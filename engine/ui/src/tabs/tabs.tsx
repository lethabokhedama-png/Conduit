import { useEffect } from "react";
import {
    C,
    scoreColor,
    scoreBg,
    fmtCost,
    fmtAvgLatency,
    fmtNextRun,
    INTERVAL_LABELS,
    INTERVAL_MS
} from "../lib/tokens";
import {
    Card,
    Row,
    SL,
    Badge,
    Dot,
    Pre,
    RefreshBtn,
    Spacer
} from "../components/ui/primitives";
import type { HealthResp, StatsResp } from "../types/api.types";

// ── Health ────────────────────────────────────────────────────────────────────
export function HealthTab({
    health,
    loading,
    onRefresh
}: {
    health: HealthResp | null;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <RefreshBtn onClick={onRefresh} loading={loading} />

            <div>
                <SL>GET /health</SL>
                <Card>
                    {health ? (
                        <>
                            <Row>
                                <span style={{ fontSize: 13 }}>Status</span>
                                <Spacer />
                                <Badge
                                    label={health.status}
                                    color={
                                        health.status === "ok"
                                            ? C.green
                                            : C.amber
                                    }
                                    bg={
                                        health.status === "ok"
                                            ? C.greenDim
                                            : C.amberDim
                                    }
                                />
                            </Row>
                            <Row>
                                <Dot on={health.redis} />
                                <span style={{ fontSize: 13 }}>Redis</span>
                                <Spacer />
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: health.redis ? C.green : C.red
                                    }}
                                >
                                    {health.redis ? "connected" : "unreachable"}
                                </span>
                            </Row>
                            <Row>
                                <Dot on={health.postgres} />
                                <span style={{ fontSize: 13 }}>Postgres</span>
                                <Spacer />
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: health.postgres ? C.green : C.red
                                    }}
                                >
                                    {health.postgres
                                        ? "connected"
                                        : "unreachable"}
                                </span>
                            </Row>
                        </>
                    ) : (
                        <Row>
                            <span style={{ color: C.dim, fontSize: 13 }}>
                                No data yet
                            </span>
                        </Row>
                    )}
                </Card>
            </div>

            {health && (
                <div>
                    <SL>Raw response</SL>
                    <Pre>{JSON.stringify(health, null, 2)}</Pre>
                </div>
            )}
        </div>
    );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function StatsTab({
    stats,
    loading,
    onRefresh
}: {
    stats: StatsResp | null;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <RefreshBtn onClick={onRefresh} loading={loading} />

            {stats && Object.keys(stats.health_scores).length > 0 && (
                <div>
                    <SL>Provider health scores (Redis cache)</SL>
                    <Card>
                        {Object.entries(stats.health_scores)
                            .sort(([, a], [, b]) => b - a)
                            .map(([provider, score]) => (
                                <Row key={provider}>
                                    <span
                                        style={{
                                            width: 120,
                                            fontSize: 13,
                                            fontFamily: "monospace",
                                            flexShrink: 0
                                        }}
                                    >
                                        {provider}
                                    </span>
                                    <div
                                        style={{
                                            flex: 1,
                                            background: "#1a1a1a",
                                            borderRadius: 3,
                                            height: 4,
                                            overflow: "hidden"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${score * 100}%`,
                                                height: "100%",
                                                background: scoreColor(score),
                                                transition: "width 0.4s"
                                            }}
                                        />
                                    </div>
                                    <span
                                        style={{
                                            width: 44,
                                            textAlign: "right",
                                            fontSize: 12,
                                            fontFamily: "monospace",
                                            color: scoreColor(score),
                                            flexShrink: 0
                                        }}
                                    >
                                        {(score * 100).toFixed(0)}%
                                    </span>
                                    <Badge
                                        label={
                                            score >= 0.8
                                                ? "healthy"
                                                : score >= 0.5
                                                  ? "degraded"
                                                  : "critical"
                                        }
                                        color={scoreColor(score)}
                                        bg={scoreBg(score)}
                                    />
                                </Row>
                            ))}
                    </Card>
                </div>
            )}

            {stats && <Pre>{JSON.stringify(stats, null, 2)}</Pre>}
        </div>
    );
}

// ── Usage ─────────────────────────────────────────────────────────────────────
export function UsageTab({ stats }: { stats: StatsResp | null }) {
    if (!stats || stats.usage.length === 0) {
        return (
            <div
                style={{
                    color: C.dim,
                    fontSize: 13,
                    padding: "20px 0",
                    lineHeight: 1.6
                }}
            >
                No usage data in Redis yet. Send at least one request through
                the gateway first.
            </div>
        );
    }

    const totalReqs = stats.usage.reduce((s, u) => s + u.request_count, 0);
    const totalTokens = stats.usage.reduce((s, u) => s + u.total_tokens, 0);
    const totalCost = stats.usage.reduce((s, u) => s + u.total_cost_usd, 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Summary cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8
                }}
            >
                {[
                    { label: "Requests", value: totalReqs.toLocaleString() },
                    { label: "Tokens", value: totalTokens.toLocaleString() },
                    { label: "Cost", value: fmtCost(totalCost) }
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            padding: "12px 14px"
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: C.dim,
                                marginBottom: 4
                            }}
                        >
                            {label}
                        </div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                fontFamily: "monospace",
                                color: C.text
                            }}
                        >
                            {value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-provider — mobile: stacked cards instead of table */}
            <div>
                <SL>Per-provider breakdown</SL>
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                    {stats.usage.map(u => {
                        const errRate =
                            u.request_count > 0
                                ? u.error_count / u.request_count
                                : 0;
                        return (
                            <div
                                key={u.provider}
                                style={{
                                    background: C.surface,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 8,
                                    padding: "12px 14px"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 8
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontFamily: "monospace",
                                            fontWeight: 600
                                        }}
                                    >
                                        {u.provider}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: C.sub,
                                            fontFamily: "monospace"
                                        }}
                                    >
                                        {fmtCost(u.total_cost_usd)}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: 8
                                    }}
                                >
                                    {[
                                        {
                                            label: "Req",
                                            value: u.request_count.toLocaleString(),
                                            color: C.sub
                                        },
                                        {
                                            label: "Err",
                                            value: String(u.error_count),
                                            color:
                                                errRate > 0.1
                                                    ? C.red
                                                    : errRate > 0
                                                      ? C.amber
                                                      : C.dim
                                        },
                                        {
                                            label: "RL",
                                            value: String(u.rate_limit_hits),
                                            color:
                                                u.rate_limit_hits > 0
                                                    ? C.amber
                                                    : C.dim
                                        },
                                        {
                                            label: "Lat",
                                            value: fmtAvgLatency(
                                                u.request_count,
                                                u.total_latency_ms
                                            ),
                                            color: C.sub
                                        }
                                    ].map(({ label, value, color }) => (
                                        <div key={label}>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.08em",
                                                    color: C.dim,
                                                    marginBottom: 2
                                                }}
                                            >
                                                {label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    fontFamily: "monospace",
                                                    color
                                                }}
                                            >
                                                {value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
const JOB_DOCS: Record<string, string> = {
    aggregate_usage:
        "Reads Redis usage counters → upserts into Postgres usage_hourly by hour bucket.",
    recalculate_health:
        "Recomputes provider health scores from Redis. Writes back with 120s TTL.",
    aggregate_cascade:
        "Reads cascade_events from Postgres. Logs trigger reasons and profile stats.",
    keepalive:
        "Pings SELF_URL/health every 14 min to prevent free-tier host sleep."
};

export function JobsTab({
    stats,
    tick
}: {
    stats: StatsResp | null;
    tick: number;
}) {
    if (!stats || stats.jobs.length === 0) {
        return (
            <div style={{ color: C.dim, fontSize: 13, padding: "20px 0" }}>
                Scheduler not running or no jobs registered.
            </div>
        );
    }

    return (
        <div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
            key={tick}
        >
            <SL>Registered scheduler jobs</SL>
            {stats.jobs.map(job => {
                const total = INTERVAL_MS[job.id] ?? 60_000;
                const remaining = job.next_run
                    ? new Date(job.next_run).getTime() - Date.now()
                    : 0;
                const pct = Math.max(
                    0,
                    Math.min(100, ((total - remaining) / total) * 100)
                );

                return (
                    <div
                        key={job.id}
                        style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            padding: "14px 16px"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    flex: 1
                                }}
                            >
                                {job.name}
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    color: C.dim,
                                    flexShrink: 0
                                }}
                            >
                                {INTERVAL_LABELS[job.id] ?? "—"}
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    color: C.blue,
                                    flexShrink: 0
                                }}
                            >
                                {fmtNextRun(job.next_run)}
                            </span>
                        </div>
                        <p
                            style={{
                                fontSize: 12,
                                color: C.dim,
                                lineHeight: 1.6,
                                marginBottom: 8
                            }}
                        >
                            {JOB_DOCS[job.id] ?? "Scheduled background task."}
                        </p>
                        {job.next_run && (
                            <div
                                style={{
                                    height: 3,
                                    background: "#1a1a1a",
                                    borderRadius: 2,
                                    overflow: "hidden"
                                }}
                            >
                                <div
                                    style={{
                                        width: `${pct}%`,
                                        height: "100%",
                                        background: C.blue,
                                        transition: "width 1s linear"
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
