import type { Category } from "../types/transaction";

export type CategoryMeta = {
  label: string;
  color: string;
  icon: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  food: { label: "Food & Drink", color: "#2ad2a3", icon: "🥗" },
  transport: { label: "Transport", color: "#f07030", icon: "🚌" },
  savings: { label: "Savings", color: "#cce972", icon: "💰" },
  bills: { label: "Bills", color: "#cdb1e7", icon: "📋" },
  fun: { label: "Fun & Leisure", color: "#fdb6f0", icon: "🎉" },
  shopping: { label: "Shopping", color: "#feb704", icon: "🛍️" },
  health: { label: "Health", color: "#9090cc", icon: "🏥" },
  subscriptions: { label: "Subscriptions", color: "#208870", icon: "📱" },
  restaurants: { label: "Restaurants", color: "#f5a800", icon: "🍽️" },
  travel: { label: "Travel", color: "#f0c000", icon: "✈️" },
  income: { label: "Income", color: "#2ad2a3", icon: "💵" },
  other: { label: "Other", color: "#fcfaeb", icon: "📦" },
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
