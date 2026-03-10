import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CheckinStatus, GoalCategory, GoalStatus } from "../backend";

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  description: string;
  targetDate: string;
  status: GoalStatus;
  createdAt: string;
}

export interface Checkin {
  id: string;
  goalId: string;
  scheduledDate: string;
  status: CheckinStatus;
  note: string;
  createdAt: string;
}

const SAMPLE_GOALS: Goal[] = [
  {
    id: "sample-goal-1",
    title: "Ship Q2 Analytics Dashboard",
    category: GoalCategory.work,
    description:
      "Design, build, and deploy a real-time analytics dashboard for the product team. Must include cohort analysis, funnel tracking, and custom event reporting.",
    targetDate: "2026-04-30",
    status: GoalStatus.active,
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "sample-goal-2",
    title: "Complete Half Marathon Training",
    category: GoalCategory.personal,
    description:
      "Follow the 16-week training plan to run the city half marathon in May. Build weekly mileage from 15 to 35 miles while avoiding injury.",
    targetDate: "2026-05-17",
    status: GoalStatus.active,
    createdAt: "2026-01-20T08:00:00Z",
  },
  {
    id: "sample-goal-3",
    title: "AWS Solutions Architect Certification",
    category: GoalCategory.work,
    description:
      "Study for and pass the AWS Solutions Architect Associate exam. Complete all practice exams with 85%+ score before scheduling the real test.",
    targetDate: "2026-06-30",
    status: GoalStatus.active,
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "sample-goal-4",
    title: "30-Day Mindfulness Challenge",
    category: GoalCategory.personal,
    description:
      "Meditate for at least 10 minutes every day for 30 consecutive days using the Waking Up app. Track mood and focus improvements.",
    targetDate: "2026-02-28",
    status: GoalStatus.completed,
    createdAt: "2026-01-29T07:00:00Z",
  },
  {
    id: "sample-goal-5",
    title: "Weekly Team Knowledge Sharing",
    category: GoalCategory.work,
    description:
      "Host a 30-minute weekly session where team members share learnings, demos, or interesting articles. Build a culture of continuous learning.",
    targetDate: "2026-12-31",
    status: GoalStatus.active,
    createdAt: "2026-02-10T11:00:00Z",
  },
];

const SAMPLE_CHECKINS: Checkin[] = [
  {
    id: "ci-1",
    goalId: "sample-goal-1",
    scheduledDate: "2026-02-01",
    status: CheckinStatus.onTrack,
    note: "Finalized data schema and backend APIs. Design mockups approved by stakeholders.",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "ci-2",
    goalId: "sample-goal-1",
    scheduledDate: "2026-02-22",
    status: CheckinStatus.onTrack,
    note: "Frontend components 60% complete. Integration with backend going smoothly.",
    createdAt: "2026-02-22T10:00:00Z",
  },
  {
    id: "ci-3",
    goalId: "sample-goal-1",
    scheduledDate: "2026-03-15",
    status: CheckinStatus.pending,
    note: "",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "ci-4",
    goalId: "sample-goal-2",
    scheduledDate: "2026-02-10",
    status: CheckinStatus.onTrack,
    note: "Week 3 complete. Running 18 miles per week. Left knee feeling a bit sore.",
    createdAt: "2026-02-10T18:00:00Z",
  },
  {
    id: "ci-5",
    goalId: "sample-goal-2",
    scheduledDate: "2026-03-01",
    status: CheckinStatus.struggling,
    note: "Missed 4 runs last week due to work deadlines. Need to get back on track.",
    createdAt: "2026-03-01T18:00:00Z",
  },
  {
    id: "ci-6",
    goalId: "sample-goal-2",
    scheduledDate: "2026-03-22",
    status: CheckinStatus.pending,
    note: "",
    createdAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "ci-7",
    goalId: "sample-goal-3",
    scheduledDate: "2026-02-20",
    status: CheckinStatus.onTrack,
    note: "Completed Modules 1-4. Taking practice quizzes. Score at 78% so far.",
    createdAt: "2026-02-20T20:00:00Z",
  },
  {
    id: "ci-8",
    goalId: "sample-goal-3",
    scheduledDate: "2026-03-20",
    status: CheckinStatus.pending,
    note: "",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "ci-9",
    goalId: "sample-goal-4",
    scheduledDate: "2026-02-15",
    status: CheckinStatus.completed,
    note: "Day 17! Streak is holding. Morning sessions feel much more natural now.",
    createdAt: "2026-02-15T07:00:00Z",
  },
  {
    id: "ci-10",
    goalId: "sample-goal-5",
    scheduledDate: "2026-02-28",
    status: CheckinStatus.onTrack,
    note: "4 sessions completed. Team engagement is great. Using Loom for async sharing too.",
    createdAt: "2026-02-28T14:00:00Z",
  },
  {
    id: "ci-11",
    goalId: "sample-goal-5",
    scheduledDate: "2026-03-14",
    status: CheckinStatus.pending,
    note: "",
    createdAt: "2026-03-01T10:00:00Z",
  },
];

interface GoalsStore {
  goals: Goal[];
  checkins: Checkin[];
  _seeded: boolean;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  removeGoal: (goalId: string) => void;
  addCheckin: (checkin: Checkin) => void;
  updateCheckin: (checkinId: string, updates: Partial<Checkin>) => void;
  seedIfEmpty: () => void;
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      goals: [],
      checkins: [],
      _seeded: false,
      addGoal: (goal) => set((s) => ({ goals: [goal, ...s.goals] })),
      updateGoal: (goalId, updates) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, ...updates } : g,
          ),
        })),
      removeGoal: (goalId) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== goalId),
          checkins: s.checkins.filter((c) => c.goalId !== goalId),
        })),
      addCheckin: (checkin) =>
        set((s) => ({ checkins: [checkin, ...s.checkins] })),
      updateCheckin: (checkinId, updates) =>
        set((s) => ({
          checkins: s.checkins.map((c) =>
            c.id === checkinId ? { ...c, ...updates } : c,
          ),
        })),
      seedIfEmpty: () => {
        const { goals, _seeded } = get();
        if (!_seeded && goals.length === 0) {
          set({
            goals: SAMPLE_GOALS,
            checkins: SAMPLE_CHECKINS,
            _seeded: true,
          });
        }
      },
    }),
    { name: "accountability-buddy-v1" },
  ),
);
