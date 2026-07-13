import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { C } from "@/lib/tokens";
import { useToastStore } from "@/store/toast.store";
import type { ToastType } from "@/store/toast.store";

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={13} color={C.green} />,
    error: <XCircle size={13} color={C.red} />,
    warning: <AlertTriangle size={13} color={C.amber} />,
    info: <Info size={13} color={C.blue} />
};

const COLORS: Record<ToastType, string> = {
    success: C.green,
    error: C.red,
    warning: C.amber,
    info: C.blue
};

export function ToastContainer() {
    const { toasts, remove } = useToastStore();
    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 300
            }}
        >
            {toasts.map(t => (
                <div
                    key={t.id}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: C.surface,
                        border: `1px solid ${C.border2}`,
                        borderLeft: `3px solid ${COLORS[t.type]}`,
                        borderRadius: 8,
                        minWidth: 260,
                        maxWidth: 380,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        fontSize: 12,
                        color: C.text
                    }}
                >
                    {ICONS[t.type]}
                    <span style={{ flex: 1, lineHeight: 1.5 }}>
                        {t.message}
                    </span>
                    <button
                        onClick={() => remove(t.id)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.dim,
                            display: "flex",
                            flexShrink: 0
                        }}
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </div>
    );
}
