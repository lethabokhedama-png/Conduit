import { C } from "@/lib/tokens";

interface ToggleProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label?: string;
    size?: "sm" | "md";
    disabled?: boolean;
}

export function Toggle({
    checked,
    onChange,
    label,
    size = "md",
    disabled
}: ToggleProps) {
    const w = size === "sm" ? 28 : 36;
    const h = size === "sm" ? 16 : 20;
    const d = size === "sm" ? 10 : 14;

    return (
        <label
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1
            }}
        >
            <div
                onClick={() => !disabled && onChange(!checked)}
                style={{
                    width: w,
                    height: h,
                    borderRadius: h / 2,
                    flexShrink: 0,
                    background: checked ? C.blue : C.border2,
                    position: "relative",
                    transition: "background 0.2s"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: (h - d) / 2,
                        left: checked ? w - d - (h - d) / 2 : (h - d) / 2,
                        width: d,
                        height: d,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                    }}
                />
            </div>
            {label && (
                <span style={{ fontSize: 12, color: C.sub }}>{label}</span>
            )}
        </label>
    );
}
