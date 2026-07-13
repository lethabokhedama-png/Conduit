import type { ReactNode } from "react";
import { X } from "lucide-react";
import { C } from "@/lib/tokens";

interface PanelProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: number;
}

export function DesktopPanel({
    open,
    onClose,
    title,
    children,
    width = 280
}: PanelProps) {
    if (!open) return null;

    return (
        <div
            style={{
                width,
                flexShrink: 0,
                borderLeft: `1px solid ${C.border}`,
                background: C.bg,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderBottom: `1px solid ${C.border}`,
                    flexShrink: 0
                }}
            >
                <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>
                    {title}
                </span>
                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.dim,
                        display: "flex"
                    }}
                >
                    <X size={13} />
                </button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
        </div>
    );
}
