"use client";

import { formatCurrency } from "@jinsight/core";

const CATEGORY_ICONS: Record<string, string> = {
  utilities: "⚡",
  subscriptions: "📱",
  rent: "🏠",
  transport: "🚌",
  education: "📚",
  other: "📦",
};

export type BillRowData = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isSubscription: boolean;
};

type BillRowProps = {
  bill: BillRowData;
  onMarkPaid?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusChip(bill: BillRowData) {
  if (bill.isPaid) {
    return { label: "Paid", bg: "bg-income", text: "text-ink" };
  }
  const days = daysUntil(bill.dueDate);
  if (days < 0) return { label: "Overdue", bg: "bg-alert", text: "text-white" };
  if (days === 0) return { label: "Due today", bg: "bg-reward", text: "text-ink" };
  if (days <= 3) return { label: `In ${days}d`, bg: "bg-reward", text: "text-ink" };
  return { label: `In ${days}d`, bg: "bg-base", text: "text-ink" };
}

export function BillRow({ bill, onMarkPaid, onEdit, onDelete }: BillRowProps) {
  const chip = statusChip(bill);
  const icon = CATEGORY_ICONS[bill.category] ?? "📦";

  return (
    <div className="border-2 border-ink rounded-card bg-base shadow-neo-xs p-3 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full border-2 border-ink bg-base flex items-center justify-center text-[18px] flex-none">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-body font-bold text-[13px] text-ink truncate">{bill.name}</p>
          {bill.isSubscription && (
            <span className="font-body text-[8px] uppercase tracking-[1px] font-bold text-muted border border-ink/40 rounded-pill px-1.5 py-px">
              Sub
            </span>
          )}
        </div>
        <p className="font-body text-[11px] text-muted">
          {formatCurrency(bill.amount, "ILS")} · {new Date(bill.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-none">
        <span
          className={`font-body text-[10px] font-bold uppercase tracking-[1px] border-2 border-ink rounded-pill px-2 py-0.5 ${chip.bg} ${chip.text}`}
        >
          {chip.label}
        </span>
        <div className="flex items-center gap-1">
          {!bill.isPaid && onMarkPaid && (
            <button
              type="button"
              onClick={() => onMarkPaid(bill.id)}
              className="font-body text-[10px] font-bold uppercase tracking-[1px] border-2 border-ink rounded-pill px-2 py-0.5 bg-income text-ink shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Paid
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(bill.id)}
              aria-label="Edit"
              className="w-7 h-7 flex items-center justify-center border-2 border-ink rounded-full bg-base text-[11px]"
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(bill.id)}
              aria-label="Delete"
              className="w-7 h-7 flex items-center justify-center border-2 border-ink rounded-full bg-base text-[12px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
