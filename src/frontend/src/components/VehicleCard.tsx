import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Lock } from "lucide-react";
import { VEHICLE_TYPE_LABELS, formatRupees } from "../data/vehicles";
import type { VehicleData } from "../types";
import { StatsBar } from "./StatsBar";

interface VehicleCardProps {
  vehicle: VehicleData;
  isOwned: boolean;
  onSelect: (vehicle: VehicleData) => void;
}

export function VehicleCard({ vehicle, isOwned, onSelect }: VehicleCardProps) {
  const typeLabel =
    VEHICLE_TYPE_LABELS[vehicle.vehicleType as string] ?? "Vehicle";

  return (
    <Card
      className="relative overflow-hidden border border-border bg-card hover:border-primary/50 transition-smooth cursor-pointer group"
      onClick={() => onSelect(vehicle)}
      data-ocid={`vehicle-card-${vehicle.id}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-smooth"
        style={{ background: vehicle.color }}
      />

      {/* Vehicle Visual */}
      <div
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{ background: `${vehicle.color}18` }}
      >
        <span className="text-6xl select-none drop-shadow-lg transform group-hover:scale-110 transition-smooth">
          {vehicle.emoji}
        </span>

        {/* Owned/Locked badge */}
        <div className="absolute top-2 right-2">
          {isOwned ? (
            <div className="flex items-center gap-1 bg-secondary/20 border border-secondary/40 rounded-full px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3 text-secondary" />
              <span className="text-xs text-secondary font-mono">OWNED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-muted/80 border border-border rounded-full px-2 py-0.5">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                LOCKED
              </span>
            </div>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="outline"
            className="text-xs border-border text-muted-foreground bg-card/80"
          >
            {typeLabel}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            {vehicle.brand}
          </p>
          <h3 className="text-sm font-display font-bold text-foreground truncate">
            {vehicle.name}
          </h3>
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          <StatsBar
            label="Speed"
            value={Number(vehicle.baseStats.speed)}
            color="primary"
          />
          <StatsBar
            label="Handling"
            value={Number(vehicle.baseStats.handling)}
            color="secondary"
          />
          <StatsBar
            label="Accel"
            value={Number(vehicle.baseStats.acceleration)}
            color="accent"
          />
          {/* Derived human-readable stats */}
          <div className="flex justify-between pt-0.5">
            <span className="telemetry-text text-[10px] text-muted-foreground">
              Top: {Math.round(Number(vehicle.baseStats.speed) * 2.2)} km/h
            </span>
            <span className="telemetry-text text-[10px] text-muted-foreground">
              0-60: {(10 - Number(vehicle.baseStats.speed) / 20).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold font-mono text-primary">
            {formatRupees(vehicle.price)}
          </span>
          <Button
            size="sm"
            variant={isOwned ? "outline" : "default"}
            className="text-xs h-7"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(vehicle);
            }}
            data-ocid={`vehicle-btn-${vehicle.id}`}
          >
            {isOwned ? "Customize" : "View"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
