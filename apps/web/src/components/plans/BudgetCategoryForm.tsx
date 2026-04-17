"use client";

import { useState, useEffect } from "react";
import { CATEGORY_META, EXPENSE_CATEGORY_ORDER, formatCurrency } from "@jinsight/core";
import type { ExpenseCategory } from "@jinsight/core";
import { NumPad } from "@/components/NumPad";

type BudgetCategoryFormProps = {
  /** Prefill for editing; omit for create mode */
  initial?: { category: ExpenseCategory; limit: number };
  /** Categories already in use (excluded from picker in create mode) */
  usedCategories?: ExpenseCategory[];
  onSave: (category: ExpenseCategory, limit: number) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function BudgetCategoryForm({
  initial,
  usedCategories = [],
  onSave,
  onDelete,
  onClose,
}: BudgetCategoryFormProps) {
  const isEdit = !!initial;

  const availableCategories = EXPENSE_CATEGORY_ORDER.filter(
    (c) => !usedCategories.includes(c) || c === initial?.category,
  );

  const [category, setCategory] = useState<ExpenseCategory>(
    initial?.category ?? availableCategories[0] ?? "other",
  );
  const [amount, setAmount] = useState(initial ? String(initial.limit) : "0");

  useEffect(() => {
    if (!isEdit && availableCategories.length > 0 && !availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [usedCategories]);

  const amountNum = parseFloat(amount) || 0;

  function handleSave() {
    if (amountNum > 0) {
      onSave(category, amountNum);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-base animate-[slideUp_200ms_cubic-bezier(0.2,0.8,0.2,1)]"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit budget" : "Add category budget"}
    >
      <div className="relative w-full max-w-[480px] mx-auto flex flex-col h-dvh">
        {/* Header */}
        <div className="flex-none relative flex items-center justify-center px-4 pt-5 pb-3">
          <h2 className="font-display font-black text-[20px] text-ink uppercase tracking-[1px]">
            {isEdit ? "Edit Budget" : "Add Category Budget"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs font-body font-bold text-[15px] text-ink transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5">
          {/* Category picker */}
          <div className="mb-3">
            <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
              Category
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {availableCategories.map((c) => {
                const meta = CATEGORY_META[c];
                const isActive = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    disabled={isEdit}
                    className="flex-none flex flex-col items-center gap-1 active:scale-95 transition-transform duration-[120ms]"
                  >
                    <div
                      className="w-[42px] h-[42px] flex items-center justify-center text-[20px] border-2 border-ink rounded-[8px] transition-all duration-[120ms]"
                      style={{
                        backgroundColor: meta.color,
                        boxShadow: isActive ? "var(--shadow-neo-sm)" : "none",
                        transform: isActive ? "translate(-1px, -1px)" : "none",
                        opacity: isActive ? 1 : 0.6,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <span
                      className={`font-body text-[8px] max-w-[48px] text-center leading-tight truncate ${
                        isActive ? "font-[800] text-ink" : "font-[500] text-muted"
                      }`}
                    >
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount display */}
          <div className="mb-2">
            <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
              Monthly Limit
            </label>
            <div className="border-[2.5px] border-ink rounded-[12px] py-2.5 flex flex-col items-center bg-[#fff9e6]">
              <p className="font-display font-black leading-none text-ink text-[28px]">
                {formatCurrency(amountNum, "ILS")}
              </p>
            </div>
          </div>

          {/* NumPad */}
          <div className="mb-4">
            <NumPad value={amount} onChange={setAmount} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="font-body flex-none px-4 py-3 text-[12px] font-black uppercase tracking-[1px] border-[2.5px] border-ink rounded-[10px] bg-alert text-white shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={amountNum === 0}
              className="font-body flex-1 py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-primary text-white shadow-neo-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
            >
              {isEdit ? "Update" : "Add Budget"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
