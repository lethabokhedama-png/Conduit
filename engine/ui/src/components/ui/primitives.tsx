import type { CSSProperties, ReactNode } from "react";
import { C } from "../../lib/tokens";

export function Card({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                overflow: "hidden"
            }}
        >
            {children}
        </div>
    );
}

export function Row({
    children,
    style
}: {
    children: ReactNode;
    style?: CSSProperties;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "11px 14px",
                borderBottom: `1px solid ${C.border}`,
                gap: 10,
                minHeight: 44,
                ...style
            }}
        >
            {children}
        </div>
    );
}

export function SL({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.dim,
                marginBottom: 10
            }}
        >
            {children}
        </div>
    );
}

export function Badge({
    label,
    color,
    bg
}: {
    label: string;
    color: string;
    bg: string;
}) {
    return (
        <span
            style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 4,
                color,
                background: bg,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                flexShrink: 0
            }}
        >
            {label}
        </span>
    );
}

export function Dot({ on }: { on: boolean }) {
    return (
        <span
            style={{ color: on ? C.green : C.red, fontSize: 9, flexShrink: 0 }}
        >
            ●
        </span>
    );
}

export function Pre({ children }: { children: ReactNode }) {
    return (
        <pre
            style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: 12,
                fontSize: 12,
                fontFamily: "monospace",
                color: C.sub,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                marginTop: 8
            }}
        >
            {children}
        </pre>
    );
}

export function RefreshBtn({
    onClick,
    loading
}: {
    onClick: () => void;
    loading: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            style={{
                background: "#1a1a1a",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: loading ? C.dim : C.text,
                fontSize: 13,
                padding: "10px 16px",
                cursor: loading ? "not-allowed" : "pointer",
                minHeight: 44,
                WebkitTapHighlightColor: "transparent"
            }}
        >
            {loading ? "Loading…" : "Refresh"}
        </button>
    );
}

export function Spacer() {
    return <div style={{ flex: 1 }} />;
}
