import PlayerTypes "../types/players";
import VehicleTypes "../types/vehicles";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

module {
  public type PlayerProfile = PlayerTypes.PlayerProfile;
  public type PlayerProfilePublic = PlayerTypes.PlayerProfilePublic;
  public type GarageEntry = PlayerTypes.GarageEntry;

  let STARTER_CURRENCY : Nat = 5000;
  let STARTER_VEHICLE_ID : Nat = 0; // Maruti Swift
  let MAX_LEVEL : Nat = 50;
  let POINTS_PER_LEVEL : Nat = 1000;

  public func createProfile(id : Principal, name : Text) : PlayerProfile {
    {
      id;
      name;
      var level = 1;
      var totalPoints = 0;
      var currencyBalance = STARTER_CURRENCY;
      var vehicleIds = [STARTER_VEHICLE_ID];
    };
  };

  public func toPublic(profile : PlayerProfile) : PlayerProfilePublic {
    {
      id = profile.id;
      name = profile.name;
      level = profile.level;
      totalPoints = profile.totalPoints;
      currencyBalance = profile.currencyBalance;
      vehicleIds = profile.vehicleIds;
    };
  };

  public func getProfile(profiles : Map.Map<Principal, PlayerProfile>, id : Principal) : ?PlayerProfile {
    profiles.get(id);
  };

  public func addVehicleToGarage(profile : PlayerProfile, vehicleId : Nat) {
    let alreadyOwned = profile.vehicleIds.find(func(v) { v == vehicleId });
    switch (alreadyOwned) {
      case (?_) {};  // already in garage, no-op
      case null {
        profile.vehicleIds := profile.vehicleIds.concat<Nat>([vehicleId]);
      };
    };
  };

  public func deductCurrency(profile : PlayerProfile, amount : Nat) : Bool {
    if (profile.currencyBalance < amount) {
      false;
    } else {
      profile.currencyBalance := profile.currencyBalance - amount;
      true;
    };
  };

  public func awardPoints(profile : PlayerProfile, points : Nat) {
    profile.totalPoints := profile.totalPoints + points;
    profile.level := computeLevel(profile.totalPoints);
  };

  public func computeLevel(totalPoints : Nat) : Nat {
    let raw = totalPoints / POINTS_PER_LEVEL + 1;
    if (raw > MAX_LEVEL) MAX_LEVEL else raw;
  };

  public func getGarage(garages : Map.Map<Principal, GarageEntry>, playerId : Principal) : [VehicleTypes.OwnedVehicle] {
    switch (garages.get(playerId)) {
      case (?entry) { entry.ownedVehicles };
      case null { [] };
    };
  };

  public func ensureGarageEntry(
    garages : Map.Map<Principal, GarageEntry>,
    playerId : Principal,
    starterVehicleId : Nat
  ) {
    switch (garages.get(playerId)) {
      case (?_) {};  // already exists
      case null {
        let starterOwned : VehicleTypes.OwnedVehicle = {
          vehicleId = starterVehicleId;
          modifications = { paint = null; performance = null; visual = null };
        };
        let entry : GarageEntry = {
          playerId;
          var ownedVehicles = [starterOwned];
        };
        garages.add(playerId, entry);
      };
    };
  };

  public func addVehicleToGarageEntry(
    garages : Map.Map<Principal, GarageEntry>,
    playerId : Principal,
    vehicleId : Nat
  ) {
    switch (garages.get(playerId)) {
      case (?entry) {
        let exists = entry.ownedVehicles.find(func(ov) { ov.vehicleId == vehicleId });
        switch (exists) {
          case (?_) {};
          case null {
            let newOwned : VehicleTypes.OwnedVehicle = {
              vehicleId;
              modifications = { paint = null; performance = null; visual = null };
            };
            entry.ownedVehicles := entry.ownedVehicles.concat<VehicleTypes.OwnedVehicle>([newOwned]);
          };
        };
      };
      case null {};
    };
  };

  public func updateGarageVehicle(
    garages : Map.Map<Principal, GarageEntry>,
    playerId : Principal,
    owned : VehicleTypes.OwnedVehicle
  ) {
    switch (garages.get(playerId)) {
      case (?entry) {
        entry.ownedVehicles := entry.ownedVehicles.map<VehicleTypes.OwnedVehicle, VehicleTypes.OwnedVehicle>(
          func(ov) {
            if (ov.vehicleId == owned.vehicleId) { owned } else { ov };
          }
        );
      };
      case null {};
    };
  };
};
