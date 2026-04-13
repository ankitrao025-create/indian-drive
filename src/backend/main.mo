import Map "mo:core/Map";
import List "mo:core/List";
import VehicleTypes "types/vehicles";
import PlayerTypes "types/players";
import ChallengeTypes "types/challenges";
import VehiclesMixin "mixins/vehicles-api";
import PlayersMixin "mixins/players-api";
import ChallengesMixin "mixins/challenges-api";
import VehicleLib "lib/vehicles";
import ChallengeLib "lib/challenges";

actor {
  // --- Vehicle catalog ---
  let vehicles = Map.empty<Nat, VehicleTypes.Vehicle>();

  // --- Player state ---
  let profiles = Map.empty<Principal, PlayerTypes.PlayerProfile>();
  let garages = Map.empty<Principal, PlayerTypes.GarageEntry>();

  // --- Challenge state ---
  let challenges = Map.empty<Nat, ChallengeTypes.Challenge>();
  let completions = List.empty<ChallengeTypes.ChallengeCompletion>();

  // --- Seed catalog data (idempotent: only runs once on first deploy) ---
  VehicleLib.seedVehicles(vehicles);
  ChallengeLib.seedChallenges(challenges);

  // --- Mixin composition ---
  include VehiclesMixin(vehicles);
  include PlayersMixin(profiles, garages, vehicles);
  include ChallengesMixin(challenges, completions, profiles);
};
