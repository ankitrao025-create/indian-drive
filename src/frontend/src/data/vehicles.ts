import { VehicleType } from "../backend";
import type { VehicleData } from "../types";

export const VEHICLES: VehicleData[] = [
  // === CARS ===
  {
    id: 1n,
    name: "Mahindra Thar",
    brand: "Mahindra",
    vehicleType: VehicleType.car,
    price: 1_400_000n,
    baseStats: { speed: 75n, acceleration: 70n, braking: 68n, handling: 72n },
    color: "#d97706",
    emoji: "🚙",
    description:
      "Rugged 4x4 SUV built for Indian terrain — raw power on and off road.",
    image: "/assets/generated/hero-indian-drive.dim_1200x675.jpg",
  },
  {
    id: 2n,
    name: "Maruti Suzuki Swift",
    brand: "Maruti",
    vehicleType: VehicleType.car,
    price: 750_000n,
    baseStats: { speed: 72n, acceleration: 74n, braking: 70n, handling: 78n },
    color: "#ef4444",
    emoji: "🚗",
    description:
      "Zippy hatchback — nimble city streaker, the streets belong to the Swift.",
  },
  {
    id: 3n,
    name: "Ambassador Classic",
    brand: "Hindustan Motors",
    vehicleType: VehicleType.car,
    price: 500_000n,
    baseStats: { speed: 60n, acceleration: 55n, braking: 60n, handling: 62n },
    color: "#fbbf24",
    emoji: "🚕",
    description:
      "India's iconic yellow taxi. Slow but legendary — pure nostalgia on wheels.",
  },
  {
    id: 4n,
    name: "Tata Nexon EV",
    brand: "Tata",
    vehicleType: VehicleType.car,
    price: 1_600_000n,
    baseStats: { speed: 78n, acceleration: 82n, braking: 80n, handling: 76n },
    color: "#14b8a6",
    emoji: "⚡",
    description:
      "Electric instant torque beast — silent but deadly at every traffic light.",
  },
  {
    id: 5n,
    name: "Force Gurkha",
    brand: "Force Motors",
    vehicleType: VehicleType.car,
    price: 1_800_000n,
    baseStats: { speed: 70n, acceleration: 65n, braking: 72n, handling: 74n },
    color: "#6b7280",
    emoji: "🛡️",
    description:
      "Military-spec 4x4 — built like a tank, drives like a challenge.",
  },
  // === MOTORCYCLES ===
  {
    id: 6n,
    name: "Royal Enfield Bullet 350",
    brand: "Royal Enfield",
    vehicleType: VehicleType.motorcycle,
    price: 200_000n,
    baseStats: { speed: 80n, acceleration: 72n, braking: 65n, handling: 70n },
    color: "#1c1917",
    emoji: "🏍️",
    description:
      "The thundering Bullet — India's soul on two wheels since 1955.",
    image: "/assets/generated/vehicle-motorcycle.dim_400x300.jpg",
  },
  {
    id: 7n,
    name: "Bajaj Pulsar 200NS",
    brand: "Bajaj",
    vehicleType: VehicleType.motorcycle,
    price: 135_000n,
    baseStats: { speed: 85n, acceleration: 80n, braking: 74n, handling: 76n },
    color: "#2563eb",
    emoji: "💨",
    description:
      "Street sport performer — aggressive stance, track-focused geometry.",
  },
  {
    id: 8n,
    name: "KTM Duke 390",
    brand: "KTM",
    vehicleType: VehicleType.motorcycle,
    price: 300_000n,
    baseStats: { speed: 90n, acceleration: 88n, braking: 82n, handling: 84n },
    color: "#f97316",
    emoji: "🔥",
    description:
      "Austrian power with Indian streets — naked aggression on 390cc.",
  },
  {
    id: 9n,
    name: "Honda CB Hornet",
    brand: "Honda",
    vehicleType: VehicleType.motorcycle,
    price: 160_000n,
    baseStats: { speed: 82n, acceleration: 78n, braking: 76n, handling: 80n },
    color: "#dc2626",
    emoji: "🐝",
    description:
      "Stings at every corner — balanced, reliable, lethal in traffic.",
  },
  // === AUTO-RICKSHAWS ===
  {
    id: 10n,
    name: "Bajaj RE Auto",
    brand: "Bajaj",
    vehicleType: VehicleType.rickshaw,
    price: 180_000n,
    baseStats: { speed: 55n, acceleration: 50n, braking: 58n, handling: 65n },
    color: "#f59e0b",
    emoji: "🛺",
    description:
      "The OG auto-rickshaw — king of narrow alleys, master of chaos.",
    image: "/assets/generated/vehicle-rickshaw.dim_400x300.jpg",
  },
  {
    id: 11n,
    name: "Piaggio Ape E-City",
    brand: "Piaggio",
    vehicleType: VehicleType.rickshaw,
    price: 250_000n,
    baseStats: { speed: 58n, acceleration: 55n, braking: 62n, handling: 68n },
    color: "#10b981",
    emoji: "⚡",
    description:
      "Electric auto — silent, green, and still terrifyingly agile in Mumbai traffic.",
  },
  {
    id: 12n,
    name: "TVS King Deluxe",
    brand: "TVS",
    vehicleType: VehicleType.rickshaw,
    price: 220_000n,
    baseStats: { speed: 60n, acceleration: 52n, braking: 60n, handling: 70n },
    color: "#8b5cf6",
    emoji: "👑",
    description:
      "The Deluxe King — wider, stronger, better. The rickshaw that thinks it's an SUV.",
  },
];

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  car: "Car",
  motorcycle: "Motorcycle",
  rickshaw: "Auto-Rickshaw",
};

export function formatRupees(amount: bigint): string {
  const num = Number(amount);
  if (num >= 100_000) return `₹${(num / 100_000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num}`;
}
