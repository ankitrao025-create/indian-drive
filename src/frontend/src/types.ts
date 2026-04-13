// Re-export interface types from backend.d.ts
export type {
  Vehicle,
  VehicleId,
  VehicleType,
  BaseStats,
  Modifications,
  PaintMod,
  PerformanceMod,
  VisualMod,
  OwnedVehicle,
  PlayerProfilePublic,
  Challenge,
  ChallengeCompletion,
  ChallengeId,
  ChallengeRewards,
  ChallengeDifficulty,
  ChallengeType,
  LeaderboardEntry,
  Medal,
  PlayerId,
  Timestamp,
} from "./backend.d.ts";

// UI-specific types
export interface VehicleData {
  id: bigint;
  name: string;
  brand: string;
  vehicleType: import("./backend.d.ts").VehicleType;
  price: bigint;
  baseStats: import("./backend.d.ts").BaseStats;
  color: string;
  emoji: string;
  description: string;
  image?: string;
}

export interface GameState {
  isPlaying: boolean;
  selectedVehicleId: bigint | null;
  speed: number;
  rpm: number;
  gear: number;
  boost: number;
  score: number;
  lapTime: number;
}

export type Route = "/" | "/game" | "/garage" | "/leaderboard";

export interface PlayerState {
  profile: import("./backend.d.ts").PlayerProfilePublic | null;
  isLoading: boolean;
  isRegistering: boolean;
}
