import { useState } from "react";
import { C } from "@/lib/tokens";
import { useAppStore } from "@/store/app.store";

// ── Shared error logo variants ────────────────────────────────────────────────
function ErrorLogo({
    variant
}: {
    variant: "500" | "401" | "502" | "429" | "offline";
}) {
    const gateColor =
        variant === "500"
            ? C.red
            : variant === "401"
              ? C.amber
              : variant === "502"
                ? C.red
                : variant === "429"
                  ? C.amber
                  : C.dim;

    const glow = ["500", "502"].includes(variant)
        ? `drop-shadow(0 0 6px ${C.red}) drop-shadow(0 0 14px ${C.red}88)`
        : undefined;

    const outputColor =
        variant === "429" ? C.amber : variant === "offline" ? C.dim : C.dim;

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
                stroke={gateColor}
                strokeWidth="2.8"
                strokeLinecap="round"
                style={glow ? { filter: glow } : undefined}
            />
            {variant === "401" && (
                // Lock icon overlay on gate
                <g transform="translate(42, 22)">
                    <rect
                        x="0"
                        y="4"
                        width="12"
                        height="9"
                        rx="1.5"
                        fill="none"
                        stroke={C.amber}
                        strokeWidth="1.2"
                    />
                    <path
                        d="M2 4V3a4 4 0 0 1 8 0v1"
                        stroke={C.amber}
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />
                </g>
            )}
            {variant === "offline" ? (
                <path
                    d="M48 30 H62"
                    stroke={C.dim}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="3 4"
                />
            ) : (
                <path
                    d="M48 30 H72"
                    stroke={outputColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={variant === "502" ? "3 3" : undefined}
                />
            )}
            {(variant === "500" || variant === "502") && (
                <>
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
                </>
            )}
        </svg>
    );
}

// ── 500 ───────────────────────────────────────────────────────────────────────
export function ServerErrorPage() {
    const [expanded, setExpanded] = useState(false);
    const TRACE = `  at fate.connectToProvider(fate:309:22)\n  at fate.connectorTimeout(fate:158:29)\n  at fate.ListocretocFeocanshelatern(i:335:203)`;

    return (
        <ErrorShell
            code="500"
            logo={<ErrorLogo variant="500" />}
            title="Something went wrong on our end."
        >
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                Gateway returned <span style={{ color: C.red }}>500</span> ·
                Check <span style={{ color: C.blue }}>/api/health</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <ActionBtn
                    onClick={() => window.location.reload()}
                    label="Retry"
                />
                <ActionBtn onClick={() => {}} label="Check status →" outline />
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
                    {expanded ? "▾" : "▸"} {expanded ? "hide" : "show"} stack
                    trace
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
            <TerminalLine
                text={`[gateway] 500 · /api/chat/stream · upstream provider timeout · see /api/health`}
                color={C.red}
            />
        </ErrorShell>
    );
}

// ── 401 ───────────────────────────────────────────────────────────────────────
export function UnauthorizedPage() {
    const { setWorkspace } = useAppStore();
    return (
        <ErrorShell
            code="401"
            logo={<ErrorLogo variant="401" />}
            title="Invalid or missing API key."
        >
            <div style={{ display: "flex", gap: 8 }}>
                <ActionBtn
                    onClick={() => setWorkspace("settings")}
                    label="Add a key →"
                />
                <ActionBtn
                    onClick={() => setWorkspace("tester")}
                    label="Check key status →"
                    outline
                />
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: C.amber,
                    fontFamily: C.mono,
                    background: C.amberDim,
                    border: `1px solid ${C.amberBdr}`,
                    borderRadius: 5,
                    padding: "5px 9px"
                }}
            >
                <span>which provider required key</span>
                <span
                    style={{
                        background: C.redDim,
                        border: `1px solid ${C.redBdr}`,
                        padding: "1px 6px",
                        borderRadius: 3,
                        fontSize: 10,
                        color: C.red
                    }}
                >
                    invalid_key
                </span>
            </div>
            <TerminalLine
                text={`[key:anthropic] 401 · key rejected · add via /settings or UI`}
                color={C.amber}
            />
        </ErrorShell>
    );
}

// ── 502 ───────────────────────────────────────────────────────────────────────
export function BadGatewayPage() {
    const [url, setUrl] = useState("http://localhost:4000");
    return (
        <ErrorShell
            code="502"
            logo={<ErrorLogo variant="502" />}
            title="Can't reach the Conduit gateway."
        >
            <p style={{ fontSize: 12, color: C.dim, textAlign: "center" }}>
                Make sure the gateway is running at the configured URL.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
                <ActionBtn
                    onClick={() => window.location.reload()}
                    label="Retry connection"
                />
                <ActionBtn
                    onClick={() => {}}
                    label="Check gateway URL"
                    outline
                />
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: C.surface,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 6,
                    padding: "6px 10px",
                    width: "100%",
                    maxWidth: 400
                }}
            >
                <span
                    style={{ fontSize: 11, color: C.dim, whiteSpace: "nowrap" }}
                >
                    Current value
                </span>
                <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        outline: "none",
                        fontSize: 11,
                        color: C.text,
                        fontFamily: C.mono
                    }}
                />
                <button
                    style={{
                        background: C.surface2,
                        border: `1px solid ${C.border2}`,
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: 10,
                        color: C.sub,
                        cursor: "pointer"
                    }}
                >
                    Edit
                </button>
            </div>
            <TerminalLine
                text={`[api] connection refused · http://localhost:4000 · ECONNREFUSED`}
                color={C.red}
            />
        </ErrorShell>
    );
}

// ── 429 ───────────────────────────────────────────────────────────────────────
export function RateLimitPage() {
    const [countdown] = useState("00:42");
    return (
        <ErrorShell
            code="429"
            logo={<ErrorLogo variant="429" />}
            title="Rate limited by provider."
        >
            <p
                style={{
                    fontSize: 13,
                    color: C.dim,
                    textAlign: "center",
                    maxWidth: 340
                }}
            >
                Conduit will retry automatically after the window resets. Retry
                in{" "}
                <span style={{ color: C.amber, fontFamily: C.mono }}>
                    {countdown}
                </span>
            </p>
            <div
                style={{
                    background: C.surface,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 7,
                    padding: "10px 14px",
                    width: "100%",
                    maxWidth: 360
                }}
            >
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 6 }}>
                    Which provider triggered it?
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                        style={{
                            fontSize: 12,
                            color: C.sub,
                            fontFamily: C.mono
                        }}
                    >
                        name →
                    </span>
                    <span
                        style={{
                            fontSize: 10,
                            background: C.blueDim,
                            border: `1px solid ${C.blueBdr}`,
                            color: C.blue,
                            padding: "2px 6px",
                            borderRadius: 3,
                            fontFamily: C.mono
                        }}
                    >
                        gpt-4o · core limited
                    </span>
                </div>
            </div>
            <TerminalLine
                text={`[cascade] rate_limited · gpt-4o · switching to claude-sonnet-4-6 · window resets in 42s`}
                color={C.amber}
            />
        </ErrorShell>
    );
}

// ── Offline ───────────────────────────────────────────────────────────────────
export function OfflinePage() {
    const checks = [
        { label: "Gateway reachable", ok: false },
        { label: "Internet connected", ok: false },
        { label: "Ollama (local)", ok: true }
    ];
    return (
        <ErrorShell
            code={null}
            logo={<ErrorLogo variant="offline" />}
            title="No connection."
        >
            <p style={{ fontSize: 13, color: C.dim }}>
                Conduit can't reach the internet or the gateway.
            </p>
            <div
                style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    width: "100%",
                    maxWidth: 300
                }}
            >
                {checks.map(c => (
                    <div
                        key={c.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12
                        }}
                    >
                        <span
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                flexShrink: 0,
                                background: c.ok ? C.greenDim : C.redDim,
                                border: `1px solid ${c.ok ? C.greenBdr : C.redBdr}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 8,
                                color: c.ok ? C.green : C.red
                            }}
                        >
                            {c.ok ? "✓" : "✕"}
                        </span>
                        <span style={{ color: c.ok ? C.sub : C.dim }}>
                            {c.label}
                        </span>
                    </div>
                ))}
            </div>
            <TerminalLine
                text={`[network] all providers unreachable · ollama available at localhost:11434`}
                color={C.dim}
            />
        </ErrorShell>
    );
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function ErrorShell({
    code,
    logo,
    title,
    children
}: {
    code: string | null;
    logo: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
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
            {logo}
            {code && (
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
                    {code}
                </div>
            )}
            <p style={{ fontSize: 16, color: C.dim, textAlign: "center" }}>
                {title}
            </p>
            {children}
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

function ActionBtn({
    onClick,
    label,
    outline
}: {
    onClick: () => void;
    label: string;
    outline?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "9px 16px",
                borderRadius: 6,
                cursor: "pointer",
                background: outline ? "none" : C.surface2,
                border: `1px solid ${C.border2}`,
                color: outline ? C.sub : C.text,
                fontSize: 12,
                fontFamily: C.sans
            }}
        >
            {label}
        </button>
    );
}

function TerminalLine({ text, color }: { text: string; color: string }) {
    return (
        <div
            style={{
                fontSize: 10,
                color,
                fontFamily: C.mono,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: "5px 10px",
                maxWidth: 520,
                textAlign: "left"
            }}
        >
            {text}
        </div>
    );
}
