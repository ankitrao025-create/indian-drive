interface StatsBarProps {
  label: string;
  value: number;
  delta?: number;
  max?: number;
  color?: "primary" | "secondary" | "accent";
}

export function StatsBar({
  label,
  value,
  delta = 0,
  max = 100,
  color = "primary",
}: StatsBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const deltaPct = Math.min(100, ((value + delta) / max) * 100);
  const colorClass =
    color === "secondary"
      ? "bg-secondary"
      : color === "accent"
        ? "bg-accent"
        : "bg-primary";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
          {label}
        </span>
        <span className="text-xs font-mono text-foreground">
          {value}
          {delta !== 0 && (
            <span
              className={`ml-1 font-bold ${delta > 0 ? "text-secondary" : "text-destructive"}`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
        {/* Base bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass} opacity-60`}
          style={{ width: `${pct}%` }}
        />
        {/* Delta overlay */}
        {delta > 0 && (
          <div
            className="absolute top-0 h-full rounded-full bg-secondary transition-all duration-500"
            style={{ left: `${pct}%`, width: `${deltaPct - pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

interface StatsComparisonProps {
  label: string;
  before: number;
  after: number;
  max?: number;
}

export function StatsComparison({
  label,
  before,
  after,
  max = 100,
}: StatsComparisonProps) {
  const delta = after - before;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {before}
          </span>
          <span className="text-muted-foreground text-xs">→</span>
          <span className="text-xs font-mono text-foreground font-bold">
            {after}
          </span>
          {delta !== 0 && (
            <span
              className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                delta > 0
                  ? "bg-secondary/20 text-secondary"
                  : "bg-destructive/20 text-destructive"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full bg-muted-foreground/40 transition-all duration-300"
          style={{ width: `${(before / max) * 100}%` }}
        />
        {delta > 0 && (
          <div
            className="absolute top-0 h-full rounded-full bg-secondary transition-all duration-500"
            style={{
              left: `${(before / max) * 100}%`,
              width: `${(delta / max) * 100}%`,
            }}
          />
        )}
        {delta < 0 && (
          <div
            className="absolute top-0 h-full rounded-full bg-destructive/60 transition-all duration-500"
            style={{
              left: `${(after / max) * 100}%`,
              width: `${(Math.abs(delta) / max) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
