import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UpcomingCheckin {
    status: CheckinStatus;
    scheduledDate: string;
    goalTitle: string;
    checkinId: string;
}
export interface DashboardSummary {
    completedGoalsCount: bigint;
    pendingCheckinsCount: bigint;
    upcomingCheckins: Array<UpcomingCheckin>;
    activeGoalsCount: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Guidance {
    encouragement: string;
    actionSteps: Array<string>;
    reframe: string;
}
export enum CheckinStatus {
    pending = "pending",
    struggling = "struggling",
    completed = "completed",
    onTrack = "onTrack"
}
export enum GoalCategory {
    work = "work",
    personal = "personal"
}
export enum GoalStatus {
    active = "active",
    completed = "completed",
    archived = "archived"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckin(goalId: string, scheduledDate: string, note: string): Promise<string>;
    createGoal(title: string, category: GoalCategory, description: string, targetDate: string): Promise<string>;
    deleteGoal(goalId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logHurdle(goalId: string, hurdleText: string): Promise<Guidance>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCheckinStatus(checkinId: string, status: CheckinStatus, note: string): Promise<void>;
    updateGoal(goalId: string, title: string, category: GoalCategory, description: string, targetDate: string): Promise<void>;
    updateGoalStatus(goalId: string, status: GoalStatus): Promise<void>;
}
