import { C } from "@/lib/tokens";
export function UptimeBar({ pct }: { pct: number }) {
    const color = pct >= 99 ? C.green : pct >= 95 ? C.amber : C.red;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                        width: `${pct}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 2
                    }}
                />
            </div>
            <span
                style={{
                    fontSize: 9,
                    color,
                    fontFamily: "monospace",
                    width: 36,
                    textAlign: "right"
                }}
            >
                {pct.toFixed(1)}%
            </span>
        </div>
    );
}
