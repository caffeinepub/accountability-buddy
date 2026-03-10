import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheckinStatus, GoalCategory, GoalStatus } from "../backend";
import type { DashboardSummary } from "../backend";
import { useActor } from "./useActor";

export function useDashboardSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) {
        return {
          activeGoalsCount: BigInt(0),
          completedGoalsCount: BigInt(0),
          pendingCheckinsCount: BigInt(0),
          upcomingCheckins: [],
        };
      }
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      title: string;
      category: GoalCategory;
      description: string;
      targetDate: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGoal(
        vars.title,
        vars.category,
        vars.description,
        vars.targetDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useUpdateGoalStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { goalId: string; status: GoalStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGoalStatus(vars.goalId, vars.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteGoal(goalId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useCreateCheckin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      goalId: string;
      scheduledDate: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCheckin(vars.goalId, vars.scheduledDate, vars.note);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useUpdateCheckinStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      checkinId: string;
      status: CheckinStatus;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCheckinStatus(vars.checkinId, vars.status, vars.note);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useLogHurdle() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (vars: { goalId: string; hurdleText: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logHurdle(vars.goalId, vars.hurdleText);
    },
  });
}

export function useUpdateGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      goalId: string;
      title: string;
      category: GoalCategory;
      description: string;
      targetDate: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGoal(
        vars.goalId,
        vars.title,
        vars.category,
        vars.description,
        vars.targetDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}
