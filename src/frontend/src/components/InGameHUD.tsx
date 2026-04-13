import { Fuel, Gauge, Timer, Trophy, Zap } from "lucide-react";
import type { PhysicsState } from "./GameCanvas";

interface InGameHUDProps {
  vehicleName: string;
  vehicleEmoji: string;
  physics: PhysicsState;
  rupeesEarned: number;
  challengeTimeLeft: number | null;
  challengeName: string | null;
  isPlaying: boolean;
}

export function InGameHUD({
  vehicleName,
  vehicleEmoji,
  physics,
  rupeesEarned,
  challengeTimeLeft,
  challengeName,
  isPlaying,
}: InGameHUDProps) {
  if (!isPlaying) return null;

  const speedPct = Math.min(physics.speed / 200, 1);
  const speedColor =
    physics.speed > 140
      ? "text-destructive"
      : physics.speed > 90
        ? "text-primary"
        : "text-secondary";

  return (
    <>
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-background/75 backdrop-blur-sm border-b border-border/50"
        data-ocid="ingame-hud-top"
      >
        {/* Vehicle */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{vehicleEmoji}</span>
          <span className="font-display font-bold text-sm text-foreground tracking-wider">
            {vehicleName.toUpperCase()}
          </span>
        </div>

        {/* Challenge timer */}
        {challengeTimeLeft !== null && challengeName && (
          <div
            className="flex items-center gap-2 bg-card/80 rounded-lg px-3 py-1 border border-secondary/50"
            data-ocid="challenge-timer"
          >
            <Timer size={13} className="text-secondary animate-pulse" />
            <span className="telemetry-text text-xs text-secondary font-bold">
              {challengeName}
            </span>
            <span
              className={`telemetry-text text-sm font-bold ${
                challengeTimeLeft < 10
                  ? "text-destructive animate-pulse"
                  : "text-foreground"
              }`}
            >
              {Math.floor(challengeTimeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(challengeTimeLeft % 60).toFixed(1).padStart(4, "0")}
            </span>
          </div>
        )}

        {/* Rupees */}
        <div
          className="flex items-center gap-1.5 bg-card/80 rounded-lg px-3 py-1 border border-primary/30"
          data-ocid="hud-rupees-earned"
        >
          <Trophy size={12} className="text-primary" />
          <span className="telemetry-text text-xs text-primary font-bold">
            +₹{rupeesEarned.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Bottom-left: Speedometer */}
      <div
        className="absolute bottom-6 left-6 z-20 flex flex-col items-center gap-1"
        data-ocid="speedometer"
      >
        <div className="gauge-shadow bg-card/85 rounded-2xl px-5 py-4 border border-border backdrop-blur-sm">
          <div className="text-center">
            <div
              className={`font-display font-black text-5xl leading-none ${speedColor}`}
            >
              {Math.round(physics.speed)}
            </div>
            <div className="telemetry-text text-xs text-muted-foreground mt-0.5">
              km/h
            </div>
          </div>
          {/* Speed bar */}
          <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${speedPct * 100}%`,
                background: "oklch(var(--primary))",
              }}
            />
          </div>
        </div>
        {/* Distance */}
        <div className="telemetry-text text-xs text-muted-foreground flex items-center gap-1">
          <Gauge size={10} />
          {physics.distanceKm.toFixed(2)} km
        </div>
      </div>

      {/* Bottom-right: Boost indicator */}
      <div
        className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-1"
        data-ocid="boost-indicator"
      >
        <div className="bg-card/85 border border-border rounded-xl px-3 py-3 backdrop-blur-sm flex flex-col items-center gap-1.5">
          <Fuel size={13} className="text-secondary" />
          <div className="h-16 w-2 bg-muted rounded-full overflow-hidden rotate-180">
            <div
              className="w-full bg-secondary rounded-full transition-all duration-200 perf-glow"
              style={{ height: "80%" }}
            />
          </div>
          <div className="telemetry-text text-xs text-secondary font-bold">
            NOS
          </div>
        </div>
      </div>

      {/* Drift/Speed FX */}
      {physics.speed > 120 && (
        <div className="absolute top-1/2 left-0 z-10 pointer-events-none">
          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 border-r border-primary/30 rounded-r-lg">
            <Zap size={12} className="text-primary animate-bounce" />
            <span className="telemetry-text text-xs text-primary font-bold">
              OVER SPEED
            </span>
          </div>
        </div>
      )}
    </>
  );
}
