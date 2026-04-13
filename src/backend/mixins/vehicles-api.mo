import VehicleTypes "../types/vehicles";
import Map "mo:core/Map";
import VehicleLib "../lib/vehicles";

mixin (
  vehicles : Map.Map<Nat, VehicleTypes.Vehicle>
) {

  /// List all available vehicles in the catalog
  public query func listVehicles() : async [VehicleTypes.Vehicle] {
    VehicleLib.listVehicles(vehicles);
  };

  /// Get a single vehicle by id
  public query func getVehicle(id : Nat) : async ?VehicleTypes.Vehicle {
    VehicleLib.getVehicle(vehicles, id);
  };

  /// Get effective stats for a vehicle with applied modifications
  public query func getEffectiveStats(id : Nat, mods : VehicleTypes.Modifications) : async ?VehicleTypes.BaseStats {
    switch (VehicleLib.getVehicle(vehicles, id)) {
      case (?vehicle) {
        ?VehicleLib.computeEffectiveStats(vehicle, mods);
      };
      case null { null };
    };
  };
};
