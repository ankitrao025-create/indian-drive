import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Paintbrush, Save, X, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApplyMods } from "../hooks/useBackend";
import type { Modifications } from "../types";
import type { VehicleData } from "../types";
import { StatsComparison } from "./StatsBar";

const PAINT_COLORS = [
  { name: "Blaze Orange", hex: "#f97316" },
  { name: "Crimson Red", hex: "#dc2626" },
  { name: "Midnight Black", hex: "#1a1a1a" },
  { name: "Pearl White", hex: "#f8fafc" },
  { name: "Teal Storm", hex: "#14b8a6" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Marigold", hex: "#f59e0b" },
  { name: "Forest Green", hex: "#16a34a" },
  { name: "Candy Purple", hex: "#8b5cf6" },
  { name: "Rose Pink", hex: "#ec4899" },
];

const RIMS = [
  { id: "stock", label: "Stock" },
  { id: "alloy_5spoke", label: "5-Spoke Alloy" },
  { id: "alloy_mesh", label: "Mesh Alloy" },
  { id: "forged_racing", label: "Forged Racing" },
];

const BODY_KITS = [
  { id: "stock", label: "Stock" },
  { id: "street_aero", label: "Street Aero" },
  { id: "race_wide", label: "Race Wide Body" },
];

const NEON_COLORS = [
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#2563eb",
  "#22c55e",
];

interface LocalMods {
  paint: { color: string; finish: "Matte" | "Metallic" | "Glossy" };
  performance: {
    engineLevel: number;
    suspensionLevel: number;
    brakesLevel: number;
    nitro: boolean;
  };
  visual: {
    rims: string;
    bodyKit: string;
    underglow: boolean;
    underglowColor: string;
  };
}

interface CustomizationPanelProps {
  vehicle: VehicleData;
  initialMods?: Modifications;
  onClose: () => void;
  onModsChange?: (mods: LocalMods) => void;
}

function calcEffectiveStats(
  base: VehicleData["baseStats"],
  perf: LocalMods["performance"],
) {
  const engBonus = (perf.engineLevel - 1) * 4;
  const susBonus = (perf.suspensionLevel - 1) * 3;
  const brkBonus = (perf.brakesLevel - 1) * 3;
  const nitroBonus = perf.nitro ? 8 : 0;
  return {
    speed: Number(base.speed) + engBonus + nitroBonus,
    acceleration: Number(base.acceleration) + engBonus,
    handling: Number(base.handling) + susBonus,
    braking: Number(base.braking) + brkBonus,
  };
}

export function CustomizationPanel({
  vehicle,
  initialMods,
  onClose,
  onModsChange,
}: CustomizationPanelProps) {
  const applyMods = useApplyMods();

  const [mods, setMods] = useState<LocalMods>({
    paint: {
      color: initialMods?.paint?.color ?? vehicle.color,
      finish:
        (initialMods?.paint?.finish as "Matte" | "Metallic" | "Glossy") ??
        "Glossy",
    },
    performance: {
      engineLevel: Number(initialMods?.performance?.engineLevel ?? 1n),
      suspensionLevel: Number(initialMods?.performance?.suspensionLevel ?? 1n),
      brakesLevel: Number(initialMods?.performance?.brakesLevel ?? 1n),
      nitro: initialMods?.performance?.nitro ?? false,
    },
    visual: {
      rims: initialMods?.visual?.rims ?? "stock",
      bodyKit: initialMods?.visual?.bodyKit ?? "stock",
      underglow: !!initialMods?.visual?.underglowColor,
      underglowColor: initialMods?.visual?.underglowColor ?? NEON_COLORS[0],
    },
  });

  const updateMods = (updated: LocalMods) => {
    setMods(updated);
    onModsChange?.(updated);
  };

  const effectiveStats = calcEffectiveStats(
    vehicle.baseStats,
    mods.performance,
  );

  const handleSave = async () => {
    const backendMods: Modifications = {
      paint: { color: mods.paint.color, finish: mods.paint.finish },
      performance: {
        engineLevel: BigInt(mods.performance.engineLevel),
        suspensionLevel: BigInt(mods.performance.suspensionLevel),
        brakesLevel: BigInt(mods.performance.brakesLevel),
        nitro: mods.performance.nitro,
      },
      visual: {
        rims: mods.visual.rims,
        bodyKit: mods.visual.bodyKit,
        underglowColor: mods.visual.underglow
          ? mods.visual.underglowColor
          : undefined,
      },
    };
    try {
      await applyMods.mutateAsync({ vehicleId: vehicle.id, mods: backendMods });
      toast.success("Loadout saved!", {
        description: `${vehicle.name} modifications applied.`,
      });
    } catch {
      toast.error("Failed to save loadout", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-card border-l border-border"
      data-ocid="customization-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="font-display font-bold text-sm text-foreground">
            Customize
          </h3>
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {vehicle.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          data-ocid="customization-close"
          aria-label="Close customization panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="paint"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-3 mt-3 grid grid-cols-3 bg-muted h-8">
          <TabsTrigger
            value="paint"
            className="text-xs gap-1"
            data-ocid="tab-paint"
          >
            <Paintbrush className="w-3 h-3" />
            Paint
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="text-xs gap-1"
            data-ocid="tab-performance"
          >
            <Zap className="w-3 h-3" />
            Perf
          </TabsTrigger>
          <TabsTrigger
            value="visual"
            className="text-xs gap-1"
            data-ocid="tab-visual"
          >
            <Eye className="w-3 h-3" />
            Visual
          </TabsTrigger>
        </TabsList>

        {/* Paint Tab */}
        <TabsContent
          value="paint"
          className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
        >
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">
              Color
            </p>
            <div className="grid grid-cols-5 gap-2">
              {PAINT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  title={c.name}
                  onClick={() =>
                    updateMods({
                      ...mods,
                      paint: { ...mods.paint, color: c.hex },
                    })
                  }
                  className="w-8 h-8 rounded-full border-2 transition-smooth hover:scale-110"
                  style={{
                    background: c.hex,
                    borderColor:
                      mods.paint.color === c.hex ? "white" : "transparent",
                    boxShadow:
                      mods.paint.color === c.hex ? `0 0 8px ${c.hex}` : "none",
                  }}
                  aria-label={c.name}
                  data-ocid={`paint-color-${c.hex.replace("#", "")}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">
              Finish
            </p>
            <div className="flex gap-2">
              {(["Matte", "Metallic", "Glossy"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() =>
                    updateMods({ ...mods, paint: { ...mods.paint, finish: f } })
                  }
                  className={`flex-1 py-1.5 text-xs font-mono rounded border transition-smooth ${
                    mods.paint.finish === f
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                  data-ocid={`finish-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Preview swatch */}
          <div
            className="rounded-lg h-16 flex items-center justify-center"
            style={{
              background: mods.paint.color,
              opacity: mods.paint.finish === "Matte" ? 0.85 : 1,
              boxShadow:
                mods.paint.finish === "Metallic"
                  ? `0 0 20px ${mods.paint.color}80, inset 0 1px 0 rgba(255,255,255,0.3)`
                  : mods.paint.finish === "Glossy"
                    ? `0 0 30px ${mods.paint.color}60`
                    : "none",
            }}
          >
            <span className="text-2xl">{vehicle.emoji}</span>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent
          value="performance"
          className="flex-1 overflow-y-auto px-3 py-3 space-y-5"
        >
          {[
            {
              key: "engineLevel" as const,
              label: "Engine Level",
              stat: "Speed",
              delta: (mods.performance.engineLevel - 1) * 4,
            },
            {
              key: "suspensionLevel" as const,
              label: "Suspension",
              stat: "Handling",
              delta: (mods.performance.suspensionLevel - 1) * 3,
            },
            {
              key: "brakesLevel" as const,
              label: "Brakes Level",
              stat: "Braking",
              delta: (mods.performance.brakesLevel - 1) * 3,
            },
          ].map(({ key, label, stat, delta }) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {label}
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    Lv {mods.performance[key]}
                  </Badge>
                  {delta > 0 && (
                    <span className="text-xs font-bold text-secondary font-mono">
                      +{delta} {stat}
                    </span>
                  )}
                </div>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[mods.performance[key]]}
                onValueChange={([v]) =>
                  updateMods({
                    ...mods,
                    performance: { ...mods.performance, [key]: v },
                  })
                }
                className="cursor-pointer"
                data-ocid={`slider-${key}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>Stock</span>
                <span>Max</span>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg border border-border">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Nitro Boost
              </Label>
              <p className="text-xs text-secondary font-mono mt-0.5">
                +8 Speed
              </p>
            </div>
            <Switch
              checked={mods.performance.nitro}
              onCheckedChange={(v) =>
                updateMods({
                  ...mods,
                  performance: { ...mods.performance, nitro: v },
                })
              }
              data-ocid="toggle-nitro"
            />
          </div>

          {/* Stats comparison */}
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
              After Mods
            </p>
            <StatsComparison
              label="Speed"
              before={Number(vehicle.baseStats.speed)}
              after={effectiveStats.speed}
            />
            <StatsComparison
              label="Acceleration"
              before={Number(vehicle.baseStats.acceleration)}
              after={effectiveStats.acceleration}
            />
            <StatsComparison
              label="Handling"
              before={Number(vehicle.baseStats.handling)}
              after={effectiveStats.handling}
            />
            <StatsComparison
              label="Braking"
              before={Number(vehicle.baseStats.braking)}
              after={effectiveStats.braking}
            />
          </div>
        </TabsContent>

        {/* Visual Tab */}
        <TabsContent
          value="visual"
          className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
        >
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">
              Rims
            </p>
            <div className="grid grid-cols-2 gap-2">
              {RIMS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() =>
                    updateMods({
                      ...mods,
                      visual: { ...mods.visual, rims: r.id },
                    })
                  }
                  className={`py-2 text-xs font-mono rounded border transition-smooth ${
                    mods.visual.rims === r.id
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                  data-ocid={`rims-${r.id}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">
              Body Kit
            </p>
            <div className="space-y-1.5">
              {BODY_KITS.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() =>
                    updateMods({
                      ...mods,
                      visual: { ...mods.visual, bodyKit: b.id },
                    })
                  }
                  className={`w-full py-2 text-xs font-mono rounded border text-left px-3 transition-smooth ${
                    mods.visual.bodyKit === b.id
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                  data-ocid={`bodykit-${b.id}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 py-2 px-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Neon Underglow
              </Label>
              <Switch
                checked={mods.visual.underglow}
                onCheckedChange={(v) =>
                  updateMods({
                    ...mods,
                    visual: { ...mods.visual, underglow: v },
                  })
                }
                data-ocid="toggle-underglow"
              />
            </div>
            {mods.visual.underglow && (
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-2">
                  Glow Color
                </p>
                <div className="flex gap-2 flex-wrap">
                  {NEON_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() =>
                        updateMods({
                          ...mods,
                          visual: { ...mods.visual, underglowColor: c },
                        })
                      }
                      className="w-7 h-7 rounded-full border-2 transition-smooth hover:scale-110"
                      style={{
                        background: c,
                        borderColor:
                          mods.visual.underglowColor === c
                            ? "white"
                            : "transparent",
                        boxShadow: `0 0 8px ${c}`,
                      }}
                      aria-label={`Neon ${c}`}
                      data-ocid={`neon-${c.replace("#", "")}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="p-3 border-t border-border">
        <Button
          className="w-full gap-2"
          onClick={handleSave}
          disabled={applyMods.isPending}
          data-ocid="save-loadout"
        >
          <Save className="w-4 h-4" />
          {applyMods.isPending ? "Saving…" : "Save Loadout"}
        </Button>
      </div>
    </div>
  );
}
