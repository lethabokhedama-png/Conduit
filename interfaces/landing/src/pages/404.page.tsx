import { C } from "../lib/tokens";

function BrokenLogo({ size = 100 }: { size?: number }) {
    const s = size;
    return (
        <svg
            width={s}
            height={s * 0.75}
            viewBox="0 0 80 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Three input lines converging — unchanged */}
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
            {/* Gate bar */}
            <line
                x1="48"
                y1="10"
                x2="48"
                y2="50"
                stroke={C.dim}
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            {/* Output line — broken, stops halfway */}
            <path
                d="M48 30 H62"
                stroke={C.dim}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="3 3"
            />
            {/* × mark at end */}
            <line
                x1="66"
                y1="26"
                x2="72"
                y2="32"
                stroke={C.red}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <line
                x1="72"
                y1="26"
                x2="66"
                y2="32"
                stroke={C.red}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function NotFoundPage() {
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
            <BrokenLogo size={110} />

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
                404
            </div>

            <p
                style={{
                    fontSize: 16,
                    color: C.dim,
                    marginTop: 12,
                    letterSpacing: "-0.01em"
                }}
            >
                This route doesn't exist.
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
                <span style={{ color: C.red }}>GET</span> /that-page{" "}
                <span style={{ color: C.dim }}>→</span>{" "}
                <span style={{ color: C.red }}>404 Not Found</span>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 28,
                    flexWrap: "wrap",
                    justifyContent: "center"
                }}
            >
                <a
                    href="/"
                    style={{
                        padding: "11px 22px",
                        background: C.text,
                        color: C.bg,
                        borderRadius: 7,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                        letterSpacing: "-0.01em"
                    }}
                >
                    Go home
                </a>
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
                    Gateway status
                </a>
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
                    opacity: 0.5
                }}
                aria-hidden="true"
            >
                <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
            </svg>
        </div>
    );
}
