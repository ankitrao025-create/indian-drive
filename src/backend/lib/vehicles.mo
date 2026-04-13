import VehicleTypes "../types/vehicles";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";

module {
  public type Vehicle = VehicleTypes.Vehicle;
  public type OwnedVehicle = VehicleTypes.OwnedVehicle;
  public type Modifications = VehicleTypes.Modifications;
  public type BaseStats = VehicleTypes.BaseStats;

  let MAX_STAT : Nat = 100;
  let LEVEL_BONUS : Nat = 5; // each level adds 5 to stat

  func clampStat(v : Nat) : Nat {
    if (v > MAX_STAT) MAX_STAT else v;
  };

  public func listVehicles(vehicles : Map.Map<Nat, Vehicle>) : [Vehicle] {
    let items = List.empty<Vehicle>();
    for ((_, v) in vehicles.entries()) {
      items.add(v);
    };
    items.toArray();
  };

  public func getVehicle(vehicles : Map.Map<Nat, Vehicle>, id : Nat) : ?Vehicle {
    vehicles.get(id);
  };

  public func computeEffectiveStats(vehicle : Vehicle, mods : Modifications) : BaseStats {
    var speed = vehicle.baseStats.speed;
    var handling = vehicle.baseStats.handling;
    var acceleration = vehicle.baseStats.acceleration;
    var braking = vehicle.baseStats.braking;

    switch (mods.performance) {
      case (?perf) {
        // engine level boosts speed: each level 1-5 adds 5 speed
        if (perf.engineLevel > 0) {
          speed := clampStat(speed + perf.engineLevel * LEVEL_BONUS);
        };
        // suspension boosts handling: each level adds 5
        if (perf.suspensionLevel > 0) {
          handling := clampStat(handling + perf.suspensionLevel * LEVEL_BONUS);
        };
        // brakes level boosts braking: each level adds 5
        if (perf.brakesLevel > 0) {
          braking := clampStat(braking + perf.brakesLevel * LEVEL_BONUS);
        };
        // engine also improves acceleration proportionally (half of engine boost)
        if (perf.engineLevel > 0) {
          acceleration := clampStat(acceleration + (perf.engineLevel * LEVEL_BONUS) / 2);
        };
        // nitro adds +30 speed temporarily (represented in stats)
        if (perf.nitro) {
          speed := clampStat(speed + 30);
        };
      };
      case null {};
    };

    { speed; handling; acceleration; braking };
  };

  public func applyModification(owned : OwnedVehicle, mods : Modifications) : OwnedVehicle {
    { owned with modifications = mods };
  };

  public func isValidMod(mods : Modifications) : Bool {
    switch (mods.performance) {
      case (?perf) {
        // engine/suspension/brakes levels must be 0-5
        perf.engineLevel <= 5 and perf.suspensionLevel <= 5 and perf.brakesLevel <= 5;
      };
      case null { true };
    };
  };

  // Seed data: 12+ Indian vehicles
  public func seedVehicles(vehicles : Map.Map<Nat, Vehicle>) {
    let catalog : [Vehicle] = [
      // --- Hatchbacks / Cars ---
      {
        id = 0;
        name = "Swift";
        brand = "Maruti";
        vehicleType = #car;
        baseStats = { speed = 110; handling = 70; acceleration = 65; braking = 68 };
        price = 0; // starter vehicle (free)
      },
      {
        id = 1;
        name = "Nexon";
        brand = "Tata";
        vehicleType = #car;
        baseStats = { speed = 120; handling = 72; acceleration = 68; braking = 72 };
        price = 8000;
      },
      {
        id = 2;
        name = "i20";
        brand = "Hyundai";
        vehicleType = #car;
        baseStats = { speed = 118; handling = 74; acceleration = 70; braking = 70 };
        price = 9000;
      },
      {
        id = 3;
        name = "City";
        brand = "Honda";
        vehicleType = #car;
        baseStats = { speed = 140; handling = 78; acceleration = 76; braking = 75 };
        price = 14000;
      },
      // --- Motorcycles ---
      {
        id = 4;
        name = "Pulsar 150";
        brand = "Bajaj";
        vehicleType = #motorcycle;
        baseStats = { speed = 130; handling = 80; acceleration = 82; braking = 75 };
        price = 6000;
      },
      {
        id = 5;
        name = "Pulsar 220";
        brand = "Bajaj";
        vehicleType = #motorcycle;
        baseStats = { speed = 148; handling = 82; acceleration = 85; braking = 78 };
        price = 9500;
      },
      {
        id = 6;
        name = "Splendor";
        brand = "Hero";
        vehicleType = #motorcycle;
        baseStats = { speed = 95; handling = 76; acceleration = 72; braking = 70 };
        price = 4500;
      },
      {
        id = 7;
        name = "Classic 350";
        brand = "Royal Enfield";
        vehicleType = #motorcycle;
        baseStats = { speed = 120; handling = 68; acceleration = 62; braking = 65 };
        price = 12000;
      },
      {
        id = 8;
        name = "Apache RTR";
        brand = "TVS";
        vehicleType = #motorcycle;
        baseStats = { speed = 160; handling = 88; acceleration = 90; braking = 84 };
        price = 18000;
      },
      // --- Auto-rickshaws ---
      {
        id = 9;
        name = "RE 4-Stroke";
        brand = "Bajaj";
        vehicleType = #rickshaw;
        baseStats = { speed = 55; handling = 50; acceleration = 42; braking = 55 };
        price = 3000;
      },
      {
        id = 10;
        name = "Ape City";
        brand = "Piaggio";
        vehicleType = #rickshaw;
        baseStats = { speed = 58; handling = 52; acceleration = 44; braking = 56 };
        price = 3500;
      },
      {
        id = 11;
        name = "Alfa";
        brand = "Mahindra";
        vehicleType = #rickshaw;
        baseStats = { speed = 60; handling = 54; acceleration = 46; braking = 58 };
        price = 4000;
      },
    ];

    for (v in catalog.vals()) {
      vehicles.add(v.id, v);
    };
  };
};
