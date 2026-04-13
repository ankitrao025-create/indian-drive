import { Environment, Grid, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PhysicsState {
  x: number; // world X
  z: number; // world Z
  angle: number; // heading in radians
  speed: number; // km/h
  distanceKm: number; // total km driven
}

export interface InputState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

interface GameCanvasProps {
  vehicleColor?: string;
  vehicleType?: string;
  inputRef: React.RefObject<InputState>;
  onPhysicsUpdate: (state: PhysicsState) => void;
  isPlaying: boolean;
  physicsRef: React.RefObject<PhysicsState>;
}

// ─── Vehicle meshes ───────────────────────────────────────────────────────────
function CarMesh({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.8, 0.55, 4.0]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.55, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wheels */}
      {(
        [
          { id: "fl", pos: [-0.9, 0.18, 1.35] },
          { id: "fr", pos: [0.9, 0.18, 1.35] },
          { id: "rl", pos: [-0.9, 0.18, -1.35] },
          { id: "rr", pos: [0.9, 0.18, -1.35] },
        ] as { id: string; pos: [number, number, number] }[]
      ).map(({ id, pos }) => (
        <mesh
          key={`wheel-${id}`}
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.32, 0.32, 0.25, 12]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[0.55, 0.35, 2.05]}>
        <boxGeometry args={[0.35, 0.18, 0.06]} />
        <meshStandardMaterial
          color="#ffffee"
          emissive="#ffffee"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[-0.55, 0.35, 2.05]}>
        <boxGeometry args={[0.35, 0.18, 0.06]} />
        <meshStandardMaterial
          color="#ffffee"
          emissive="#ffffee"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

function MotorcycleMesh({ color }: { color: string }) {
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.38, 0.7, 1.9]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Handlebar */}
      <mesh position={[0, 1.1, 0.75]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.12]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Wheels */}
      {(
        [
          { id: "front", pos: [0, 0.3, 0.9] },
          { id: "rear", pos: [0, 0.3, -0.9] },
        ] as { id: string; pos: [number, number, number] }[]
      ).map(({ id, pos }) => (
        <mesh
          key={`mwheel-${id}`}
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.18, 14]} />
          <meshStandardMaterial color="#111" metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
      {/* Rider seat */}
      <mesh position={[0, 1.0, -0.1]} castShadow>
        <boxGeometry args={[0.34, 0.12, 0.7]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  );
}

function RickshawMesh({ color }: { color: string }) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.5, 0.1]} castShadow>
        <boxGeometry args={[1.3, 0.8, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Hood/top */}
      <mesh position={[0, 1.08, -0.1]} castShadow>
        <boxGeometry args={[1.25, 0.55, 1.6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Front engine */}
      <mesh position={[0, 0.4, 1.1]} castShadow>
        <boxGeometry args={[0.7, 0.55, 0.5]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* 3 wheels */}
      {(
        [
          { id: "front", pos: [0, 0.25, 1.2] },
          { id: "rearleft", pos: [-0.7, 0.25, -0.7] },
          { id: "rearright", pos: [0.7, 0.25, -0.7] },
        ] as { id: string; pos: [number, number, number] }[]
      ).map(({ id, pos }) => (
        <mesh
          key={`rwheel-${id}`}
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.28, 0.28, 0.2, 10]} />
          <meshStandardMaterial color="#111" metalness={0.2} roughness={0.9} />
        </mesh>
      ))}
      {/* Decorative stripe */}
      <mesh position={[0, 0.5, 1.01]}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

// ─── Road environment ─────────────────────────────────────────────────────────
const LANE_MARKINGS: Array<{ id: string; pos: [number, number, number] }> =
  Array.from({ length: 30 }, (_, i) => ({
    id: `lm${i}`,
    pos: [0, 0.01, (i - 15) * 8] as [number, number, number],
  }));

const LEFT_BUILDINGS: Array<{
  id: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  hue: number;
  l: number;
}> = Array.from({ length: 20 }, (_, i) => ({
  id: `bl${i}`,
  x: -14 - ((i * 3.7) % 6),
  y: (2 + ((i * 2.3) % 6)) / 2,
  z: (i - 10) * 30 + ((i * 7.1) % 10),
  w: 3 + ((i * 1.3) % 4),
  h: 2 + ((i * 1.7) % 6),
  d: 4 + ((i * 2.1) % 6),
  hue: ((i * 13) % 30) + 200,
  l: ((i * 5) % 10) + 10,
}));

const RIGHT_BUILDINGS: Array<{
  id: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  hue: number;
  l: number;
}> = Array.from({ length: 20 }, (_, i) => ({
  id: `br${i}`,
  x: 14 + ((i * 2.9) % 6),
  y: (2 + ((i * 3.1) % 6)) / 2,
  z: (i - 10) * 30 + ((i * 5.3) % 10),
  w: 3 + ((i * 2.1) % 4),
  h: 2 + ((i * 2.3) % 6),
  d: 4 + ((i * 1.7) % 6),
  hue: ((i * 17) % 30) + 20,
  l: ((i * 7) % 10) + 10,
}));

function RoadEnvironment() {
  return (
    <group>
      {/* Main road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 2000]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Road edges - white lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.9, 0.005, 0]}>
        <planeGeometry args={[0.25, 2000]} />
        <meshStandardMaterial color="#e5e5e5" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.9, 0.005, 0]}>
        <planeGeometry args={[0.25, 2000]} />
        <meshStandardMaterial color="#e5e5e5" roughness={1} />
      </mesh>
      {/* Center dashes */}
      {LANE_MARKINGS.map(({ id, pos }) => (
        <mesh key={id} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
          <planeGeometry args={[0.15, 4]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={1}
            emissive="#f59e0b"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      {/* Ground off-road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[500, 2000]} />
        <meshStandardMaterial color="#0f0f0f" roughness={1} />
      </mesh>
      {/* Roadside buildings - left */}
      {LEFT_BUILDINGS.map(({ id, x, y, z, w, h, d, hue, l }) => (
        <mesh key={id} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={`hsl(${hue},10%,${l}%)`}
            roughness={0.9}
          />
        </mesh>
      ))}
      {/* Roadside buildings - right */}
      {RIGHT_BUILDINGS.map(({ id, x, y, z, w, h, d, hue, l }) => (
        <mesh key={id} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={`hsl(${hue},10%,${l}%)`}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Physics driver ───────────────────────────────────────────────────────────
const MAX_STEER = 0.9; // rad/s
const DRAG = 0.97;
const KMH_TO_MS = 1 / 3.6;
const WHEELBASE = 3.0;

interface VehicleActorProps {
  vehicleColor: string;
  vehicleType: string;
  inputRef: React.RefObject<InputState>;
  onPhysicsUpdate: (state: PhysicsState) => void;
  isPlaying: boolean;
  physicsRef: React.RefObject<PhysicsState>;
  maxSpeedKmh: number;
  accelRate: number;
  brakingRate: number;
  turningRate: number;
}

function VehicleActor({
  vehicleColor,
  vehicleType,
  inputRef,
  onPhysicsUpdate,
  isPlaying,
  physicsRef,
  maxSpeedKmh,
  accelRate,
  brakingRate,
  turningRate,
}: VehicleActorProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (
      !isPlaying ||
      !meshRef.current ||
      !inputRef.current ||
      !physicsRef.current
    )
      return;

    const dt = Math.min(delta, 0.05);
    const input = inputRef.current;
    const state = physicsRef.current;

    // Speed in m/s
    const speedMs = state.speed * KMH_TO_MS;
    let newSpeedMs = speedMs;

    if (input.forward) {
      newSpeedMs += accelRate * dt;
    } else if (input.back) {
      newSpeedMs -= brakingRate * 1.2 * dt;
    } else {
      newSpeedMs -= accelRate * 0.25 * dt; // engine drag
    }

    if (input.brake) {
      newSpeedMs -= brakingRate * 2.5 * dt;
    }

    newSpeedMs = Math.max(0, Math.min(newSpeedMs, maxSpeedKmh * KMH_TO_MS));
    newSpeedMs *= DRAG;

    // Steering (bicycle model)
    let newAngle = state.angle;
    if (newSpeedMs > 0.5) {
      const steerInput = (input.left ? 1 : 0) - (input.right ? 1 : 0);
      const steerAngle = steerInput * MAX_STEER * turningRate;
      const angularVel = (newSpeedMs * Math.tan(steerAngle)) / WHEELBASE;
      newAngle += angularVel * dt;
    }

    // Integrate position
    const newX = state.x + Math.sin(newAngle) * newSpeedMs * dt;
    const newZ = state.z + Math.cos(newAngle) * newSpeedMs * dt;
    const newSpeedKmh = newSpeedMs / KMH_TO_MS;
    const newDist = state.distanceKm + (newSpeedMs * dt) / 1000;

    // Update physics ref directly
    physicsRef.current = {
      x: newX,
      z: newZ,
      angle: newAngle,
      speed: newSpeedKmh,
      distanceKm: newDist,
    };

    // Update mesh
    meshRef.current.position.set(newX, 0, newZ);
    meshRef.current.rotation.y = newAngle;

    // Third-person camera follow
    const camDist = 10;
    const camHeight = 4.5;
    const camX = newX - Math.sin(newAngle) * camDist;
    const camZ = newZ - Math.cos(newAngle) * camDist;
    camera.position.lerp(new THREE.Vector3(camX, camHeight, camZ), 0.08);
    camera.lookAt(new THREE.Vector3(newX, 1, newZ));

    // Notify parent
    onPhysicsUpdate(physicsRef.current);
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {vehicleType === "motorcycle" ? (
        <MotorcycleMesh color={vehicleColor} />
      ) : vehicleType === "rickshaw" ? (
        <RickshawMesh color={vehicleColor} />
      ) : (
        <CarMesh color={vehicleColor} />
      )}
      {/* Neon underglow */}
      <pointLight
        position={[0, 0.1, 0]}
        intensity={0.8}
        color={vehicleColor}
        distance={4}
      />
    </group>
  );
}

function Scene({
  vehicleColor,
  vehicleType,
  inputRef,
  onPhysicsUpdate,
  isPlaying,
  physicsRef,
  maxSpeedKmh,
  accelRate,
  brakingRate,
  turningRate,
}: VehicleActorProps) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        color="#fff5e0"
      />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#14b8a6" />
      <Stars
        radius={120}
        depth={40}
        count={1200}
        factor={4}
        saturation={0.3}
        fade
      />
      <Environment preset="night" />
      <fog attach="fog" args={["#0d0d0d", 40, 160]} />
      <Grid
        args={[500, 500]}
        cellSize={5}
        cellThickness={0}
        sectionSize={20}
        sectionThickness={0.4}
        sectionColor="#1a2a2a"
        fadeDistance={100}
        fadeStrength={2}
        followCamera
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      <RoadEnvironment />
      <VehicleActor
        vehicleColor={vehicleColor}
        vehicleType={vehicleType}
        inputRef={inputRef}
        onPhysicsUpdate={onPhysicsUpdate}
        isPlaying={isPlaying}
        physicsRef={physicsRef}
        maxSpeedKmh={maxSpeedKmh}
        accelRate={accelRate}
        brakingRate={brakingRate}
        turningRate={turningRate}
      />
    </>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export function GameCanvas({
  vehicleColor = "#d97706",
  vehicleType = "car",
  inputRef,
  onPhysicsUpdate,
  isPlaying,
  physicsRef,
  maxSpeedKmh = 160,
  accelRate = 8,
  brakingRate = 12,
  turningRate = 0.8,
}: GameCanvasProps & {
  maxSpeedKmh?: number;
  accelRate?: number;
  brakingRate?: number;
  turningRate?: number;
}) {
  return (
    <div className="w-full h-full" data-ocid="game-canvas">
      <Canvas
        camera={{ position: [0, 4.5, -10], fov: 60, near: 0.1, far: 500 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#0d0d0d" }}
      >
        <Suspense fallback={null}>
          <Scene
            vehicleColor={vehicleColor}
            vehicleType={vehicleType}
            inputRef={inputRef}
            onPhysicsUpdate={onPhysicsUpdate}
            isPlaying={isPlaying}
            physicsRef={physicsRef}
            maxSpeedKmh={maxSpeedKmh}
            accelRate={accelRate}
            brakingRate={brakingRate}
            turningRate={turningRate}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
