import Common "common";

module {
  public type ChallengeId = Common.ChallengeId;
  public type PlayerId = Common.PlayerId;
  public type Timestamp = Common.Timestamp;

  public type ChallengeDifficulty = {
    #easy;
    #medium;
    #hard;
    #expert;
  };

  public type ChallengeType = {
    #drag;
    #drift;
    #circuit;
    #delivery;
  };

  public type ChallengeRewards = {
    currency : Nat;
    points : Nat;
  };

  public type Challenge = {
    id : ChallengeId;
    name : Text;
    challengeType : ChallengeType;
    difficulty : ChallengeDifficulty;
    rewards : ChallengeRewards;
  };

  public type Medal = {
    #bronze;
    #silver;
    #gold;
  };

  public type ChallengeCompletion = {
    playerId : PlayerId;
    challengeId : ChallengeId;
    medal : Medal;
    timeMs : Nat;
    pointsEarned : Nat;
    completedAt : Timestamp;
  };

  public type LeaderboardEntry = {
    rank : Nat;
    playerId : PlayerId;
    playerName : Text;
    level : Nat;
    totalPoints : Nat;
    challengesCompleted : Nat;
  };
};
