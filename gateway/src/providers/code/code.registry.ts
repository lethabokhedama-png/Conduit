import { getKey } from "@db/stores/key.store";
import type {
   CodeRuntime,
   ExecutionOptions,
   ExecutionResult,
   CellOutput
} from "./code.types";
import { isSupportedRuntime, SUPPORTED_RUNTIMES } from "./code.types";

// ── E2B SDK (optional dependency) ─────────────────────────────────────────────

/**
 * E2B is an optional dependency — not in package.json by default.
 * We lazy-import it so the gateway boots normally when no E2B key is
 * configured. The import is attempted once and the result cached.
 *
 * Install when needed: npm install @e2b/code-interpreter
 *
 * The E2B v2 SDK uses the CodeInterpreter class with a Jupyter kernel,
 * which natively supports Python, JavaScript, and shell execution.
 * API: https://e2b.dev/docs/code-interpreter/quickstart
 */
type E2BModule = typeof import("@e2b/code-interpreter");
let _e2b: E2BModule | null = null;
let _e2bLoadError: string | null = null;

async function loadE2B(): Promise<E2BModule> {
   if (_e2b) return _e2b;
   if (_e2bLoadError) throw new Error(_e2bLoadError);

   try {
      _e2b = (await import("@e2b/code-interpreter")) as E2BModule;
      return _e2b;
   } catch {
      _e2bLoadError =
         "E2B SDK not installed. Run: npm install @e2b/code-interpreter";
      throw new Error(_e2bLoadError);
   }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function isCodeExecutionConfigured(): boolean {
   return !!getKey("e2b");
}

/**
 * Executes code in an isolated E2B CodeInterpreter sandbox.
 *
 * Uses the E2B v2 CodeInterpreter API which runs a stateful Jupyter kernel
 * per sandbox. Each call creates a fresh sandbox, executes the code cell,
 * collects all outputs (stdout, stderr, rich cell outputs like images),
 * and immediately closes the sandbox.
 *
 * The kernel is chosen by runtime:
 *   python     → default Jupyter Python 3 kernel
 *   javascript → Deno kernel (bundled in E2B sandbox template)
 *   bash       → executed via process.startAndWait, not the Jupyter kernel
 *
 * Throws on configuration errors. Runtime errors (non-zero exit, syntax
 * errors) are returned in the result rather than thrown, so callers can
 * display them to the user.
 */
export async function executeCode(
   code: string,
   runtime: CodeRuntime,
   options: ExecutionOptions = {}
): Promise<ExecutionResult> {
   if (!isCodeExecutionConfigured()) {
      throw new Error(
         "Code execution requires an E2B API key. Add one via Settings → Providers."
      );
   }

   const { CodeInterpreter } = await loadE2B();
   const timeoutMs = Math.min(options.timeoutMs ?? 15_000, 30_000);
   const apiKey = getKey("e2b") as string;

   const started = Date.now();

   const sandbox = await CodeInterpreter.create({
      apiKey,
      // E2B timeout is in seconds
      timeoutMs
   });

   try {
      // Inject environment variables before execution
      if (options.env && Object.keys(options.env).length > 0) {
         const exports = Object.entries(options.env)
            .map(([k, v]) => `export ${k}=${JSON.stringify(v)}`)
            .join("\n");
         await sandbox.process.startAndWait(
            `bash -c ${JSON.stringify(exports)}`
         );
      }

      let stdout = "";
      let stderr = "";
      let exitCode = 0;
      const outputs: CellOutput[] = [];

      if (runtime === "bash") {
         // Bash goes through the process API, not the Jupyter kernel
         const proc = await sandbox.process.startAndWait(
            `bash -c ${JSON.stringify(code)}`,
            { timeoutMs }
         );
         stdout = proc.stdout ?? "";
         stderr = proc.stderr ?? "";
         exitCode = proc.exitCode ?? 0;
      } else {
         // Python and JavaScript use the Jupyter kernel via runCode
         // The kernel is selected when the sandbox template is chosen;
         // the default E2B template supports both python3 and deno kernels.
         const kernelLang = runtime === "javascript" ? "javascript" : "python";

         const execution = await sandbox.runCode(code, {
            language: kernelLang,
            timeoutMs,
            onStdout: (line: string) => {
               stdout += line + "\n";
            },
            onStderr: (line: string) => {
               stderr += line + "\n";
            }
         });

         exitCode = execution.error ? 1 : 0;

         // Collect rich cell outputs (images, HTML, text/plain)
         for (const result of execution.results ?? []) {
            if (result.png) {
               outputs.push({
                  type: "image",
                  base64: result.png,
                  mimeType: "image/png"
               });
            } else if (result.jpeg) {
               outputs.push({
                  type: "image",
                  base64: result.jpeg,
                  mimeType: "image/jpeg"
               });
            } else if (result.text) {
               outputs.push({ type: "text", text: result.text });
            }
         }

         if (execution.error) {
            stderr =
               execution.error.traceback ?? execution.error.value ?? stderr;
            outputs.push({ type: "error", text: stderr });
         }
      }

      return {
         stdout: stdout.trimEnd(),
         stderr: stderr.trimEnd(),
         exitCode,
         outputs,
         durationMs: Date.now() - started,
         runtime
      };
   } finally {
      await sandbox.close().catch(() => {});
   }
}

export { isSupportedRuntime, SUPPORTED_RUNTIMES };
