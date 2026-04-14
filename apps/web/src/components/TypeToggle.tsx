"use client";

import type { TransactionType } from "@jinsight/core";

type TypeToggleProps = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div className="inline-flex border-2 border-ink rounded-btn overflow-hidden shadow-neo-xs">
      <button
        type="button"
        onClick={() => onChange("EXPENSE")}
        className={`font-body px-4 py-1.5 text-[11px] font-[700] uppercase tracking-[1px] transition-all border-r-2 border-ink ${
          value === "EXPENSE" ? "bg-alert text-white" : "bg-base text-muted"
        }`}
      >
        Expense
      </button>
      <button
        type="button"
        onClick={() => onChange("INCOME")}
        className={`font-body px-4 py-1.5 text-[11px] font-[700] uppercase tracking-[1px] transition-all ${
          value === "INCOME" ? "bg-income text-white" : "bg-base text-muted"
        }`}
      >
        Income
      </button>
    </div>
  );
}
