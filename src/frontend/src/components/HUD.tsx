import { Link, useRouterState } from "@tanstack/react-router";
import { Gauge, Trophy, Wrench, Zap } from "lucide-react";
import { usePlayer } from "../hooks/usePlayer";

// Navigation HUD — shown on non-game, non-menu routes
export function HUD() {
  const { profile, currencyBalance } = usePlayer();
  const { location } = useRouterState();
  const pathname = location.pathname;

  const navItems = [
    { to: "/game", label: "PLAY", icon: Zap, ocid: "nav-play" },
    { to: "/garage", label: "GARAGE", icon: Wrench, ocid: "nav-garage" },
    {
      to: "/leaderboard",
      label: "RANKS",
      icon: Trophy,
      ocid: "nav-leaderboard",
    },
  ] as const;

  return (
    <header
      className="bg-card border-b border-border shadow-lg sticky top-0 z-50"
      data-ocid="hud-bar"
    >
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          data-ocid="nav-logo"
        >
          <span className="text-primary font-display font-black text-lg tracking-tight leading-none">
            BHARAT
          </span>
          <span className="text-secondary font-display font-black text-lg tracking-tight leading-none">
            BURNOUT
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, ocid }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display font-bold tracking-wider transition-smooth ${
                pathname === to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-ocid={ocid}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        {profile && (
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <div
              className="flex items-center gap-1.5 text-muted-foreground"
              data-ocid="hud-level"
            >
              <Gauge size={13} className="text-secondary" />
              <span className="telemetry-text text-xs">
                LVL{" "}
                <span className="text-foreground font-bold">
                  {profile.level.toString()}
                </span>
              </span>
            </div>
            <div
              className="bg-muted rounded px-2.5 py-1 telemetry-text text-xs text-primary font-bold"
              data-ocid="hud-currency"
            >
              ₹{Number(currencyBalance).toLocaleString("en-IN")}
            </div>
            <div
              className="text-xs text-muted-foreground font-display truncate max-w-[100px]"
              data-ocid="hud-player-name"
            >
              {profile.name}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
