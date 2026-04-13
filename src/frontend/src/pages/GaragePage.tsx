import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bike, Car, Truck, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { VehicleType } from "../backend";
import { VehicleCard } from "../components/VehicleCard";
import { VehicleDetailModal } from "../components/VehicleDetailModal";
import { VEHICLES, formatRupees } from "../data/vehicles";
import { useGetMyGarage } from "../hooks/useBackend";
import { usePlayer } from "../hooks/usePlayer";
import type { OwnedVehicle, VehicleData } from "../types";

type FilterTab = "all" | "car" | "motorcycle" | "rickshaw";

const FILTER_TABS: {
  id: FilterTab;
  label: string;
  icon: React.ReactNode;
  count: number;
}[] = [
  {
    id: "all",
    label: "All",
    icon: <span className="text-base">🏎️</span>,
    count: VEHICLES.length,
  },
  {
    id: "car",
    label: "Cars",
    icon: <Car className="w-4 h-4" />,
    count: VEHICLES.filter((v) => v.vehicleType === VehicleType.car).length,
  },
  {
    id: "motorcycle",
    label: "Motorcycles",
    icon: <Bike className="w-4 h-4" />,
    count: VEHICLES.filter((v) => v.vehicleType === VehicleType.motorcycle)
      .length,
  },
  {
    id: "rickshaw",
    label: "Auto-Rickshaws",
    icon: <Truck className="w-4 h-4" />,
    count: VEHICLES.filter((v) => v.vehicleType === VehicleType.rickshaw)
      .length,
  },
];

function AnimatedBalance({ value }: { value: bigint }) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<bigint>(value);

  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;
    if (value !== prevRef.current) {
      el.classList.add("text-secondary");
      const t = setTimeout(() => el.classList.remove("text-secondary"), 800);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      ref={displayRef}
      className="font-mono font-bold text-primary transition-colors duration-500"
      data-ocid="currency-balance"
    >
      {formatRupees(value)}
    </span>
  );
}

export function GaragePage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(
    null,
  );

  const { data: garageData, isLoading: garageLoading } = useGetMyGarage();
  const { currencyBalance, isLoading: profileLoading } = usePlayer();

  const ownedIds = new Set((garageData ?? []).map((v) => v.vehicleId));
  const ownedCount = VEHICLES.filter((v) => ownedIds.has(v.id)).length;

  const filteredVehicles = VEHICLES.filter((v) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "car") return v.vehicleType === VehicleType.car;
    if (activeFilter === "motorcycle")
      return v.vehicleType === VehicleType.motorcycle;
    if (activeFilter === "rickshaw")
      return v.vehicleType === VehicleType.rickshaw;
    return true;
  });

  const getOwnedData = (vehicleId: bigint): OwnedVehicle | undefined =>
    (garageData ?? []).find((v) => v.vehicleId === vehicleId);

  const isLoading = garageLoading || profileLoading;

  return (
    <div className="min-h-screen bg-background" data-ocid="garage-page">
      {/* Sticky Page Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              🏎️ Garage
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {ownedCount}/{VEHICLES.length} vehicles owned
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <AnimatedBalance value={currencyBalance} />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-smooth border ${
                  activeFilter === tab.id
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-muted/40 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
                data-ocid={`filter-tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
                <Badge
                  variant="outline"
                  className={`text-xs h-4 px-1 ${
                    activeFilter === tab.id
                      ? "border-primary/40 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
              <div key={key} className="space-y-2">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredVehicles.map((vehicle, i) => (
                <motion.div
                  key={String(vehicle.id)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    isOwned={ownedIds.has(vehicle.id)}
                    onSelect={setSelectedVehicle}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && filteredVehicles.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="empty-state-garage"
          >
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              No vehicles found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try a different filter to find your ride.
            </p>
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOwned={selectedVehicle ? ownedIds.has(selectedVehicle.id) : false}
        ownedData={
          selectedVehicle ? getOwnedData(selectedVehicle.id) : undefined
        }
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
}
