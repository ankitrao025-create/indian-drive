import PlayerTypes "../types/players";
import VehicleTypes "../types/vehicles";
import Map "mo:core/Map";
import PlayerLib "../lib/players";
import VehicleLib "../lib/vehicles";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

mixin (
  profiles : Map.Map<Principal, PlayerTypes.PlayerProfile>,
  garages : Map.Map<Principal, PlayerTypes.GarageEntry>,
  vehicles : Map.Map<Nat, VehicleTypes.Vehicle>
) {

  /// Register the caller's player profile. Idempotent — returns existing profile if already registered.
  public shared ({ caller }) func registerPlayer(name : Text) : async PlayerTypes.PlayerProfilePublic {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot register");
    };
    switch (profiles.get(caller)) {
      case (?existing) {
        PlayerLib.toPublic(existing);
      };
      case null {
        let profile = PlayerLib.createProfile(caller, name);
        profiles.add(caller, profile);
        // Create garage with starter vehicle
        PlayerLib.ensureGarageEntry(garages, caller, 0);
        PlayerLib.toPublic(profile);
      };
    };
  };

  /// Get own player profile
  public query ({ caller }) func getMyProfile() : async ?PlayerTypes.PlayerProfilePublic {
    switch (profiles.get(caller)) {
      case (?profile) { ?PlayerLib.toPublic(profile) };
      case null { null };
    };
  };

  /// Get any player profile by id
  public query func getProfile(playerId : Principal) : async ?PlayerTypes.PlayerProfilePublic {
    switch (profiles.get(playerId)) {
      case (?profile) { ?PlayerLib.toPublic(profile) };
      case null { null };
    };
  };

  /// Purchase a vehicle from the catalog
  public shared ({ caller }) func purchaseVehicle(vehicleId : Nat) : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    switch (profiles.get(caller)) {
      case null { false };
      case (?profile) {
        switch (VehicleLib.getVehicle(vehicles, vehicleId)) {
          case null { false };
          case (?vehicle) {
            let alreadyOwned = profile.vehicleIds.find(func(v) { v == vehicleId });
            switch (alreadyOwned) {
              case (?_) { true }; // already owned
              case null {
                let ok = PlayerLib.deductCurrency(profile, vehicle.price);
                if (ok) {
                  PlayerLib.addVehicleToGarage(profile, vehicleId);
                  PlayerLib.addVehicleToGarageEntry(garages, caller, vehicleId);
                };
                ok;
              };
            };
          };
        };
      };
    };
  };

  /// Get caller's garage (owned vehicles with modifications)
  public query ({ caller }) func getMyGarage() : async [VehicleTypes.OwnedVehicle] {
    PlayerLib.getGarage(garages, caller);
  };

  /// Apply modifications to a vehicle in the caller's garage
  public shared ({ caller }) func applyMods(vehicleId : Nat, mods : VehicleTypes.Modifications) : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    if (not VehicleLib.isValidMod(mods)) {
      return false;
    };
    switch (profiles.get(caller)) {
      case null { false };
      case (?profile) {
        let owns = profile.vehicleIds.find(func(v) { v == vehicleId });
        switch (owns) {
          case null { false };
          case (?_) {
            let garageEntries = PlayerLib.getGarage(garages, caller);
            let existingOwned = garageEntries.find(func(ov) { ov.vehicleId == vehicleId });
            switch (existingOwned) {
              case null { false };
              case (?owned) {
                let updated = VehicleLib.applyModification(owned, mods);
                PlayerLib.updateGarageVehicle(garages, caller, updated);
                true;
              };
            };
          };
        };
      };
    };
  };
};
