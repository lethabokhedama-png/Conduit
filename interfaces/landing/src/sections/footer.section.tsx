import { C } from "../lib/tokens";
import { LogoMark } from "../components/logo.animated";

function IconGithub({
    size = 13,
    color = C.dim
}: {
    size?: number;
    color?: string;
}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

function FooterStar() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={C.dimmer}
            aria-hidden="true"
        >
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>
    );
}

const COLS = [
    {
        heading: "Product",
        links: [
            { label: "Chat", href: "/interfaces/chat" },
            { label: "Tester", href: "/interfaces/tester" },
            { label: "Media", href: "/interfaces/media" },
            { label: "Engine UI", href: "/engine" }
        ]
    },
    {
        heading: "Deploy",
        links: [
            {
                label: "Docker",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/deployment/docker.md"
            },
            {
                label: "Render",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/deployment/render.md"
            },
            {
                label: "Environment vars",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/deployment/env.md"
            }
        ]
    },
    {
        heading: "Docs",
        links: [
            {
                label: "Routes",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/gateway/routes.md"
            },
            {
                label: "Cascade",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/gateway/cascade.md"
            },
            {
                label: "Providers",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/gateway/providers.md"
            },
            {
                label: "Config",
                href: "https://github.com/picklem0b/Conduit/blob/main/docs/gateway/config.md"
            }
        ]
    },
    {
        heading: "Community",
        links: [
            { label: "GitHub", href: "https://github.com/picklem0b/Conduit" },
            {
                label: "Issues",
                href: "https://github.com/picklem0b/Conduit/issues"
            },
            {
                label: "Discussions",
                href: "https://github.com/picklem0b/Conduit/discussions"
            }
        ]
    }
];

const NAV_LINKS = [
    {
        label: "Docs",
        href: "https://github.com/picklem0b/Conduit/tree/main/docs"
    },
    { label: "GitHub", href: "https://github.com/picklem0b/Conduit" },
    { label: "Status", href: "/api/status" },
    {
        label: "Changelog",
        href: "https://github.com/picklem0b/Conduit/releases"
    }
];

export function FooterSection() {
    return (
        <footer
            style={{
                background: C.bg,
                borderTop: `1px solid ${C.border}`
            }}
        >
            {/* Top nav strip — matches reference */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 40px",
                    borderBottom: `1px solid ${C.border}`,
                    flexWrap: "wrap",
                    gap: 12
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LogoMark size={16} />
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: C.text,
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Conduit
                    </span>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    {NAV_LINKS.map(l => (
                        <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: 12,
                                color: C.dim,
                                textDecoration: "none",
                                transition: "color 0.15s"
                            }}
                            onMouseEnter={e =>
                                (e.currentTarget.style.color = C.sub)
                            }
                            onMouseLeave={e =>
                                (e.currentTarget.style.color = C.dim)
                            }
                        >
                            {l.label}
                        </a>
                    ))}
                    <a
                        href="https://github.com/picklem0b/Conduit"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IconGithub size={14} color={C.dim} />
                    </a>
                    <FooterStar />
                </div>
            </div>

            {/* Four-column link grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 0,
                    padding: "40px",
                    maxWidth: 1100,
                    margin: "0 auto",
                    width: "100%"
                }}
                className="footer-cols"
            >
                {COLS.map((col, ci) => (
                    <div
                        key={col.heading}
                        style={{
                            padding: ci === 0 ? "0 40px 0 0" : "0 40px",
                            borderRight:
                                ci < COLS.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none"
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: C.sub,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                marginBottom: 14
                            }}
                        >
                            {col.heading}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 9
                            }}
                        >
                            {col.links.map(l => (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    target={
                                        l.href.startsWith("http")
                                            ? "_blank"
                                            : undefined
                                    }
                                    rel={
                                        l.href.startsWith("http")
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    style={{
                                        fontSize: 13,
                                        color: C.dim,
                                        textDecoration: "none",
                                        transition: "color 0.15s"
                                    }}
                                    onMouseEnter={e =>
                                        (e.currentTarget.style.color = C.sub)
                                    }
                                    onMouseLeave={e =>
                                        (e.currentTarget.style.color = C.dim)
                                    }
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom strip */}
            <div
                style={{
                    borderTop: `1px solid ${C.border}`,
                    padding: "16px 40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8
                }}
            >
                <span
                    style={{ fontSize: 11, color: C.dim, fontFamily: C.mono }}
                >
                    Conduit v0.3.1 · MIT License · Built with Bun + Hono
                </span>
                <span style={{ fontSize: 11, color: C.dimmer }}>
                    0 telemetry · 0 ads · 0 data leaves your machine
                </span>
            </div>

            <style>{`
        @media (max-width: 640px) {
          .footer-cols { grid-template-columns: repeat(2, 1fr) !important; padding: 24px !important; gap: 24px !important; }
          .footer-cols > div { border-right: none !important; padding: 0 !important; }
        }
      `}</style>
        </footer>
    );
}
