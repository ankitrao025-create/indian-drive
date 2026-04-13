import { useState } from "react";
import type { PlayerProfilePublic } from "../types";
import { useGetMyProfile, useRegisterPlayer } from "./useBackend";

export interface UsePlayerReturn {
  profile: PlayerProfilePublic | null;
  isLoading: boolean;
  isRegistering: boolean;
  needsRegistration: boolean;
  registerPlayer: (name: string) => Promise<void>;
  currencyBalance: bigint;
  level: bigint;
  totalPoints: bigint;
}

export function usePlayer(): UsePlayerReturn {
  const { data: profile, isLoading } = useGetMyProfile();
  const registerMutation = useRegisterPlayer();
  const [isRegistering, setIsRegistering] = useState(false);

  const needsRegistration = !isLoading && profile === null;

  const registerPlayer = async (name: string) => {
    setIsRegistering(true);
    try {
      await registerMutation.mutateAsync(name);
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    profile: profile ?? null,
    isLoading,
    isRegistering: isRegistering || registerMutation.isPending,
    needsRegistration,
    registerPlayer,
    currencyBalance: profile?.currencyBalance ?? 0n,
    level: profile?.level ?? 1n,
    totalPoints: profile?.totalPoints ?? 0n,
  };
}
