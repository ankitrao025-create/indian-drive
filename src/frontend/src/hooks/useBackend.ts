import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  LeaderboardEntry,
  Medal,
  Modifications,
  OwnedVehicle,
  PlayerProfilePublic,
  Vehicle,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useListVehicles() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listVehicles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetVehicle(id: bigint | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Vehicle | null>({
    queryKey: ["vehicle", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getVehicle(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<PlayerProfilePublic | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyGarage() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<OwnedVehicle[]>({
    queryKey: ["myGarage"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyGarage();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterPlayer() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<PlayerProfilePublic, Error, string>({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerPlayer(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function usePurchaseVehicle() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (vehicleId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.purchaseVehicle(vehicleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["myGarage"] });
    },
  });
}

export function useApplyMods() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { vehicleId: bigint; mods: Modifications }
  >({
    mutationFn: async ({ vehicleId, mods }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.applyMods(vehicleId, mods);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGarage"] });
    },
  });
}

export function useListChallenges() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChallenges();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGetMyCompletions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["myCompletions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCompletions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeaderboard(topN = 10) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", topN],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard(BigInt(topN));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useSubmitChallengeResult() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      challengeId,
      timeMs,
      medal,
    }: {
      challengeId: bigint;
      timeMs: bigint;
      medal: Medal;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitChallengeResult(challengeId, timeMs, medal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCompletions"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}
