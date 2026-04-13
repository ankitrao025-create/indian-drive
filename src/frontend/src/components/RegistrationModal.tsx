import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Props {
  isRegistering: boolean;
  onRegister: (name: string) => Promise<void>;
}

export function RegistrationModal({ isRegistering, onRegister }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    await onRegister(name.trim());
  };

  return (
    <Dialog open>
      <DialogContent
        className="bg-card border-border max-w-sm"
        data-ocid="registration-modal"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            Welcome, Racer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your driver name to start your journey on Indian streets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="player-name"
              className="text-xs font-display tracking-wider text-muted-foreground"
            >
              DRIVER NAME
            </Label>
            <Input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun, Priya, Speed Bhai..."
              className="bg-background border-input font-display"
              minLength={2}
              maxLength={24}
              autoFocus
              data-ocid="registration-name-input"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-display font-bold tracking-widest"
            disabled={name.trim().length < 2 || isRegistering}
            data-ocid="registration-submit"
          >
            {isRegistering ? "Registering..." : "START DRIVING"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
