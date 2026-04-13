import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Flame, Medal as MedalIcon, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../types";

type TabKey = "points" | "challenges" | "fastest";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  currentPlayerName?: string;
  activeTab: TabKey;
}

const PODIUM_CONFIG: Record<
  number,
  {
    icon: typeof Crown;
    iconColor: string;
    bgGradient: string;
    borderColor: string;
    label: string;
  }
> = {
  1: {
    icon: Crown,
    iconColor: "text-primary",
    bgGradient: "from-primary/15 to-primary/5",
    borderColor: "border-primary/50",
    label: "1ST",
  },
  2: {
    icon: MedalIcon,
    iconColor: "text-muted-foreground",
    bgGradient: "from-muted/30 to-muted/10",
    borderColor: "border-muted-foreground/40",
    label: "2ND",
  },
  3: {
    icon: MedalIcon,
    iconColor: "text-accent-foreground",
    bgGradient: "from-accent/20 to-accent/5",
    borderColor: "border-accent/40",
    label: "3RD",
  },
};

function getLevelLabel(level: bigint): { label: string; color: string } {
  const n = Number(level);
  if (n >= 50)
    return { label: "LEGEND", color: "bg-primary text-primary-foreground" };
  if (n >= 35)
    return {
      label: "ELITE",
      color: "bg-secondary/20 text-secondary border border-secondary/40",
    };
  if (n >= 20)
    return {
      label: "VETERAN",
      color: "bg-accent/20 text-accent-foreground border border-accent/40",
    };
  if (n >= 10)
    return { label: "RACER", color: "bg-muted text-muted-foreground" };
  return { label: "ROOKIE", color: "bg-muted text-muted-foreground" };
}

function AnimatedNumber({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{display.toLocaleString("en-IN")}</span>;
}

function PodiumCard({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  const rank = Number(entry.rank);
  const cfg = PODIUM_CONFIG[rank];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const lvl = getLevelLabel(entry.level);
  // Podium heights: 1st tallest
  const heightClass = rank === 1 ? "h-28" : rank === 2 ? "h-20" : "h-16";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: "spring", stiffness: 200 }}
      className={`flex-1 flex flex-col items-center gap-2 ${rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3"}`}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ delay: 0.8 + rank * 0.1, duration: 0.6 }}
        >
          <Icon size={rank === 1 ? 28 : 22} className={cfg.iconColor} />
        </motion.div>
        <div
          className={`font-display font-black text-xs mt-1 ${cfg.iconColor}`}
        >
          {cfg.label}
        </div>
      </div>

      <div
        className={`w-full bg-gradient-to-b ${cfg.bgGradient} border ${cfg.borderColor} rounded-xl p-3 ${heightClass} flex flex-col justify-end ${
          isMe
            ? "ring-2 ring-secondary ring-offset-1 ring-offset-background"
            : ""
        }`}
      >
        <div className="font-display font-bold text-xs text-foreground truncate text-center">
          {entry.playerName}
          {isMe && <span className="text-secondary ml-1">★</span>}
        </div>
        <Badge
          className={`text-[9px] font-display px-1.5 py-0 mx-auto mt-1 ${lvl.color}`}
        >
          {lvl.label}
        </Badge>
        <div
          className={`telemetry-text text-xs font-bold text-center mt-1 ${cfg.iconColor}`}
        >
          <AnimatedNumber target={Number(entry.totalPoints)} />
          <span className="text-[9px] text-muted-foreground ml-0.5">pts</span>
        </div>
      </div>
    </motion.div>
  );
}

const SKELETON_IDS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f", "sk-g"];

export function LeaderboardTable({
  entries,
  isLoading,
  currentPlayerName,
  activeTab,
}: LeaderboardTableProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-36 w-full rounded-xl mb-4" />
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-4"
        data-ocid="leaderboard-empty"
      >
        <div className="text-5xl">🏆</div>
        <div className="font-display font-black text-xl text-foreground text-center">
          NO RACERS YET
        </div>
        <div className="text-muted-foreground text-sm text-center max-w-xs">
          Be the first to hit the road! Complete challenges to earn your spot on
          the leaderboard.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Podium */}
      {top3.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-4">
            <Flame size={14} className="text-primary" />
            <span className="telemetry-text text-xs text-muted-foreground tracking-wider">
              PODIUM — TOP 3
            </span>
          </div>
          <div className="flex items-end gap-2">
            {top3.map((entry) => (
              <PodiumCard
                key={entry.playerName}
                entry={entry}
                isMe={currentPlayerName === entry.playerName}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rest of the table */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5"
        >
          {rest.map((entry, idx) => {
            const rank = Number(entry.rank);
            const isMe = currentPlayerName === entry.playerName;
            const lvl = getLevelLabel(entry.level);

            return (
              <motion.div
                key={`${activeTab}-${entry.playerName}`}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-smooth ${
                  isMe
                    ? "bg-secondary/10 border-secondary/50 ring-1 ring-secondary/30"
                    : "bg-card/60 border-border/50 hover:bg-card hover:border-border"
                }`}
                data-ocid={`leaderboard-row-${rank}`}
              >
                {/* Rank number */}
                <div className="w-7 text-center shrink-0">
                  <span className="telemetry-text text-sm text-muted-foreground font-bold">
                    {rank}
                  </span>
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-display font-bold text-sm truncate ${isMe ? "text-secondary" : "text-foreground"}`}
                    >
                      {entry.playerName}
                    </span>
                    {isMe && (
                      <Badge className="bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0 shrink-0">
                        YOU
                      </Badge>
                    )}
                    <Badge
                      className={`text-[9px] font-display px-1.5 py-0 shrink-0 hidden sm:flex ${lvl.color}`}
                    >
                      {lvl.label}
                    </Badge>
                  </div>
                  <div className="telemetry-text text-[10px] text-muted-foreground">
                    LVL {entry.level.toString()} •{" "}
                    {entry.challengesCompleted.toString()} challenges
                  </div>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  {activeTab === "points" && (
                    <>
                      <div className="telemetry-text text-sm font-bold text-foreground">
                        <AnimatedNumber target={Number(entry.totalPoints)} />
                      </div>
                      <div className="telemetry-text text-[10px] text-muted-foreground">
                        pts
                      </div>
                    </>
                  )}
                  {activeTab === "challenges" && (
                    <>
                      <div className="telemetry-text text-sm font-bold text-foreground flex items-center gap-1 justify-end">
                        <Zap size={10} className="text-primary" />
                        {entry.challengesCompleted.toString()}
                      </div>
                      <div className="telemetry-text text-[10px] text-muted-foreground">
                        wins
                      </div>
                    </>
                  )}
                  {activeTab === "fastest" && (
                    <>
                      <div className="telemetry-text text-sm font-bold text-secondary">
                        <AnimatedNumber target={Number(entry.totalPoints)} />
                      </div>
                      <div className="telemetry-text text-[10px] text-muted-foreground">
                        score
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
