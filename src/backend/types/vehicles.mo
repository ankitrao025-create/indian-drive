import Common "common";

module {
  public type VehicleId = Common.VehicleId;

  public type VehicleType = {
    #car;
    #motorcycle;
    #rickshaw;
  };

  public type BaseStats = {
    speed : Nat;        // 0-100
    handling : Nat;     // 0-100
    acceleration : Nat; // 0-100
    braking : Nat;      // 0-100
  };

  public type Vehicle = {
    id : VehicleId;
    name : Text;
    vehicleType : VehicleType;
    brand : Text;
    baseStats : BaseStats;
    price : Nat;
  };

  public type PaintMod = {
    color : Text;
    finish : Text; // e.g. "matte", "glossy", "metallic"
  };

  public type PerformanceMod = {
    engineLevel : Nat;    // 0-5
    suspensionLevel : Nat; // 0-5
    brakesLevel : Nat;    // 0-5
    nitro : Bool;
  };

  public type VisualMod = {
    rims : Text;
    bodyKit : Text;
    underglowColor : ?Text;
  };

  public type Modifications = {
    paint : ?PaintMod;
    performance : ?PerformanceMod;
    visual : ?VisualMod;
  };

  public type OwnedVehicle = {
    vehicleId : VehicleId;
    modifications : Modifications;
  };
};
