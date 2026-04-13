import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { motion } from "motion/react";
import { CHALLENGE_TYPE_ICONS, DIFFICULTY_COLORS } from "../data/challenges";
import type { Challenge, ChallengeCompletion, Medal } from "../types";

interface ChallengeCardProps {
  challenge: Challenge;
  completion?: ChallengeCompletion;
  index: number;
}

const MEDAL_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; emoji: string }
> = {
  gold: {
    label: "GOLD",
    bg: "bg-yellow-400/10",
    text: "text-yellow-400",
    border: "border-yellow-400/40",
    emoji: "🥇",
  },
  silver: {
    label: "SILVER",
    bg: "bg-slate-400/10",
    text: "text-slate-300",
    border: "border-slate-400/40",
    emoji: "🥈",
  },
  bronze: {
    label: "BRONZE",
    bg: "bg-amber-700/10",
    text: "text-amber-600",
    border: "border-amber-700/40",
    emoji: "🥉",
  },
};

function formatTime(ms: bigint): string {
  const totalMs = Number(ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centis = Math.floor((totalMs % 1000) / 10);
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
  }
  return `${seconds}.${String(centis).padStart(2, "0")}s`;
}

function medalKey(medal: Medal): string {
  return String(medal);
}

export function ChallengeCard({
  challenge,
  completion,
  index,
}: ChallengeCardProps) {
  const typeIcon = CHALLENGE_TYPE_ICONS[challenge.challengeType] ?? "🏁";
  const diffColor =
    DIFFICULTY_COLORS[challenge.difficulty] ?? "text-muted-foreground";
  const medalStr = completion ? medalKey(completion.medal) : null;
  const medalCfg = medalStr ? MEDAL_CONFIG[medalStr] : null;
  const isCompleted = !!completion;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className={`relative bg-card border rounded-xl p-4 flex flex-col gap-3 overflow-hidden transition-smooth hover:border-border ${
        isCompleted ? "border-border" : "border-border/50 opacity-85"
      }`}
      data-ocid={`challenge-card-${challenge.id}`}
    >
      {/* Top accent line for completed */}
      {isCompleted && medalCfg && (
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 ${medalCfg.bg.replace("/10", "")} opacity-80`}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">{typeIcon}</span>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm text-foreground truncate">
              {challenge.name}
            </div>
            <div
              className={`telemetry-text text-[10px] capitalize ${diffColor}`}
            >
              {challenge.difficulty} • {challenge.challengeType}
            </div>
          </div>
        </div>

        {isCompleted ? (
          <CheckCircle2 size={16} className="text-secondary shrink-0 mt-0.5" />
        ) : (
          <Lock size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        )}
      </div>

      {/* Medal + best time */}
      {completion && medalCfg ? (
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 border ${medalCfg.bg} ${medalCfg.border}`}
        >
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="flex items-center gap-1.5"
          >
            <span className="text-base">{medalCfg.emoji}</span>
            <span
              className={`font-display font-black text-xs ${medalCfg.text}`}
            >
              {medalCfg.label}
            </span>
          </motion.div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={10} />
            <span className="telemetry-text text-xs">
              {formatTime(completion.timeMs)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/30 border border-border/40">
          <span className="telemetry-text text-xs text-muted-foreground">
            Not completed
          </span>
          <div className="flex items-center gap-1">
            <span className="telemetry-text text-xs text-primary">
              ₹{Number(challenge.rewards.currency).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="text-[10px] font-display border-border text-muted-foreground px-2 py-0"
        >
          +{challenge.rewards.points.toString()} PTS
        </Badge>
        {completion && (
          <span className="telemetry-text text-[10px] text-secondary">
            +{Number(completion.pointsEarned).toLocaleString("en-IN")} earned
          </span>
        )}
      </div>
    </motion.div>
  );
}
