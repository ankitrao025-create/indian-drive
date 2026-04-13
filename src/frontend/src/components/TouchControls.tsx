import { useEffect, useRef, useState } from "react";
import type { InputState } from "./GameCanvas";

interface TouchControlsProps {
  inputRef: React.RefObject<InputState>;
  isPlaying: boolean;
}

interface JoystickState {
  active: boolean;
  baseX: number;
  baseY: number;
  tipX: number;
  tipY: number;
}

const JOYSTICK_RADIUS = 44;
const DEAD_ZONE = 0.2;

export function TouchControls({ inputRef, isPlaying }: TouchControlsProps) {
  const [joystick, setJoystick] = useState<JoystickState>({
    active: false,
    baseX: 0,
    baseY: 0,
    tipX: 0,
    tipY: 0,
  });
  const [accelActive, setAccelActive] = useState(false);
  const [brakeActive, setBrakeActive] = useState(false);
  const [handbrakeActive, setHandbrakeActive] = useState(false);

  const joystickTouchId = useRef<number | null>(null);

  // Update input from joystick + buttons
  useEffect(() => {
    if (!inputRef.current) return;

    if (joystick.active) {
      const dx = (joystick.tipX - joystick.baseX) / JOYSTICK_RADIUS;
      const dy = (joystick.tipY - joystick.baseY) / JOYSTICK_RADIUS;

      inputRef.current.left = dx < -DEAD_ZONE;
      inputRef.current.right = dx > DEAD_ZONE;
      // forward/back from joystick vertical
      inputRef.current.forward = accelActive || dy < -DEAD_ZONE;
      inputRef.current.back = dy > DEAD_ZONE;
    } else {
      inputRef.current.left = false;
      inputRef.current.right = false;
      if (!accelActive) inputRef.current.forward = false;
      if (!brakeActive) inputRef.current.back = false;
    }

    inputRef.current.forward = accelActive || inputRef.current.forward;
    inputRef.current.back = brakeActive || inputRef.current.back;
    inputRef.current.brake = handbrakeActive;
  }, [joystick, accelActive, brakeActive, handbrakeActive, inputRef]);

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    joystickTouchId.current = touch.identifier;
    setJoystick({
      active: true,
      baseX: touch.clientX,
      baseY: touch.clientY,
      tipX: touch.clientX,
      tipY: touch.clientY,
    });
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === joystickTouchId.current,
    );
    if (!touch) return;

    setJoystick((prev) => {
      const dx = touch.clientX - prev.baseX;
      const dy = touch.clientY - prev.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamp = Math.min(dist, JOYSTICK_RADIUS);
      const angle = Math.atan2(dy, dx);
      return {
        ...prev,
        tipX: prev.baseX + Math.cos(angle) * clamp,
        tipY: prev.baseY + Math.sin(angle) * clamp,
      };
    });
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    const ids = Array.from(e.changedTouches).map((t) => t.identifier);
    if (
      joystickTouchId.current !== null &&
      ids.includes(joystickTouchId.current)
    ) {
      joystickTouchId.current = null;
      setJoystick({ active: false, baseX: 0, baseY: 0, tipX: 0, tipY: 0 });
    }
  };

  if (!isPlaying) return null;

  const tipOffsetX = joystick.active ? joystick.tipX - joystick.baseX : 0;
  const tipOffsetY = joystick.active ? joystick.tipY - joystick.baseY : 0;

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none select-none"
      data-ocid="touch-controls"
    >
      {/* Left: Virtual joystick zone */}
      <div
        className="absolute bottom-24 left-8 pointer-events-auto"
        style={{
          width: JOYSTICK_RADIUS * 2 + 20,
          height: JOYSTICK_RADIUS * 2 + 20,
        }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        aria-label="Steering joystick"
      >
        {/* Base ring */}
        <div
          className="absolute rounded-full border-2 border-primary/30 bg-card/30 backdrop-blur-sm"
          style={{
            width: JOYSTICK_RADIUS * 2,
            height: JOYSTICK_RADIUS * 2,
            top: 10,
            left: 10,
          }}
        />
        {/* Thumb nub */}
        <div
          className="absolute rounded-full bg-primary/70 border border-primary shadow-lg"
          style={{
            width: 36,
            height: 36,
            top: 10 + JOYSTICK_RADIUS - 18 + tipOffsetY,
            left: 10 + JOYSTICK_RADIUS - 18 + tipOffsetX,
            transition: joystick.active ? "none" : "all 0.15s ease",
          }}
        />
      </div>

      {/* Right: Gas + Brake + Handbrake */}
      <div className="absolute bottom-24 right-8 flex flex-col gap-3 items-end pointer-events-auto">
        {/* Handbrake */}
        <button
          type="button"
          onTouchStart={() => setHandbrakeActive(true)}
          onTouchEnd={() => setHandbrakeActive(false)}
          onTouchCancel={() => setHandbrakeActive(false)}
          className={`w-12 h-12 rounded-full border-2 font-display font-bold text-xs transition-smooth ${
            handbrakeActive
              ? "bg-secondary/80 border-secondary text-secondary-foreground"
              : "bg-card/60 border-secondary/40 text-secondary"
          }`}
          aria-label="Handbrake"
          data-ocid="touch-handbrake"
        >
          HB
        </button>

        {/* Brake */}
        <button
          type="button"
          onTouchStart={() => setBrakeActive(true)}
          onTouchEnd={() => setBrakeActive(false)}
          onTouchCancel={() => setBrakeActive(false)}
          className={`w-16 h-16 rounded-full border-2 font-display font-bold text-xs transition-smooth ${
            brakeActive
              ? "bg-destructive/80 border-destructive text-foreground"
              : "bg-card/60 border-destructive/40 text-destructive"
          }`}
          aria-label="Brake"
          data-ocid="touch-brake"
        >
          BRAKE
        </button>

        {/* Accelerate */}
        <button
          type="button"
          onTouchStart={() => setAccelActive(true)}
          onTouchEnd={() => setAccelActive(false)}
          onTouchCancel={() => setAccelActive(false)}
          className={`w-20 h-20 rounded-full border-2 font-display font-bold text-sm transition-smooth ${
            accelActive
              ? "bg-primary border-primary text-primary-foreground shadow-lg"
              : "bg-card/60 border-primary/50 text-primary"
          }`}
          aria-label="Accelerate"
          data-ocid="touch-accelerate"
        >
          GAS
        </button>
      </div>
    </div>
  );
}
