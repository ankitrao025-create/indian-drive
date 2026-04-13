import ChallengeTypes "../types/challenges";
import PlayerTypes "../types/players";
import Map "mo:core/Map";
import List "mo:core/List";
import ChallengeLib "../lib/challenges";
import PlayerLib "../lib/players";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

mixin (
  challenges : Map.Map<Nat, ChallengeTypes.Challenge>,
  completions : List.List<ChallengeTypes.ChallengeCompletion>,
  profiles : Map.Map<Principal, PlayerTypes.PlayerProfile>
) {

  /// List all available challenges
  public query func listChallenges() : async [ChallengeTypes.Challenge] {
    ChallengeLib.listChallenges(challenges);
  };

  /// Get a challenge by id
  public query func getChallenge(id : Nat) : async ?ChallengeTypes.Challenge {
    ChallengeLib.getChallenge(challenges, id);
  };

  /// Submit completion of a challenge (awards points and currency)
  public shared ({ caller }) func submitChallengeResult(
    challengeId : Nat,
    timeMs : Nat,
    medal : ChallengeTypes.Medal
  ) : async ChallengeTypes.ChallengeCompletion {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot submit results");
    };
    let challenge = switch (ChallengeLib.getChallenge(challenges, challengeId)) {
      case (?c) { c };
      case null { Runtime.trap("Challenge not found") };
    };
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null { Runtime.trap("Player not registered") };
    };

    let pointsEarned = ChallengeLib.computePointsForMedal(medal, challenge);
    let currencyEarned = ChallengeLib.computeCurrencyForMedal(medal, challenge);

    PlayerLib.awardPoints(profile, pointsEarned);
    profile.currencyBalance := profile.currencyBalance + currencyEarned;

    let completion : ChallengeTypes.ChallengeCompletion = {
      playerId = caller;
      challengeId;
      medal;
      timeMs;
      pointsEarned;
      completedAt = Time.now();
    };

    ChallengeLib.recordCompletion(completions, completion);
    completion;
  };

  /// Get caller's challenge completions
  public query ({ caller }) func getMyCompletions() : async [ChallengeTypes.ChallengeCompletion] {
    ChallengeLib.getPlayerCompletions(completions, caller);
  };

  /// Get top N leaderboard entries
  public query func getLeaderboard(topN : Nat) : async [ChallengeTypes.LeaderboardEntry] {
    ChallengeLib.buildLeaderboard(profiles, completions, topN);
  };
};
