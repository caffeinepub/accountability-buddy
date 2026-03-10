import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Eye,
  Heart,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CheckinStatus, GoalStatus } from "../backend";
import AddGoalModal from "../components/AddGoalModal";
import { useDeleteGoal, useUpdateGoalStatus } from "../hooks/useQueries";
import { type Goal, useGoalsStore } from "../store/goalsStore";

function GoalCard({
  goal,
  checkinCount,
  completedCheckinCount,
  idx,
  onDelete,
}: {
  goal: Goal;
  checkinCount: number;
  completedCheckinCount: number;
  idx: number;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const updateStatus = useUpdateGoalStatus();
  const store = useGoalsStore();
  const pct =
    checkinCount > 0
      ? Math.round((completedCheckinCount / checkinCount) * 100)
      : 0;

  const handleStatusChange = async (status: GoalStatus) => {
    store.updateGoal(goal.id, { status });
    try {
      await updateStatus.mutateAsync({ goalId: goal.id, status });
    } catch {
      // backend may not have this goal, local update sufficient
    }
    toast.success(
      status === GoalStatus.completed
        ? "Goal marked as completed!"
        : status === GoalStatus.archived
          ? "Goal archived."
          : "Goal reactivated.",
    );
  };

  return (
    <motion.div
      data-ocid={`goals.goal.item.${idx + 1}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: idx * 0.06 }}
      className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
              goal.category === "work"
                ? "bg-category-work/15 text-category-work"
                : "bg-category-personal/15 text-category-personal"
            }`}
          >
            {goal.category === "work" ? (
              <Briefcase className="h-4 w-4" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant="outline"
            className={`text-xs ${
              goal.category === "work"
                ? "bg-category-work/10 text-category-work border-category-work/30"
                : "bg-category-personal/10 text-category-personal border-category-personal/30"
            }`}
          >
            {goal.category === "work" ? "Work" : "Personal"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                data-ocid={`goals.goal.dropdown_menu.${idx + 1}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: "/goals/$goalId",
                    params: { goalId: goal.id },
                  })
                }
                data-ocid={`goals.goal.view.button.${idx + 1}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Detail
              </DropdownMenuItem>
              {goal.status === GoalStatus.active && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(GoalStatus.completed)}
                  data-ocid={`goals.goal.complete.button.${idx + 1}`}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              {goal.status !== GoalStatus.archived && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(GoalStatus.archived)}
                  data-ocid={`goals.goal.archive.button.${idx + 1}`}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              {goal.status === GoalStatus.archived && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(GoalStatus.active)}
                  data-ocid={`goals.goal.activate.button.${idx + 1}`}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(goal.id)}
                className="text-destructive focus:text-destructive"
                data-ocid={`goals.goal.delete_button.${idx + 1}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Target date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <CalendarDays className="h-3 w-3" />
        <span>
          Target:{" "}
          {new Date(goal.targetDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {completedCheckinCount}/{checkinCount} check-ins
          </span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {/* Footer action */}
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs h-7 text-muted-foreground hover:text-foreground"
          onClick={() =>
            navigate({ to: "/goals/$goalId", params: { goalId: goal.id } })
          }
          data-ocid={`goals.goal.open_modal_button.${idx + 1}`}
        >
          <Eye className="h-3 w-3 mr-1" />
          View & Manage
        </Button>
      </div>
    </motion.div>
  );
}

export default function Goals() {
  const goals = useGoalsStore((s) => s.goals);
  const checkins = useGoalsStore((s) => s.checkins);
  const removeGoal = useGoalsStore((s) => s.removeGoal);
  const deleteGoalMutation = useDeleteGoal();
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const activeGoals = goals.filter((g) => g.status === GoalStatus.active);
  const completedGoals = goals.filter((g) => g.status === GoalStatus.completed);
  const archivedGoals = goals.filter((g) => g.status === GoalStatus.archived);

  const getCheckinStats = (goalId: string) => {
    const gc = checkins.filter((c) => c.goalId === goalId);
    const done = gc.filter(
      (c) =>
        c.status === CheckinStatus.completed ||
        c.status === CheckinStatus.onTrack,
    ).length;
    return { total: gc.length, done };
  };

  const handleDelete = async (goalId: string) => {
    removeGoal(goalId);
    setDeleteTargetId(null);
    try {
      await deleteGoalMutation.mutateAsync(goalId);
    } catch {
      // local delete is sufficient
    }
    toast.success("Goal deleted.");
  };

  const GoalList = ({
    list,
    emptyMsg,
  }: { list: typeof goals; emptyMsg: string }) => (
    <AnimatePresence>
      {list.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
          data-ocid="goals.empty_state"
        >
          <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">{emptyMsg}</p>
          {list === activeGoals && (
            <Button
              size="sm"
              onClick={() => setAddGoalOpen(true)}
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="goals.add.primary_button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((goal, idx) => {
            const stats = getCheckinStats(goal.id);
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                checkinCount={stats.total}
                completedCheckinCount={stats.done}
                idx={idx}
                onDelete={(id) => setDeleteTargetId(id)}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Goals
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          onClick={() => setAddGoalOpen(true)}
          data-ocid="goals.add.primary_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Goal
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="active" data-ocid="goals.status.tab">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="active" data-ocid="goals.active.tab">
            Active
            {activeGoals.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {activeGoals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" data-ocid="goals.completed.tab">
            Completed
            {completedGoals.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {completedGoals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived" data-ocid="goals.archived.tab">
            Archived
            {archivedGoals.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {archivedGoals.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <GoalList
            list={activeGoals}
            emptyMsg="No active goals. Add one to get started!"
          />
        </TabsContent>
        <TabsContent value="completed">
          <GoalList
            list={completedGoals}
            emptyMsg="No completed goals yet. Keep working!"
          />
        </TabsContent>
        <TabsContent value="archived">
          <GoalList list={archivedGoals} emptyMsg="No archived goals." />
        </TabsContent>
      </Tabs>

      <AddGoalModal open={addGoalOpen} onOpenChange={setAddGoalOpen} />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent data-ocid="goals.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this goal and all its check-ins. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="goals.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="goals.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
