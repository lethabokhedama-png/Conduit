import { C } from "@/lib/tokens";

interface AvatarProps {
    name?: string;
    src?: string;
    size?: number;
    online?: boolean;
}

export function Avatar({ name, src, size = 28, online }: AvatarProps) {
    const initials = name
        ? name
              .split(" ")
              .map(w => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    return (
        <div
            style={{
                position: "relative",
                display: "inline-flex",
                flexShrink: 0
            }}
        >
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: src
                        ? "transparent"
                        : `linear-gradient(135deg, ${C.green}, ${C.blue})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: size * 0.36,
                    fontWeight: 600,
                    color: "white",
                    overflow: "hidden",
                    flexShrink: 0
                }}
            >
                {src ? (
                    <img
                        src={src}
                        alt={name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                ) : (
                    initials
                )}
            </div>
            {online !== undefined && (
                <span
                    style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: size * 0.28,
                        height: size * 0.28,
                        borderRadius: "50%",
                        background: online ? C.green : C.dim,
                        border: `1.5px solid ${C.bg}`
                    }}
                />
            )}
        </div>
    );
}
