import type { ReactNode } from "react";
import { C } from "@/lib/tokens";

interface EmptyProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function Empty({ icon, title, description, action }: EmptyProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 12,
                padding: "40px 24px",
                textAlign: "center"
            }}
        >
            {icon && (
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: C.surface2,
                        border: `1px solid ${C.border2}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.dim
                    }}
                >
                    {icon}
                </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, color: C.sub, fontWeight: 500 }}>
                    {title}
                </span>
                {description && (
                    <span
                        style={{
                            fontSize: 11,
                            color: C.dim,
                            lineHeight: 1.6,
                            maxWidth: 280
                        }}
                    >
                        {description}
                    </span>
                )}
            </div>
            {action}
        </div>
    );
}
