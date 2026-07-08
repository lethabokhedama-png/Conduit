// ── Code execution types ──────────────────────────────────────────────────────

/**
 * Supported execution runtimes.
 * Each maps to a kernel/environment inside an E2B CodeInterpreter sandbox.
 * E2B's CodeInterpreter natively supports Python and JavaScript; bash runs
 * as shell commands via the same sandbox process interface.
 */
export type CodeRuntime = "python" | "javascript" | "bash";

export const SUPPORTED_RUNTIMES: CodeRuntime[] = [
   "python",
   "javascript",
   "bash"
];

export function isSupportedRuntime(r: string): r is CodeRuntime {
   return SUPPORTED_RUNTIMES.includes(r as CodeRuntime);
}

// ── Execution result ──────────────────────────────────────────────────────────

export interface CellOutput {
   type: "text" | "image" | "error";
   /** Plain text or error message */
   text?: string;
   /** Base64-encoded PNG/JPEG for image outputs (matplotlib, etc.) */
   base64?: string;
   mimeType?: string;
}

export interface ExecutionResult {
   /** stdout from the execution */
   stdout: string;
   /** stderr from the execution */
   stderr: string;
   /** Process exit code — 0 means success */
   exitCode: number;
   /** Rich cell outputs (images, HTML, etc.) from Jupyter kernel */
   outputs: CellOutput[];
   /** Wall-clock duration of the sandbox execution in ms */
   durationMs: number;
   /** Runtime that was used */
   runtime: CodeRuntime;
}

// ── Execution options ─────────────────────────────────────────────────────────

export interface ExecutionOptions {
   /** Timeout in ms. Max 30 000ms. Defaults to 15 000ms. */
   timeoutMs?: number;
   /** Environment variables to inject into the sandbox */
   env?: Record<string, string>;
}
