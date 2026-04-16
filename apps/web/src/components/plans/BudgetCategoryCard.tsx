"use client";

import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Category, Currency } from "@jinsight/core";

type BudgetCategoryCardProps = {
  category: Category;
  limit: number;
  spent: number;
  currency?: Currency;
  readOnly?: boolean;
  onEdit?: () => void;
};

function progressColor(percent: number): string {
  if (percent >= 100) return "#ef4444"; // red
  if (percent >= 75) return "#f59e0b";  // amber
  return "#2ad2a3";                     // mint green
}

function statusLabel(percent: number): string {
  if (percent >= 100) return "Over budget";
  if (percent >= 75) return "Approaching";
  return "On track";
}

export function BudgetCategoryCard({
  category,
  limit,
  spent,
  currency = "ILS",
  readOnly = false,
  onEdit,
}: BudgetCategoryCardProps) {
  const meta = CATEGORY_META[category];
  const percent = limit > 0 ? (spent / limit) * 100 : 0;
  const barWidth = Math.min(percent, 100);
  const color = progressColor(percent);

  return (
    <button
      type="button"
      onClick={readOnly ? undefined : onEdit}
      disabled={readOnly}
      className="w-full text-left p-3 border-2 border-ink rounded-[12px] bg-base shadow-neo-xs transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-neo-xs"
    >
      {/* Top row: icon + name + amount */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-[36px] h-[36px] flex items-center justify-center text-[18px] border-[1.5px] border-ink rounded-[8px] flex-none"
          style={{ backgroundColor: meta.color }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[13px] font-bold text-ink truncate">
            {meta.label}
          </p>
        </div>
        <p className="font-body text-[13px] font-black text-ink flex-none">
          {formatCurrency(spent, currency)}{" "}
          <span className="font-bold text-muted">/ {formatCurrency(limit, currency)}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-[10px] rounded-[30px] border-[1.5px] border-ink overflow-hidden bg-[#f5f5f0] relative">
        <div
          className="absolute left-0 top-0 h-full rounded-[30px] transition-all duration-300"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>

      {/* Bottom row: status + percent */}
      <div className="flex items-center justify-between mt-1.5">
        <span
          className="font-body text-[10px] font-bold uppercase tracking-[1px]"
          style={{ color }}
        >
          {statusLabel(percent)}
        </span>
        <span className="font-body text-[10px] font-bold text-muted">
          {Math.round(percent)}%
        </span>
      </div>
    </button>
  );
}
