import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Timer, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Medal } from "../backend";
import { CHALLENGE_TYPE_ICONS } from "../data/challenges";
import type { Challenge } from "../types";

interface ChallengeOverlayProps {
  activeChallenge: Challenge | null;
  timeLeft: number;
  totalTime: number;
  isComplete: boolean;
  isFailed: boolean;
  earnedMedal: Medal | null;
  onDismiss: () => void;
}

function getMedalStars(medal: Medal): number {
  if (medal === Medal.gold) return 3;
  if (medal === Medal.silver) return 2;
  return 1;
}

function getMedalColor(medal: Medal): string {
  if (medal === Medal.gold) return "text-primary";
  if (medal === Medal.silver) return "text-muted-foreground";
  return "text-accent-foreground";
}

function getMedalLabel(medal: Medal): string {
  if (medal === Medal.gold) return "GOLD";
  if (medal === Medal.silver) return "SILVER";
  return "BRONZE";
}

export function ChallengeOverlay({
  activeChallenge,
  timeLeft,
  totalTime,
  isComplete,
  isFailed,
  earnedMedal,
  onDismiss,
}: ChallengeOverlayProps) {
  const progressPct =
    totalTime > 0 ? Math.max(0, (timeLeft / totalTime) * 100) : 0;
  const typeIcon = activeChallenge
    ? (CHALLENGE_TYPE_ICONS[activeChallenge.challengeType] ?? "🏁")
    : "";

  return (
    <AnimatePresence>
      {/* Active challenge timer bar */}
      {activeChallenge && !isComplete && !isFailed && (
        <motion.div
          key="challenge-progress"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-25 w-72"
          data-ocid="challenge-progress"
        >
          <div className="bg-card/90 backdrop-blur border border-secondary/40 rounded-xl px-4 py-2.5 shadow-xl">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{typeIcon}</span>
                <span className="font-display font-bold text-xs text-foreground tracking-wider truncate max-w-[140px]">
                  {activeChallenge.name.toUpperCase()}
                </span>
              </div>
              <div
                className={`telemetry-text text-sm font-bold ${
                  timeLeft < 10
                    ? "text-destructive animate-pulse"
                    : "text-secondary"
                }`}
              >
                {Math.floor(timeLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor(timeLeft % 60)
                  .toString()
                  .padStart(2, "0")}
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background:
                    timeLeft < 10
                      ? "oklch(0.6 0.22 20)"
                      : "oklch(var(--secondary))",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Challenge Complete */}
      {isComplete && earnedMedal && (
        <motion.div
          key="challenge-complete"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="absolute inset-0 z-30 flex items-center justify-center"
          data-ocid="challenge-complete"
        >
          <div className="bg-card/95 backdrop-blur-md border border-primary/40 rounded-2xl px-8 py-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <CheckCircle size={40} className="text-primary mx-auto mb-3" />
            <h2 className="font-display font-black text-2xl text-foreground mb-1">
              CHALLENGE COMPLETE!
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {activeChallenge?.name ?? "Challenge"}
            </p>

            {/* Medal */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: 3 }, (_, starIdx) => (
                <Star
                  key={`medal-star-${starIdx === 0 ? "a" : starIdx === 1 ? "b" : "c"}`}
                  size={28}
                  className={
                    starIdx < getMedalStars(earnedMedal)
                      ? `${getMedalColor(earnedMedal)} fill-current`
                      : "text-muted"
                  }
                />
              ))}
            </div>
            <div
              className={`font-display font-black text-xl ${getMedalColor(earnedMedal)} mb-4`}
            >
              {getMedalLabel(earnedMedal)} MEDAL
            </div>

            {/* Rewards */}
            {activeChallenge && (
              <div className="bg-muted/40 rounded-lg px-4 py-3 mb-5 flex items-center justify-around">
                <div className="text-center">
                  <div className="text-primary font-bold font-display text-lg">
                    +₹
                    {Number(activeChallenge.rewards.currency).toLocaleString(
                      "en-IN",
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs telemetry-text">
                    RUPEES
                  </div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="text-secondary font-bold font-display text-lg">
                    +
                    {Number(activeChallenge.rewards.points).toLocaleString(
                      "en-IN",
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs telemetry-text">
                    POINTS
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={onDismiss}
              className="w-full font-display font-bold tracking-widest"
              data-ocid="challenge-dismiss-btn"
            >
              CONTINUE DRIVING
            </Button>
          </div>
        </motion.div>
      )}

      {/* Challenge Failed */}
      {isFailed && (
        <motion.div
          key="challenge-failed"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="absolute inset-0 z-30 flex items-center justify-center"
          data-ocid="challenge-failed"
        >
          <div className="bg-card/95 backdrop-blur-md border border-destructive/40 rounded-2xl px-8 py-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <XCircle size={40} className="text-destructive mx-auto mb-3" />
            <h2 className="font-display font-black text-2xl text-foreground mb-1">
              TIME&apos;S UP!
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {activeChallenge?.name ?? "Challenge"} — Better luck next time!
            </p>
            <Button
              variant="outline"
              onClick={onDismiss}
              className="w-full font-display font-bold border-destructive text-destructive hover:bg-destructive/10"
              data-ocid="challenge-failed-dismiss-btn"
            >
              KEEP DRIVING
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
