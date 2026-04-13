import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ShoppingCart, Wrench, X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import { VEHICLE_TYPE_LABELS, formatRupees } from "../data/vehicles";
import { usePurchaseVehicle } from "../hooks/useBackend";
import { usePlayer } from "../hooks/usePlayer";
import type { OwnedVehicle, VehicleData } from "../types";
import { CustomizationPanel } from "./CustomizationPanel";
import { StatsBar } from "./StatsBar";

// ─── 3D Vehicle Mesh ──────────────────────────────────────────────────────────

interface VehicleMeshProps {
  vehicleType: string;
  color: string;
  underglowColor?: string;
  underglowEnabled?: boolean;
}

function VehicleMesh({
  vehicleType,
  color,
  underglowColor,
  underglowEnabled,
}: VehicleMeshProps) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.6;
    if (glowRef.current && underglowEnabled) {
      glowRef.current.rotation.y -= delta * 0.3;
      (glowRef.current.material as MeshBasicMaterial).opacity =
        0.3 + Math.sin(Date.now() * 0.003) * 0.15;
    }
  });

  const isMotorcycle = vehicleType === "motorcycle";
  const isRickshaw = vehicleType === "rickshaw";

  const wheelPositions: Array<{ key: string; pos: [number, number, number] }> =
    isMotorcycle
      ? [
          { key: "moto-front", pos: [0, -0.55, 0.7] },
          { key: "moto-rear", pos: [0, -0.55, -0.7] },
        ]
      : isRickshaw
        ? [
            { key: "rick-fl", pos: [-0.55, -0.55, 0.5] },
            { key: "rick-fr", pos: [0.55, -0.55, 0.5] },
            { key: "rick-rear", pos: [0, -0.55, -0.6] },
          ]
        : [
            { key: "car-fl", pos: [-0.85, -0.5, 1.1] },
            { key: "car-fr", pos: [0.85, -0.5, 1.1] },
            { key: "car-rl", pos: [-0.85, -0.5, -1.1] },
            { key: "car-rr", pos: [0.85, -0.5, -1.1] },
          ];

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow position={[0, isMotorcycle ? 0.1 : 0, 0]}>
        <boxGeometry
          args={
            isMotorcycle
              ? [0.6, 0.8, 2.0]
              : isRickshaw
                ? [1.2, 0.9, 1.6]
                : [1.6, 0.7, 3.0]
          }
        />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Roof / Canopy */}
      {!isMotorcycle && (
        <mesh position={[0, isRickshaw ? 0.75 : 0.6, isRickshaw ? 0.1 : 0]}>
          <boxGeometry
            args={isRickshaw ? [1.1, 0.25, 1.3] : [1.3, 0.35, 1.8]}
          />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
        </mesh>
      )}

      {/* Wheels */}
      {wheelPositions.map(({ key, pos }) => (
        <mesh key={key} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}

      {/* Neon underglow ring */}
      {underglowEnabled && underglowColor && (
        <mesh
          ref={glowRef}
          position={[0, -0.7, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry
            args={[isMotorcycle ? 0.5 : isRickshaw ? 0.8 : 1.2, 0.04, 8, 48]}
          />
          <meshBasicMaterial color={underglowColor} transparent opacity={0.4} />
        </mesh>
      )}

      {/* Ground shadow */}
      <mesh
        position={[0, -0.85, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

function VehicleCanvas({
  vehicle,
  paintColor,
  underglowColor,
  underglowEnabled,
}: {
  vehicle: VehicleData;
  paintColor: string;
  underglowColor: string;
  underglowEnabled: boolean;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [3, 2, 4], fov: 40 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.4} color={paintColor} />
      {underglowEnabled && (
        <pointLight
          position={[0, -0.5, 0]}
          intensity={1.5}
          color={underglowColor}
          distance={3}
        />
      )}
      <Suspense fallback={null}>
        <VehicleMesh
          vehicleType={vehicle.vehicleType as string}
          color={paintColor}
          underglowColor={underglowColor}
          underglowEnabled={underglowEnabled}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={false}
      />
    </Canvas>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface VehicleDetailModalProps {
  vehicle: VehicleData | null;
  isOwned: boolean;
  ownedData?: OwnedVehicle;
  onClose: () => void;
}

export function VehicleDetailModal({
  vehicle,
  isOwned,
  ownedData,
  onClose,
}: VehicleDetailModalProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [paintColor, setPaintColor] = useState<string>("");
  const [underglowColor, setUnderglowColor] = useState<string>("#14b8a6");
  const [underglowEnabled, setUnderglowEnabled] = useState(false);

  const purchaseMutation = usePurchaseVehicle();
  const { currencyBalance } = usePlayer();

  useEffect(() => {
    if (vehicle) {
      setPaintColor(ownedData?.modifications?.paint?.color ?? vehicle.color);
      setUnderglowColor(
        ownedData?.modifications?.visual?.underglowColor ?? "#14b8a6",
      );
      setUnderglowEnabled(!!ownedData?.modifications?.visual?.underglowColor);
      setShowCustomize(false);
    }
  }, [vehicle, ownedData]);

  if (!vehicle) return null;

  const canAfford = currencyBalance >= vehicle.price;
  const typeLabel =
    VEHICLE_TYPE_LABELS[vehicle.vehicleType as string] ?? "Vehicle";

  const handlePurchase = async () => {
    if (!canAfford) {
      toast.error("Insufficient funds", {
        description: `You need ${formatRupees(vehicle.price - currencyBalance)} more.`,
      });
      return;
    }
    try {
      const success = await purchaseMutation.mutateAsync(vehicle.id);
      if (success) {
        toast.success(`${vehicle.name} purchased!`, {
          description: "Check your garage to customize.",
        });
        onClose();
      } else {
        toast.error("Purchase failed", { description: "Try again." });
      }
    } catch {
      toast.error("Purchase failed");
    }
  };

  return (
    <Dialog open={!!vehicle} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden border-border bg-card gap-0"
        data-ocid="vehicle-detail-modal"
      >
        <DialogTitle className="sr-only">{vehicle.name} Details</DialogTitle>

        <div className="flex h-[580px]">
          {/* Left: 3D Preview + Info */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {typeLabel}
                  </Badge>
                  {isOwned && (
                    <Badge className="text-xs bg-secondary/20 text-secondary border-secondary/40">
                      Owned
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {vehicle.name}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  {vehicle.brand}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-primary">
                  {formatRupees(vehicle.price)}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Canvas */}
            <div
              className="flex-1 relative"
              style={{
                background: `radial-gradient(ellipse at center, ${paintColor}18 0%, transparent 70%)`,
              }}
            >
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="w-48 h-48 rounded-full" />
                  </div>
                }
              >
                <VehicleCanvas
                  vehicle={vehicle}
                  paintColor={paintColor}
                  underglowColor={underglowColor}
                  underglowEnabled={underglowEnabled}
                />
              </Suspense>
              <p className="absolute bottom-2 right-3 text-xs text-muted-foreground font-mono opacity-60">
                Drag to rotate
              </p>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-2 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">
                Base Stats
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
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
                  label="Acceleration"
                  value={Number(vehicle.baseStats.acceleration)}
                  color="accent"
                />
                <StatsBar
                  label="Braking"
                  value={Number(vehicle.baseStats.braking)}
                  color="secondary"
                />
              </div>
              {/* Derived performance labels */}
              <div className="flex justify-between pt-1 border-t border-border/40">
                <span className="telemetry-text text-[10px] text-muted-foreground">
                  Top Speed: {Math.round(Number(vehicle.baseStats.speed) * 2.2)}{" "}
                  km/h
                </span>
                <span className="telemetry-text text-[10px] text-muted-foreground">
                  0-60: {(10 - Number(vehicle.baseStats.speed) / 20).toFixed(1)}
                  s
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {vehicle.description}
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 pt-2 flex gap-2 border-t border-border">
              {isOwned ? (
                <Button
                  className="flex-1 gap-2"
                  onClick={() => setShowCustomize(true)}
                  data-ocid="btn-customize"
                >
                  <Wrench className="w-4 h-4" />
                  Customize
                </Button>
              ) : (
                <Button
                  className="flex-1 gap-2"
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending || !canAfford}
                  variant={canAfford ? "default" : "outline"}
                  data-ocid="btn-purchase"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {purchaseMutation.isPending
                    ? "Purchasing…"
                    : canAfford
                      ? `Buy for ${formatRupees(vehicle.price)}`
                      : "Insufficient Funds"}
                </Button>
              )}
            </div>
          </div>

          {/* Right: Customization Panel */}
          {showCustomize && isOwned && (
            <div className="w-72 border-l border-border overflow-y-auto">
              <CustomizationPanel
                vehicle={vehicle}
                initialMods={ownedData?.modifications}
                onClose={() => setShowCustomize(false)}
                onModsChange={(m) => {
                  setPaintColor(m.paint.color);
                  setUnderglowColor(m.visual.underglowColor);
                  setUnderglowEnabled(m.visual.underglow);
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
