import { useState, useEffect, useCallback } from "react";
import { C } from "./lib/tokens";
import { Dot } from "./components/ui/primitives";
import { HealthTab, StatsTab, UsageTab, JobsTab } from "./tabs/tabs";
import type { Tab, HealthResp, StatsResp } from "./types/api.types";

const TABS: { id: Tab; label: string }[] = [
    { id: "health", label: "Health" },
    { id: "stats", label: "Scores" },
    { id: "usage", label: "Usage" },
    { id: "jobs", label: "Jobs" }
];

const REFRESH_MS = 15_000;

async function api<T>(path: string): Promise<T> {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json() as Promise<T>;
}

export default function App() {
    const [tab, setTab] = useState<Tab>("health");
    const [health, setHealth] = useState<HealthResp | null>(null);
    const [stats, setStats] = useState<StatsResp | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastAt, setLastAt] = useState<Date | null>(null);
    const [connErr, setConnErr] = useState("");
    const [tick, setTick] = useState(0);

    const refresh = useCallback(async () => {
        setLoading(true);
        setConnErr("");
        try {
            const [h, s] = await Promise.all([
                api<HealthResp>("/health"),
                api<StatsResp>("/stats")
            ]);
            setHealth(h);
            setStats(s);
            setLastAt(new Date());
        } catch (e) {
            setConnErr(String(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const t = setInterval(refresh, REFRESH_MS);
        return () => clearInterval(t);
    }, [refresh]);

    // Tick every second for job progress bars
    useEffect(() => {
        const t = setInterval(() => setTick(v => v + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const overallOk = health?.status === "ok";

    return (
        <>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; background: ${C.bg}; color: ${C.text}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

        .bottom-nav { display: none; }
        .top-nav { display: flex; }
        .content-wrap { padding: 24px; padding-bottom: 24px; }

        @media (max-width: 640px) {
          .bottom-nav { display: flex; }
          .top-nav-tabs { display: none; }
          .content-wrap { padding: 16px; padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 16px); }
        }
      `}</style>

            <div
                style={{
                    minHeight: "100dvh",
                    background: C.bg,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {/* Header */}
                <div
                    className="top-nav"
                    style={{
                        borderBottom: `1px solid ${C.border}`,
                        padding: "0 20px",
                        alignItems: "center",
                        height: 52,
                        gap: 4,
                        position: "sticky",
                        top: 0,
                        background: C.bg,
                        zIndex: 20
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginRight: 12
                        }}
                    >
                        <Dot on={overallOk} />
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.text,
                                letterSpacing: "-0.3px"
                            }}
                        >
                            Conduit Engine
                        </span>
                    </div>

                    <div
                        className="top-nav-tabs"
                        style={{ display: "flex", flex: 1, height: "100%" }}
                    >
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: tab === t.id ? 600 : 400,
                                    color: tab === t.id ? C.text : C.dim,
                                    padding: "0 8px",
                                    borderBottom:
                                        tab === t.id
                                            ? `2px solid ${C.blue}`
                                            : "2px solid transparent",
                                    height: 52,
                                    WebkitTapHighlightColor: "transparent"
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Connection indicators */}
                    {connErr && (
                        <span
                            style={{
                                fontSize: 11,
                                color: C.red,
                                maxWidth: 180,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {connErr}
                        </span>
                    )}
                    {lastAt && !connErr && (
                        <span style={{ fontSize: 11, color: C.dim }}>
                            {lastAt.toLocaleTimeString()}
                        </span>
                    )}
                    {health && (
                        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
                            {(["redis", "postgres"] as const).map(k => (
                                <span
                                    key={k}
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                        color: health[k] ? C.green : C.red,
                                        background: health[k]
                                            ? C.greenDim
                                            : C.redDim,
                                        letterSpacing: "0.06em"
                                    }}
                                >
                                    {k} {health[k] ? "●" : "○"}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div
                    className="content-wrap"
                    style={{
                        flex: 1,
                        maxWidth: 860,
                        width: "100%",
                        margin: "0 auto"
                    }}
                >
                    {tab === "health" && (
                        <HealthTab
                            health={health}
                            loading={loading}
                            onRefresh={refresh}
                        />
                    )}
                    {tab === "stats" && (
                        <StatsTab
                            stats={stats}
                            loading={loading}
                            onRefresh={refresh}
                        />
                    )}
                    {tab === "usage" && <UsageTab stats={stats} />}
                    {tab === "jobs" && <JobsTab stats={stats} tick={tick} />}
                </div>

                {/* Mobile bottom nav */}
                <div
                    className="bottom-nav"
                    style={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: `1px solid ${C.border}`,
                        background: C.bg,
                        zIndex: 20,
                        paddingBottom: "env(safe-area-inset-bottom, 0px)"
                    }}
                >
                    <div style={{ display: "flex", height: 56 }}>
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    flex: 1,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: tab === t.id ? 600 : 400,
                                    color: tab === t.id ? C.blue : C.dim,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderTop:
                                        tab === t.id
                                            ? `2px solid ${C.blue}`
                                            : "2px solid transparent",
                                    WebkitTapHighlightColor: "transparent"
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
