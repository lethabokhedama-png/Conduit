import { useState } from "react";
import { C } from "../lib/tokens";
import { LogoMark } from "../components/logo.animated";

function IconGithub({
    size = 15,
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
            fill={color}
            aria-hidden="true"
        >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}
function IconMail({
    size = 14,
    color = C.sub
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    );
}
function IconLock({
    size = 11,
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
function IconShield({
    size = 11,
    color = C.blue
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}
function IconEyeOff({
    size = 11,
    color = C.purple
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
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

// Trust badges matching reference image bottom strip
const TRUST = [
    { icon: <IconShield size={12} color={C.blue} />, label: "SOC 2 Type II" },
    {
        icon: <IconLock size={12} color={C.green} />,
        label: "Keys encrypted at rest"
    },
    {
        icon: <IconEyeOff size={12} color={C.purple} />,
        label: "Zero prompt logging"
    }
];

// Self-hosted panel
function SelfHostedPanel() {
    return (
        <div
            style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                flex: 1
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: 11,
                        color: C.dim,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8
                    }}
                >
                    Option A
                </div>
                <h3
                    style={{
                        fontSize: 22,
                        fontWeight: 300,
                        color: C.text,
                        letterSpacing: "-0.02em"
                    }}
                >
                    Self-hosted
                </h3>
                <p
                    style={{
                        fontSize: 13,
                        color: C.sub,
                        marginTop: 6,
                        lineHeight: 1.6
                    }}
                >
                    Full control. Your machine, your keys, your data.
                </p>
            </div>

            {/* Docker command */}
            <div
                style={{
                    background: C.bg,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 7,
                    padding: "10px 14px",
                    fontFamily: C.mono,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                }}
            >
                <span style={{ color: C.dim }}>$</span>
                <span style={{ color: "#4ade80" }}>docker</span>
                <span style={{ color: C.sub }}> compose</span>
                <span style={{ color: C.text }}> → conduit</span>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span
                    style={{
                        fontSize: 10,
                        color: C.sub,
                        padding: "3px 8px",
                        background: C.surface2,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 4,
                        fontFamily: C.mono
                    }}
                >
                    MIT
                </span>
                <a
                    href="https://github.com/picklem0b/Conduit"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: 10,
                        color: C.blue,
                        padding: "3px 8px",
                        background: C.blueDim,
                        border: `1px solid ${C.blueBorder}`,
                        borderRadius: 4,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                    }}
                >
                    <IconGithub size={10} color={C.blue} />
                    GitHub
                </a>
            </div>
        </div>
    );
}

// Conduit Cloud sign-in card
function CloudPanel() {
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const handleEmail = () => {
        if (email.trim()) setEmailSent(true);
    };

    return (
        <div
            style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                flex: 1
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: 11,
                        color: C.dim,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8
                    }}
                >
                    Option B
                </div>
                {/* Logo + wordmark */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8
                    }}
                >
                    <LogoMark size={22} />
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: C.text,
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Conduit Cloud
                    </span>
                </div>
                <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
                    Managed gateway. Keys encrypted at rest. No infra to run.
                </p>
            </div>

            {/* Auth buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        padding: "11px 16px",
                        borderRadius: 7,
                        background: C.text,
                        color: C.bg,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        width: "100%",
                        minHeight: 44,
                        transition: "opacity 0.15s"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                    <IconGithub size={15} color={C.bg} />
                    Continue with GitHub
                </button>

                {emailSent ? (
                    <div
                        style={{
                            padding: "11px 16px",
                            borderRadius: 7,
                            textAlign: "center",
                            background: C.greenDim,
                            border: `1px solid ${C.greenBorder}`,
                            fontSize: 13,
                            color: C.green
                        }}
                    >
                        Check your email for the magic link
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: C.bg,
                                border: `1px solid ${C.border2}`,
                                borderRadius: 7,
                                padding: "0 12px",
                                minHeight: 44
                            }}
                        >
                            <IconMail size={13} color={C.dim} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e =>
                                    e.key === "Enter" && handleEmail()
                                }
                                placeholder="Continue with email"
                                style={{
                                    background: "none",
                                    border: "none",
                                    outline: "none",
                                    fontSize: 13,
                                    color: C.text,
                                    flex: 1,
                                    minWidth: 0,
                                    fontFamily: "inherit"
                                }}
                            />
                        </div>
                        <button
                            onClick={handleEmail}
                            style={{
                                padding: "0 14px",
                                borderRadius: 7,
                                minHeight: 44,
                                background: C.surface2,
                                border: `1px solid ${C.border2}`,
                                color: C.sub,
                                fontSize: 12,
                                cursor: "pointer",
                                flexShrink: 0,
                                fontFamily: "inherit"
                            }}
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>

            <p
                style={{
                    fontSize: 11,
                    color: C.dim,
                    lineHeight: 1.6,
                    margin: 0
                }}
            >
                Your keys are encrypted at rest.
                <br />
                We never read your prompts.
            </p>
        </div>
    );
}

export function AuthSection() {
    return (
        <section
            style={{
                background: C.bg,
                borderTop: `1px solid ${C.border}`,
                padding: "96px 24px"
            }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 56 }}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: C.dim,
                            marginBottom: 12
                        }}
                    >
                        Get started
                    </div>
                    <h2
                        style={{
                            fontSize: "clamp(26px, 4vw, 40px)",
                            fontWeight: 300,
                            color: C.text,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1
                        }}
                    >
                        Your way. Your data.
                    </h2>
                </div>

                {/* Two panels with OR divider */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: 0,
                        alignItems: "stretch"
                    }}
                    className="auth-grid"
                >
                    <SelfHostedPanel />

                    {/* Divider */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 24px",
                            gap: 12
                        }}
                    >
                        <div
                            style={{ flex: 1, width: 1, background: C.border }}
                        />
                        <span
                            style={{
                                fontSize: 11,
                                color: C.dim,
                                letterSpacing: "0.04em"
                            }}
                        >
                            or
                        </span>
                        <div
                            style={{ flex: 1, width: 1, background: C.border }}
                        />
                    </div>

                    <CloudPanel />
                </div>

                {/* Trust badges strip — matches reference image */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 24,
                        marginTop: 40,
                        paddingTop: 32,
                        borderTop: `1px solid ${C.border}`,
                        flexWrap: "wrap"
                    }}
                >
                    {TRUST.map(t => (
                        <div
                            key={t.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                color: C.dim
                            }}
                        >
                            {t.icon}
                            {t.label}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @media (max-width: 640px) {
          .auth-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </section>
    );
}
