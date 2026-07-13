import { useState, useEffect } from "react";
import { ShellLayout } from "@/layout/shell.layout";
import { OnboardingPage } from "@/pages/onboarding/onboarding.page";
import { LandingPage } from "@/pages/landing/landing.page";
import { ChatPage } from "@/pages/chat/chat.page";
import { ComparePage } from "@/pages/compare/compare.page";
import { BenchmarkPage } from "@/pages/benchmark/benchmark.page";
import { ExperimentsPage } from "@/pages/experiments/experiments.page";
import { RagPage } from "@/pages/rag/rag.page";
import { OsintPage } from "@/pages/osint/osint.page";
import { PromptsPage } from "@/pages/prompts/prompts.page";
import { ModelsPage } from "@/pages/models/models.page";
import { ProbePage } from "@/pages/tester/probe/probe.page";
import { StatusPage } from "@/pages/tester/status/status.page";
import { LibraryPage } from "@/pages/library/library.page";
import { ProjectsPage } from "@/pages/projects/projects.page";
import { RuntimePage } from "@/pages/runtime/runtime.page";
import { SettingsPage } from "@/pages/settings/settings.page";
import { ChangelogPage } from "@/pages/changelog/changelog.page";
import { GeneratePage } from "@/pages/media/generate/generate.page";
import { CanvasPage } from "@/pages/media/canvas/canvas.page";
import { CodePage } from "@/pages/media/code/code.page";
import { NotFoundPage } from "@/pages/errors/404.page";
import { ServerErrorPage } from "@/pages/errors/500.page";
import { ToastContainer } from "@/components/ui/toast.ui";
import { ErrorBoundary } from "@/layout/boundary.error";
import { useAppStore, type WorkspaceId } from "@/store/app.store";
import {
    useOnboardingStore,
    needsOnboarding
} from "@/pages/onboarding/onboarding.store";
import "@/styles/global.css";
import "@/styles/themes.css";
import "@/styles/typography.css";

// ── App state machine ─────────────────────────────────────────────────────────
// landing → onboarding → app
type AppStage = "landing" | "onboarding" | "app";

function WorkspaceRouter() {
    const { workspace } = useAppStore();
    const pages: Record<WorkspaceId, React.ReactNode> = {
        chat: <ChatPage />,
        compare: <ComparePage />,
        benchmark: <BenchmarkPage />,
        experiments: <ExperimentsPage />,
        rag: <RagPage />,
        osint: <OsintPage />,
        prompts: <PromptsPage />,
        models: <ModelsPage />,
        tester: <StatusPage />,
        library: <LibraryPage />,
        projects: <ProjectsPage />,
        runtime: <RuntimePage />,
        settings: <SettingsPage />,
        changelog: <ChangelogPage />,
        "media-generate": <GeneratePage />,
        "media-canvas": <CanvasPage />,
        "media-code": <CodePage />
    };
    return <>{pages[workspace] ?? <NotFoundPage />}</>;
}

function AppShell() {
    return (
        <ErrorBoundary>
            <ShellLayout>
                <WorkspaceRouter />
            </ShellLayout>
        </ErrorBoundary>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
    const [stage, setStage] = useState<AppStage>(() => {
        // If already onboarded, skip straight to app
        if (!needsOnboarding()) return "app";
        return "landing";
    });

    const { done: onboardingDone, skip } = useOnboardingStore();

    // When onboarding finishes → go to app
    useEffect(() => {
        if (onboardingDone && stage === "onboarding") {
            setStage("app");
        }
    }, [onboardingDone, stage]);

    // Hash-based trigger from landing page "Get started"
    useEffect(() => {
        const handler = () => {
            if (window.location.hash === "#onboard") {
                setStage("onboarding");
                window.location.hash = "";
            }
        };
        window.addEventListener("hashchange", handler);
        return () => window.removeEventListener("hashchange", handler);
    }, []);

    // "Sign in to Conduit Cloud" / skip from landing
    const handleSkipToApp = () => {
        skip();
        setStage("app");
    };

    return (
        <>
            {stage === "landing" && <LandingPage />}

            {stage === "onboarding" && (
                <>
                    {/* Show a blurred app shell behind the onboarding modal */}
                    <div
                        style={{
                            filter: "blur(3px)",
                            pointerEvents: "none",
                            position: "fixed",
                            inset: 0
                        }}
                    >
                        <AppShell />
                    </div>
                    <OnboardingPage />
                </>
            )}

            {stage === "app" && <AppShell />}

            {/* Global toasts */}
            <ToastContainer />
        </>
    );
}
