"use client";

import { useState } from "react";
import { CATEGORY_META, formatCurrency } from "@jinsight/core";
import { CategoryIcon } from "@/components/CategoryIcon";

export type BillRowData = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurrence?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM";
  isRecurring?: boolean;
  isPaid: boolean;
  lastPaidDate?: string | null;
  isSubscription?: boolean;
};

type BillRowProps = {
  bill: BillRowData;
  onMarkPaid?: (id: string) => Promise<void> | void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
  customCategoryColors?: Record<string, string>;
};

export function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function paidThisMonth(bill: BillRowData, now = new Date()) {
  if (!bill.lastPaidDate) return Boolean(bill.isPaid);
  const paidAt = new Date(bill.lastPaidDate);
  if (Number.isNaN(paidAt.getTime())) return Boolean(bill.isPaid);
  return isSameMonth(paidAt, now);
}

function statusChip(bill: BillRowData) {
  if (paidThisMonth(bill)) {
    return { label: "Paid", bg: "bg-income", text: "text-ink" };
  }
  const days = daysUntil(bill.dueDate);
  if (days < 0) return { label: "Overdue", bg: "bg-alert", text: "text-white" };
  if (days === 0) return { label: "Due today", bg: "bg-reward", text: "text-ink" };
  if (days <= 3) return { label: `In ${days}d`, bg: "bg-reward", text: "text-ink" };
  return { label: `In ${days}d`, bg: "bg-base", text: "text-ink" };
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function recurrenceLabel(bill: BillRowData) {
  const d = new Date(bill.dueDate);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });

  if (bill.isRecurring === false) {
    return `One-time · ${month} ${day}`;
  }

  switch (bill.recurrence) {
    case "WEEKLY":
      return `Every ${weekday}`;
    case "ANNUAL":
      return `Every year · ${month} ${day}`;
    case "CUSTOM":
      return "Custom schedule";
    case "MONTHLY":
    default:
      return `${ordinal(day)} of every month`;
  }
}

export function BillRow({ bill, onMarkPaid, onEdit, onDelete, customCategoryColors }: BillRowProps) {
  const chip = statusChip(bill);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<null | "paid" | "delete">(null);
  const alreadyPaidThisMonth = paidThisMonth(bill);
  const hasActions = Boolean((!alreadyPaidThisMonth && onMarkPaid) || onEdit || onDelete);

  const meta = CATEGORY_META[bill.category as keyof typeof CATEGORY_META] ?? {
    label: bill.category,
    color: customCategoryColors?.[bill.category] ?? "#d4d4d4",
    icon: "📦",
  };

  async function handlePaid() {
    if (!onMarkPaid || alreadyPaidThisMonth) return;
    setPending("paid");
    try {
      await onMarkPaid(bill.id);
    } finally {
      setPending(null);
      setMenuOpen(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setPending("delete");
    try {
      await onDelete(bill.id);
    } finally {
      setPending(null);
      setMenuOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5 border-2 border-dashed border-ink/60 rounded-[10px] px-3 py-2 bg-base">
      <div className="flex-none">
        <div
          className="w-9 h-9 rounded-[10px] border-2 border-ink flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: meta.color }}
        >
          <CategoryIcon category={bill.category} size={20} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-body font-[700] text-[12px] text-ink truncate">
            {bill.name}
          </p>
          {bill.isSubscription && (
            <span className="font-body text-[8px] uppercase tracking-[1px] font-bold text-muted border border-ink/40 rounded-pill px-1.5 py-px">
              Sub
            </span>
          )}
        </div>
        <p className="font-body text-[10px] text-muted truncate">
          {recurrenceLabel(bill)}
        </p>
      </div>

      {/* Amount (middle) */}
      <div className="flex-none text-right whitespace-nowrap">
        <p className="font-body text-[13px] font-[800] leading-tight text-ink">
          {formatCurrency(bill.amount, "ILS")}
        </p>
      </div>

      {/* Status after amount */}
      <div className="flex-none">
        <span className={`font-body text-[9px] font-bold uppercase tracking-[1px] border-2 border-ink rounded-pill px-2 py-0.5 ${chip.bg} ${chip.text}`}>
          {chip.label}
        </span>
      </div>

      {/* Menu (edit/delete/paid) */}
      {hasActions && (
        <div className="flex-none relative ml-0.5">
          <button
            type="button"
            aria-label="Bill actions"
            disabled={pending !== null}
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-ink/5 active:scale-95 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#111008">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute right-0 top-7 z-30 flex flex-col min-w-[130px] border-2 border-ink rounded-[10px] shadow-neo-sm bg-base overflow-hidden">
                {!alreadyPaidThisMonth && onMarkPaid && (
                  <button
                    type="button"
                    onClick={handlePaid}
                    disabled={pending !== null}
                    className="font-body flex items-center gap-2 px-3 py-2 text-[12px] font-[600] text-income hover:bg-income/10 text-left disabled:opacity-40"
                  >
                    <span className="w-2 h-2 rounded-full bg-income border border-ink" />
                    Mark paid
                  </button>
                )}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(bill.id);
                    }}
                    className="font-body flex items-center gap-2 px-3 py-2 text-[12px] font-[600] text-ink hover:bg-ink/5 text-left border-t border-ink/20"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#111008" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pending !== null}
                    className="font-body flex items-center gap-2 px-3 py-2 text-[12px] font-[600] text-alert hover:bg-alert/10 border-t border-ink/20 text-left disabled:opacity-40"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#c81e1e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
