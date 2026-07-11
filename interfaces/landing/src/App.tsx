import { useEffect, useState } from "react";
import { HeroSection } from "./sections/hero.section";
import { CascadeSection } from "./sections/cascade.section";
import { FeaturesSection } from "./sections/features.section";
import { ComparisonSection } from "./sections/comparison.section";
import { InterfacesSection } from "./sections/interfaces.section";
import { AuthSection } from "./sections/auth.section";
import { DeploySection } from "./sections/deploy.section";
import { FooterSection } from "./sections/footer.section";
import { NotFoundPage } from "./pages/404.page";
import { ServerErrorPage } from "./pages/500.page";

function useRoute() {
    const [path, setPath] = useState(window.location.pathname);
    useEffect(() => {
        const handler = () => setPath(window.location.pathname);
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    }, []);
    return path;
}

export default function App() {
    const path = useRoute();

    return (
        <>
            <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #080808; color: #e5e5e5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        code {
          font-family: ui-monospace,'Cascadia Code','SF Mono',monospace;
          font-size: 0.9em; color: #999; background: #141414;
          padding: 1px 5px; border-radius: 3px;
        }
        a { color: inherit; }
        button { font-family: inherit; }
        input { font-family: inherit; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        @supports (padding: env(safe-area-inset-bottom)) {
          body { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>

            {path === "/404" ? (
                <NotFoundPage />
            ) : path === "/500" ? (
                <ServerErrorPage />
            ) : (
                <main>
                    <HeroSection />
                    <CascadeSection />
                    <FeaturesSection />
                    <ComparisonSection />
                    <InterfacesSection />
                    <AuthSection />
                    <DeploySection />
                    <FooterSection />
                </main>
            )}
        </>
    );
}
