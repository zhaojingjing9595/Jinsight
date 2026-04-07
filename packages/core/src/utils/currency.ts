import type { Currency } from "../types/user";

const CURRENCY_LOCALES: Record<Currency, string> = {
  ILS: "he-IL",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function formatCurrency(
  amount: number,
  currency: Currency = "ILS",
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}
