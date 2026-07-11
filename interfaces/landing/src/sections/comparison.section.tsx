import { C } from "../lib/tokens";

function IconX({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.red}
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
function IconCheck({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.green}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
function IconMinus({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.amber}
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

type CellVal = "yes" | "no" | "mixed";

const ROWS: {
    feature: string;
    rawApi: CellVal;
    openRouter: CellVal;
    litellm: CellVal;
    conduit: CellVal;
}[] = [
    {
        feature: "Automatic fallback",
        rawApi: "no",
        openRouter: "no",
        litellm: "mixed",
        conduit: "yes"
    },
    {
        feature: "Self-hosted",
        rawApi: "no",
        openRouter: "no",
        litellm: "mixed",
        conduit: "yes"
    },
    {
        feature: "Keys never leave your machine",
        rawApi: "no",
        openRouter: "no",
        litellm: "mixed",
        conduit: "yes"
    },
    {
        feature: "Chat + Image + Search + Code",
        rawApi: "no",
        openRouter: "mixed",
        litellm: "mixed",
        conduit: "yes"
    },
    {
        feature: "Open source",
        rawApi: "yes",
        openRouter: "mixed",
        litellm: "yes",
        conduit: "yes"
    }
];

function Cell({ val, highlight }: { val: CellVal; highlight?: boolean }) {
    const icon =
        val === "yes" ? (
            <IconCheck size={13} />
        ) : val === "no" ? (
            <IconX size={13} />
        ) : (
            <IconMinus size={13} />
        );
    return (
        <td
            style={{
                padding: "12px 0",
                textAlign: "center",
                borderBottom: `1px solid ${C.border}`,
                background: highlight ? "rgba(59,130,246,0.06)" : "transparent"
            }}
        >
            {icon}
        </td>
    );
}

export function ComparisonSection() {
    return (
        <section
            style={{
                background: C.bg,
                borderTop: `1px solid ${C.border}`,
                padding: "96px 24px"
            }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ marginBottom: 48 }}>
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
                        Why Conduit
                    </div>
                    <h2
                        style={{
                            fontSize: "clamp(24px, 4vw, 40px)",
                            fontWeight: 300,
                            color: C.text,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1
                        }}
                    >
                        Why not just use the API directly?
                    </h2>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            tableLayout: "fixed"
                        }}
                    >
                        <colgroup>
                            <col style={{ width: "32%" }} />
                            <col style={{ width: "17%" }} />
                            <col style={{ width: "17%" }} />
                            <col style={{ width: "17%" }} />
                            <col style={{ width: "17%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        padding: "10px 0",
                                        textAlign: "left",
                                        fontSize: 11,
                                        color: C.dim,
                                        fontWeight: 500,
                                        borderBottom: `1px solid ${C.border}`
                                    }}
                                >
                                    Feature
                                </th>
                                {[
                                    { label: "Raw API keys", highlight: false },
                                    { label: "OpenRouter", highlight: false },
                                    { label: "LiteLLM", highlight: false },
                                    { label: "Conduit", highlight: true }
                                ].map(col => (
                                    <th
                                        key={col.label}
                                        style={{
                                            padding: "10px 0",
                                            textAlign: "center",
                                            fontSize: 11,
                                            fontWeight: col.highlight
                                                ? 700
                                                : 500,
                                            color: col.highlight
                                                ? C.blue
                                                : C.dim,
                                            borderBottom: `1px solid ${col.highlight ? C.blue : C.border}`,
                                            background: col.highlight
                                                ? "rgba(59,130,246,0.06)"
                                                : "transparent",
                                            letterSpacing: col.highlight
                                                ? "-0.01em"
                                                : 0
                                        }}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ROWS.map(row => (
                                <tr key={row.feature}>
                                    <td
                                        style={{
                                            padding: "12px 0",
                                            fontSize: 13,
                                            color: C.sub,
                                            borderBottom: `1px solid ${C.border}`
                                        }}
                                    >
                                        {row.feature}
                                    </td>
                                    <Cell val={row.rawApi} />
                                    <Cell val={row.openRouter} />
                                    <Cell val={row.litellm} />
                                    <Cell val={row.conduit} highlight />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p
                    style={{
                        marginTop: 28,
                        fontSize: 13,
                        color: C.dim,
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: 20
                    }}
                >
                    Conduit is the only option where nothing leaves your
                    machine.
                </p>
            </div>
        </section>
    );
}
