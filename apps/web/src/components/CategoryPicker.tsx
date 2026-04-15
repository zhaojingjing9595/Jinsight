"use client";

import { CATEGORY_META, EXPENSE_CATEGORY_ORDER, INCOME_CATEGORY_ORDER } from "@jinsight/core";
import type { Category } from "@jinsight/core";
import { CategoryIcon } from "./CategoryIcon";

// ─── Component ────────────────────────────────────────────────────────────────

type CategoryPickerProps = {
  value: Category | null;
  onChange: (category: Category) => void;
  mode?: "expense" | "income";
  onAddNew?: () => void;
};

export function CategoryPicker({
  value,
  onChange,
  mode = "expense",
  onAddNew,
}: CategoryPickerProps) {
  const cats: Category[] = mode === "income"
    ? INCOME_CATEGORY_ORDER
    : EXPENSE_CATEGORY_ORDER;

  return (
    <div className="flex gap-3 overflow-x-auto pt-1.5 pb-2 pl-[5px]" style={{ scrollbarWidth: "none" }}>
      {cats.map((cat) => {
        const meta = CATEGORY_META[cat];
        const isSelected = value === cat;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-[120ms]"
          >
            <div
              className="w-[52px] h-[52px] flex items-center justify-center border-[2.5px] border-ink rounded-[10px] transition-all duration-[120ms]"
              style={{
                backgroundColor: meta.color,
                boxShadow: isSelected ? "var(--shadow-neo-md)" : "var(--shadow-neo-xs)",
                transform: isSelected ? "translate(-2px, -2px) scale(1.1)" : "none",
                opacity: isSelected ? 1 : 0.72,
              }}
            >
              <CategoryIcon category={cat} size={26} />
            </div>
            <span
              className={`font-body text-center leading-tight text-[9px] max-w-[52px] overflow-hidden text-ellipsis whitespace-nowrap ${
                isSelected ? "font-[800] text-ink" : "font-[500] text-muted"
              }`}
            >
              {meta.label}
            </span>
          </button>
        );
      })}

      {/* Add new category */}
      {onAddNew && (
        <button
          type="button"
          onClick={onAddNew}
          className="flex-none flex flex-col items-center gap-1.5 transition-all active:scale-95"
        >
          <div className="w-[52px] h-[52px] flex items-center justify-center border-2 border-dashed border-[#aaa] rounded-[10px] bg-[#f4f4f4]">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="#aaa"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="font-body text-[9px] font-[500] text-[#aaa]">
            New
          </span>
        </button>
      )}
    </div>
  );
}
