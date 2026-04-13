import { ChallengeDifficulty, ChallengeType } from "../backend";
import type { Challenge } from "../types";

export const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 1n,
    name: "Marine Drive Drag",
    challengeType: ChallengeType.drag,
    difficulty: ChallengeDifficulty.easy,
    rewards: { currency: 5000n, points: 100n },
  },
  {
    id: 2n,
    name: "Bandra Kurla Circuit",
    challengeType: ChallengeType.circuit,
    difficulty: ChallengeDifficulty.medium,
    rewards: { currency: 12000n, points: 250n },
  },
  {
    id: 3n,
    name: "Old Delhi Delivery Run",
    challengeType: ChallengeType.delivery,
    difficulty: ChallengeDifficulty.easy,
    rewards: { currency: 8000n, points: 150n },
  },
  {
    id: 4n,
    name: "Hyderabad Drift Zone",
    challengeType: ChallengeType.drift,
    difficulty: ChallengeDifficulty.medium,
    rewards: { currency: 15000n, points: 300n },
  },
  {
    id: 5n,
    name: "Mumbai Expressway Drag",
    challengeType: ChallengeType.drag,
    difficulty: ChallengeDifficulty.hard,
    rewards: { currency: 25000n, points: 500n },
  },
  {
    id: 6n,
    name: "Ghat Road Expert",
    challengeType: ChallengeType.circuit,
    difficulty: ChallengeDifficulty.expert,
    rewards: { currency: 50000n, points: 1000n },
  },
];

export const CHALLENGE_TYPE_ICONS: Record<string, string> = {
  drag: "⚡",
  circuit: "🏁",
  delivery: "📦",
  drift: "💨",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-orange-400",
  expert: "text-red-400",
};
