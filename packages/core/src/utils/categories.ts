import type { Category, ExpenseCategory, IncomeCategory } from "../types/transaction";

export type CategoryMeta = {
  label: string;
  color: string;
  icon: string;
};

/** Canonical display order for expense categories. */
export const EXPENSE_CATEGORY_ORDER: ExpenseCategory[] = [
  "rent",
  "utilities",
  "subscriptions",
  "grocery",
  "dining",
  "shopping",
  "entertainment",
  "transport",
  "education",
  "travel",
  "other",
];

/** Canonical display order for income categories. */
export const INCOME_CATEGORY_ORDER: IncomeCategory[] = [
  "salary",
  "bonus",
  "freelance",
  "side_hustle",
  "investment_return",
  "refund",
  "gift",
  "other_income",
];

/** @deprecated Use EXPENSE_CATEGORY_ORDER instead */
export const CATEGORY_ORDER = EXPENSE_CATEGORY_ORDER;

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  // ── Expense categories ──
  rent:              { label: "Rent",           color: "#cdb1e7", icon: "🏠" },
  utilities:         { label: "Utility Bills",  color: "#f07030", icon: "⚡" },
  subscriptions:     { label: "Subscriptions",  color: "#208870", icon: "📱" },
  grocery:           { label: "Grocery",        color: "#2ad2a3", icon: "🛒" },
  dining:            { label: "Dining Out",     color: "#f5a800", icon: "🍽️" },
  shopping:          { label: "Shopping",       color: "#feb704", icon: "🛍️" },
  entertainment:     { label: "Entertainment",  color: "#fdb6f0", icon: "🎉" },
  transport:         { label: "Transportation", color: "#9090cc", icon: "🚌" },
  education:         { label: "Education",      color: "#cce972", icon: "📚" },
  travel:            { label: "Travel",         color: "#f0c000", icon: "✈️" },
  other:             { label: "Others",         color: "#d4d4d4", icon: "📦" },

  // ── Income categories ──
  salary:            { label: "Salary",          color: "#2ad2a3", icon: "💰" },
  bonus:             { label: "Bonus",           color: "#feb704", icon: "🎁" },
  freelance:         { label: "Freelance",       color: "#a57dee", icon: "💻" },
  side_hustle:       { label: "Side Hustle",     color: "#f07030", icon: "🔥" },
  investment_return: { label: "Investments",     color: "#cce972", icon: "📈" },
  refund:            { label: "Refund",          color: "#9090cc", icon: "↩️" },
  gift:              { label: "Gift",            color: "#fdb6f0", icon: "🎀" },
  other_income:      { label: "Other Income",    color: "#cdb1e7", icon: "💵" },
};

export const CATEGORY_LIST: Category[] = Object.keys(CATEGORY_META) as Category[];

export function getCategoryMeta(category: Category): CategoryMeta {
  return CATEGORY_META[category];
}

export function getCategoryColor(category: Category): string {
  return CATEGORY_META[category].color;
}

export function getCategoryIcon(category: Category): string {
  return CATEGORY_META[category].icon;
}

export function getCategoryLabel(category: Category): string {
  return CATEGORY_META[category].label;
}

export function isIncomeCategory(category: Category): category is IncomeCategory {
  return INCOME_CATEGORY_ORDER.includes(category as IncomeCategory);
}

export function isExpenseCategory(category: Category): category is ExpenseCategory {
  return EXPENSE_CATEGORY_ORDER.includes(category as ExpenseCategory);
}
