import type { CSSProperties, ReactNode } from "react";
import { C } from "@/lib/tokens";

type BtnVariant = "default" | "primary" | "danger" | "ghost" | "success";

const VARIANTS: Record<BtnVariant, CSSProperties> = {
    default: {
        background: C.surface2,
        color: C.text,
        border: `1px solid ${C.border2}`
    },
    primary: { background: C.blue, color: "white", border: "none" },
    danger: {
        background: C.redDim,
        color: C.red,
        border: `1px solid ${C.redBdr}`
    },
    ghost: {
        background: "none",
        color: C.sub,
        border: `1px solid ${C.border2}`
    },
    success: {
        background: C.greenDim,
        color: C.green,
        border: `1px solid ${C.greenBdr}`
    }
};

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: BtnVariant;
    disabled?: boolean;
    size?: "sm" | "md";
    style?: CSSProperties;
    icon?: ReactNode;
    type?: "button" | "submit";
}

export function Button({
    children,
    onClick,
    variant = "default",
    disabled,
    size = "md",
    style,
    icon,
    type = "button"
}: ButtonProps) {
    const v = VARIANTS[variant];
    const pad = size === "sm" ? "4px 9px" : "7px 14px";
    const fs = size === "sm" ? 11 : 13;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: pad,
                borderRadius: 6,
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: fs,
                fontWeight: 500,
                whiteSpace: "nowrap",
                opacity: disabled ? 0.4 : 1,
                transition: "opacity 0.12s, background 0.12s",
                WebkitTapHighlightColor: "transparent",
                ...v,
                ...style
            }}
        >
            {icon}
            {children}
        </button>
    );
}
