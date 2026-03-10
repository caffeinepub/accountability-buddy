import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Briefcase, Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GoalCategory, GoalStatus } from "../backend";
import { useCreateGoal } from "../hooks/useQueries";
import { useGoalsStore } from "../store/goalsStore";

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddGoalModal({
  open,
  onOpenChange,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.work);
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addGoal = useGoalsStore((s) => s.addGoal);
  const createGoalMutation = useCreateGoal();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!targetDate) errs.targetDate = "Target date is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    let goalId = `local-${Date.now()}`;
    try {
      goalId = await createGoalMutation.mutateAsync({
        title: title.trim(),
        category,
        description: description.trim(),
        targetDate,
      });
    } catch {
      // Use local ID if backend fails
    }

    addGoal({
      id: goalId,
      title: title.trim(),
      category,
      description: description.trim(),
      targetDate,
      status: GoalStatus.active,
      createdAt: new Date().toISOString(),
    });

    toast.success("Goal created! Stay committed. 🚀");
    setTitle("");
    setCategory(GoalCategory.work);
    setDescription("");
    setTargetDate("");
    onOpenChange(false);
  };

  const isPending = createGoalMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="add-goal.dialog">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Define what you want to achieve and set a target date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Goal Title *</Label>
            <Input
              id="goal-title"
              placeholder="e.g. Launch new product feature"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-ocid="add-goal.title.input"
            />
            {errors.title && (
              <p
                className="text-xs text-destructive"
                data-ocid="add-goal.title.error_state"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <ToggleGroup
              type="single"
              value={category}
              onValueChange={(v) => v && setCategory(v as GoalCategory)}
              className="justify-start"
              data-ocid="add-goal.category.toggle"
            >
              <ToggleGroupItem
                value={GoalCategory.work}
                className="gap-1.5 data-[state=on]:bg-category-work/15 data-[state=on]:text-category-work"
                data-ocid="add-goal.category.work.toggle"
              >
                <Briefcase className="h-4 w-4" />
                Work
              </ToggleGroupItem>
              <ToggleGroupItem
                value={GoalCategory.personal}
                className="gap-1.5 data-[state=on]:bg-category-personal/15 data-[state=on]:text-category-personal"
                data-ocid="add-goal.category.personal.toggle"
              >
                <Heart className="h-4 w-4" />
                Personal
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">Description</Label>
            <Textarea
              id="goal-desc"
              placeholder="What does success look like? Any specific milestones?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-ocid="add-goal.description.textarea"
            />
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-date">Target Date *</Label>
            <Input
              id="goal-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              data-ocid="add-goal.date.input"
            />
            {errors.targetDate && (
              <p
                className="text-xs text-destructive"
                data-ocid="add-goal.date.error_state"
              >
                {errors.targetDate}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-ocid="add-goal.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="add-goal.submit.submit_button"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
