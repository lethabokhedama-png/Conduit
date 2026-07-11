import React from 'react'

export const C = {
  bg: "#080808",
  surface: "#0f0f0f",
  surface2: "#141414",
  surface3: "#181818",
  border: "#1e1e1e",
  border2: "#2a2a2a",
  border3: "#333",
  text: "#e5e5e5",
  sub: "#999",
  dim: "#555",
  dimmer: "#333",
  green: "#22c55e",
  greenDim: "#052e16",
  greenBorder: "rgba(34,197,94,0.2)",
  red: "#ef4444",
  redDim: "#2d0a0a",
  amber: "#f59e0b",
  amberDim: "#2d1a00",
  amberBorder: "rgba(245,158,11,0.2)",
  blue: "#3b82f6",
  blueDim: "#0c1a2e",
  blueBorder: "rgba(59,130,246,0.25)",
  purple: "#a855f7",
  purpleDim: "#1a0a2e",
  mono: "ui-monospace,'Cascadia Code','SF Mono',monospace",
} as const;

export const star = React.createElement(
    "svg",
    {
        width: 20,
        height:20,
        viewBox: '0 0 24 24',
        fill: C.dim,
        "aria-hidden": true,
    },
    React.createElement("path", 
                        {
                            d: "M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
                        })
);