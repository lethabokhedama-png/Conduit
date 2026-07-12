// Design tokens — matches gateway/ui and all existing interfaces
export const C = {
    // Base surfaces
    bg: "#080808",
    surface: "#0f0f0f",
    surface2: "#141414",
    surface3: "#181818",

    // Borders
    border: "#1e1e1e",
    border2: "#2a2a2a",
    border3: "#333333",

    // Text
    text: "#e5e5e5",
    sub: "#999999",
    dim: "#555555",
    dimmer: "#333333",

    // Semantic
    green: "#22c55e",
    greenDim: "#052e16",
    greenBdr: "rgba(34,197,94,0.2)",
    red: "#ef4444",
    redDim: "#2d0a0a",
    redBdr: "rgba(239,68,68,0.2)",
    amber: "#f59e0b",
    amberDim: "#2d1a00",
    amberBdr: "rgba(245,158,11,0.2)",
    blue: "#3b82f6",
    blueDim: "#0c1a2e",
    blueBdr: "rgba(59,130,246,0.25)",
    purple: "#a855f7",
    purpleDim: "#1a0a2e",
    purpleBdr: "rgba(168,85,247,0.2)",

    // Fonts
    mono: "ui-monospace,'Cascadia Code','SF Mono',Menlo,monospace",
    sans: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
} as const;

// Shell dimensions — matches Image 4 exactly
export const SHELL = {
    iconRailW: 40, // narrow icon rail (leftmost)
    sidebarW: 280, // sidebar panel
    terminalH: 180 // bottom terminal panel
} as const;
