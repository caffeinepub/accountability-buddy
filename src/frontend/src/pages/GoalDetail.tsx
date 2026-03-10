import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock,
  Heart,
  MoreHorizontal,
  Plus,
  Target,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CheckinStatus, GoalCategory, GoalStatus } from "../backend";
import CheckinModal from "../components/CheckinModal";
import HurdleAssistant from "../components/HurdleAssistant";
import { useUpdateGoalStatus } from "../hooks/useQueries";
import { useGoalsStore } from "../store/goalsStore";

function checkinStatusIcon(status: CheckinStatus) {
  switch (status) {
    case CheckinStatus.onTrack:
      return <CheckCircle2 className="h-4 w-4 text-status-on-track" />;
    case CheckinStatus.struggling:
      return <AlertTriangle className="h-4 w-4 text-status-struggling" />;
    case CheckinStatus.completed:
      return <CheckCheck className="h-4 w-4 text-status-completed" />;
    default:
      return <Clock className="h-4 w-4 text-status-pending" />;
  }
}

function checkinStatusLabel(status: CheckinStatus) {
  switch (status) {
    case CheckinStatus.onTrack:
      return "On Track";
    case CheckinStatus.struggling:
      return "Struggling";
    case CheckinStatus.completed:
      return "Completed";
    default:
      return "Pending";
  }
}

function checkinStatusClass(status: CheckinStatus) {
  switch (status) {
    case CheckinStatus.onTrack:
      return "bg-status-on-track/10 text-status-on-track border-status-on-track/30";
    case CheckinStatus.struggling:
      return "bg-status-struggling/10 text-status-struggling border-status-struggling/30";
    case CheckinStatus.completed:
      return "bg-status-completed/10 text-status-completed border-status-completed/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function GoalDetail() {
  const params = useParams({ strict: false }) as { goalId?: string };
  const goalId = params.goalId ?? "";
  const navigate = useNavigate();

  const goals = useGoalsStore((s) => s.goals);
  const checkins = useGoalsStore((s) => s.checkins);
  const updateGoalLocal = useGoalsStore((s) => s.updateGoal);
  const updateStatusMutation = useUpdateGoalStatus();

  const goal = goals.find((g) => g.id === goalId);
  const goalCheckins = checkins
    .filter((c) => c.goalId === goalId)
    .sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime(),
    );

  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [editCheckinId, setEditCheckinId] = useState<string | null>(null);
  const [hurdleOpen, setHurdleOpen] = useState(false);

  if (!goal) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <p className="text-muted-foreground">Goal not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/goals" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
      </div>
    );
  }

  const completedCheckins = goalCheckins.filter(
    (c) =>
      c.status === CheckinStatus.completed ||
      c.status === CheckinStatus.onTrack,
  ).length;
  const totalCheckins = goalCheckins.length;
  const pct =
    totalCheckins > 0
      ? Math.round((completedCheckins / totalCheckins) * 100)
      : 0;

  const handleStatusChange = async (status: GoalStatus) => {
    updateGoalLocal(goalId, { status });
    try {
      await updateStatusMutation.mutateAsync({ goalId, status });
    } catch {
      // local update sufficient
    }
    toast.success(
      status === GoalStatus.completed
        ? "🎉 Goal marked as completed!"
        : status === GoalStatus.archived
          ? "Goal archived."
          : "Goal reactivated.",
    );
  };

  const editCheckin = editCheckinId
    ? goalCheckins.find((c) => c.id === editCheckinId)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/goals" })}
          className="text-muted-foreground hover:text-foreground -ml-2"
          data-ocid="goal-detail.back.button"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Goals
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-lg p-6"
            data-ocid="goal-detail.info.card"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    goal.category === GoalCategory.work
                      ? "bg-category-work/15 text-category-work"
                      : "bg-category-personal/15 text-category-personal"
                  }`}
                >
                  {goal.category === GoalCategory.work ? (
                    <Briefcase className="h-5 w-5" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    {goal.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        goal.category === GoalCategory.work
                          ? "bg-category-work/10 text-category-work border-category-work/30"
                          : "bg-category-personal/10 text-category-personal border-category-personal/30"
                      }`}
                    >
                      {goal.category === GoalCategory.work
                        ? "Work"
                        : "Personal"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        goal.status === GoalStatus.active
                          ? "bg-status-on-track/10 text-status-on-track border-status-on-track/30 text-xs"
                          : goal.status === GoalStatus.completed
                            ? "bg-status-completed/10 text-status-completed border-status-completed/30 text-xs"
                            : "bg-muted text-muted-foreground text-xs"
                      }
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    data-ocid="goal-detail.actions.dropdown_menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {goal.status === GoalStatus.active && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(GoalStatus.completed)}
                      data-ocid="goal-detail.complete.button"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  {goal.status !== GoalStatus.archived && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(GoalStatus.archived)}
                      data-ocid="goal-detail.archive.button"
                    >
                      Archive Goal
                    </DropdownMenuItem>
                  )}
                  {goal.status === GoalStatus.archived && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(GoalStatus.active)}
                      data-ocid="goal-detail.activate.button"
                    >
                      Reactivate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {goal.description && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {goal.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                Target:{" "}
                {new Date(goal.targetDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {completedCheckins} of {totalCheckins} check-ins done
                </span>
                <span className="font-medium text-foreground">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </motion.div>

          {/* Check-ins */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            data-ocid="goal-detail.checkins.section"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Check-ins ({totalCheckins})
              </h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditCheckinId(null);
                  setCheckinModalOpen(true);
                }}
                data-ocid="goal-detail.add-checkin.primary_button"
                className="bg-primary/15 text-primary hover:bg-primary/25 text-xs h-7"
                variant="ghost"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Check-in
              </Button>
            </div>

            {goalCheckins.length === 0 ? (
              <div
                className="bg-card border border-dashed border-border rounded-lg p-8 text-center"
                data-ocid="goal-detail.checkins.empty_state"
              >
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No check-ins yet. Schedule one to track your progress.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {goalCheckins.map((checkin, idx) => (
                    <motion.div
                      key={checkin.id}
                      data-ocid={`goal-detail.checkin.item.${idx + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="bg-card border border-border rounded-lg p-4 hover:border-border/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5">
                            {checkinStatusIcon(checkin.status)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${checkinStatusClass(
                                  checkin.status,
                                )}`}
                              >
                                {checkinStatusLabel(checkin.status)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  checkin.scheduledDate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {checkin.note && (
                              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                {checkin.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs opacity-60 hover:opacity-100 flex-shrink-0"
                          onClick={() => {
                            setEditCheckinId(checkin.id);
                            setCheckinModalOpen(true);
                          }}
                          data-ocid={`goal-detail.checkin.edit_button.${idx + 1}`}
                        >
                          Update
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                className="w-full justify-start text-sm bg-primary/15 text-primary hover:bg-primary/25"
                variant="ghost"
                onClick={() => {
                  setEditCheckinId(null);
                  setCheckinModalOpen(true);
                }}
                data-ocid="goal-detail.quick-checkin.primary_button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Check-in
              </Button>
              <Separator className="my-2" />
              <Button
                className="w-full justify-start text-sm"
                variant="outline"
                onClick={() => setHurdleOpen(true)}
                data-ocid="goal-detail.hurdle.open_modal_button"
              >
                <Zap className="h-4 w-4 mr-2 text-primary" />
                AI Hurdle Assistant
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="bg-card border border-border rounded-lg p-5"
            data-ocid="goal-detail.stats.card"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Check-in Stats
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "On Track",
                  count: goalCheckins.filter(
                    (c) => c.status === CheckinStatus.onTrack,
                  ).length,
                  cls: "text-status-on-track",
                },
                {
                  label: "Struggling",
                  count: goalCheckins.filter(
                    (c) => c.status === CheckinStatus.struggling,
                  ).length,
                  cls: "text-status-struggling",
                },
                {
                  label: "Completed",
                  count: goalCheckins.filter(
                    (c) => c.status === CheckinStatus.completed,
                  ).length,
                  cls: "text-status-completed",
                },
                {
                  label: "Pending",
                  count: goalCheckins.filter(
                    (c) => c.status === CheckinStatus.pending,
                  ).length,
                  cls: "text-muted-foreground",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-semibold ${row.cls}`}>
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <CheckinModal
        open={checkinModalOpen}
        onOpenChange={setCheckinModalOpen}
        goalId={goalId}
        goalTitle={goal.title}
        existingCheckinId={editCheckin?.id}
        initialStatus={editCheckin?.status}
        initialNote={editCheckin?.note}
        initialDate={editCheckin?.scheduledDate}
      />

      <HurdleAssistant
        open={hurdleOpen}
        onOpenChange={setHurdleOpen}
        goalId={goalId}
        goalTitle={goal.title}
      />
    </div>
  );
}
