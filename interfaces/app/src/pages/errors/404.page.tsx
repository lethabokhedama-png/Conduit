import { C } from "@/lib/tokens";
import { useAppStore } from "@/store/app.store";

function BrokenLogo() {
    return (
        <svg width="90" height="68" viewBox="0 0 80 60" fill="none">
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
                stroke={C.dim}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path
                d="M48 30 H62"
                stroke={C.dim}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="3 3"
            />
            <line
                x1="65"
                y1="26"
                x2="71"
                y2="32"
                stroke={C.red}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <line
                x1="71"
                y1="26"
                x2="65"
                y2="32"
                stroke={C.red}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function NotFoundPage() {
    const { setWorkspace } = useAppStore();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 20,
                padding: "40px",
                fontFamily: C.sans
            }}
        >
            <BrokenLogo />

            <div
                style={{
                    fontSize: 72,
                    fontWeight: 700,
                    color: C.border3,
                    fontFamily: C.mono,
                    letterSpacing: "-0.05em",
                    lineHeight: 1
                }}
            >
                404
            </div>

            <p style={{ fontSize: 15, color: C.dim }}>
                This page doesn't exist.
            </p>

            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => history.back()}
                    style={{
                        padding: "9px 16px",
                        background: C.surface,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 6,
                        color: C.sub,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: C.sans
                    }}
                >
                    ← Go back
                </button>
                <button
                    onClick={() => setWorkspace("chat")}
                    style={{
                        padding: "9px 16px",
                        background: C.text,
                        border: "none",
                        borderRadius: 6,
                        color: C.bg,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: C.sans
                    }}
                >
                    Go home
                </button>
            </div>

            <div
                style={{
                    padding: "7px 14px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontFamily: C.mono,
                    fontSize: 11,
                    color: C.dim
                }}
            >
                <span style={{ color: C.red }}>GET</span> /whatever-they-typed{" "}
                <span style={{ color: C.dim }}>→</span>{" "}
                <span style={{ color: C.red }}>404 Not Found</span>
            </div>

            <div style={{ fontSize: 10, color: C.dim, fontFamily: C.mono }}>
                [/error] ms match for "/whatever" · redirecting suggestion:
            </div>

            {/* Star decal */}
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={C.dimmer}
                style={{
                    position: "absolute",
                    bottom: 32,
                    right: 32,
                    opacity: 0.4
                }}
            >
                <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
            </svg>
        </div>
    );
}
