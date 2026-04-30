import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@jinsight/core";
import { BillsDetailSheet } from "./BillsDetailSheet";

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

export function BillsSnapshotCard({ bills }: { bills: ApiBill[] }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const overdueCount = bills.filter((b) => !b.isPaid && daysUntil(b.dueDate) < 0).length;
  const upcomingCount = bills.filter((b) => !b.isPaid && daysUntil(b.dueDate) >= 0).length;
  const paidCount = bills.filter((b) => b.isPaid).length;
  const totalAmount = bills.filter((b) => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);

  const overdueBills = bills
    .filter((b) => !b.isPaid && daysUntil(b.dueDate) < 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingBillsOnly = bills
    .filter((b) => !b.isPaid && daysUntil(b.dueDate) >= 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const paidBillsOnly = bills
    .filter((b) => b.isPaid)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const displayBills = [
    ...overdueBills,
    ...upcomingBillsOnly,
    ...paidBillsOnly,
  ].slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-2 text-left">
        {bills.length === 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="font-body text-[9px] md:text-[10px] font-bold uppercase tracking-[2px] text-ink">
                Bills & Subscriptions
              </p>
              <Link
                href="/dashboard"
                className="font-body text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] text-primary hover:underline"
              >
                Dashboard →
              </Link>
            </div>
            <div className="border-[2.5px] border-ink rounded-card shadow-neo-md bg-base px-3 md:px-4 py-2 md:py-3 text-center">
              <p className="font-body text-[11px] md:text-[12px] text-muted">No bills yet</p>
            </div>
          </>
        ) : (
          <button
            onClick={() => setDetailsOpen(true)}
            className="border-[2.5px] border-ink rounded-card shadow-neo-md bg-base px-3 md:px-4 py-2 md:py-3 flex flex-col gap-1.5 md:gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-body text-[11px] md:text-[12px] font-black uppercase tracking-[1.5px] text-ink">
                Bills & Subscriptions
              </h2>
              <Link
                href="/dashboard"
                onClick={(e) => e.stopPropagation()}
                className="font-body text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] text-primary hover:underline"
              >
                Dashboard →
              </Link>
            </div>

            {/* Content: Left stats + Right bills */}
            <div className="flex gap-2 md:gap-3">
            {/* Left side: 2x2 stat cards */}
            <div className="flex-1 grid grid-cols-2 gap-2 md:gap-3">
              <div className="border border-ink rounded-[10px] md:rounded-[12px] shadow-neo-xs bg-reward px-2 md:px-3 py-4 md:py-6 flex flex-col items-center justify-center text-center">
                <p className="font-body text-[10px] md:text-[12px] font-bold uppercase tracking-[0.5px] text-ink">Upcoming</p>
                <p className="font-display font-bold text-[28px] md:text-[36px] text-ink leading-none mt-2">
                  {upcomingCount}
                </p>
              </div>

              <div className="border border-ink rounded-[10px] md:rounded-[12px] shadow-neo-xs bg-alert px-2 md:px-3 py-4 md:py-6 flex flex-col items-center justify-center text-center">
                <p className="font-body text-[10px] md:text-[12px] font-bold uppercase tracking-[0.5px] text-white">Overdue</p>
                <p className="font-display font-bold text-[28px] md:text-[36px] text-white leading-none mt-2">
                  {overdueCount}
                </p>
              </div>

              <div className="border border-ink rounded-[10px] md:rounded-[12px] shadow-neo-xs bg-income px-2 md:px-3 py-4 md:py-6 flex flex-col items-center justify-center text-center">
                <p className="font-body text-[10px] md:text-[12px] font-bold uppercase tracking-[0.5px] text-ink">Paid</p>
                <p className="font-display font-bold text-[28px] md:text-[36px] text-ink leading-none mt-2">
                  {paidCount}
                </p>
              </div>

              <div className="border border-ink rounded-[10px] md:rounded-[12px] shadow-neo-xs bg-primary px-2 md:px-3 py-4 md:py-6 flex flex-col items-center justify-center text-center">
                <p className="font-body text-[10px] md:text-[12px] font-bold uppercase tracking-[0.5px] text-white">Total</p>
                <p className="font-body text-[13px] md:text-[16px] font-bold text-white leading-none mt-2">
                  {formatCurrency(totalAmount, "ILS")}
                </p>
              </div>
            </div>

            {/* Right side: Bills list (overdue → upcoming → paid) */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5 md:gap-1">
              {displayBills.length > 0 ? (
                displayBills.map((bill) => {
                  const daysLeft = daysUntil(bill.dueDate);
                  const isOverdue = daysLeft < 0;
                  const statusLabel = isOverdue ? "Overdue" : "Upcoming";
                  const statusColor = isOverdue ? "bg-alert text-white" : "bg-reward text-reward-dark";

                  return (
                    <div
                      key={bill.id}
                      className="grid grid-cols-3 gap-1 md:gap-1.5 items-center pb-0.5 md:pb-1 border-b border-ink/10 last:border-b-0"
                    >
                      <p className="font-body text-[10px] md:text-[11px] font-bold text-ink truncate text-start">{bill.name}</p>
                      <div className={`px-1.5 md:px-2 py-0.5 rounded-pill border border-ink text-center w-fit ${statusColor}`}>
                        <p className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[0.5px] whitespace-nowrap">
                          {isOverdue ? `${Math.abs(daysLeft)}d ${statusLabel}` : `${statusLabel}`}
                        </p>
                      </div>
                      <p className="font-body text-[9px] md:text-[10px] font-bold text-ink text-right">
                        {formatCurrency(bill.amount, "ILS")}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="font-body text-[9px] md:text-[10px] text-muted">No upcoming bills</p>
              )}
            </div>
            </div>
          </button>
        )}
      </div>

      <BillsDetailSheet bills={bills} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  );
}
