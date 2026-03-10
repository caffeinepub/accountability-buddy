import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let GOALS_VERSION : Nat = 1;
  let CHECKINS_VERSION : Nat = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type GoalCategory = {
    #work;
    #personal;
  };

  public type GoalStatus = {
    #active;
    #completed;
    #archived;
  };

  public type CheckinStatus = {
    #pending;
    #onTrack;
    #struggling;
    #completed;
  };

  public type Goal = {
    id : Text;
    title : Text;
    category : GoalCategory;
    description : Text;
    targetDate : Text;
    status : GoalStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Checkin = {
    id : Text;
    goalId : Text;
    scheduledDate : Text;
    completionDate : ?Text;
    status : CheckinStatus;
    note : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type HurdleLog = {
    id : Text;
    goalId : Text;
    hurdleText : Text;
    guidance : Obstacles.Guidance;
    createdAt : Time.Time;
  };

  public type DashboardSummary = {
    activeGoalsCount : Nat;
    pendingCheckinsCount : Nat;
    completedGoalsCount : Nat;
    upcomingCheckins : [UpcomingCheckin];
  };

  public type UpcomingCheckin = {
    checkinId : Text;
    goalTitle : Text;
    scheduledDate : Text;
    status : CheckinStatus;
  };

  public type UserProfile = {
    name : Text;
  };

  let goals = Map.empty<Principal, Map.Map<Text, Goal>>();
  let checkins = Map.empty<Principal, Map.Map<Text, Map.Map<Text, Checkin>>>();
  let hurdleLogs = Map.empty<Principal, Map.Map<Text, HurdleLog>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Goal Management Functions
  public shared ({ caller }) func createGoal(title : Text, category : GoalCategory, description : Text, targetDate : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let goalId = "goal-" # Int.abs(Time.now()).toText();
    let now = Time.now();
    let newGoal : Goal = {
      id = goalId;
      title;
      category;
      description;
      targetDate;
      status = #active;
      createdAt = now;
      updatedAt = now;
    };

    let existingUserGoals = switch (goals.get(caller)) {
      case (null) { Map.empty<Text, Goal>() };
      case (?userGoals) { userGoals };
    };

    existingUserGoals.add(goalId, newGoal);
    goals.add(caller, existingUserGoals);

    goalId;
  };

  public shared ({ caller }) func updateGoal(goalId : Text, title : Text, category : GoalCategory, description : Text, targetDate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?userGoals) { userGoals };
    };

    let goal = switch (userGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?g) { g };
    };

    let updatedGoal : Goal = {
      goal with
      title;
      category;
      description;
      targetDate;
      updatedAt = Time.now();
    };

    userGoals.add(goalId, updatedGoal);
  };

  public shared ({ caller }) func deleteGoal(goalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?userGoals) {
        if (not userGoals.containsKey(goalId)) {
          Runtime.trap("Goal not found");
        };
        userGoals.remove(goalId);
      };
    };
  };

  public shared ({ caller }) func updateGoalStatus(goalId : Text, status : GoalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?userGoals) { userGoals };
    };

    let goal = switch (userGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?g) { g };
    };

    let updatedGoal : Goal = { goal with status; updatedAt = Time.now() };
    userGoals.add(goalId, updatedGoal);
  };

  // Check-in Management Functions
  public shared ({ caller }) func createCheckin(goalId : Text, scheduledDate : Text, note : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?g) { g };
    };

    switch (userGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?_goal) {
        let checkinId = "checkin-" # Int.abs(Time.now()).toText();
        let now = Time.now();
        let checkin : Checkin = {
          id = checkinId;
          goalId;
          scheduledDate;
          completionDate = null;
          status = #pending;
          note;
          createdAt = now;
          updatedAt = now;
        };

        let userCheckins = switch (checkins.get(caller)) {
          case (null) { Map.empty<Text, Map.Map<Text, Checkin>>() };
          case (?c) { c };
        };

        let goalCheckins = switch (userCheckins.get(goalId)) {
          case (null) { Map.empty<Text, Checkin>() };
          case (?g) { g };
        };

        goalCheckins.add(checkinId, checkin);
        userCheckins.add(goalId, goalCheckins);
        checkins.add(caller, userCheckins);

        checkinId;
      };
    };
  };

  public shared ({ caller }) func updateCheckinStatus(checkinId : Text, status : CheckinStatus, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userCheckins = switch (checkins.get(caller)) {
      case (null) { Runtime.trap("Checkin not found") };
      case (?c) { c };
    };

    var checkinData : ?(Text, Checkin) = null;

    label findCheckin for ((goalId, goalCheckins) in userCheckins.entries()) {
      switch (goalCheckins.get(checkinId)) {
        case (null) {};
        case (?checkin) {
          checkinData := ?(goalId, checkin);
          break findCheckin;
        };
      };
    };

    switch (checkinData) {
      case (null) { Runtime.trap("Checkin not found") };
      case (?(goalId, checkin)) {
        let updatedCheckin : Checkin = {
          checkin with
          status;
          note;
          updatedAt = Time.now();
          completionDate = if (status == #completed) {
            ?Int.abs(Time.now()).toText();
          } else { checkin.completionDate };
        };

        let goalCheckins = switch (userCheckins.get(goalId)) {
          case (null) { Runtime.trap("Data corrupted") };
          case (?g) { g };
        };

        goalCheckins.add(checkinId, updatedCheckin);
      };
    };
  };

  // Hurdle Log Functions
  public shared ({ caller }) func logHurdle(goalId : Text, hurdleText : Text) : async Obstacles.Guidance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?g) { g };
    };

    switch (userGoals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?_goal) {
        let now = Time.now();
        let guidance : Obstacles.Guidance = Obstacles.generateGuidance(hurdleText);
        let hurdleLog : HurdleLog = {
          id = "hurdle-" # Int.abs(now).toText();
          goalId;
          hurdleText;
          guidance;
          createdAt = now;
        };

        let userHurdles = switch (hurdleLogs.get(caller)) {
          case (null) { Map.empty<Text, HurdleLog>() };
          case (?h) { h };
        };

        userHurdles.add(hurdleLog.id, hurdleLog);
        hurdleLogs.add(caller, userHurdles);

        guidance;
      };
    };
  };

  // Dashboard Functions
  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Map.empty<Text, Goal>() };
      case (?g) { g };
    };

    let allCheckins = switch (checkins.get(caller)) {
      case (null) { Map.empty<Text, Map.Map<Text, Checkin>>() };
      case (?c) { c };
    };

    var activeGoals = 0;
    var completedGoals = 0;

    for ((_, goal) in userGoals.entries()) {
      switch (goal.status) {
        case (#active) { activeGoals += 1 };
        case (#completed) { completedGoals += 1 };
        case (_) {};
      };
    };

    var pendingCheckins = 0;
    var upcomingCheckinsList : [UpcomingCheckin] = [];

    for ((goalId, goalCheckins) in allCheckins.entries()) {
      for ((checkinId, checkin) in goalCheckins.entries()) {
        if (checkin.status == #pending) {
          pendingCheckins += 1;
          let goal = userGoals.get(goalId);
          let goalTitle = switch (goal) {
            case (null) { "" };
            case (?g) { g.title };
          };
          let upcomingCheckin : UpcomingCheckin = {
            checkinId;
            goalTitle;
            scheduledDate = checkin.scheduledDate;
            status = checkin.status;
          };
          upcomingCheckinsList := upcomingCheckinsList.concat([upcomingCheckin]);
        };
      };
    };

    let sortedUpcomingCheckins = upcomingCheckinsList.sort(UpcomingCheckin.compareByDate);

    let upcomingCheckinsArray = Array.tabulate(
      if (sortedUpcomingCheckins.size() < 3) { sortedUpcomingCheckins.size() } else { 3 },
      func(i : Nat) : UpcomingCheckin { sortedUpcomingCheckins[i] }
    );

    {
      activeGoalsCount = activeGoals;
      pendingCheckinsCount = pendingCheckins;
      completedGoalsCount = completedGoals;
      upcomingCheckins = upcomingCheckinsArray;
    };
  };

  module UpcomingCheckin {
    public func compareByDate(a : UpcomingCheckin, b : UpcomingCheckin) : Order.Order {
      Text.compare(a.scheduledDate, b.scheduledDate);
    };
  };

  module Obstacles {
    public type Guidance = {
      reframe : Text;
      actionSteps : [Text];
      encouragement : Text;
    };

    public func generateGuidance(_hurdleText : Text) : Guidance {
      {
        reframe = "Try to see challenges as opportunities for growth.";
        actionSteps = [
          "Break the task into smaller steps.",
          "Set specific deadlines.",
          "Seek support from a friend or colleague.",
        ];
        encouragement = "Remember, you have overcome challenges before. You can do this!";
      };
    };
  };
};
