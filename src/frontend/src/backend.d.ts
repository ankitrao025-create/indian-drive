import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaintMod {
    color: string;
    finish: string;
}
export interface LeaderboardEntry {
    playerId: PlayerId;
    rank: bigint;
    challengesCompleted: bigint;
    level: bigint;
    playerName: string;
    totalPoints: bigint;
}
export type Timestamp = bigint;
export type VehicleId = bigint;
export interface PerformanceMod {
    engineLevel: bigint;
    brakesLevel: bigint;
    nitro: boolean;
    suspensionLevel: bigint;
}
export type ChallengeId = bigint;
export interface VisualMod {
    bodyKit: string;
    rims: string;
    underglowColor?: string;
}
export interface Vehicle {
    id: VehicleId;
    vehicleType: VehicleType;
    name: string;
    baseStats: BaseStats;
    brand: string;
    price: bigint;
}
export interface PlayerProfilePublic {
    id: PlayerId;
    vehicleIds: Array<VehicleId>;
    name: string;
    level: bigint;
    totalPoints: bigint;
    currencyBalance: bigint;
}
export interface OwnedVehicle {
    modifications: Modifications;
    vehicleId: VehicleId;
}
export type PlayerId = Principal;
export interface ChallengeCompletion {
    medal: Medal;
    completedAt: Timestamp;
    timeMs: bigint;
    playerId: PlayerId;
    pointsEarned: bigint;
    challengeId: ChallengeId;
}
export interface Challenge {
    id: ChallengeId;
    difficulty: ChallengeDifficulty;
    name: string;
    challengeType: ChallengeType;
    rewards: ChallengeRewards;
}
export interface Modifications {
    performance?: PerformanceMod;
    paint?: PaintMod;
    visual?: VisualMod;
}
export interface ChallengeRewards {
    currency: bigint;
    points: bigint;
}
export interface BaseStats {
    speed: bigint;
    acceleration: bigint;
    braking: bigint;
    handling: bigint;
}
export enum ChallengeDifficulty {
    easy = "easy",
    hard = "hard",
    expert = "expert",
    medium = "medium"
}
export enum ChallengeType {
    drag = "drag",
    delivery = "delivery",
    drift = "drift",
    circuit = "circuit"
}
export enum Medal {
    bronze = "bronze",
    gold = "gold",
    silver = "silver"
}
export enum VehicleType {
    car = "car",
    rickshaw = "rickshaw",
    motorcycle = "motorcycle"
}
export interface backendInterface {
    applyMods(vehicleId: bigint, mods: Modifications): Promise<boolean>;
    getChallenge(id: bigint): Promise<Challenge | null>;
    getEffectiveStats(id: bigint, mods: Modifications): Promise<BaseStats | null>;
    getLeaderboard(topN: bigint): Promise<Array<LeaderboardEntry>>;
    getMyCompletions(): Promise<Array<ChallengeCompletion>>;
    getMyGarage(): Promise<Array<OwnedVehicle>>;
    getMyProfile(): Promise<PlayerProfilePublic | null>;
    getProfile(playerId: Principal): Promise<PlayerProfilePublic | null>;
    getVehicle(id: bigint): Promise<Vehicle | null>;
    listChallenges(): Promise<Array<Challenge>>;
    listVehicles(): Promise<Array<Vehicle>>;
    purchaseVehicle(vehicleId: bigint): Promise<boolean>;
    registerPlayer(name: string): Promise<PlayerProfilePublic>;
    submitChallengeResult(challengeId: bigint, timeMs: bigint, medal: Medal): Promise<ChallengeCompletion>;
}
