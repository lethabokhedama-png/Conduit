import { Play, RotateCcw } from "lucide-react";
import { C } from "@/lib/tokens";
import { useCodeStore } from "./code.store";
import { useAppStore } from "@/store/app.store";
import { executeCode } from "@/lib/api.lib";

const LANGUAGES = [
    "python",
    "javascript",
    "typescript",
    "bash",
    "go",
    "rust",
    "sql"
] as const;

export function CodePage() {
    const {
        language,
        setLanguage,
        code,
        setCode,
        output,
        running,
        setRunning,
        setOutput,
        error,
        setError
    } = useCodeStore();
    const { pushTerminalLine } = useAppStore();

    const run = async () => {
        setRunning(true);
        setOutput(null);
        setError(null);
        pushTerminalLine({
            text: `[code] executing ${language} · ${code.split("\n").length} lines`,
            type: "dim"
        });
        try {
            const r = (await executeCode(code, language)) as {
                stdout?: string;
                stderr?: string;
                exitCode?: number;
            };
            const out = r.stdout ?? JSON.stringify(r, null, 2);
            setOutput(out);
            pushTerminalLine({
                text: `[code] exit 0 · ${out.slice(0, 60)}`,
                type: "success"
            });
        } catch (e) {
            setError(String(e));
            pushTerminalLine({
                text: `[code] error: ${String(e)}`,
                type: "error"
            });
        }
        setRunning(false);
    };

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Editor */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRight: `1px solid ${C.border}`,
                    overflow: "hidden"
                }}
            >
                {/* Toolbar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderBottom: `1px solid ${C.border}`,
                        background: C.bg,
                        flexShrink: 0
                    }}
                >
                    <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        style={{
                            background: C.surface,
                            border: `1px solid ${C.border2}`,
                            borderRadius: 5,
                            padding: "5px 8px",
                            color: C.sub,
                            fontSize: 11,
                            cursor: "pointer"
                        }}
                    >
                        {LANGUAGES.map(l => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                    <div style={{ flex: 1 }} />
                    <button
                        onClick={() => setCode("")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.dim,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11
                        }}
                    >
                        <RotateCcw size={11} />
                        Clear
                    </button>
                    <button
                        onClick={run}
                        disabled={running}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            background: running ? C.surface2 : C.green,
                            border: "none",
                            borderRadius: 6,
                            color: running ? C.dim : C.bg,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: running ? "not-allowed" : "pointer"
                        }}
                    >
                        <Play size={11} />
                        {running ? "Running…" : "Run"}
                    </button>
                </div>

                {/* Code textarea */}
                <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    spellCheck={false}
                    style={{
                        flex: 1,
                        background: C.bg,
                        border: "none",
                        outline: "none",
                        padding: "14px",
                        color: C.text,
                        fontSize: 13,
                        fontFamily: C.mono,
                        lineHeight: 1.7,
                        resize: "none",
                        tabSize: 2
                    }}
                />
            </div>

            {/* Output panel */}
            <div
                style={{
                    width: "40%",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        padding: "8px 12px",
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        color: C.dim,
                        background: C.bg,
                        flexShrink: 0
                    }}
                >
                    Output
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
                    {running && (
                        <div
                            style={{
                                fontSize: 11,
                                color: C.dim,
                                fontFamily: C.mono
                            }}
                        >
                            Running…
                        </div>
                    )}
                    {output && (
                        <pre
                            style={{
                                fontSize: 12,
                                fontFamily: C.mono,
                                color: C.green,
                                lineHeight: 1.6,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all"
                            }}
                        >
                            {output}
                        </pre>
                    )}
                    {error && (
                        <pre
                            style={{
                                fontSize: 12,
                                fontFamily: C.mono,
                                color: C.red,
                                lineHeight: 1.6,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                                padding: "10px 12px",
                                background: C.redDim,
                                borderRadius: 6
                            }}
                        >
                            {error}
                        </pre>
                    )}
                    {!output && !error && !running && (
                        <div style={{ fontSize: 11, color: C.dim }}>
                            Click Run to execute
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
