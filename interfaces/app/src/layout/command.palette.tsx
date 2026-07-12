import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { C } from "@/lib/tokens";
import { useAppStore, type WorkspaceId } from "@/store/app.store";

interface Command {
    label: string;
    shortcut?: string;
    action: () => void;
    section: string;
}

export function CommandPalette() {
    const { setCommandOpen, setWorkspace } = useAppStore();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setCommandOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [setCommandOpen]);

    const go = (ws: WorkspaceId) => {
        setWorkspace(ws);
        setCommandOpen(false);
    };

    const COMMANDS: Command[] = [
        // Navigation
        {
            section: "Navigation",
            label: "Go to Chat",
            shortcut: "⌘1",
            action: () => go("chat")
        },
        {
            section: "Navigation",
            label: "Go to Benchmark",
            shortcut: "⌘2",
            action: () => go("benchmark")
        },
        {
            section: "Navigation",
            label: "Go to Settings",
            shortcut: "⌘,",
            action: () => go("settings")
        },
        // Actions
        {
            section: "Actions",
            label: "New conversation",
            shortcut: "⌘N",
            action: () => go("chat")
        },
        {
            section: "Actions",
            label: "Clear context",
            shortcut: "⌘⇧C",
            action: () => {}
        },
        { section: "Actions", label: "Export conversation", action: () => {} },
        {
            section: "Actions",
            label: "Run benchmark",
            action: () => go("benchmark")
        },
        // Switch
        {
            section: "Switch model",
            label: "Switch to gpt-4o",
            shortcut: "S:0.16",
            action: () => {}
        },
        {
            section: "Switch model",
            label: "Switch to claude-sonnet-4-6",
            action: () => {}
        },
        // Tester
        {
            section: "Test",
            label: "Test 3 conversations yet",
            action: () => go("tester")
        },
        {
            section: "Test",
            label: "Test 3tb claude sonnet by title",
            action: () => go("tester")
        }
    ];

    const filtered = COMMANDS.filter(
        c => !query || c.label.toLowerCase().includes(query.toLowerCase())
    );

    const sections = [...new Set(filtered.map(c => c.section))];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => setCommandOpen(false)}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    zIndex: 100,
                    backdropFilter: "blur(2px)"
                }}
            />

            {/* Palette */}
            <div
                style={{
                    position: "fixed",
                    top: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 480,
                    maxHeight: 400,
                    background: C.surface,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 10,
                    zIndex: 101,
                    overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {/* Search input */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        borderBottom: `1px solid ${C.border}`
                    }}
                >
                    <Search size={14} color={C.dim} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search commands…"
                        style={{
                            background: "none",
                            border: "none",
                            outline: "none",
                            fontSize: 13,
                            color: C.text,
                            flex: 1,
                            fontFamily: C.sans
                        }}
                    />
                    <span
                        style={{
                            fontSize: 10,
                            color: C.dim,
                            background: C.surface2,
                            border: `1px solid ${C.border2}`,
                            padding: "2px 6px",
                            borderRadius: 4
                        }}
                    >
                        ESC
                    </span>
                </div>

                {/* Results */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                    {sections.map(section => (
                        <div key={section}>
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: C.dim,
                                    padding: "8px 14px 4px",
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase"
                                }}
                            >
                                {section}
                            </div>
                            {filtered
                                .filter(c => c.section === section)
                                .map((cmd, i) => (
                                    <button
                                        key={i}
                                        onClick={cmd.action}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "8px 14px",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: C.text,
                                            fontSize: 13,
                                            textAlign: "left",
                                            fontFamily: C.sans,
                                            transition: "background 0.1s"
                                        }}
                                        onMouseEnter={e =>
                                            (e.currentTarget.style.background =
                                                C.surface2)
                                        }
                                        onMouseLeave={e =>
                                            (e.currentTarget.style.background =
                                                "none")
                                        }
                                    >
                                        {cmd.label}
                                        {cmd.shortcut && (
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    color: C.dim,
                                                    fontFamily: C.mono,
                                                    background: C.surface3,
                                                    border: `1px solid ${C.border2}`,
                                                    padding: "1px 6px",
                                                    borderRadius: 3
                                                }}
                                            >
                                                {cmd.shortcut}
                                            </span>
                                        )}
                                    </button>
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
