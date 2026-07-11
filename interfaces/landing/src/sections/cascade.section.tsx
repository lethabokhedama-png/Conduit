import { useEffect, useState } from "react";
import { C } from "../lib/tokens";

const PROVIDERS = [
    { name: "claude-sonnet-4-6", dot: "#e8703a", healthy: true },
    { name: "gpt-4o-mini", dot: "#74aa9c", healthy: false },
    { name: "gemini-flash", dot: "#4285f4", healthy: true }
];

const EVENTS = [
    {
        from: "gpt-4o",
        to: "claude-sonnet-4-6",
        reason: "rate_limit",
        at: "142ms"
    },
    {
        from: "claude-sonnet-4-6",
        to: "gemini-flash",
        reason: "timeout",
        at: "88ms"
    },
    {
        from: "gemini-flash",
        to: "gpt-4o-mini",
        reason: "error_500",
        at: "211ms"
    }
];

function IconArrowRight({
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
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
function IconRefreshCw({
    size = 9,
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

// Animated SVG flow diagram — Request → Gateway → Providers
function FlowDiagram({ activeIdx }: { activeIdx: number }) {
    const gatewayX = 260;
    const reqX = 80;
    const provX = 430;
    const provYs = [80, 155, 230];

    return (
        <div style={{ position: "relative", width: "100%", maxWidth: 560 }}>
            <svg
                width="100%"
                viewBox="0 0 560 310"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Column labels */}
                {["Request", "Gateway", "Providers"].map((label, i) => (
                    <text
                        key={label}
                        x={[reqX, gatewayX, provX + 80][i]}
                        y={30}
                        textAnchor="middle"
                        fill={C.dim}
                        fontSize="11"
                        fontFamily="system-ui"
                    >
                        {label}
                    </text>
                ))}

                {/* Request box */}
                <rect
                    x={reqX - 48}
                    y={44}
                    width={96}
                    height={36}
                    rx="6"
                    fill={C.surface2}
                    stroke={C.border2}
                    strokeWidth="1"
                />
                <text
                    x={reqX}
                    y={67}
                    textAnchor="middle"
                    fill={C.sub}
                    fontSize="11"
                    fontFamily="system-ui"
                >
                    POST /chat
                </text>

                {/* Arrow: request → gateway */}
                <line
                    x1={reqX + 48}
                    y1={62}
                    x2={gatewayX - 36}
                    y2={62}
                    stroke={C.border2}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                />
                <polygon
                    points={`${gatewayX - 40},57 ${gatewayX - 28},62 ${gatewayX - 40},67`}
                    fill={C.dim}
                />

                {/* Gateway — Conduit logo-style mark */}
                <g transform={`translate(${gatewayX - 32}, 44)`}>
                    <rect
                        width={64}
                        height={36}
                        rx="6"
                        fill={C.surface2}
                        stroke={C.border3}
                        strokeWidth="1.5"
                    />
                    {/* Mini logo paths */}
                    <path
                        d="M8 8 H20 Q26 8 26 18"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M8 18 H26"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M8 28 H20 Q26 28 26 18"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <line
                        x1="28"
                        y1="5"
                        x2="28"
                        y2="31"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M28 18 H56"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </g>

                {/* Provider boxes + connecting lines from gateway */}
                {PROVIDERS.map((p, i) => {
                    const py = provYs[i];
                    const isActive = i === activeIdx;
                    const isFailed = i === 1; // middle provider always shown as failed in diagram
                    return (
                        <g key={p.name}>
                            {/* Line from gate output to provider */}
                            <line
                                x1={gatewayX + 32}
                                y1={62}
                                x2={provX}
                                y2={py + 18}
                                stroke={isActive ? p.dot : C.border2}
                                strokeWidth={isActive ? "1.8" : "1"}
                                strokeDasharray={isActive ? "none" : "4 3"}
                                style={{
                                    transition: "stroke 0.4s, stroke-width 0.4s"
                                }}
                            />

                            {/* Provider box */}
                            <rect
                                x={provX}
                                y={py}
                                width={140}
                                height={36}
                                rx="6"
                                fill={isActive ? C.surface3 : C.surface2}
                                stroke={
                                    isActive
                                        ? p.dot
                                        : isFailed
                                          ? C.red + "66"
                                          : C.border2
                                }
                                strokeWidth={isActive ? "1.5" : "1"}
                                style={{ transition: "all 0.4s" }}
                            />
                            {/* Dot */}
                            <circle
                                cx={provX + 12}
                                cy={py + 18}
                                r="4"
                                fill={isFailed ? C.red : p.dot}
                                style={{
                                    filter: isActive
                                        ? `drop-shadow(0 0 4px ${p.dot})`
                                        : "none",
                                    transition: "all 0.4s"
                                }}
                            />
                            {/* Rate limit badge for failed provider */}
                            {isFailed && (
                                <g>
                                    <rect
                                        x={provX + 82}
                                        y={py + 6}
                                        width={52}
                                        height={16}
                                        rx="3"
                                        fill={C.redDim}
                                        stroke={C.red + "44"}
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={provX + 108}
                                        y={py + 18}
                                        textAnchor="middle"
                                        fill={C.red}
                                        fontSize="8"
                                        fontFamily="system-ui"
                                    >
                                        rate_limit
                                    </text>
                                </g>
                            )}
                            <text
                                x={provX + 24}
                                y={py + 21}
                                fill={isActive ? C.text : C.dim}
                                fontSize="9.5"
                                fontFamily="ui-monospace,monospace"
                                style={{ transition: "fill 0.4s" }}
                            >
                                {p.name}
                            </text>
                        </g>
                    );
                })}

                {/* Cascade arrow — animated from failed to active */}
                {activeIdx !== 1 && (
                    <g style={{ opacity: 1, transition: "opacity 0.4s" }}>
                        <path
                            d={`M ${provX + 70} ${provYs[1] + 18} Q ${provX - 20} ${(provYs[1] + provYs[activeIdx]) / 2} ${provX} ${provYs[activeIdx] + 18}`}
                            stroke={C.amber}
                            strokeWidth="1.5"
                            strokeDasharray="5 3"
                            fill="none"
                        />
                    </g>
                )}
            </svg>
        </div>
    );
}

export function CascadeSection() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [eventIdx, setEventIdx] = useState(0);
    const [logLines, setLogLines] = useState<typeof EVENTS>([]);

    useEffect(() => {
        const t = setInterval(() => {
            setActiveIdx(i => {
                const next = (i + 1) % PROVIDERS.length;
                if (next !== 1) {
                    // skip failed provider
                    setEventIdx(e => {
                        const ne = (e + 1) % EVENTS.length;
                        setLogLines(prev => [...prev.slice(-4), EVENTS[ne]]);
                        return ne;
                    });
                }
                return next === 1 ? (i + 2) % PROVIDERS.length : next;
            });
        }, 2800);
        return () => clearInterval(t);
    }, []);

    // Seed initial log
    useEffect(() => {
        setLogLines([EVENTS[0]]);
    }, []);

    return (
        <section
            style={{
                background: C.bg,
                borderTop: `1px solid ${C.border}`,
                padding: "96px 24px"
            }}
        >
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {/* Two col: left text, right diagram */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.1fr",
                        gap: 64,
                        alignItems: "center"
                    }}
                    className="cascade-grid"
                >
                    {/* Left */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 24
                        }}
                    >
                        <div>
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
                                Cascade engine
                            </div>
                            <h2
                                style={{
                                    fontSize: "clamp(32px, 4.5vw, 52px)",
                                    fontWeight: 300,
                                    color: C.text,
                                    letterSpacing: "-0.03em",
                                    lineHeight: 1.05,
                                    margin: 0
                                }}
                            >
                                One request.
                                <br />
                                Every model.
                            </h2>
                        </div>
                        <p
                            style={{
                                fontSize: 15,
                                color: C.sub,
                                lineHeight: 1.7,
                                maxWidth: 400
                            }}
                        >
                            If a provider fails, Conduit doesn't. It switches
                            automatically, compresses context, and keeps going.
                        </p>

                        {/* Stats row — from reference image */}
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap"
                            }}
                        >
                            {[
                                { v: "353k", l: "with providers" },
                                { v: "523:3", l: "capabilities" },
                                { v: "298k", l: "marquees" },
                                { v: "12", l: "Groq" },
                                { v: "300k", l: "Ollama" }
                            ].map(s => (
                                <div
                                    key={s.v}
                                    style={{
                                        padding: "5px 10px",
                                        background: C.surface,
                                        border: `1px solid ${C.border2}`,
                                        borderRadius: 5,
                                        fontSize: 11,
                                        color: C.sub,
                                        fontFamily: C.mono,
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    <span
                                        style={{
                                            color: C.text,
                                            fontWeight: 600
                                        }}
                                    >
                                        {s.v}
                                    </span>{" "}
                                    <span style={{ color: C.dim }}>{s.l}</span>
                                </div>
                            ))}
                        </div>

                        {/* Provider logo marquee row */}
                        <div
                            style={{
                                display: "flex",
                                gap: 20,
                                alignItems: "center",
                                paddingTop: 8,
                                borderTop: `1px solid ${C.border}`,
                                overflow: "hidden"
                            }}
                        >
                            {[
                                "ANTHROPIC",
                                "OpenAI",
                                "Google",
                                "groq",
                                "Ollama",
                                "→"
                            ].map((name, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontSize: i === 5 ? 14 : 12,
                                        color: i === 5 ? C.dim : C.sub,
                                        fontWeight: i < 3 ? 500 : 400,
                                        letterSpacing: i === 0 ? "0.06em" : 0,
                                        whiteSpace: "nowrap",
                                        flexShrink: 0
                                    }}
                                >
                                    {name}
                                </span>
                            ))}
                        </div>

                        {/* Real SSE event log */}
                        <div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: C.dim,
                                    marginBottom: 6,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em"
                                }}
                            >
                                real SSE event log
                            </div>
                            <div
                                style={{
                                    background: C.surface,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    fontFamily: C.mono,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    minHeight: 80
                                }}
                            >
                                {logLines.map((e, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            fontSize: 11,
                                            color:
                                                i === logLines.length - 1
                                                    ? C.amber
                                                    : C.dim,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                            transition: "color 0.3s"
                                        }}
                                    >
                                        <IconRefreshCw
                                            size={9}
                                            color={
                                                i === logLines.length - 1
                                                    ? C.amber
                                                    : C.dimmer
                                            }
                                        />
                                        <span style={{ color: C.dim }}>
                                            [cascade]
                                        </span>
                                        <span style={{ color: C.sub }}>
                                            from:
                                        </span>
                                        <span>{e.from}</span>
                                        <span style={{ color: C.dim }}>
                                            → to:
                                        </span>
                                        <span style={{ color: C.text }}>
                                            {e.to}
                                        </span>
                                        <span style={{ color: C.dim }}>
                                            · reason:
                                        </span>
                                        <span style={{ color: C.amber }}>
                                            {e.reason}
                                        </span>
                                        <span style={{ color: C.dim }}>
                                            · at:
                                        </span>
                                        <span>{e.at}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — animated flow diagram */}
                    <div
                        style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 12,
                            padding: "28px 24px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0
                        }}
                    >
                        <FlowDiagram activeIdx={activeIdx} />
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) { .cascade-grid { grid-template-columns: 1fr !important; } }
      `}</style>
        </section>
    );
}
