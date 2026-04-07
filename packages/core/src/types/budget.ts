import type { Category } from "./transaction";

export type BudgetPeriod = "MONTHLY" | "WEEKLY";

export type Budget = {
  id: string;
  userId: string;
  category: Category;
  limit: number;
  period: BudgetPeriod;
  month: number;
  year: number;
};

export type BudgetWithSpend = Budget & {
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverspent: boolean;
};
