export type GoalType = "TRIP_EVENT" | "PURCHASE" | "EMERGENCY" | "DEBT" | "CUSTOM";
export type GoalStatus = "PLANNING" | "SAVING" | "ACTIVE" | "COMPLETE";

export type SpendingPlanItem = {
  category: string;
  budget: number;
  actual: number;
};

export type Goal = {
  id: string;
  userId: string;
  type: GoalType;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  startDate: string | null;
  endDate: string | null;
  status: GoalStatus;
  spendingPlan: SpendingPlanItem[] | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalWithProgress = Goal & {
  percentComplete: number;
  remaining: number;
  isComplete: boolean;
  monthsRemaining: number | null;
  monthlyNeeded: number | null;
};

export const GOAL_TYPE_META: Record<GoalType, { label: string; emoji: string; description: string }> = {
  TRIP_EVENT:  { label: "Trip / Event",    emoji: "✈️",  description: "Save + spend plan for a bounded event" },
  PURCHASE:    { label: "Big Purchase",    emoji: "🛍️", description: "Save toward a single purchase" },
  EMERGENCY:   { label: "Emergency Fund",  emoji: "🛡️", description: "Build a safety net" },
  DEBT:        { label: "Debt Payoff",     emoji: "💳",  description: "Eliminate a liability balance" },
  CUSTOM:      { label: "Custom",          emoji: "🎯",  description: "Open-ended user-defined goal" },
};

export const GOAL_STATUS_META: Record<GoalStatus, { label: string; color: string }> = {
  PLANNING: { label: "Planning", color: "#a57dee" },
  SAVING:   { label: "Saving",   color: "#cce972" },
  ACTIVE:   { label: "Active",   color: "#2ad2a3" },
  COMPLETE: { label: "Complete", color: "#888888" },
};

export function computeGoalProgress(goal: Goal): GoalWithProgress {
  const percentComplete = goal.targetAmount > 0
    ? (goal.savedAmount / goal.targetAmount) * 100
    : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const isComplete = goal.savedAmount >= goal.targetAmount || goal.status === "COMPLETE";

  let monthsRemaining: number | null = null;
  let monthlyNeeded: number | null = null;

  if (goal.endDate && !isComplete) {
    const now = new Date();
    const end = new Date(goal.endDate);
    const diffMs = end.getTime() - now.getTime();
    monthsRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));
    monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
  }

  return { ...goal, percentComplete, remaining, isComplete, monthsRemaining, monthlyNeeded };
}

export function getGoalHealthStatus(goal: GoalWithProgress): "on_track" | "behind" | "at_risk" {
  if (goal.isComplete) return "on_track";
  if (goal.monthsRemaining === null || goal.monthlyNeeded === null) return "on_track";
  if (goal.monthsRemaining <= 1 && goal.percentComplete < 90) return "at_risk";
  if (goal.percentComplete < (100 - (goal.monthsRemaining / ((goal.monthsRemaining + 1) || 1)) * 100) * 0.5) return "behind";
  return "on_track";
}
