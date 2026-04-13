import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Star, Target, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { UsePlayerReturn } from "../hooks/usePlayer";
import type { LeaderboardEntry } from "../types";

interface PlayerStatsCardProps {
  player: UsePlayerReturn;
  leaderboardEntries: LeaderboardEntry[];
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="telemetry-text text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`telemetry-text text-base font-bold ${accent ? "text-secondary" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function getLevelLabel(level: bigint): string {
  const n = Number(level);
  if (n >= 50) return "LEGEND";
  if (n >= 35) return "ELITE";
  if (n >= 20) return "VETERAN";
  if (n >= 10) return "RACER";
  return "ROOKIE";
}

function getLevelColor(level: bigint): string {
  const n = Number(level);
  if (n >= 50) return "bg-primary text-primary-foreground";
  if (n >= 35)
    return "bg-secondary/20 text-secondary border border-secondary/40";
  if (n >= 20)
    return "bg-accent/20 text-accent-foreground border border-accent/40";
  return "bg-muted text-muted-foreground";
}

export function PlayerStatsCard({
  player,
  leaderboardEntries,
}: PlayerStatsCardProps) {
  const { profile, isLoading, level, totalPoints } = player;

  const myRankEntry = profile
    ? leaderboardEntries.find((e) => e.playerName === profile.name)
    : null;
  const myRank = myRankEntry ? Number(myRankEntry.rank) : null;

  if (isLoading) {
    return <Skeleton className="h-28 w-full rounded-xl" />;
  }

  if (!profile) {
    return (
      <div
        className="bg-card border border-border rounded-xl p-4 flex items-center justify-center"
        data-ocid="player-stats-empty"
      >
        <span className="text-muted-foreground text-sm font-display">
          Register to see your stats
        </span>
      </div>
    );
  }

  const levelLabel = getLevelLabel(level);
  const levelColor = getLevelColor(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-4 relative overflow-hidden"
      data-ocid="player-stats-card"
    >
      {/* accent strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-primary to-secondary opacity-60" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-black text-lg text-foreground truncate">
              {profile.name}
            </span>
            <Badge
              className={`text-[10px] font-display px-2 py-0 shrink-0 ${levelColor}`}
            >
              {levelLabel}
            </Badge>
          </div>
          <div className="flex gap-4 flex-wrap">
            <StatBox
              label="Rank"
              value={myRank !== null ? `#${myRank}` : "—"}
              accent
            />
            <StatBox
              label="Points"
              value={Number(totalPoints).toLocaleString("en-IN")}
            />
            <StatBox label="Level" value={level.toString()} />
            <StatBox
              label="Vehicles"
              value={profile.vehicleIds.length.toString()}
            />
          </div>
        </div>

        {/* Icon cluster */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Zap size={14} className="text-secondary" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Star size={14} className="text-primary" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
              <Target size={14} className="text-muted-foreground" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
              <Award size={14} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
