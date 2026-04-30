"use client";

import { useState } from "react";
import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { CategoryIcon } from "./CategoryIcon";
import { BillsDetailSheet } from "./bills/BillsDetailSheet";

type ApiBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
};

type EditPatch = { description: string | null; amount: number };

function formatDateTime(date: Date) {
  const d = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const t = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${d} · ${t}`;
}

function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function BillsAndTransactionsCard({
  bills,
  transactions,
  onTransactionEdit,
  onTransactionDelete,
}: {
  bills: ApiBill[];
  transactions: Transaction[];
  onTransactionEdit?: (id: string, patch: EditPatch) => Promise<void> | void;
  onTransactionDelete?: (id: string) => Promise<void> | void;
}) {
  const [tab, setTab] = useState<"transactions" | "bills">("transactions");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const sorted = [...transactions].sort(
    (a, b) =>
      b.date.getTime() - a.date.getTime() ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setEditDesc(t.description ?? "");
    setEditAmount(String(t.amount));
  }

  async function saveEdit(id: string) {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    setPendingId(id);
    try {
      await onTransactionEdit?.(id, { description: editDesc.trim() || null, amount });
      setEditingId(null);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    setPendingId(id);
    try {
      await onTransactionDelete?.(id);
    } finally {
      setPendingId(null);
    }
  }

  // Bills data
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

  const displayBills = [...overdueBills, ...upcomingBillsOnly, ...paidBillsOnly].slice(0, 3);

  return (
    <>
      <div className="h-full border-[2.5px] border-ink rounded-card shadow-neo-md bg-base overflow-hidden flex flex-col">
        {/* Tab header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 md:px-4 py-3 md:py-4 bg-base">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("transactions")}
              className={`font-body px-3 py-1.5 border-2 border-ink rounded-[10px] text-[10px] font-[700] uppercase tracking-[0.8px] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                tab === "transactions"
                  ? "bg-primary text-white shadow-neo-sm -translate-x-px -translate-y-px"
                  : "bg-base text-ink shadow-[2px_2px_0_#111008]"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setTab("bills")}
              className={`font-body px-3 py-1.5 border-2 border-ink rounded-[10px] text-[10px] font-[700] uppercase tracking-[0.8px] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                tab === "bills"
                  ? "bg-primary text-white shadow-neo-sm -translate-x-px -translate-y-px"
                  : "bg-base text-ink shadow-[2px_2px_0_#111008]"
              }`}
            >
              Bills
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {tab === "transactions" ? (
            <div className="flex flex-col gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 md:py-3 pb-4">
              {sorted.length === 0 ? (
                <p className="font-body text-[11px] md:text-[12px] text-muted text-center py-4">No transactions yet</p>
              ) : (
                sorted.map((t) => {
                  const meta = CATEGORY_META[t.category] ?? { label: t.category, color: "#d4d4d4", icon: "📦" };
                  const isExpense = t.type === "EXPENSE";
                  const isEditing = editingId === t.id;
                  const isPending = pendingId === t.id;

                  return (
                    <div
                      key={t.id}
                      className="flex flex-col gap-1.5 md:gap-2 border-2 border-dashed border-ink/60 rounded-[10px] md:rounded-[12px] px-2.5 md:px-3 py-1.5 md:py-2 bg-base"
                    >
                      <div className="flex items-center gap-2.5 md:gap-3">
                        <div className="flex-none">
                          <div
                            className="w-8 md:w-9 h-8 md:h-9 rounded-[8px] md:rounded-[10px] border-2 border-ink flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: meta.color }}
                          >
                            <CategoryIcon category={t.category} size={18} />
                          </div>
                        </div>

                        <p className="font-body flex-1 min-w-0 truncate text-[12px] md:text-[13px] font-[600] text-ink">
                          {t.description ?? meta.label}
                        </p>

                        <div className="flex-none text-right whitespace-nowrap">
                          <p className={`font-body text-[13px] md:text-[14px] font-[700] leading-tight ${isExpense ? "text-alert" : "text-income"}`}>
                            {isExpense ? "−" : "+"}{formatCurrency(t.amount, "ILS")}
                          </p>
                          <p className="font-body mt-0.5 text-[8px] md:text-[9px] font-[500] text-[#999]">
                            {formatDateTime(t.date)}
                          </p>
                        </div>

                        <div className="flex-none relative ml-0.5 md:ml-1">
                          <button
                            type="button"
                            aria-label="Transaction actions"
                            disabled={isPending}
                            onClick={() => setMenuId(menuId === t.id ? null : t.id)}
                            className="w-5 md:w-6 h-5 md:h-6 flex items-center justify-center rounded-[5px] md:rounded-[6px] hover:bg-ink/5 active:scale-95 disabled:opacity-40"
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" className="md:w-[16px] md:h-[16px]" fill="#111008">
                              <circle cx="5" cy="12" r="1.8" />
                              <circle cx="12" cy="12" r="1.8" />
                              <circle cx="19" cy="12" r="1.8" />
                            </svg>
                          </button>
                          {menuId === t.id && (
                            <>
                              <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setMenuId(null)}
                                className="fixed inset-0 z-20 cursor-default"
                              />
                              <div className="absolute right-0 top-7 z-30 flex flex-col min-w-[110px] border-2 border-ink rounded-[10px] shadow-neo-sm bg-base overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuId(null);
                                    isEditing ? setEditingId(null) : startEdit(t);
                                  }}
                                  className="font-body flex items-center gap-2 px-3 py-2 text-[12px] font-[600] text-ink hover:bg-ink/5 text-left"
                                >
                                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#111008" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuId(null);
                                    handleDelete(t.id);
                                  }}
                                  className="font-body flex items-center gap-2 px-3 py-2 text-[12px] font-[600] text-alert hover:bg-alert/10 border-t border-ink/20 text-left"
                                >
                                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#c81e1e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex items-center gap-2 pt-2 border-t border-ink/20">
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            className="font-body flex-1 min-w-0 text-[12px] px-2 py-1 border-2 border-ink rounded-[8px] bg-base focus:outline-none focus:shadow-neo-xs"
                          />
                          <input
                            type="number"
                            inputMode="decimal"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="Amount"
                            className="font-body w-24 text-[12px] px-2 py-1 border-2 border-ink rounded-[8px] bg-base text-right focus:outline-none focus:shadow-neo-xs"
                          />
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => saveEdit(t.id)}
                            className="font-body text-[11px] font-[700] uppercase px-2.5 py-1 border-2 border-ink rounded-[8px] bg-reward shadow-neo-xs active:shadow-none active:translate-y-[1px] disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setEditingId(null)}
                            className="font-body text-[11px] font-[700] uppercase px-2.5 py-1 border-2 border-ink rounded-[8px] bg-base"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : bills.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <p className="font-body text-[11px] md:text-[12px] text-muted">No bills yet</p>
            </div>
          ) : (
            <button
              onClick={() => setDetailsOpen(true)}
              className="w-full h-full p-3 md:p-4 flex flex-col gap-2 md:gap-3 hover:bg-ink/5 transition-colors"
            >
              <div className="grid grid-cols-2 gap-1 md:gap-2">
                <div className="border border-ink rounded-[8px] md:rounded-[10px] shadow-neo-xs bg-reward px-1 md:px-1.5 py-1 md:py-1.5 flex flex-col items-center justify-center text-center">
                  <p className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[0.5px] text-ink">Upcoming</p>
                  <p className="font-display font-bold text-[12px] md:text-[14px] text-ink leading-none mt-0.5">
                    {upcomingCount}
                  </p>
                </div>

                <div className="border border-ink rounded-[8px] md:rounded-[10px] shadow-neo-xs bg-alert px-1 md:px-1.5 py-1 md:py-1.5 flex flex-col items-center justify-center text-center">
                  <p className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[0.5px] text-white">Overdue</p>
                  <p className="font-display font-bold text-[12px] md:text-[14px] text-white leading-none mt-0.5">
                    {overdueCount}
                  </p>
                </div>

                <div className="border border-ink rounded-[8px] md:rounded-[10px] shadow-neo-xs bg-income px-1 md:px-1.5 py-1 md:py-1.5 flex flex-col items-center justify-center text-center">
                  <p className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[0.5px] text-ink">Paid</p>
                  <p className="font-display font-bold text-[12px] md:text-[14px] text-ink leading-none mt-0.5">
                    {paidCount}
                  </p>
                </div>

                <div className="border border-ink rounded-[8px] md:rounded-[10px] shadow-neo-xs bg-primary px-1 md:px-1.5 py-1 md:py-1.5 flex flex-col items-center justify-center text-center">
                  <p className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[0.5px] text-white">Total</p>
                  <p className="font-body text-[9px] md:text-[10px] font-bold text-white leading-none mt-0.5">
                    {formatCurrency(totalAmount, "ILS")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 md:gap-1">
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
            </button>
          )}
        </div>
      </div>

      <BillsDetailSheet bills={bills} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  );
}
