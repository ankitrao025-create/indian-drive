import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  FlagTriangleRight,
  RefreshCw,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ChallengeCard } from "../components/ChallengeCard";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { PlayerStatsCard } from "../components/PlayerStatsCard";
import { CHALLENGE_TYPE_ICONS, SAMPLE_CHALLENGES } from "../data/challenges";
import {
  useGetLeaderboard,
  useGetMyCompletions,
  useListChallenges,
} from "../hooks/useBackend";
import { usePlayer } from "../hooks/usePlayer";
import type { LeaderboardEntry } from "../types";

const SAMPLE_NAMES = [
  "Arjun Singh",
  "Priya Sharma",
  "Rahul Das",
  "Kavita Nair",
  "Vikram Rao",
  "Sunita Patel",
  "Deepak Joshi",
  "Anjali Mehta",
  "Ravi Kumar",
  "Sanjay Gupta",
];

const ANON_PRINCIPAL = Principal.anonymous();

const MOCK_ENTRIES: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
  rank: BigInt(i + 1),
  playerName: SAMPLE_NAMES[i] ?? `Racer ${i + 1}`,
  level: BigInt(48 - i * 4),
  challengesCompleted: BigInt(120 - i * 10),
  totalPoints: BigInt(62000 - i * 5800),
  playerId: ANON_PRINCIPAL,
}));

type TabKey = "points" | "challenges" | "fastest";

const TAB_META: { key: TabKey; label: string; icon: typeof Trophy }[] = [
  { key: "points", label: "Overall Points", icon: Trophy },
  { key: "challenges", label: "Challenge Wins", icon: Zap },
  { key: "fastest", label: "Fastest Times", icon: Timer },
];

function sortEntries(
  entries: LeaderboardEntry[],
  tab: TabKey,
): LeaderboardEntry[] {
  const sorted = [...entries];
  if (tab === "challenges") {
    sorted.sort((a, b) =>
      Number(b.challengesCompleted - a.challengesCompleted),
    );
  } else if (tab === "fastest") {
    sorted.sort((a, b) => Number(b.totalPoints - a.totalPoints));
  } else {
    sorted.sort((a, b) => Number(b.totalPoints - a.totalPoints));
  }
  return sorted.map((e, i) => ({ ...e, rank: BigInt(i + 1) }));
}

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("points");

  const {
    data: rawEntries = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetLeaderboard(20);
  const { data: completions = [] } = useGetMyCompletions();
  const { data: challengesData = [] } = useListChallenges();
  const player = usePlayer();

  const baseEntries: LeaderboardEntry[] =
    rawEntries.length > 0 ? rawEntries : MOCK_ENTRIES;

  const sortedEntries = useMemo(
    () => sortEntries(baseEntries, activeTab),
    [baseEntries, activeTab],
  );

  // Merge backend challenges with sample fallback
  const challenges =
    challengesData.length > 0 ? challengesData : SAMPLE_CHALLENGES;

  // Map completions by challengeId
  const completionMap = useMemo(() => {
    const map = new Map<string, (typeof completions)[0]>();
    for (const c of completions) {
      const key = c.challengeId.toString();
      const existing = map.get(key);
      // Keep best (fastest time)
      if (!existing || c.timeMs < existing.timeMs) {
        map.set(key, c);
      }
    }
    return map;
  }, [completions]);

  const hasNoCompletions = completions.length === 0;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="leaderboard-page"
    >
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground telemetry-text text-[10px] tracking-widest mb-1">
              <Users size={11} />
              INDIA-WIDE RANKINGS
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight leading-none">
              LEADERBOARD
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            data-ocid="leaderboard-refresh"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline font-display text-xs">
              {isFetching ? "REFRESHING…" : "REFRESH"}
            </span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Player Stats Card */}
        <PlayerStatsCard player={player} leaderboardEntries={sortedEntries} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leaderboard Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabKey)}
              data-ocid="leaderboard-tabs"
            >
              <TabsList className="w-full bg-card border border-border rounded-xl h-10 p-1">
                {TAB_META.map(({ key, label, icon: Icon }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex-1 gap-1.5 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                    data-ocid={`tab-${key}`}
                  >
                    <Icon size={11} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">
                      {key === "points"
                        ? "PTS"
                        : key === "challenges"
                          ? "WIN"
                          : "SPD"}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Table */}
            <LeaderboardTable
              entries={sortedEntries}
              isLoading={isLoading}
              currentPlayerName={player.profile?.name}
              activeTab={activeTab}
            />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* CTA */}
            <Link to="/game" data-ocid="leaderboard-play-cta">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary/10 border border-primary/40 rounded-xl p-5 text-center cursor-pointer hover:bg-primary/20 transition-smooth group"
              >
                <Trophy
                  size={28}
                  className="text-primary mx-auto mb-2 group-hover:scale-110 transition-smooth"
                />
                <div className="font-display font-black text-base text-foreground">
                  CLAIM YOUR RANK
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Drive. Drift. Dominate.
                </div>
              </motion.div>
            </Link>

            {/* Medal Tier Guide */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <FlagTriangleRight
                  size={13}
                  className="text-muted-foreground"
                />
                <span className="telemetry-text text-[10px] text-muted-foreground tracking-wider uppercase">
                  Medal Rewards
                </span>
              </div>
              {[
                {
                  emoji: "🥇",
                  label: "GOLD",
                  mult: "×3 pts",
                  color: "text-primary",
                },
                {
                  emoji: "🥈",
                  label: "SILVER",
                  mult: "×2 pts",
                  color: "text-muted-foreground",
                },
                {
                  emoji: "🥉",
                  label: "BRONZE",
                  mult: "×1 pts",
                  color: "text-accent-foreground",
                },
              ].map(({ emoji, label, mult, color }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                >
                  <span
                    className={`font-display text-xs font-bold ${color} flex items-center gap-1.5`}
                  >
                    <span>{emoji}</span>
                    {label}
                  </span>
                  <span className="telemetry-text text-xs text-muted-foreground">
                    {mult}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick challenge preview */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Zap size={13} className="text-primary" />
                <span className="telemetry-text text-[10px] text-muted-foreground tracking-wider uppercase">
                  Active Challenges
                </span>
              </div>
              <div className="space-y-2">
                {SAMPLE_CHALLENGES.slice(0, 3).map((ch) => (
                  <div
                    key={ch.id.toString()}
                    className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0"
                  >
                    <span className="text-base shrink-0">
                      {CHALLENGE_TYPE_ICONS[ch.challengeType]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-xs text-foreground font-bold truncate">
                        {ch.name}
                      </div>
                    </div>
                    <span className="telemetry-text text-xs text-primary shrink-0">
                      +{ch.rewards.points.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-xl text-foreground">
                YOUR CHALLENGES
              </h2>
              <p className="text-muted-foreground text-xs mt-0.5">
                Personal bests, medals earned, and rewards
              </p>
            </div>
            {!hasNoCompletions && (
              <div className="telemetry-text text-xs text-secondary">
                {completions.length} completed
              </div>
            )}
          </div>

          {hasNoCompletions ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/30 border border-border/50 rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
              data-ocid="challenges-empty-state"
            >
              <div className="text-6xl">🏁</div>
              <div>
                <div className="font-display font-black text-2xl text-foreground mb-1">
                  NO LAPS COMPLETED YET
                </div>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Hit the road, beat challenges, and earn medals to build your
                  legend on the leaderboard.
                </p>
              </div>
              <Link to="/game" data-ocid="challenges-start-cta">
                <Button
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground font-display font-bold tracking-wide hover:bg-primary/90"
                >
                  <Zap size={16} />
                  START YOUR FIRST CHALLENGE
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.slice(0, 6).map((challenge, idx) => {
                const completion = completionMap.get(challenge.id.toString());
                return (
                  <ChallengeCard
                    key={challenge.id.toString()}
                    challenge={challenge}
                    completion={completion}
                    index={idx}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
