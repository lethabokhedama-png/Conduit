interface LogoProps {
    size?: number;
    color?: string;
}

export function LogoMark({ size = 24, color = "white" }: LogoProps) {
    return (
        <svg
            width={size}
            height={size * 0.75}
            viewBox="0 0 80 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Conduit"
        >
            <path
                d="M4 14 H28 Q44 14 44 30"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4 30 H44"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M4 46 H28 Q44 46 44 30"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line
                x1="48"
                y1="10"
                x2="48"
                y2="50"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M48 30 H76"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function LogoWordmark({ size = 22 }: { size?: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark size={size} />
            <span
                style={{
                    fontSize: size * 0.75,
                    fontWeight: 400,
                    color: "white",
                    letterSpacing: "-0.02em",
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    lineHeight: 1
                }}
            >
                Conduit
            </span>
        </div>
    );
}
