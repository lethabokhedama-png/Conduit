import { useState } from "react";
import { C } from "@/lib/tokens";
import { useAppStore } from "@/store/app.store";

function ErrorLogo() {
    return (
        <svg width="100" height="75" viewBox="0 0 80 60" fill="none">
            <path
                d="M4 14 H28 Q44 14 44 30"
                stroke={C.border3}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4 30 H44"
                stroke={C.border3}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path
                d="M4 46 H28 Q44 46 44 30"
                stroke={C.border3}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line
                x1="48"
                y1="10"
                x2="48"
                y2="50"
                stroke={C.red}
                strokeWidth="2.8"
                strokeLinecap="round"
                style={{
                    filter: "drop-shadow(0 0 6px #ef4444) drop-shadow(0 0 14px #ef444488)"
                }}
            />
            <path
                d="M48 30 H72"
                stroke={C.border3}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <line
                x1="68"
                y1="26"
                x2="74"
                y2="32"
                stroke={C.red}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <line
                x1="74"
                y1="26"
                x2="68"
                y2="32"
                stroke={C.red}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function ServerErrorPage() {
    const [expanded, setExpanded] = useState(false);
    const { setWorkspace } = useAppStore();
    const TRACE = `  at fate.connectToProvider(fate:309:22)\n  at fate.connectorTimeout(fate:158:29)\n  at fate.ListocretocFeocanshelatern(i:335:203)`;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 18,
                padding: "40px",
                fontFamily: C.sans,
                position: "relative"
            }}
        >
            <ErrorLogo />
            <div
                style={{
                    fontSize: 80,
                    fontWeight: 700,
                    color: C.border3,
                    fontFamily: C.mono,
                    letterSpacing: "-0.05em",
                    lineHeight: 1
                }}
            >
                500
            </div>
            <p style={{ fontSize: 16, color: C.dim }}>
                Something went wrong on our end.
            </p>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                Gateway returned <span style={{ color: C.red }}>500</span> ·
                Check <span style={{ color: C.blue }}>/api/health</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "9px 16px",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: C.surface2,
                        border: `1px solid ${C.border2}`,
                        color: C.text,
                        fontSize: 12,
                        fontFamily: C.sans
                    }}
                >
                    Retry
                </button>
                <button
                    onClick={() => setWorkspace("runtime")}
                    style={{
                        padding: "9px 16px",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "none",
                        border: `1px solid ${C.border2}`,
                        color: C.sub,
                        fontSize: 12,
                        fontFamily: C.sans
                    }}
                >
                    Check status
                </button>
            </div>
            <div style={{ width: "100%", maxWidth: 440 }}>
                <button
                    onClick={() => setExpanded(v => !v)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 10,
                        color: C.dim,
                        fontFamily: C.mono,
                        padding: "2px 0"
                    }}
                >
                    {expanded ? "▾ hide" : "▸ show"} stack trace
                </button>
                {expanded && (
                    <pre
                        style={{
                            marginTop: 6,
                            background: "#0a0a0a",
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            padding: "10px 12px",
                            fontFamily: C.mono,
                            fontSize: 10,
                            color: C.red,
                            lineHeight: 1.7
                        }}
                    >
                        {TRACE}
                    </pre>
                )}
            </div>
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={C.dimmer}
                style={{
                    position: "absolute",
                    bottom: 28,
                    right: 28,
                    opacity: 0.4
                }}
            >
                <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
            </svg>
        </div>
    );
}
