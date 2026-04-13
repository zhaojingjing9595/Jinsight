import type { Category } from "../types/transaction";

export type CategoryMeta = {
  label: string;
  color: string;
  icon: string;
};

/** Canonical display order for spending categories (income excluded). */
export const CATEGORY_ORDER: Category[] = [
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

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  rent:          { label: "Rent",           color: "#cdb1e7", icon: "🏠" },
  utilities:     { label: "Utility Bills",  color: "#f07030", icon: "⚡" },
  subscriptions: { label: "Subscriptions",  color: "#208870", icon: "📱" },
  grocery:       { label: "Grocery",        color: "#2ad2a3", icon: "🛒" },
  dining:        { label: "Dining Out",     color: "#f5a800", icon: "🍽️" },
  shopping:      { label: "Shopping",       color: "#feb704", icon: "🛍️" },
  entertainment: { label: "Entertainment",  color: "#fdb6f0", icon: "🎉" },
  transport:     { label: "Transportation", color: "#9090cc", icon: "🚌" },
  education:     { label: "Education",      color: "#cce972", icon: "📚" },
  travel:        { label: "Travel",         color: "#f0c000", icon: "✈️" },
  other:         { label: "Others",         color: "#d4d4d4", icon: "📦" },
  income:        { label: "Income",         color: "#2ad2a3", icon: "💵" },
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
