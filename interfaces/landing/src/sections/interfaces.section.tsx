import { C } from "../lib/tokens";

// Inline SVGs
function IconArrowRight({
    size = 8,
    color = C.dim
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
function IconRefreshCw({
    size = 8,
    color = C.amber
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
        </svg>
    );
}
function IconSend({
    size = 8,
    color = "white"
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
    );
}
function IconStar({
    size = 8,
    color = C.dim
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            stroke="none"
        >
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
    );
}
function IconCheck({
    size = 8,
    color = C.green
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
function IconImage({
    size = 10,
    color = C.dim
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

// ── Chat mini mockup
function ChatMockup() {
    return (
        <div
            style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                overflow: "hidden",
                height: 180,
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui"
            }}
        >
            {/* Titlebar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderBottom: `1px solid ${C.border}`,
                    background: C.surface
                }}
            >
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#ff5f57"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#febc2e"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#28c840"
                    }}
                />
                <span style={{ fontSize: 9, color: C.dim, marginLeft: 4 }}>
                    Chat
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 8, color: C.dim, fontFamily: C.mono }}>
                    interfaces/chat
                </span>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    overflow: "hidden"
                }}
            >
                {/* User */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 5
                    }}
                >
                    <div
                        style={{
                            background: C.surface2,
                            border: `1px solid ${C.border2}`,
                            borderRadius: "8px 8px 2px 8px",
                            padding: "5px 8px",
                            fontSize: 9,
                            color: C.sub,
                            maxWidth: "70%"
                        }}
                    >
                        Hey, i need help on a project help me plan!
                    </div>
                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: C.border2,
                            flexShrink: 0,
                            marginTop: 1
                        }}
                    />
                </div>

                {/* Cascade event */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 6px",
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.18)",
                        borderRadius: 4,
                        fontSize: 8,
                        color: C.amber,
                        fontFamily: C.mono
                    }}
                >
                    <IconRefreshCw size={7} color={C.amber} />
                    cascade event: claude-sonnet-4-6
                </div>

                {/* AI */}
                <div style={{ display: "flex", gap: 5 }}>
                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: C.surface2,
                            border: `1px solid ${C.border2}`,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <IconStar size={6} color={C.sub} />
                    </div>
                    <div
                        style={{
                            background: C.surface2,
                            border: `1px solid ${C.border}`,
                            borderRadius: "8px 8px 8px 2px",
                            padding: "5px 8px",
                            fontSize: 9,
                            color: C.text,
                            lineHeight: 1.5
                        }}
                    >
                        Ready when you are, what are we thinking.
                    </div>
                </div>
            </div>

            {/* Input bar */}
            <div
                style={{
                    padding: "7px 10px",
                    borderTop: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}
            >
                <div
                    style={{
                        flex: 1,
                        background: C.surface,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 5,
                        padding: "5px 8px",
                        fontSize: 9,
                        color: C.dim
                    }}
                >
                    Send a message…
                </div>
                <div
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: C.blue,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <IconSend size={7} />
                </div>
            </div>
        </div>
    );
}

// ── Tester mini mockup
function TesterMockup() {
    const caps = ["streaming", "bition", "function-calling"];
    return (
        <div
            style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                overflow: "hidden",
                height: 180,
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderBottom: `1px solid ${C.border}`,
                    background: C.surface
                }}
            >
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#ff5f57"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#febc2e"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#28c840"
                    }}
                />
                <span style={{ fontSize: 9, color: C.dim, marginLeft: 4 }}>
                    Tester
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 8, color: C.dim, fontFamily: C.mono }}>
                    interfaces/tester
                </span>
            </div>
            <div
                style={{
                    flex: 1,
                    padding: "12px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                }}
            >
                <div style={{ fontSize: 9, color: C.dim }}>Probe result</div>
                {/* Capability badges */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {caps.map(c => (
                        <div
                            key={c}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                padding: "3px 7px",
                                borderRadius: 4,
                                background: C.greenDim,
                                border: `1px solid ${C.greenBorder}`,
                                fontSize: 8,
                                color: C.green
                            }}
                        >
                            <IconCheck size={7} color={C.green} />
                            {c}
                        </div>
                    ))}
                </div>
                {/* Fake result card */}
                <div
                    style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        padding: "8px 10px"
                    }}
                >
                    <div style={{ fontSize: 9, color: C.sub, marginBottom: 4 }}>
                        gnndio result card
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <div
                            style={{
                                fontSize: 8,
                                color: C.dim,
                                fontFamily: C.mono
                            }}
                        >
                            anthropic
                        </div>
                        <span style={{ color: C.dim }}>·</span>
                        <div style={{ fontSize: 8, color: C.green }}>valid</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Media mini mockup
function MediaMockup() {
    return (
        <div
            style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                overflow: "hidden",
                height: 180,
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderBottom: `1px solid ${C.border}`,
                    background: C.surface
                }}
            >
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#ff5f57"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#febc2e"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#28c840"
                    }}
                />
                <span style={{ fontSize: 9, color: C.dim, marginLeft: 4 }}>
                    Media
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 8, color: C.dim, fontFamily: C.mono }}>
                    interfaces/media
                </span>
            </div>
            <div
                style={{
                    flex: 1,
                    padding: "12px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                }}
            >
                <div
                    style={{
                        background: C.surface,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 5,
                        padding: "5px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                    }}
                >
                    <span style={{ fontSize: 9, color: C.dim, flex: 1 }}>
                        Image generation…
                    </span>
                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            background: C.blue,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <IconArrowRight size={7} color="white" />
                    </div>
                </div>
                {/* Image result grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 5,
                        flex: 1
                    }}
                >
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            style={{
                                background: C.surface2,
                                border: `1px solid ${C.border}`,
                                borderRadius: 5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: 44
                            }}
                        >
                            {i === 0 ? (
                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        background: C.border2,
                                        borderRadius: "50%"
                                    }}
                                />
                            ) : (
                                <IconImage size={12} color={C.dimmer} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Engine mini mockup
function EngineMockup() {
    const scores = [
        { label: "Health score", pct: 92, color: C.green },
        { label: "openRouter", pct: 78, color: C.green },
        { label: "Cascade", pct: 61, color: C.amber },
        { label: "Providers", pct: 45, color: C.amber }
    ];
    return (
        <div
            style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                overflow: "hidden",
                height: 180,
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderBottom: `1px solid ${C.border}`,
                    background: C.surface
                }}
            >
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#ff5f57"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#febc2e"
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#28c840"
                    }}
                />
                <span style={{ fontSize: 9, color: C.dim, marginLeft: 4 }}>
                    Engine
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 8, color: C.dim, fontFamily: C.mono }}>
                    interfaces/engine
                </span>
            </div>
            <div
                style={{
                    flex: 1,
                    padding: "12px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                }}
            >
                {scores.map(s => (
                    <div
                        key={s.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <span
                            style={{
                                fontSize: 8,
                                color: C.dim,
                                width: 68,
                                flexShrink: 0
                            }}
                        >
                            {s.label}
                        </span>
                        <div
                            style={{
                                flex: 1,
                                height: 4,
                                background: C.border,
                                borderRadius: 2
                            }}
                        >
                            <div
                                style={{
                                    width: `${s.pct}%`,
                                    height: "100%",
                                    background: s.color,
                                    borderRadius: 2,
                                    transition: "width 1s ease"
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Section
export function InterfacesSection() {
    return (
        <section
            style={{
                background: C.bg,
                borderTop: `1px solid ${C.border}`,
                padding: "96px 24px"
            }}
        >
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 56 }}>
                    <h2
                        style={{
                            fontSize: "clamp(28px, 4vw, 44px)",
                            fontWeight: 300,
                            color: C.text,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1
                        }}
                    >
                        Every interface included.
                    </h2>
                </div>

                {/* 2×2 grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16
                    }}
                    className="interfaces-grid"
                >
                    {[
                        {
                            label: "Chat",
                            route: "interfaces/chat",
                            mock: <ChatMockup />
                        },
                        {
                            label: "Tester",
                            route: "interfaces/tester",
                            mock: <TesterMockup />
                        },
                        {
                            label: "Media",
                            route: "interfaces/media",
                            mock: <MediaMockup />
                        },
                        {
                            label: "Engine",
                            route: "interfaces/engine",
                            mock: <EngineMockup />
                        }
                    ].map(card => (
                        <div
                            key={card.label}
                            style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                                borderRadius: 12,
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                transition: "border-color 0.2s"
                            }}
                            onMouseEnter={e =>
                                (e.currentTarget.style.borderColor = C.border3)
                            }
                            onMouseLeave={e =>
                                (e.currentTarget.style.borderColor = C.border)
                            }
                        >
                            {/* Header row */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: C.text
                                    }}
                                >
                                    {card.label}
                                </span>
                                <span
                                    style={{
                                        fontSize: 9,
                                        color: C.dim,
                                        fontFamily: C.mono,
                                        padding: "2px 7px",
                                        background: C.surface2,
                                        border: `1px solid ${C.border2}`,
                                        borderRadius: 4
                                    }}
                                >
                                    {card.route}
                                </span>
                            </div>

                            {/* Mockup */}
                            {card.mock}
                        </div>
                    ))}
                </div>

                {/* Footer line */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: 40,
                        fontSize: 13,
                        color: C.dim
                    }}
                >
                    All open source. MIT licensed.
                </p>
            </div>

            <style>{`
        @media (max-width: 640px) { .interfaces-grid { grid-template-columns: 1fr !important; } }
      `}</style>
        </section>
    );
}
