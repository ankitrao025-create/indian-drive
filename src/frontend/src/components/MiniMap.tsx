import { useEffect, useRef } from "react";
import type { PhysicsState } from "./GameCanvas";

interface MiniMapProps {
  physics: PhysicsState;
  isPlaying: boolean;
}

const MAP_SCALE = 0.6; // pixels per world meter
const MAP_SIZE = 140;

export function MiniMap({ physics, isPlaying }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = MAP_SIZE;
    const H = MAP_SIZE;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "rgba(13,13,13,0.9)";
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 8);
    ctx.fill();

    // Road strip (vertical in map = Z axis in world)
    const roadPixelWidth = 20 * MAP_SCALE;
    const cx = W / 2;
    ctx.fillStyle = "#1c1c1e";
    ctx.fillRect(cx - roadPixelWidth / 2, 0, roadPixelWidth, H);

    // Center line dashes
    ctx.strokeStyle = "rgba(245,158,11,0.6)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player dot — centered on map, world offset rendered around it
    const playerScreenX = W / 2;
    const playerScreenZ = H / 2;

    // Direction indicator
    const arrowLen = 8;
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      playerScreenX - Math.sin(physics.angle) * arrowLen,
      playerScreenZ - Math.cos(physics.angle) * arrowLen,
    );
    ctx.lineTo(
      playerScreenX + Math.sin(physics.angle) * arrowLen * 1.5,
      playerScreenZ + Math.cos(physics.angle) * arrowLen * 1.5,
    );
    ctx.stroke();

    // Player dot
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenZ, 4, 0, Math.PI * 2);
    ctx.fill();

    // Coordinate readout
    ctx.fillStyle = "rgba(102,102,102,0.8)";
    ctx.font = "8px monospace";
    ctx.fillText(
      `X:${Math.round(physics.x)} Z:${Math.round(physics.z)}`,
      6,
      H - 5,
    );

    // Border
    ctx.strokeStyle = "rgba(249,115,22,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, W - 1, H - 1, 8);
    ctx.stroke();
  }, [physics]);

  if (!isPlaying) return null;

  return (
    <div
      className="absolute bottom-24 right-6 z-20 shadow-xl"
      data-ocid="minimap"
    >
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        className="rounded-lg"
        aria-label="Mini-map"
      />
      <div className="telemetry-text text-xs text-muted-foreground text-center mt-0.5">
        MAP
      </div>
    </div>
  );
}
