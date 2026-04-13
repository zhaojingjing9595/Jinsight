import type { Category } from "./transaction";

export type BudgetPlanType =
  | "trip"
  | "home_project"
  | "event"
  | "monthly"
  | "custom";

export type BudgetPlanStatus = "planned" | "active" | "completed";

export type CategoryAllocation = {
  category: Category;
  limit: number;
};

export type BudgetPlan = {
  id: string;
  userId: string;
  name: string;
  type: BudgetPlanType;
  startDate: Date;
  endDate: Date | null;
  totalLimit: number;
  categoryAllocations: CategoryAllocation[];
  notes: string | null;
  status: BudgetPlanStatus;
  createdAt: Date;
};

export type BudgetPlanInput = Omit<BudgetPlan, "id" | "status" | "createdAt">;
