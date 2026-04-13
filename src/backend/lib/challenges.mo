import ChallengeTypes "../types/challenges";
import PlayerTypes "../types/players";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  public type Challenge = ChallengeTypes.Challenge;
  public type ChallengeCompletion = ChallengeTypes.ChallengeCompletion;
  public type LeaderboardEntry = ChallengeTypes.LeaderboardEntry;
  public type Medal = ChallengeTypes.Medal;

  public func listChallenges(challenges : Map.Map<Nat, Challenge>) : [Challenge] {
    let items = List.empty<Challenge>();
    for ((_, c) in challenges.entries()) {
      items.add(c);
    };
    items.toArray();
  };

  public func getChallenge(challenges : Map.Map<Nat, Challenge>, id : Nat) : ?Challenge {
    challenges.get(id);
  };

  public func recordCompletion(
    completions : List.List<ChallengeCompletion>,
    completion : ChallengeCompletion
  ) {
    completions.add(completion);
  };

  public func getPlayerCompletions(
    completions : List.List<ChallengeCompletion>,
    playerId : Principal
  ) : [ChallengeCompletion] {
    let filtered = completions.filter(func(c : ChallengeCompletion) : Bool {
      Principal.equal(c.playerId, playerId)
    });
    filtered.toArray();
  };

  public func computePointsForMedal(medal : Medal, challenge : Challenge) : Nat {
    let base = challenge.rewards.points;
    switch (medal) {
      case (#bronze) { base };
      case (#silver) { base * 2 };
      case (#gold)   { base * 3 };
    };
  };

  public func computeCurrencyForMedal(medal : Medal, challenge : Challenge) : Nat {
    let base = challenge.rewards.currency;
    switch (medal) {
      case (#bronze) { base };
      case (#silver) { base * 2 };
      case (#gold)   { base * 3 };
    };
  };

  public func buildLeaderboard(
    profiles : Map.Map<Principal, PlayerTypes.PlayerProfile>,
    completions : List.List<ChallengeCompletion>,
    topN : Nat
  ) : [LeaderboardEntry] {
    // Build unsorted entries
    let entries = List.empty<LeaderboardEntry>();

    for ((pid, profile) in profiles.entries()) {
      let count = completions.foldLeft(0, func(acc : Nat, c : ChallengeCompletion) : Nat {
        if (Principal.equal(c.playerId, pid)) acc + 1 else acc
      });

      entries.add({
        rank = 0; // assigned after sort
        playerId = pid;
        playerName = profile.name;
        level = profile.level;
        totalPoints = profile.totalPoints;
        challengesCompleted = count;
      });
    };

    // Sort descending by totalPoints — compare returns Order so we flip a/b
    let sorted = entries.sort(func(a, b) {
      Nat.compare(b.totalPoints, a.totalPoints)
    });

    // Assign ranks and take topN
    let ranked = List.empty<LeaderboardEntry>();
    var rank = 1;
    for (entry in sorted.values()) {
      if (rank <= topN) {
        ranked.add({ entry with rank });
        rank := rank + 1;
      };
    };

    ranked.toArray();
  };

  // Seed 6 challenges
  public func seedChallenges(challenges : Map.Map<Nat, Challenge>) {
    let catalog : [Challenge] = [
      {
        id = 0;
        name = "City Drag Race";
        challengeType = #drag;
        difficulty = #easy;
        rewards = { currency = 500; points = 100 };
      },
      {
        id = 1;
        name = "Highway Sprint";
        challengeType = #drag;
        difficulty = #medium;
        rewards = { currency = 800; points = 200 };
      },
      {
        id = 2;
        name = "Precision Parking";
        challengeType = #delivery;
        difficulty = #easy;
        rewards = { currency = 400; points = 80 };
      },
      {
        id = 3;
        name = "Mountain Switchback";
        challengeType = #circuit;
        difficulty = #hard;
        rewards = { currency = 1200; points = 350 };
      },
      {
        id = 4;
        name = "Rickshaw Slalom";
        challengeType = #drift;
        difficulty = #medium;
        rewards = { currency = 700; points = 180 };
      },
      {
        id = 5;
        name = "Off-Road Trail";
        challengeType = #circuit;
        difficulty = #expert;
        rewards = { currency = 1500; points = 500 };
      },
    ];

    for (c in catalog.vals()) {
      challenges.add(c.id, c);
    };
  };
};
