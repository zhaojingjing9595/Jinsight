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
  shopping:          { label: "Shopping",       color: "#ec4899", icon: "🛍️" },
  entertainment:     { label: "Entertainment",  color: "#fdb6f0", icon: "🎉" },
  transport:         { label: "Transportation", color: "#9090cc", icon: "🚌" },
  education:         { label: "Education",      color: "#cce972", icon: "📚" },
  travel:            { label: "Travel",         color: "#3b82f6", icon: "✈️" },
  other:             { label: "Others",         color: "#d4d4d4", icon: "📦" },

  // ── Income categories ──
  salary:            { label: "Salary",          color: "#22c55e", icon: "💰" },
  bonus:             { label: "Bonus",           color: "#6366f1", icon: "🎁" },
  freelance:         { label: "Freelance",       color: "#b45309", icon: "💻" },
  side_hustle:       { label: "Side Hustle",     color: "#0d9488", icon: "🔥" },
  investment_return: { label: "Investments",     color: "#84cc16", icon: "📈" },
  refund:            { label: "Refund",          color: "#06b6d4", icon: "↩️" },
  gift:              { label: "Gift",            color: "#f472b6", icon: "🎀" },
  other_income:      { label: "Other Income",    color: "#fb7185", icon: "💵" },
};

export const CATEGORY_LIST: Category[] = Object.keys(CATEGORY_META) as Category[];

export type CustomCategoryMeta = {
  id: string;
  name: string;
  color: string;
  /** The key stored in Transaction.category / Bill.category */
  slug: string;
};

/** Derives the stored category key from a custom category name. */
export function slugifyCustomCategory(name: string): string {
  return "custom_" + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/** Returns true if the key belongs to a custom (user-created) category. */
export function isCustomCategory(key: string): boolean {
  return key.startsWith("custom_");
}

/** Derives a readable label from a custom category slug when no DB record is available. */
function customCategoryFallbackLabel(slug: string): string {
  return slug
    .slice("custom_".length)
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category as Category] ?? { label: getCategoryLabel(category), color: "#d4d4d4", icon: "📦" };
}

export function getCategoryColor(category: string): string {
  return CATEGORY_META[category as Category]?.color ?? "#d4d4d4";
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_META[category as Category]?.icon ?? "📦";
}

export function getCategoryLabel(category: string): string {
  const meta = CATEGORY_META[category as Category];
  if (meta) return meta.label;
  if (isCustomCategory(category)) return customCategoryFallbackLabel(category);
  return category;
}

export function isIncomeCategory(category: string): category is IncomeCategory {
  return INCOME_CATEGORY_ORDER.includes(category as IncomeCategory);
}

export function isExpenseCategory(category: string): category is ExpenseCategory {
  return EXPENSE_CATEGORY_ORDER.includes(category as ExpenseCategory);
}
