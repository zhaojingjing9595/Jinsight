export type TransactionType = "INCOME" | "EXPENSE";

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "subscriptions"
  | "grocery"
  | "dining"
  | "shopping"
  | "entertainment"
  | "transport"
  | "education"
  | "travel"
  | "other";

export type IncomeCategory =
  | "salary"
  | "bonus"
  | "freelance"
  | "side_hustle"
  | "investment_return"
  | "refund"
  | "gift"
  | "other_income";

export type Category = ExpenseCategory | IncomeCategory;

export type Transaction = {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string | null;
  date: Date;
  isRecurring: boolean;
  createdAt: Date;
};

export type TransactionInput = Omit<Transaction, "id" | "createdAt">;
