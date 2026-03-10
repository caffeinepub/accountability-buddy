import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CheckinStatus, type GoalCategory } from "../backend";
import AddGoalModal from "../components/AddGoalModal";
import CheckinModal from "../components/CheckinModal";
import { useDashboardSummary } from "../hooks/useQueries";
import { useGoalsStore } from "../store/goalsStore";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
  ocid,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay: number;
  ocid: string;
}) {
  return (
    <motion.div
      data-ocid={ocid}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-card border border-border rounded-lg p-5 flex items-start gap-4"
    >
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function statusLabel(s: CheckinStatus) {
  switch (s) {
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

function statusColor(s: CheckinStatus) {
  switch (s) {
    case CheckinStatus.onTrack:
      return "bg-status-on-track/15 text-status-on-track border-status-on-track/30";
    case CheckinStatus.struggling:
      return "bg-status-struggling/15 text-status-struggling border-status-struggling/30";
    case CheckinStatus.completed:
      return "bg-status-completed/15 text-status-completed border-status-completed/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function Dashboard() {
  const { data: summary, isLoading } = useDashboardSummary();
  const goals = useGoalsStore((s) => s.goals);
  const checkins = useGoalsStore((s) => s.checkins);
  const navigate = useNavigate();
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<{
    checkinId: string;
    goalId: string;
    goalTitle: string;
  } | null>(null);

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const pendingCheckins = checkins.filter(
    (c) => c.status === CheckinStatus.pending,
  );

  const localActiveCount = activeGoals.length;
  const localCompletedCount = completedGoals.length;
  const localPendingCount = pendingCheckins.length;

  // Upcoming check-ins from local store (next 3 pending, sorted by date)
  const upcomingLocal = [...pendingCheckins]
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    )
    .slice(0, 3)
    .map((c) => {
      const goal = goals.find((g) => g.id === c.goalId);
      return {
        ...c,
        goalTitle: goal?.title ?? "Unknown Goal",
        goalCategory: goal?.category,
      };
    });

  // Prefer backend data if available
  const activeCount = summary
    ? Number(summary.activeGoalsCount)
    : localActiveCount;
  const completedCount = summary
    ? Number(summary.completedGoalsCount)
    : localCompletedCount;
  const pendingCount = summary
    ? Number(summary.pendingCheckinsCount)
    : localPendingCount;

  const upcoming =
    summary && summary.upcomingCheckins.length > 0
      ? summary.upcomingCheckins.slice(0, 3).map((u) => ({
          id: u.checkinId,
          checkinId: u.checkinId,
          goalId: "",
          goalTitle: u.goalTitle,
          scheduledDate: u.scheduledDate,
          status: u.status,
          goalCategory: undefined as GoalCategory | undefined,
        }))
      : upcomingLocal.map((u) => ({
          id: u.id,
          checkinId: u.id,
          goalId: u.goalId,
          goalTitle: u.goalTitle,
          scheduledDate: u.scheduledDate,
          status: u.status,
          goalCategory: u.goalCategory,
        }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your progress and stay accountable.
          </p>
        </div>
        <Button
          onClick={() => setAddGoalOpen(true)}
          data-ocid="dashboard.add.primary_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Goal
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          <>
            <Skeleton
              className="h-24 rounded-lg"
              data-ocid="dashboard.loading_state"
            />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </>
        ) : (
          <>
            <StatCard
              label="Active Goals"
              value={activeCount}
              icon={Target}
              color="bg-primary/15 text-primary"
              delay={0}
              ocid="dashboard.active.card"
            />
            <StatCard
              label="Pending Check-ins"
              value={pendingCount}
              icon={Clock}
              color="bg-status-struggling/15 text-status-struggling"
              delay={0.08}
              ocid="dashboard.pending.card"
            />
            <StatCard
              label="Goals Completed"
              value={completedCount}
              icon={CheckCircle2}
              color="bg-status-on-track/15 text-status-on-track"
              delay={0.16}
              ocid="dashboard.completed.card"
            />
          </>
        )}
      </div>

      {/* Upcoming Check-ins */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        data-ocid="dashboard.checkins.section"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Upcoming Check-ins
          </h2>
        </div>

        {upcoming.length === 0 ? (
          <div
            className="bg-card border border-border rounded-lg p-10 text-center"
            data-ocid="dashboard.checkins.empty_state"
          >
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No upcoming check-ins. Add goals and schedule check-ins to stay on
              track.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setAddGoalOpen(true)}
              data-ocid="dashboard.checkins.add.button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((item, idx) => (
              <motion.div
                key={item.checkinId}
                data-ocid={`dashboard.checkin.item.${idx + 1}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + idx * 0.08 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4 hover:border-border/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {item.goalTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Scheduled:{" "}
                      {new Date(item.scheduledDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(
                      item.status,
                    )}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (item.goalId) {
                        setCheckinTarget({
                          checkinId: item.checkinId,
                          goalId: item.goalId,
                          goalTitle: item.goalTitle,
                        });
                      } else {
                        navigate({ to: "/goals" });
                      }
                    }}
                    data-ocid={`dashboard.checkin.button.${idx + 1}`}
                    className="text-xs h-7"
                  >
                    Check In
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Recent Goals */}
      {goals.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-8"
          data-ocid="dashboard.goals.section"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Active Goals
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/goals" })}
              data-ocid="dashboard.goals.view.button"
              className="text-xs text-muted-foreground"
            >
              View All
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeGoals.slice(0, 4).map((goal, idx) => {
              const goalCheckins = checkins.filter((c) => c.goalId === goal.id);
              const done = goalCheckins.filter(
                (c) =>
                  c.status === CheckinStatus.completed ||
                  c.status === CheckinStatus.onTrack,
              ).length;
              const total = goalCheckins.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <motion.div
                  key={goal.id}
                  data-ocid={`dashboard.goal.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + idx * 0.07 }}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 transition-colors group"
                  onClick={() =>
                    navigate({
                      to: "/goals/$goalId",
                      params: { goalId: goal.id },
                    })
                  }
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {goal.title}
                    </p>
                    <Badge
                      className={`text-xs shrink-0 ${
                        goal.category === "work"
                          ? "bg-category-work/15 text-category-work border-category-work/30"
                          : "bg-category-personal/15 text-category-personal border-category-personal/30"
                      }`}
                      variant="outline"
                    >
                      {goal.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {done}/{total} check-ins
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      <AddGoalModal open={addGoalOpen} onOpenChange={setAddGoalOpen} />

      {checkinTarget && (
        <CheckinModal
          open={!!checkinTarget}
          onOpenChange={(open) => !open && setCheckinTarget(null)}
          goalId={checkinTarget.goalId}
          goalTitle={checkinTarget.goalTitle}
          existingCheckinId={checkinTarget.checkinId}
        />
      )}
    </div>
  );
}
