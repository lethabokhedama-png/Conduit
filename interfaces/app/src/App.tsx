import { useAppStore } from "@/store/app.store";
import { ShellLayout } from "@/layout/shell.layout";
import { ChatPage } from "@/pages/chat/chat.page";
import { SettingsPage } from "@/pages/settings/settings.page";
import { NotFoundPage } from "@/pages/errors/404.page";

// Stub pages — filled in subsequent commits
function StubPage({ label }: { label: string }) {
    const { C } = {
        C: {
            text: "#e5e5e5",
            dim: "#555",
            surface: "#0f0f0f",
            border: "#1e1e1e",
            mono: "monospace"
        }
    };
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 12,
                color: C.dim,
                fontFamily: "system-ui"
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    fontFamily: C.mono,
                    color: C.dim,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    padding: "4px 10px",
                    borderRadius: 4
                }}
            >
                {label} workspace
            </div>
            <p style={{ fontSize: 12, color: C.dim }}>Coming in next commit.</p>
        </div>
    );
}

function WorkspaceRouter() {
    const { workspace } = useAppStore();
    switch (workspace) {
        case "chat":
            return <ChatPage />;
        case "settings":
            return <SettingsPage />;
        case "benchmark":
            return <StubPage label="benchmark" />;
        case "compare":
            return <StubPage label="compare" />;
        case "experiments":
            return <StubPage label="experiments" />;
        case "rag":
            return <StubPage label="rag" />;
        case "osint":
            return <StubPage label="osint" />;
        case "prompts":
            return <StubPage label="prompts" />;
        case "models":
            return <StubPage label="models" />;
        case "tester":
            return <StubPage label="tester" />;
        case "library":
            return <StubPage label="library" />;
        case "projects":
            return <StubPage label="projects" />;
        case "runtime":
            return <StubPage label="runtime" />;
        case "changelog":
            return <StubPage label="changelog" />;
        default:
            return <NotFoundPage />;
    }
}

export default function App() {
    return (
        <>
            <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow: hidden; }
        body {
          font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          background: #080808; color: #e5e5e5;
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input, textarea, select, button { font-family: inherit; }
        a { color: inherit; text-decoration: none; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

            <ShellLayout>
                <WorkspaceRouter />
            </ShellLayout>
        </>
    );
}
