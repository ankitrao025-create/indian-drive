import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Gamepad2, Home, RotateCcw, Settings, Volume2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onReturnToMenu: () => void;
  onRestart: () => void;
}

const CONTROLS = [
  { keys: ["W", "↑"], action: "Accelerate" },
  { keys: ["S", "↓"], action: "Brake / Reverse" },
  { keys: ["A", "←"], action: "Steer Left" },
  { keys: ["D", "→"], action: "Steer Right" },
  { keys: ["Space"], action: "Handbrake / Drift" },
  { keys: ["Esc"], action: "Pause / Resume" },
];

export function PauseMenu({
  isOpen,
  onResume,
  onReturnToMenu,
  onRestart,
}: PauseMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pause-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-md"
          data-ocid="pause-menu"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <Gamepad2 size={18} className="text-primary" />
                <span className="font-display font-black text-lg text-foreground tracking-wider">
                  PAUSED
                </span>
              </div>
              <button
                type="button"
                onClick={onResume}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                aria-label="Close pause menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 space-y-2">
              <Button
                onClick={onResume}
                className="w-full font-display font-bold tracking-widest text-sm"
                data-ocid="pause-resume-btn"
              >
                ▶ RESUME DRIVING
              </Button>
              <Button
                variant="outline"
                onClick={onRestart}
                className="w-full font-display font-bold tracking-widest text-sm gap-2"
                data-ocid="pause-restart-btn"
              >
                <RotateCcw size={14} />
                RESTART SESSION
              </Button>
              <Button
                variant="ghost"
                onClick={onReturnToMenu}
                className="w-full font-display font-bold tracking-widest text-sm gap-2 text-muted-foreground hover:text-foreground"
                data-ocid="pause-menu-btn"
              >
                <Home size={14} />
                RETURN TO MENU
              </Button>
            </div>

            <Separator />

            {/* Settings row */}
            <div className="px-6 py-3 flex items-center gap-2 text-muted-foreground">
              <Settings size={13} />
              <span className="text-xs font-display tracking-wider">
                SETTINGS
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Volume2 size={13} />
                <span className="telemetry-text text-xs">SFX ON</span>
              </div>
            </div>

            <Separator />

            {/* Controls reference */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Gamepad2 size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-display tracking-widest">
                  CONTROLS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {CONTROLS.map(({ keys, action }) => (
                  <div
                    key={action}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-0.5">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="bg-muted border border-border rounded px-1 py-0 telemetry-text text-xs text-foreground min-w-[1.25rem] text-center leading-5"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <span className="telemetry-text text-xs text-muted-foreground truncate">
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
