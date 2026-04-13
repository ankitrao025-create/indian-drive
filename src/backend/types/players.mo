import Common "common";
import VehicleTypes "vehicles";

module {
  public type PlayerId = Common.PlayerId;
  public type VehicleId = Common.VehicleId;

  public type PlayerProfile = {
    id : PlayerId;
    name : Text;
    var level : Nat;          // 1-50
    var totalPoints : Nat;
    var currencyBalance : Nat;
    var vehicleIds : [VehicleId];
  };

  public type PlayerProfilePublic = {
    id : PlayerId;
    name : Text;
    level : Nat;
    totalPoints : Nat;
    currencyBalance : Nat;
    vehicleIds : [VehicleId];
  };

  public type GarageEntry = {
    playerId : PlayerId;
    var ownedVehicles : [VehicleTypes.OwnedVehicle];
  };
};
