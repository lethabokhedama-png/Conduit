import { C } from "@/lib/tokens";
import type { CSSProperties } from "react";

type BadgeVariant =
    | "default"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "purple";

const VARIANTS: Record<
    BadgeVariant,
    { color: string; bg: string; border: string }
> = {
    default: { color: C.sub, bg: C.surface2, border: C.border2 },
    success: { color: C.green, bg: C.greenDim, border: C.greenBdr },
    error: { color: C.red, bg: C.redDim, border: C.redBdr },
    warning: { color: C.amber, bg: C.amberDim, border: C.amberBdr },
    info: { color: C.blue, bg: C.blueDim, border: C.blueBdr },
    purple: { color: C.purple, bg: C.purpleDim, border: C.purpleBdr }
};

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    style?: CSSProperties;
    dot?: boolean;
}

export function Badge({ label, variant = "default", style, dot }: BadgeProps) {
    const v = VARIANTS[variant];
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 4,
                letterSpacing: "0.04em",
                color: v.color,
                background: v.bg,
                border: `1px solid ${v.border}`,
                whiteSpace: "nowrap",
                flexShrink: 0,
                ...style
            }}
        >
            {dot && (
                <span
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: v.color,
                        flexShrink: 0
                    }}
                />
            )}
            {label}
        </span>
    );
}
