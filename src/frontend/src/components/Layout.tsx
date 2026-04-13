import { Outlet, useRouterState } from "@tanstack/react-router";
import { usePlayer } from "../hooks/usePlayer";
import { HUD } from "./HUD";
import { RegistrationModal } from "./RegistrationModal";

export function Layout() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const { needsRegistration, isRegistering, registerPlayer } = usePlayer();

  const isGameRoute = pathname === "/game";
  const isMenuRoute = pathname === "/";
  const showHUD = !isMenuRoute;

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col"
      data-ocid="layout-root"
    >
      {showHUD && !isGameRoute && <HUD />}

      <main
        className={`flex-1 ${isGameRoute ? "relative" : ""}`}
        data-ocid="layout-main"
      >
        <Outlet />
      </main>

      {!isMenuRoute && !isGameRoute && (
        <footer className="bg-card border-t border-border py-4 px-6 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-mono">
            BHARAT BURNOUT v1.0
          </span>
          <span className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </span>
        </footer>
      )}

      {needsRegistration && (
        <RegistrationModal
          isRegistering={isRegistering}
          onRegister={registerPlayer}
        />
      )}
    </div>
  );
}
