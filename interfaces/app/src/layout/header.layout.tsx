import { BarChart2, FileText, Activity, Globe, Settings } from "lucide-react";
import { C } from "@/lib/tokens";
import { useAppStore } from "@/store/app.store";

const TOOLBAR = [
    { icon: <BarChart2 size={14} />, tip: "Metrics" },
    { icon: <FileText size={14} />, tip: "Log" },
    { icon: <Activity size={14} />, tip: "Stream" },
    { icon: <Globe size={14} />, tip: "Network" },
    { icon: <Settings size={14} />, tip: "Config" }
];

export function HeaderLayout() {
    const { workspace } = useAppStore();

    const labels: Record<string, string> = {
        chat: "Chat Workspace.",
        compare: "Model Comparison Workspace.",
        benchmark: "Benchmark Workspace.",
        experiments: "Prompt Experiments Workspace.",
        rag: "RAG Workspace.",
        osint: "OSINT",
        prompts: "Prompt Library / saved prompts",
        models: "Local Models",
        tester: "API Tester",
        library: "Library / Images",
        projects: "Projects",
        runtime: "Runtime",
        settings: "Settings",
        changelog: "Changelog"
    };

    return (
        <div
            style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: `1px solid ${C.border}`,
                background: C.bg,
                flexShrink: 0
            }}
        >
            <span style={{ fontSize: 13, color: C.sub }}>
                {labels[workspace] ?? workspace}
            </span>
            <div style={{ display: "flex", gap: 2 }}>
                {TOOLBAR.map((t, i) => (
                    <button
                        key={i}
                        title={t.tip}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.dim,
                            padding: "5px 6px",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            transition: "color 0.12s"
                        }}
                        onMouseEnter={e =>
                            (e.currentTarget.style.color = C.sub)
                        }
                        onMouseLeave={e =>
                            (e.currentTarget.style.color = C.dim)
                        }
                    >
                        {t.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}
