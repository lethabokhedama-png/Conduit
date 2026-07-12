import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { C, SHELL } from "@/lib/tokens";
import { useAppStore } from "@/store/app.store";

const TABS = ["Terminal", "API Log", "Event Stream", "Metrics"] as const;

export function TerminalPanel() {
    const {
        terminalTab,
        setTerminalTab,
        terminalLines,
        clearTerminal,
        setTerminalOpen
    } = useAppStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalLines]);

    const lineColor = (type: string) => {
        if (type === "success") return C.green;
        if (type === "error") return C.red;
        if (type === "dim") return C.dim;
        return C.sub;
    };

    return (
        <div
            style={{
                height: SHELL.terminalH,
                borderTop: `1px solid ${C.border}`,
                background: C.bg,
                display: "flex",
                flexDirection: "column",
                flexShrink: 0
            }}
        >
            {/* Tab bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: `1px solid ${C.border}`,
                    padding: "0 12px",
                    height: 32,
                    flexShrink: 0,
                    gap: 0
                }}
            >
                {TABS.map(tab => {
                    const id = tab
                        .toLowerCase()
                        .replace(" ", "-") as typeof terminalTab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setTerminalTab(id)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                padding: "0 10px",
                                height: 32,
                                color: terminalTab === id ? C.text : C.dim,
                                borderBottom:
                                    terminalTab === id
                                        ? `1px solid ${C.blue}`
                                        : "1px solid transparent",
                                fontFamily: C.sans,
                                transition: "color 0.12s"
                            }}
                        >
                            {tab}
                        </button>
                    );
                })}
                <div style={{ flex: 1 }} />
                <button
                    onClick={clearTerminal}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 10,
                        color: C.dim,
                        padding: "0 8px",
                        fontFamily: C.sans
                    }}
                >
                    Clear
                </button>
                <button
                    onClick={() => setTerminalOpen(false)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.dim,
                        display: "flex",
                        padding: "4px"
                    }}
                >
                    <X size={13} />
                </button>
            </div>

            {/* Log content */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "6px 14px",
                    fontFamily: C.mono,
                    fontSize: 11,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}
            >
                {terminalLines.map(line => (
                    <div
                        key={line.id}
                        style={{ color: lineColor(line.type), lineHeight: 1.6 }}
                    >
                        {line.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
