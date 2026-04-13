export type AssetType =
  | "stock"
  | "etf"
  | "crypto"
  | "bond"
  | "real_estate"
  | "other";

/** A single investment holding (position). */
export type Investment = {
  id: string;
  userId: string;
  name: string;
  ticker: string | null;
  assetType: AssetType;
  units: number;
  purchasePrice: number; // per unit, in account currency
  purchaseDate: Date;
  platform: string | null;
  createdAt: Date;
};

/** A goal-based investment target (e.g. "House down payment"). */
export type InvestmentGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  assetType: AssetType | null;
  createdAt: Date;
};

/** A single DCA / contribution log entry. */
export type InvestmentContribution = {
  id: string;
  userId: string;
  investmentId: string | null;
  goalId: string | null;
  amount: number;
  date: Date;
  notes: string | null;
  createdAt: Date;
};

export type InvestmentInput = Omit<Investment, "id" | "createdAt">;
export type InvestmentGoalInput = Omit<InvestmentGoal, "id" | "createdAt">;
export type InvestmentContributionInput = Omit<
  InvestmentContribution,
  "id" | "createdAt"
>;
