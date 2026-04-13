import { Link } from "@tanstack/react-router";
import { Settings, Trophy, Wrench, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { usePlayer } from "../hooks/usePlayer";

const ROAD_PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
  size: 1 + Math.random() * 2,
}));

const NAV_ITEMS = [
  {
    to: "/game" as const,
    label: "PLAY GAME",
    sub: "Free-roam Indian streets",
    icon: Zap,
    color: "border-primary hover:bg-primary/10",
    iconColor: "text-primary",
    ocid: "menu-play",
  },
  {
    to: "/garage" as const,
    label: "GARAGE",
    sub: "12 vehicles • Modifications",
    icon: Wrench,
    color: "border-secondary hover:bg-secondary/10",
    iconColor: "text-secondary",
    ocid: "menu-garage",
  },
  {
    to: "/leaderboard" as const,
    label: "LEADERBOARD",
    sub: "Top racers across India",
    icon: Trophy,
    color: "border-muted hover:bg-muted/30",
    iconColor: "text-yellow-400",
    ocid: "menu-leaderboard",
  },
  {
    to: "/" as const,
    label: "SETTINGS",
    sub: "Audio • Controls • Graphics",
    icon: Settings,
    color: "border-muted hover:bg-muted/30",
    iconColor: "text-muted-foreground",
    ocid: "menu-settings",
  },
];

export function MenuPage() {
  const { profile } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offset = (offset + 1) % canvas.height;

      // Road lines
      ctx.strokeStyle = "oklch(0.62 0.22 22 / 0.3)";
      ctx.lineWidth = 2;
      for (let i = -1; i < 3; i++) {
        const x = canvas.width / 2 + (i - 1) * (canvas.width / 6);
        ctx.beginPath();
        ctx.setLineDash([40, 30]);
        ctx.lineDashOffset = -offset * 4;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center"
      data-ocid="menu-page"
    >
      {/* Animated road canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        aria-hidden
      />

      {/* Floating particles */}
      {ROAD_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.6, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Hero image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/generated/hero-indian-drive.dim_1200x675.jpg"
          alt="Bharat Burnout street racing"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-0 leading-none">
            <span className="font-display font-black text-6xl md:text-8xl text-primary tracking-tight">
              BHARAT
            </span>
            <span className="font-display font-black text-6xl md:text-8xl text-secondary tracking-tight ml-3">
              BURNOUT
            </span>
          </div>
          <p className="text-muted-foreground font-display text-sm tracking-[0.3em] uppercase">
            Free-Roam Indian Street Driving
          </p>
        </motion.div>

        {/* Greeting */}
        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card/80 border border-border rounded-lg px-4 py-2 telemetry-text text-sm"
          >
            WELCOME BACK,{" "}
            <span className="text-primary font-bold">
              {profile.name.toUpperCase()}
            </span>{" "}
            — LVL{" "}
            <span className="text-secondary">{profile.level.toString()}</span>
          </motion.div>
        )}

        {/* Vehicle types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6 text-muted-foreground text-sm font-display"
        >
          <span className="flex items-center gap-1.5">
            🚗 <span>Cars</span>
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            🏍️ <span>Motorcycles</span>
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            🛺 <span>Auto-Rickshaws</span>
          </span>
        </motion.div>

        {/* Nav grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {NAV_ITEMS.map(
            ({ to, label, sub, icon: Icon, color, iconColor, ocid }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-2 p-4 bg-card/80 border ${color} rounded-xl transition-smooth group backdrop-blur-sm`}
                  data-ocid={ocid}
                >
                  <Icon
                    size={28}
                    className={`${iconColor} group-hover:scale-110 transition-smooth`}
                  />
                  <div>
                    <div className="font-display font-bold text-sm tracking-wider text-foreground">
                      {label}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {sub}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ),
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground text-xs"
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </motion.p>
      </div>
    </div>
  );
}
