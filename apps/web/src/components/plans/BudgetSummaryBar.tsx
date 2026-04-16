"use client";

import { formatCurrency } from "@jinsight/core";
import type { Currency } from "@jinsight/core";

type BudgetSummaryBarProps = {
  totalBudgeted: number;
  totalSpent: number;
  currency?: Currency;
};

export function BudgetSummaryBar({
  totalBudgeted,
  totalSpent,
  currency = "ILS",
}: BudgetSummaryBarProps) {
  const remaining = totalBudgeted - totalSpent;
  const percent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const barWidth = Math.min(percent, 100);
  const isOver = remaining < 0;

  return (
    <div className="p-3 border-[2.5px] border-ink rounded-[12px] bg-base shadow-neo-sm">
      {/* Stats row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-center flex-1">
          <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">
            Budgeted
          </p>
          <p className="font-body text-[16px] font-black text-ink leading-tight">
            {formatCurrency(totalBudgeted, currency)}
          </p>
        </div>
        <div className="w-[1.5px] h-[28px] bg-ink/15" />
        <div className="text-center flex-1">
          <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">
            Spent
          </p>
          <p className="font-body text-[16px] font-black text-ink leading-tight">
            {formatCurrency(totalSpent, currency)}
          </p>
        </div>
        <div className="w-[1.5px] h-[28px] bg-ink/15" />
        <div className="text-center flex-1">
          <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">
            {isOver ? "Over" : "Left"}
          </p>
          <p
            className={`font-body text-[16px] font-black leading-tight ${
              isOver ? "text-alert" : "text-income"
            }`}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-[8px] rounded-[30px] border-[1.5px] border-ink overflow-hidden bg-[#f5f5f0] relative">
        <div
          className="absolute left-0 top-0 h-full rounded-[30px] transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            backgroundColor: isOver ? "#ef4444" : percent >= 75 ? "#f59e0b" : "#2ad2a3",
          }}
        />
      </div>
    </div>
  );
}
