export type TransactionType = "INCOME" | "EXPENSE";

// Ordered: Rent, Utility Bills, Subscriptions, Grocery, Dining Out,
//          Shopping, Entertainment, Transportation, Education, Travel, Others
export type Category =
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
  | "other"
  | "income";

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
