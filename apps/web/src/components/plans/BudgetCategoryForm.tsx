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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-[480px] bg-base border-t-[2.5px] border-x-[2.5px] border-ink rounded-t-[16px] px-4 pt-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-[14px] font-black uppercase tracking-[1.5px] text-ink">
              {isEdit ? "Edit Budget" : "Add Category Budget"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-[32px] h-[32px] flex items-center justify-center border-2 border-ink rounded-[8px] bg-base shadow-neo-xs active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="text-[16px] font-bold text-ink">×</span>
            </button>
          </div>

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
    </>
  );
}
