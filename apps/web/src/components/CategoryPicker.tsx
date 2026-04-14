"use client";

import { CATEGORY_META, CATEGORY_ORDER } from "@jinsight/core";
import type { Category } from "@jinsight/core";

// ─── SVG icon paths per category (24×24 viewBox, stroke-only) ─────────────────

const ICON_PATHS: Record<Category, string[]> = {
  rent: [
    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    "M9 22V12h6v10",
  ],
  utilities: [
    "M13 2L3 14h9l-1 8 10-12h-9z",
  ],
  subscriptions: [
    "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z",
    "M2 10h20",
    "M6 15h4",
  ],
  grocery: [
    "M6 2H3",
    "M6 2l2 11h10l2-7H7",
    "M10 20a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
    "M17 20a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
  ],
  dining: [
    "M3 2v7a3 3 0 006 0V2",
    "M6 9v13",
    "M18 2v20",
    "M18 2c-2 0-4 2-4 5s2 5 4 5",
  ],
  shopping: [
    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z",
    "M3 6h18",
    "M16 10a4 4 0 01-8 0",
  ],
  entertainment: [
    "M9 18V5l12-2v13",
    "M6 21a3 3 0 100-6 3 3 0 000 6z",
    "M18 19a3 3 0 100-6 3 3 0 000 6z",
  ],
  transport: [
    "M8 4h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z",
    "M6 12h12",
    "M10 18v2",
    "M14 18v2",
    "M10 4V2",
    "M14 4V2",
  ],
  education: [
    "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z",
    "M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  ],
  travel: [
    "M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  ],
  other: [
    "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    "M3.27 6.96L12 12.01l8.73-5.05",
    "M12 22.08V12",
  ],
  income: [
    "M12 1v22",
    "M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

type CategoryPickerProps = {
  value: Category | null;
  onChange: (category: Category) => void;
  includeIncome?: boolean;
  onAddNew?: () => void;
};

export function CategoryPicker({
  value,
  onChange,
  includeIncome = false,
  onAddNew,
}: CategoryPickerProps) {
  const cats: Category[] = includeIncome
    ? [...CATEGORY_ORDER, "income"]
    : CATEGORY_ORDER;

  return (
    <div className="flex gap-3 overflow-x-auto pt-1.5 pb-2 pl-[5px]" style={{ scrollbarWidth: "none" }}>
      {cats.map((cat) => {
        const meta = CATEGORY_META[cat];
        const isSelected = value === cat;
        const paths = ICON_PATHS[cat];

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
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="#111008"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </svg>
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
