"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@jinsight/core";

type ApiBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
};

const CATEGORY_ICONS: Record<string, string> = {
  utilities: "⚡",
  subscriptions: "📱",
  rent: "🏠",
  transport: "🚌",
  education: "📚",
  other: "📦",
};

function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusFor(b: ApiBill) {
  if (b.isPaid) return { label: "Paid", color: "bg-income text-ink" };
  const d = daysUntil(b.dueDate);
  if (d < 0) return { label: `${Math.abs(d)}d late`, color: "bg-alert text-white" };
  if (d === 0) return { label: "Due today", color: "bg-reward text-reward-dark" };
  return { label: `In ${d}d`, color: d <= 3 ? "bg-reward text-reward-dark" : "bg-base text-ink" };
}

export function BillsDetailSheet({
  bills,
  open,
  onClose,
}: {
  bills: ApiBill[];
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const overdueBills = bills
    .filter((b) => !b.isPaid && daysUntil(b.dueDate) < 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingBills = bills
    .filter((b) => !b.isPaid && daysUntil(b.dueDate) >= 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const paidBills = bills
    .filter((b) => b.isPaid)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[100] flex bg-base animate-[slideUp_200ms_cubic-bezier(0.2,0.8,0.2,1)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-[480px] mx-auto flex flex-col h-dvh">
          {/* Header */}
          <div className="flex-none flex items-center justify-between px-4 py-3 border-b-2 border-ink/10">
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              aria-label="Close"
            >
              ←
            </button>
            <h2 className="font-display font-bold text-[18px] text-ink tracking-[0.01em]">
              Bills & Subscriptions
            </h2>
            <div className="w-9" />
          </div>

          {/* Scroll body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 pb-5">
            {/* Overdue section */}
            {overdueBills.length > 0 && (
              <div className="mb-5">
                <p className="font-body text-[10px] font-bold uppercase tracking-[2px] text-alert mb-2">
                  Overdue ({overdueBills.length})
                </p>
                <div className="flex flex-col gap-2">
                  {overdueBills.map((b) => (
                    <BillRow key={b.id} bill={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming section */}
            {upcomingBills.length > 0 && (
              <div className="mb-5">
                <p className="font-body text-[10px] font-bold uppercase tracking-[2px] text-reward-dark mb-2">
                  Upcoming ({upcomingBills.length})
                </p>
                <div className="flex flex-col gap-2">
                  {upcomingBills.map((b) => (
                    <BillRow key={b.id} bill={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Paid section */}
            {paidBills.length > 0 && (
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-[2px] text-income-dark mb-2">
                  Paid ({paidBills.length})
                </p>
                <div className="flex flex-col gap-2">
                  {paidBills.map((b) => (
                    <BillRow key={b.id} bill={b} />
                  ))}
                </div>
              </div>
            )}

            {bills.length === 0 && (
              <p className="font-body text-[12px] text-muted text-center py-6">
                No bills yet. Add one to get started.
              </p>
            )}
          </div>

          {/* Bottom action bar */}
          <div className="flex-none border-t-2 border-ink/10 px-4 py-3">
            <Link
              href="/bills"
              onClick={onClose}
              className="block w-full py-2.5 text-center font-body text-[12px] font-bold uppercase tracking-[1.5px] text-primary border-2 border-ink rounded-btn shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Manage All Bills →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function BillRow({ bill }: { bill: ApiBill }) {
  const s = statusFor(bill);
  const daysLeft = daysUntil(bill.dueDate);

  return (
    <div className="flex items-center gap-2.5 p-2 border-2 border-ink rounded-card bg-base hover:bg-reward/5 transition-colors">
      <span className="w-7 h-7 flex items-center justify-center text-[13px] flex-none">
        {CATEGORY_ICONS[bill.category] ?? "📦"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-body font-bold text-[12px] text-ink truncate">{bill.name}</p>
        <p className="font-body text-[10px] text-muted">
          {formatCurrency(bill.amount, "ILS")} · {new Date(bill.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <div className={`px-2 py-1 rounded-pill border-2 border-ink ${s.color} text-center flex-none`}>
        <p className="font-body text-[9px] font-bold whitespace-nowrap">{s.label}</p>
      </div>
    </div>
  );
}
