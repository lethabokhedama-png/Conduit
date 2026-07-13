import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { C } from "@/lib/tokens";

interface Release {
    version: string;
    date: string;
    tag: "Latest" | "Stable" | null;
    added: string[];
    fixed: string[];
    changed: string[];
    security: string[];
}

const RELEASES: Release[] = [
    {
        version: "v0.3.4",
        date: "3 days ago",
        tag: "Latest",
        added: [
            "interfaces/app — unified shell with all workspaces",
            "onboarding flow",
            "model explorer with local models tab"
        ],
        fixed: ["cascade event timing in streaming", "terminal panel scroll"],
        changed: ["shell layout consolidated from 4 apps into 1"],
        security: []
    },
    {
        version: "v0.3.3",
        date: "3 days ago",
        tag: null,
        added: [
            "gateway/ui + engine/ui mobile-first rebuild",
            "terminal panel",
            "command palette Cmd+K"
        ],
        fixed: ["provider health score TTL", "redis usage counter reset"],
        changed: ["bottom nav on ≤640px viewports"],
        security: []
    },
    {
        version: "v0.3.2",
        date: "5 days ago",
        tag: null,
        added: [
            "interfaces/landing — hero, cascade section, comparison table, auth section"
        ],
        fixed: ["docker compose volume mounts"],
        changed: [],
        security: ["JWT secret now required at startup"]
    },
    {
        version: "v0.3.1",
        date: "3 days ago",
        tag: null,
        added: ["landing page with animated logo"],
        fixed: [],
        changed: [],
        security: []
    }
];

const TAG_COLORS: Record<string, string> = { Latest: C.blue, Stable: C.green };

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: copied ? C.green : C.dim,
                display: "flex"
            }}
        >
            <Copy size={11} />
        </button>
    );
}

export function ChangelogPage() {
    const [expanded, setExpanded] = useState<string>(RELEASES[0].version);

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Left: version list */}
            <div
                style={{
                    width: 200,
                    flexShrink: 0,
                    borderRight: `1px solid ${C.border}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        padding: "10px 14px",
                        borderBottom: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <span
                        style={{ fontSize: 12, fontWeight: 600, color: C.text }}
                    >
                        Changelog
                    </span>
                    <button
                        style={{
                            fontSize: 10,
                            padding: "3px 7px",
                            background: C.blueDim,
                            border: `1px solid ${C.blueBdr}`,
                            borderRadius: 4,
                            color: C.blue,
                            cursor: "pointer"
                        }}
                    >
                        Relaunch in update
                    </button>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                    {RELEASES.map(r => (
                        <button
                            key={r.version}
                            onClick={() => setExpanded(r.version)}
                            style={{
                                width: "100%",
                                padding: "9px 14px",
                                background:
                                    expanded === r.version
                                        ? C.surface2
                                        : "none",
                                border: "none",
                                borderBottom: `1px solid ${C.border}`,
                                cursor: "pointer",
                                textAlign: "left",
                                display: "flex",
                                flexDirection: "column",
                                gap: 3
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: C.text,
                                        fontFamily: C.mono
                                    }}
                                >
                                    {r.version}
                                </span>
                                {r.tag && (
                                    <span
                                        style={{
                                            fontSize: 8,
                                            padding: "1px 5px",
                                            borderRadius: 3,
                                            background:
                                                TAG_COLORS[r.tag] + "22",
                                            border: `1px solid ${TAG_COLORS[r.tag]}44`,
                                            color: TAG_COLORS[r.tag]
                                        }}
                                    >
                                        {r.tag}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: 9, color: C.dim }}>
                                {r.date}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: release notes */}
            <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
                {RELEASES.filter(r => r.version === expanded).map(r => (
                    <div
                        key={r.version}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: C.text,
                                    fontFamily: C.mono,
                                    letterSpacing: "-0.03em"
                                }}
                            >
                                {r.version}
                            </span>
                            {r.tag && (
                                <span
                                    style={{
                                        fontSize: 9,
                                        padding: "2px 7px",
                                        borderRadius: 4,
                                        background: TAG_COLORS[r.tag] + "22",
                                        border: `1px solid ${TAG_COLORS[r.tag]}44`,
                                        color: TAG_COLORS[r.tag],
                                        fontWeight: 700
                                    }}
                                >
                                    {r.tag}
                                </span>
                            )}
                            <div style={{ flex: 1 }} />
                            <CopyBtn text={`git checkout ${r.version}`} />
                            <a
                                href={`https://github.com/picklem0b/Conduit/releases/tag/${r.version}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: C.dim, display: "flex" }}
                            >
                                <ExternalLink size={11} />
                            </a>
                        </div>

                        {/* Quick copy */}
                        <div
                            style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                                borderRadius: 7,
                                padding: "10px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 10
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 11,
                                    color: C.sub,
                                    fontFamily: C.mono,
                                    flex: 1
                                }}
                            >
                                Copy rollback inline
                            </span>
                            <CopyBtn text={`git checkout ${r.version}`} />
                        </div>

                        {/* Sections */}
                        {[
                            { label: "Added", items: r.added, color: C.green },
                            { label: "Fixed", items: r.fixed, color: C.blue },
                            {
                                label: "Changed",
                                items: r.changed,
                                color: C.amber
                            },
                            {
                                label: "Security",
                                items: r.security,
                                color: C.red
                            }
                        ]
                            .filter(s => s.items.length > 0)
                            .map(s => (
                                <div key={s.label}>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: s.color,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            marginBottom: 6
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4
                                        }}
                                    >
                                        {s.items.map((item, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 8,
                                                    fontSize: 12,
                                                    color: C.sub,
                                                    lineHeight: 1.5
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: s.color,
                                                        marginTop: 1,
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    +
                                                </span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        {/* Footer */}
                        <div
                            style={{
                                fontSize: 9,
                                color: C.dim,
                                fontFamily: C.mono,
                                borderTop: `1px solid ${C.border}`,
                                paddingTop: 10
                            }}
                        >
                            [{r.version}] {r.added.length} added ·{" "}
                            {r.fixed.length} fixed · {r.changed.length} changed
                            · {r.security.length} security · released {r.date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
