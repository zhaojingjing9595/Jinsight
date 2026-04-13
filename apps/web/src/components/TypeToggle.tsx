"use client";

import type { TransactionType } from "@jinsight/core";

type TypeToggleProps = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div
      className="inline-flex border-[2px] border-[#111008] rounded-[8px] overflow-hidden"
      style={{ boxShadow: "2px 2px 0 #111008" }}
    >
      <button
        type="button"
        onClick={() => onChange("EXPENSE")}
        className="px-4 py-1.5 text-[11px] font-[700] uppercase tracking-[1px] transition-all"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          backgroundColor: value === "EXPENSE" ? "#fc524f" : "#fcfaeb",
          color: value === "EXPENSE" ? "#fff" : "#888",
          borderRight: "2px solid #111008",
        }}
      >
        Expense
      </button>
      <button
        type="button"
        onClick={() => onChange("INCOME")}
        className="px-4 py-1.5 text-[11px] font-[700] uppercase tracking-[1px] transition-all"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          backgroundColor: value === "INCOME" ? "#2ad2a3" : "#fcfaeb",
          color: value === "INCOME" ? "#fff" : "#888",
        }}
      >
        Income
      </button>
    </div>
  );
}
