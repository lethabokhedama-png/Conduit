import { useState } from "react";
import { C } from "../lib/tokens";

function ErrorLogo({ size = 100 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size * 0.75}
            viewBox="0 0 80 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Input lines — dimmed */}
            <path
                d="M4 14 H28 Q44 14 44 30"
                stroke={C.border3}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4 30 H44"
                stroke={C.border3}
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <path
                d="M4 46 H28 Q44 46 44 30"
                stroke={C.border3}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Gate bar — glowing red */}
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
            {/* Output line */}
            <path
                d="M48 30 H72"
                stroke={C.border3}
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            {/* × at far right */}
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

const FAKE_TRACE = `  at fate.connectToProvider(fate:309:22)
  at fate.connectorTimeout(fate:158:29)
  at fate.ListocretocFeocanshelatern(i:335:203)`;

export function ServerErrorPage() {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            style={{
                minHeight: "100dvh",
                background: C.bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                textAlign: "center",
                fontFamily: "system-ui, -apple-system, sans-serif",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <ErrorLogo size={110} />

            <div
                style={{
                    fontSize: "clamp(72px, 12vw, 120px)",
                    fontWeight: 700,
                    color: C.border3,
                    fontFamily: C.mono,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    marginTop: 20
                }}
            >
                500
            </div>

            <p
                style={{
                    fontSize: 16,
                    color: C.dim,
                    marginTop: 12,
                    letterSpacing: "-0.01em"
                }}
            >
                Something went wrong on our end.
            </p>

            <div
                style={{
                    marginTop: 14,
                    padding: "7px 14px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontFamily: C.mono,
                    fontSize: 12,
                    color: C.dim
                }}
            >
                <span style={{ color: C.dim }}>Gateway returned</span>{" "}
                <span style={{ color: C.red }}>500</span> · <span>Check </span>
                <span style={{ color: C.blue }}>/api/health</span>
            </div>

            {/* Action buttons */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 24,
                    flexWrap: "wrap",
                    justifyContent: "center"
                }}
            >
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "11px 22px",
                        background: C.surface,
                        color: C.text,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 7,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "-0.01em"
                    }}
                >
                    Retry
                </button>
                <a
                    href="/api/status"
                    style={{
                        padding: "11px 22px",
                        background: "none",
                        color: C.sub,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 7,
                        fontSize: 14,
                        textDecoration: "none"
                    }}
                >
                    Check status
                </a>
            </div>

            {/* Collapsible stack trace — matches reference image */}
            <div
                style={{
                    marginTop: 24,
                    width: "100%",
                    maxWidth: 480,
                    textAlign: "left"
                }}
            >
                <button
                    onClick={() => setExpanded(v => !v)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        color: C.dim,
                        fontFamily: C.mono,
                        padding: "4px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                    }}
                >
                    <span style={{ color: C.dimmer }}>
                        {expanded ? "▾" : "▸"}
                    </span>
                    {expanded ? "Hide" : "Show"} stack trace
                </button>
                {expanded && (
                    <div
                        style={{
                            marginTop: 8,
                            background: "#0a0a0a",
                            border: `1px solid ${C.border}`,
                            borderRadius: 7,
                            padding: "12px 14px",
                            fontFamily: C.mono,
                            fontSize: 11,
                            color: C.red,
                            lineHeight: 1.7,
                            textAlign: "left",
                            whiteSpace: "pre"
                        }}
                    >
                        {FAKE_TRACE}
                    </div>
                )}
            </div>

            {/* Star decal */}
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={C.dimmer}
                style={{
                    position: "absolute",
                    bottom: 40,
                    right: 40,
                    opacity: 0.4
                }}
                aria-hidden="true"
            >
                <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
            </svg>
        </div>
    );
}
