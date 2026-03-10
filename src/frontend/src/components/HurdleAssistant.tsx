import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  LightbulbIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Guidance } from "../backend";
import { useLogHurdle } from "../hooks/useQueries";

interface HurdleAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
}

export default function HurdleAssistant({
  open,
  onOpenChange,
  goalId,
  goalTitle,
}: HurdleAssistantProps) {
  const [hurdleText, setHurdleText] = useState("");
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const logHurdleMutation = useLogHurdle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hurdleText.trim()) return;

    try {
      const result = await logHurdleMutation.mutateAsync({
        goalId,
        hurdleText: hurdleText.trim(),
      });
      setGuidance(result);
    } catch (_err) {
      // Provide offline fallback guidance
      setGuidance({
        reframe:
          "Every challenge is a signal that you are growing. The fact that you identified this hurdle shows self-awareness — that is the first step to overcoming it.",
        actionSteps: [
          "Break this specific hurdle into one small, immediate action you can take today.",
          "Talk to someone who has faced a similar challenge and ask what worked for them.",
          "Set a 25-minute focus session dedicated solely to this blocker.",
          "Write down three possible solutions, even if imperfect, and pick the easiest to try first.",
        ],
        encouragement:
          "You have already shown commitment by working toward this goal. This hurdle is temporary. Keep going — the version of you who finishes this goal is worth fighting for.",
      });
      toast.error(
        "Using offline guidance — connect for personalized AI advice.",
      );
    }
  };

  const handleReset = () => {
    setGuidance(null);
    setHurdleText("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        data-ocid="hurdle.sheet"
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <SheetTitle>AI Hurdle Assistant</SheetTitle>
          </div>
          <SheetDescription className="text-muted-foreground">
            Facing a blocker on{" "}
            <span className="text-foreground font-medium">{goalTitle}</span>?
            Describe it and get personalized guidance.
          </SheetDescription>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {!guidance ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="hurdle-text">What's blocking you?</Label>
                <Textarea
                  id="hurdle-text"
                  placeholder="e.g. I keep procrastinating on the technical documentation because it feels overwhelming and I don't know where to start..."
                  value={hurdleText}
                  onChange={(e) => setHurdleText(e.target.value)}
                  rows={5}
                  className="resize-none"
                  data-ocid="hurdle.problem.textarea"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific — the more detail, the more useful the guidance.
                </p>
              </div>

              <Button
                type="submit"
                disabled={logHurdleMutation.isPending || !hurdleText.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="hurdle.submit.primary_button"
              >
                {logHurdleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Guidance
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
              data-ocid="hurdle.guidance.panel"
            >
              {/* Reframe */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-primary/8 border border-primary/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <LightbulbIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-primary">
                    Reframe
                  </h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {guidance.reframe}
                </p>
              </motion.div>

              {/* Action Steps */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Action Steps
                  </h3>
                </div>
                <div className="space-y-2">
                  {guidance.actionSteps.map((step, i) => (
                    <motion.div
                      key={`step-${step.slice(0, 20)}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.15 + i * 0.07 }}
                      className="flex items-start gap-3 bg-card border border-border rounded-md p-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center flex-shrink-0 font-medium mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <Separator />

              {/* Encouragement */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-accent/8 border border-accent/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-accent">
                    Encouragement
                  </h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">
                  "{guidance.encouragement}"
                </p>
              </motion.div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
                data-ocid="hurdle.reset.secondary_button"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Ask About Another Hurdle
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
