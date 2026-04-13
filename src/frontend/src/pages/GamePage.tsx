import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Pause, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Medal } from "../backend";
import { ChallengeOverlay } from "../components/ChallengeOverlay";
import { GameCanvas } from "../components/GameCanvas";
import type { InputState, PhysicsState } from "../components/GameCanvas";
import { InGameHUD } from "../components/InGameHUD";
import { MiniMap } from "../components/MiniMap";
import { PauseMenu } from "../components/PauseMenu";
import { TouchControls } from "../components/TouchControls";
import { SAMPLE_CHALLENGES } from "../data/challenges";
import { VEHICLES, VEHICLE_TYPE_LABELS } from "../data/vehicles";
import {
  useGetMyGarage,
  useListChallenges,
  useSubmitChallengeResult,
} from "../hooks/useBackend";
import type { Challenge, VehicleData } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────
const RUPEES_PER_KM = 10;
const CHALLENGE_DURATION_S = 90;

// ─── Vehicle stat helpers ─────────────────────────────────────────────────────
function computeVehiclePhysics(v: VehicleData) {
  return {
    maxSpeedKmh: Number(v.baseStats.speed) * 2.2,
    accelRate: Number(v.baseStats.acceleration) * 0.12,
    brakingRate: Number(v.baseStats.braking) * 0.15,
    turningRate: Number(v.baseStats.handling) / 100,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GamePage() {
  const navigate = useNavigate();
  const { data: garageVehicles } = useGetMyGarage();
  const { data: backendChallenges } = useListChallenges();
  const submitChallenge = useSubmitChallengeResult();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData>(
    VEHICLES[0],
  );

  // Physics live state — rendered in UI
  const [physics, setPhysics] = useState<PhysicsState>({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    distanceKm: 0,
  });
  const physicsRef = useRef<PhysicsState>({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    distanceKm: 0,
  });

  // Session economy
  const [rupeesEarned, setRupeesEarned] = useState(0);
  const lastKmRef = useRef(0);

  // Challenge state
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(
    null,
  );
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(0);
  const [challengeIsComplete, setChallengeIsComplete] = useState(false);
  const [challengeIsFailed, setChallengeIsFailed] = useState(false);
  const [earnedMedal, setEarnedMedal] = useState<Medal | null>(null);
  const challengeStartRef = useRef<number>(0);

  // Input refs
  const inputRef = useRef<InputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    brake: false,
  });

  const challenges = backendChallenges?.length
    ? backendChallenges
    : SAMPLE_CHALLENGES;

  // ─── Keyboard controls ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(true);
        return;
      }
      if (!inputRef.current) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
        inputRef.current.forward = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
        inputRef.current.back = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        inputRef.current.right = true;
      if (e.key === " ") {
        e.preventDefault();
        inputRef.current.brake = true;
      }
    };

    const up = (e: KeyboardEvent) => {
      if (!inputRef.current) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
        inputRef.current.forward = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
        inputRef.current.back = false;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        inputRef.current.right = false;
      if (e.key === " ") inputRef.current.brake = false;
    };

    // Esc while paused
    const escUnpause = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPaused) setIsPaused(false);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("keydown", escUnpause);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("keydown", escUnpause);
    };
  }, [isPlaying, isPaused]);

  // ─── Esc key for pausing ────────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPaused) setIsPaused(false);
        else if (isPlaying) setIsPaused(true);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isPlaying, isPaused]);

  // ─── Physics update callback ────────────────────────────────────────────────
  const handlePhysicsUpdate = useCallback((state: PhysicsState) => {
    setPhysics({ ...state });

    // Rupees per km
    const kmDelta = state.distanceKm - lastKmRef.current;
    if (kmDelta >= 0.1) {
      setRupeesEarned(
        (prev) => prev + Math.floor(kmDelta * RUPEES_PER_KM * 100) / 10,
      );
      lastKmRef.current = state.distanceKm;
    }
  }, []);

  // ─── Challenge timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !activeChallenge ||
      !isPlaying ||
      isPaused ||
      challengeIsComplete ||
      challengeIsFailed
    )
      return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - challengeStartRef.current) / 1000;
      const remaining = CHALLENGE_DURATION_S - elapsed;

      if (remaining <= 0) {
        setChallengeTimeLeft(0);
        setChallengeIsFailed(true);
        clearInterval(interval);
      } else {
        setChallengeTimeLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    activeChallenge,
    isPlaying,
    isPaused,
    challengeIsComplete,
    challengeIsFailed,
  ]);

  // ─── Start game ─────────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    physicsRef.current = { x: 0, z: 0, angle: 0, speed: 0, distanceKm: 0 };
    setPhysics({ x: 0, z: 0, angle: 0, speed: 0, distanceKm: 0 });
    lastKmRef.current = 0;
    setRupeesEarned(0);
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    setActiveChallenge(null);
    setChallengeIsComplete(false);
    setChallengeIsFailed(false);
    setEarnedMedal(null);
    setTimeout(handleStart, 50);
  }, [handleStart]);

  const handleReturnToMenu = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    navigate({ to: "/" });
  }, [navigate]);

  // ─── Start challenge ────────────────────────────────────────────────────────
  const startChallenge = useCallback(
    (challenge: Challenge) => {
      setActiveChallenge(challenge);
      setChallengeTimeLeft(CHALLENGE_DURATION_S);
      setChallengeIsComplete(false);
      setChallengeIsFailed(false);
      setEarnedMedal(null);
      challengeStartRef.current = Date.now();
      if (!isPlaying) handleStart();
    },
    [isPlaying, handleStart],
  );

  // ─── Complete challenge (manual trigger for demo) ───────────────────────────
  const completeChallenge = useCallback(() => {
    if (!activeChallenge) return;
    const elapsed = Date.now() - challengeStartRef.current;
    const pct = elapsed / (CHALLENGE_DURATION_S * 1000);
    const medal =
      pct < 0.5 ? Medal.gold : pct < 0.75 ? Medal.silver : Medal.bronze;
    setEarnedMedal(medal);
    setChallengeIsComplete(true);
    submitChallenge.mutate({
      challengeId: activeChallenge.id,
      timeMs: BigInt(Math.round(elapsed)),
      medal,
    });
  }, [activeChallenge, submitChallenge]);

  const dismissChallenge = useCallback(() => {
    setActiveChallenge(null);
    setChallengeIsComplete(false);
    setChallengeIsFailed(false);
    setEarnedMedal(null);
  }, []);

  // ─── Vehicle physics params ─────────────────────────────────────────────────
  const vehiclePhysics = useMemo(
    () => computeVehiclePhysics(selectedVehicle),
    [selectedVehicle],
  );

  // ─── Owned vehicle IDs ───────────────────────────────────────────────────────
  const ownedVehicleIds = useMemo(() => {
    if (!garageVehicles?.length) return new Set<string>();
    return new Set(garageVehicles.map((v) => v.vehicleId.toString()));
  }, [garageVehicles]);

  // ─── Selectable vehicles (owned or all VEHICLES if garage empty) ─────────────
  const selectableVehicles = useMemo(() => {
    if (ownedVehicleIds.size === 0) return VEHICLES;
    return VEHICLES.filter((v) => ownedVehicleIds.has(v.id.toString()));
  }, [ownedVehicleIds]);

  return (
    <div
      className="h-screen bg-background relative overflow-hidden"
      data-ocid="game-page"
    >
      {/* 3D Canvas fills viewport */}
      <div className="absolute inset-0">
        <GameCanvas
          vehicleColor={selectedVehicle.color}
          vehicleType={selectedVehicle.vehicleType}
          inputRef={inputRef}
          onPhysicsUpdate={handlePhysicsUpdate}
          isPlaying={isPlaying && !isPaused}
          physicsRef={physicsRef}
          maxSpeedKmh={vehiclePhysics.maxSpeedKmh}
          accelRate={vehiclePhysics.accelRate}
          brakingRate={vehiclePhysics.brakingRate}
          turningRate={vehiclePhysics.turningRate}
        />
      </div>

      {/* ── Pre-game overlay ── */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            key="prestart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col bg-background/80 backdrop-blur-sm"
            data-ocid="prestart-overlay"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-display"
                data-ocid="game-back-btn"
              >
                <ChevronLeft size={16} />
                MENU
              </Link>
              <span className="font-display font-black text-primary tracking-widest text-sm">
                BHARAT BURNOUT
              </span>
              <Link to="/garage">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-display text-xs tracking-wider"
                >
                  GARAGE
                </Button>
              </Link>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 px-6 py-6 overflow-auto">
              {/* Vehicle selector */}
              <div className="flex-1">
                <h2 className="font-display font-black text-xl text-foreground mb-4 tracking-wider">
                  SELECT VEHICLE
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectableVehicles.map((v) => (
                    <button
                      type="button"
                      key={v.id.toString()}
                      onClick={() => setSelectedVehicle(v)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-smooth text-left ${
                        selectedVehicle.id === v.id
                          ? "bg-primary/20 border-primary shadow-lg"
                          : "bg-card/80 border-border hover:border-muted-foreground hover:bg-card"
                      }`}
                      data-ocid={`select-vehicle-${v.id}`}
                    >
                      <span className="text-3xl">{v.emoji}</span>
                      <div className="w-full text-center">
                        <div className="font-display font-bold text-xs text-foreground truncate">
                          {v.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {VEHICLE_TYPE_LABELS[v.vehicleType]}
                        </div>
                      </div>
                      {/* Mini stat bars */}
                      <div className="w-full space-y-1">
                        {(["speed", "acceleration", "handling"] as const).map(
                          (stat) => (
                            <div key={stat} className="flex items-center gap-1">
                              <span className="telemetry-text text-xs text-muted-foreground w-5 uppercase">
                                {stat[0]}
                              </span>
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${Number(v.baseStats[stat])}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenge selector */}
              <div className="lg:w-72">
                <h2 className="font-display font-black text-xl text-foreground mb-4 tracking-wider">
                  CHALLENGES
                </h2>
                <div className="space-y-2">
                  {challenges.slice(0, 5).map((c) => (
                    <button
                      type="button"
                      key={c.id.toString()}
                      onClick={() => startChallenge(c)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-card/80 border border-border hover:border-primary/50 hover:bg-card transition-smooth"
                      data-ocid={`start-challenge-${c.id}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">🏁</span>
                        <div className="min-w-0">
                          <div className="font-display font-bold text-xs text-foreground truncate">
                            {c.name}
                          </div>
                          <div className="telemetry-text text-xs text-muted-foreground capitalize">
                            {c.difficulty}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-primary border-primary/40 text-xs"
                      >
                        ₹{Number(c.rewards.currency).toLocaleString("en-IN")}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start button */}
            <div className="px-6 pb-6 flex items-center justify-center gap-4">
              <Button
                onClick={handleStart}
                className="bg-primary text-primary-foreground font-display font-black tracking-widest px-10 py-5 text-lg shadow-xl"
                data-ocid="game-start-btn"
              >
                <Zap size={20} className="mr-2" />
                START FREE ROAM
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── In-game overlays ── */}
      {isPlaying && (
        <>
          {/* In-game top HUD */}
          <InGameHUD
            vehicleName={selectedVehicle.name}
            vehicleEmoji={selectedVehicle.emoji}
            physics={physics}
            rupeesEarned={Math.floor(rupeesEarned)}
            challengeTimeLeft={
              activeChallenge && !challengeIsComplete && !challengeIsFailed
                ? challengeTimeLeft
                : null
            }
            challengeName={activeChallenge?.name ?? null}
            isPlaying={isPlaying && !isPaused}
          />

          {/* Pause button */}
          <button
            type="button"
            onClick={() => setIsPaused(true)}
            className="absolute top-14 right-4 z-20 bg-card/70 border border-border rounded-lg p-2 hover:bg-card transition-smooth backdrop-blur-sm"
            aria-label="Pause game"
            data-ocid="pause-btn"
          >
            <Pause size={16} className="text-muted-foreground" />
          </button>

          {/* Vehicle switch bar */}
          <div
            className="absolute top-14 left-4 z-20 flex gap-2"
            data-ocid="vehicle-switch-bar"
          >
            {selectableVehicles.slice(0, 4).map((v) => (
              <button
                type="button"
                key={v.id.toString()}
                onClick={() => setSelectedVehicle(v)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border text-xs transition-smooth backdrop-blur-sm ${
                  selectedVehicle.id === v.id
                    ? "bg-primary/20 border-primary"
                    : "bg-card/60 border-border/60 hover:border-muted-foreground"
                }`}
                data-ocid={`switch-vehicle-${v.id}`}
              >
                <span className="text-base leading-none">{v.emoji}</span>
                <span className="telemetry-text text-xs text-muted-foreground leading-none">
                  {v.name.split(" ").pop()}
                </span>
              </button>
            ))}
          </div>

          {/* Mini-map */}
          <MiniMap physics={physics} isPlaying={isPlaying && !isPaused} />

          {/* Touch controls */}
          <TouchControls
            inputRef={inputRef}
            isPlaying={isPlaying && !isPaused}
          />

          {/* Challenge overlay */}
          <ChallengeOverlay
            activeChallenge={activeChallenge}
            timeLeft={challengeTimeLeft}
            totalTime={CHALLENGE_DURATION_S}
            isComplete={challengeIsComplete}
            isFailed={challengeIsFailed}
            earnedMedal={earnedMedal}
            onDismiss={dismissChallenge}
          />

          {/* Dev: complete challenge button */}
          {activeChallenge && !challengeIsComplete && !challengeIsFailed && (
            <button
              type="button"
              onClick={completeChallenge}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-secondary/20 border border-secondary/40 rounded-lg px-3 py-1.5 text-secondary text-xs font-display tracking-wider hover:bg-secondary/30 transition-smooth backdrop-blur-sm"
              data-ocid="complete-challenge-btn"
            >
              ✓ COMPLETE CHALLENGE
            </button>
          )}
        </>
      )}

      {/* Pause menu */}
      <PauseMenu
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onReturnToMenu={handleReturnToMenu}
        onRestart={handleRestart}
      />
    </div>
  );
}
