export const C = {
    bg: "#080808",
    surface: "#0f0f0f",
    border: "#1e1e1e",
    dim: "#666",
    text: "#e5e5e5",
    sub: "#999",
    green: "#22c55e",
    greenDim: "#052e16",
    red: "#ef4444",
    redDim: "#2d0a0a",
    amber: "#f59e0b",
    amberDim: "#2d1a00",
    blue: "#3b82f6",
    blueDim: "#0c1a2e"
} as const;

export const scoreColor = (s: number) =>
    s >= 0.8 ? C.green : s >= 0.5 ? C.amber : C.red;
export const scoreBg = (s: number) =>
    s >= 0.8 ? C.greenDim : s >= 0.5 ? C.amberDim : C.redDim;
export const fmtCost = (v: number) =>
    v < 0.001
        ? `$${v.toFixed(5)}`
        : v < 0.01
          ? `$${v.toFixed(4)}`
          : `$${v.toFixed(2)}`;
export const fmtAvgLatency = (req: number, ms: number) =>
    req === 0 ? "—" : `${Math.round(ms / req)}ms`;
export const fmtNextRun = (iso: string | null) => {
    if (!iso) return "—";
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return "now";
    const s = Math.floor(diff / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};
export const INTERVAL_LABELS: Record<string, string> = {
    aggregate_usage: "5 min",
    recalculate_health: "2 min",
    aggregate_cascade: "10 min",
    keepalive: "14 min"
};
export const INTERVAL_MS: Record<string, number> = {
    aggregate_usage: 5 * 60 * 1000,
    recalculate_health: 2 * 60 * 1000,
    aggregate_cascade: 10 * 60 * 1000,
    keepalive: 14 * 60 * 1000
};
