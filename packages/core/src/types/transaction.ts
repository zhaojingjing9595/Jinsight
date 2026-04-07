export type TransactionType = "INCOME" | "EXPENSE";

export type Category =
  | "food"
  | "transport"
  | "savings"
  | "bills"
  | "fun"
  | "shopping"
  | "health"
  | "subscriptions"
  | "restaurants"
  | "travel"
  | "income"
  | "other";

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
