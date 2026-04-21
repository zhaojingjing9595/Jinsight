"use client";

import { useState } from "react";
import Link from "next/link";
import type { Transaction } from "@jinsight/core";
import { CATEGORY_META, formatCurrency } from "@jinsight/core";
import { CategoryIcon } from "./CategoryIcon";

function formatDateTime(date: Date) {
  const d = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const t = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${d} · ${t}`;
}

type EditPatch = { description: string | null; amount: number };

export function TransactionHistory({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  onEdit?: (id: string, patch: EditPatch) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const sorted = [...transactions].sort(
    (a, b) =>
      b.date.getTime() - a.date.getTime() ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

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
      await onEdit?.(id, { description: editDesc.trim() || null, amount });
      setEditingId(null);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    setPendingId(id);
    try {
      await onDelete?.(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="h-full border-[2.5px] border-ink rounded-card shadow-neo-md bg-base overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 md:px-4 pt-2 md:pt-3 pb-1.5 md:pb-2 bg-base">
        <h3 className="font-body text-[11px] md:text-[12px] font-[900] uppercase tracking-[1.5px] text-ink">
          Transactions
        </h3>
        <Link
          href="/transactions"
          className="font-body text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] text-primary hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="flex flex-col gap-1.5 md:gap-2 px-2.5 md:px-3 pb-2 md:pb-3">
        {sorted.map((t) => {
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
                {/* Icon */}
                <div className="flex-none">
                  <div
                    className="w-8 md:w-9 h-8 md:h-9 rounded-[8px] md:rounded-[10px] border-2 border-ink flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  >
                    <CategoryIcon category={t.category} size={18} />
                  </div>
                </div>

                {/* Description */}
                <p className="font-body flex-1 min-w-0 truncate text-[12px] md:text-[13px] font-[600] text-ink">
                  {t.description ?? meta.label}
                </p>

                {/* Amount + datetime */}
                <div className="flex-none text-right whitespace-nowrap">
                  <p className={`font-body text-[13px] md:text-[14px] font-[700] leading-tight ${isExpense ? "text-alert" : "text-income"}`}>
                    {isExpense ? "−" : "+"}{formatCurrency(t.amount, "ILS")}
                  </p>
                  <p className="font-body mt-0.5 text-[8px] md:text-[9px] font-[500] text-[#999]">
                    {formatDateTime(t.date)}
                  </p>
                </div>

                {/* Actions: 3-dot menu */}
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

              {/* Inline edit row */}
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
        })}
      </div>
    </div>
  );
}
