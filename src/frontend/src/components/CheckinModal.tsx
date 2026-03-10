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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckinStatus } from "../backend";
import { useCreateCheckin, useUpdateCheckinStatus } from "../hooks/useQueries";
import { useGoalsStore } from "../store/goalsStore";

interface CheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
  existingCheckinId?: string;
  initialStatus?: CheckinStatus;
  initialNote?: string;
  initialDate?: string;
}

export default function CheckinModal({
  open,
  onOpenChange,
  goalId,
  goalTitle,
  existingCheckinId,
  initialStatus,
  initialNote,
  initialDate,
}: CheckinModalProps) {
  const isEditing = !!existingCheckinId;
  const [date, setDate] = useState(
    initialDate ?? new Date().toISOString().split("T")[0],
  );
  const [status, setStatus] = useState<CheckinStatus>(
    initialStatus ?? CheckinStatus.pending,
  );
  const [note, setNote] = useState(initialNote ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDate(initialDate ?? new Date().toISOString().split("T")[0]);
      setStatus(initialStatus ?? CheckinStatus.pending);
      setNote(initialNote ?? "");
      setErrors({});
    }
  }, [open, initialDate, initialStatus, initialNote]);

  const addCheckin = useGoalsStore((s) => s.addCheckin);
  const updateCheckin = useGoalsStore((s) => s.updateCheckin);
  const createCheckinMutation = useCreateCheckin();
  const updateStatusMutation = useUpdateCheckinStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Date is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    if (isEditing && existingCheckinId) {
      // Update existing
      updateCheckin(existingCheckinId, { status, note });
      try {
        await updateStatusMutation.mutateAsync({
          checkinId: existingCheckinId,
          status,
          note,
        });
      } catch {
        // local update sufficient
      }
      toast.success("Check-in updated!");
    } else {
      // Create new
      let checkinId = `ci-${Date.now()}`;
      try {
        checkinId = await createCheckinMutation.mutateAsync({
          goalId,
          scheduledDate: date,
          note,
        });
      } catch {
        // use local id
      }
      addCheckin({
        id: checkinId,
        goalId,
        scheduledDate: date,
        status,
        note,
        createdAt: new Date().toISOString(),
      });
      toast.success("Check-in scheduled!");
    }

    onOpenChange(false);
  };

  const isPending =
    createCheckinMutation.isPending || updateStatusMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="checkin.dialog">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update Check-in" : "Schedule Check-in"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {goalTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="ci-date">Scheduled Date *</Label>
              <Input
                id="ci-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-ocid="checkin.date.input"
              />
              {errors.date && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="checkin.date.error_state"
                >
                  {errors.date}
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="ci-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as CheckinStatus)}
            >
              <SelectTrigger id="ci-status" data-ocid="checkin.status.select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CheckinStatus.pending}>
                  ⏳ Pending
                </SelectItem>
                <SelectItem value={CheckinStatus.onTrack}>
                  ✅ On Track
                </SelectItem>
                <SelectItem value={CheckinStatus.struggling}>
                  ⚠️ Struggling
                </SelectItem>
                <SelectItem value={CheckinStatus.completed}>
                  🎉 Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="ci-note">Notes</Label>
            <Textarea
              id="ci-note"
              placeholder="How's it going? Any blockers or wins to note?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              data-ocid="checkin.note.textarea"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-ocid="checkin.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="checkin.submit.submit_button"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update" : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
