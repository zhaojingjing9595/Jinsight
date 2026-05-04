"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { CategoryIcon } from "./CategoryIcon";
import { BillRow as BillsPageBillRow, daysUntil as billDaysUntil } from "@/components/bills/BillRow";
import { AddBillModal } from "@/components/bills/AddBillModal";

type ApiBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurrence?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM";
  isRecurring?: boolean;
  isSubscription?: boolean;
  reminderDays?: number;
  isPaid: boolean;
  lastPaidDate?: string | null;
  /** Shown amount for latest payment row; omit/null → use template `amount`. */
  lastPaidAmount?: number | null;
};

function billPaymentDisplayAmount(b: ApiBill): number {
  const o = b.lastPaidAmount;
  if (o != null && typeof o === "number" && !Number.isNaN(o)) return o;
  return b.amount;
}

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

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function paidThisMonth(b: ApiBill, now = new Date()) {
  if (!b.lastPaidDate) return Boolean(b.isPaid);
  const paidAt = new Date(b.lastPaidDate);
  if (Number.isNaN(paidAt.getTime())) return Boolean(b.isPaid);
  return isSameMonth(paidAt, now);
}

type BillFilter = "all" | "upcoming" | "paid" | "overdue";
const BILL_FILTERS: { value: BillFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

type TxFilter = "all" | Transaction["category"];

type TxListMergedItem =
  | { kind: "transaction"; transaction: Transaction }
  | { kind: "bill_payment"; bill: ApiBill; paidAt: Date };

/** Same UTC calendar month as transactions.list (see API routers/transactions.ts). */
function mergeTransactionsAndPaidBills(
  transactions: Transaction[],
  bills: ApiBill[],
  listMonth: number,
  listYear: number,
): TxListMergedItem[] {
  const gte = Date.UTC(listYear, listMonth - 1, 1, 0, 0, 0, 0);
  const lt = Date.UTC(listYear, listMonth, 1, 0, 0, 0, 0);
  const billRows: TxListMergedItem[] = [];
  for (const b of bills) {
    if (!b.lastPaidDate) continue;
    const paid = new Date(b.lastPaidDate);
    const t = paid.getTime();
    if (t >= gte && t < lt) {
      billRows.push({ kind: "bill_payment", bill: b, paidAt: paid });
    }
  }
  const txRows = transactions.map((transaction) =>
    ({ kind: "transaction" as const, transaction }),
  );
  return [...txRows, ...billRows].sort((a, b) => {
    const dateA =
      a.kind === "transaction" ? a.transaction.date.getTime() : a.paidAt.getTime();
    const dateB =
      b.kind === "transaction" ? b.transaction.date.getTime() : b.paidAt.getTime();
    if (dateB !== dateA) return dateB - dateA;
    const tieA =
      a.kind === "transaction" ? a.transaction.createdAt.getTime() : a.paidAt.getTime();
    const tieB =
      b.kind === "transaction" ? b.transaction.createdAt.getTime() : b.paidAt.getTime();
    return tieB - tieA;
  });
}

function mergedListCategories(items: TxListMergedItem[]): Transaction["category"][] {
  const uniq = new Set<Transaction["category"]>();
  for (const it of items) {
    if (it.kind === "transaction") uniq.add(it.transaction.category);
    else uniq.add(it.bill.category as Transaction["category"]);
  }
  return Array.from(uniq).sort((a, b) => {
    const al = CATEGORY_META[a]?.label ?? String(a);
    const bl = CATEGORY_META[b]?.label ?? String(b);
    return al.localeCompare(bl);
  });
}

function mergedItemCategory(it: TxListMergedItem): Transaction["category"] {
  return it.kind === "transaction"
    ? it.transaction.category
    : (it.bill.category as Transaction["category"]);
}

function TxListMergedRowBill({
  item,
  billActionsEnabled,
  editingBillPaymentId,
  pendingBillPaymentId,
  menuBillPaymentId,
  editBillPaymentAmount,
  setEditBillPaymentAmount,
  setEditingBillPaymentId,
  setMenuBillPaymentId,
  startEditBillPayment,
  saveBillPaymentEdit,
  revertBillPayment,
  customCategoryColors,
}: {
  item: Extract<TxListMergedItem, { kind: "bill_payment" }>;
  billActionsEnabled: boolean;
  editingBillPaymentId: string | null;
  pendingBillPaymentId: string | null;
  menuBillPaymentId: string | null;
  editBillPaymentAmount: string;
  setEditBillPaymentAmount: (s: string) => void;
  setEditingBillPaymentId: (id: string | null) => void;
  setMenuBillPaymentId: (id: string | null) => void;
  startEditBillPayment: (b: ApiBill) => void;
  saveBillPaymentEdit: (billId: string) => void | Promise<void>;
  revertBillPayment: (billId: string) => void | Promise<void>;
  customCategoryColors?: Record<string, string>;
}) {
  const { bill, paidAt } = item;
  const displayAmount = billPaymentDisplayAmount(bill);
  const isEditing = editingBillPaymentId === bill.id;
  const isPending = pendingBillPaymentId === bill.id;
  const meta = CATEGORY_META[bill.category as Transaction["category"]] ?? {
    label: bill.category,
    color: customCategoryColors?.[bill.category] ?? "#d4d4d4",
    icon: "📦",
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2 border-2 border-dashed border-primary/40 rounded-[10px] md:rounded-[12px] px-2.5 md:px-3 py-1.5 md:py-2 bg-primary/[0.04]">
      <div className="flex items-center gap-2.5 md:gap-3">
        <div className="flex-none">
          <div
            className="w-8 md:w-9 h-8 md:h-9 rounded-[8px] md:rounded-[10px] border-2 border-ink flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: meta.color }}
          >
            <CategoryIcon category={bill.category as Transaction["category"]} size={18} />
          </div>
        </div>

        <div className="relative flex-1 min-w-0 flex items-center min-h-[2.25rem] md:min-h-[2.5rem]">
          <p className="font-body relative z-[1] w-full truncate pr-12 md:pr-14 text-left text-[12px] md:text-[13px] font-[600] text-ink">
            {bill.name}
          </p>
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 font-body inline-flex items-center rounded-md border border-solid border-primary/40 bg-base px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-primary">
            Bill
          </span>
        </div>

        <div className="relative z-[1] flex-none text-right whitespace-nowrap">
          <p className="font-body text-[13px] md:text-[14px] font-[700] leading-tight text-alert">
            −{formatCurrency(displayAmount, "ILS")}
          </p>
          <p className="font-body mt-0.5 text-[8px] md:text-[9px] font-[500] text-[#999]">
            {formatDateTime(paidAt)}
          </p>
        </div>

        {billActionsEnabled ? (
          <div className="flex-none relative ml-0.5 md:ml-1">
            <button
              type="button"
              aria-label="Bill payment actions"
              disabled={isPending}
              onClick={() => setMenuBillPaymentId(menuBillPaymentId === bill.id ? null : bill.id)}
              className="w-5 md:w-6 h-5 md:h-6 flex items-center justify-center rounded-[5px] md:rounded-[6px] hover:bg-ink/5 active:scale-95 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" className="md:w-[16px] md:h-[16px]" fill="#111008">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>
            {menuBillPaymentId === bill.id && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuBillPaymentId(null)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <div className="absolute right-0 top-7 z-30 flex flex-col min-w-[110px] border-2 border-ink rounded-[10px] shadow-neo-sm bg-base overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuBillPaymentId(null);
                      isEditing ? setEditingBillPaymentId(null) : startEditBillPayment(bill);
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
                      setMenuBillPaymentId(null);
                      void revertBillPayment(bill.id);
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
        ) : (
          <div className="flex-none w-5 md:w-6 flex-shrink-0" aria-hidden />
        )}
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 pt-2 border-t border-ink/20">
          <p className="font-body flex-1 min-w-0 text-[10px] font-[600] text-ink/70">
            Amount only — does not change your recurring bill
          </p>
          <input
            type="number"
            inputMode="decimal"
            value={editBillPaymentAmount}
            onChange={(e) => setEditBillPaymentAmount(e.target.value)}
            placeholder="Amount"
            className="font-body w-24 text-[12px] px-2 py-1 border-2 border-ink rounded-[8px] bg-base text-right focus:outline-none focus:shadow-neo-xs"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => void saveBillPaymentEdit(bill.id)}
            className="font-body text-[11px] font-[700] uppercase px-2.5 py-1 border-2 border-ink rounded-[8px] bg-reward shadow-neo-xs active:shadow-none active:translate-y-[1px] disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setEditingBillPaymentId(null)}
            className="font-body text-[11px] font-[700] uppercase px-2.5 py-1 border-2 border-ink rounded-[8px] bg-base"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function TxListMergedRowTransaction({
  item,
  editingId,
  pendingId,
  menuId,
  editDesc,
  editAmount,
  setEditDesc,
  setEditAmount,
  setEditingId,
  setMenuId,
  startEdit,
  saveEdit,
  handleDelete,
  customCategoryColors,
}: {
  item: Extract<TxListMergedItem, { kind: "transaction" }>;
  editingId: string | null;
  pendingId: string | null;
  menuId: string | null;
  editDesc: string;
  editAmount: string;
  setEditDesc: (s: string) => void;
  setEditAmount: (s: string) => void;
  setEditingId: (id: string | null) => void;
  setMenuId: (id: string | null) => void;
  startEdit: (t: Transaction) => void;
  saveEdit: (id: string) => void | Promise<void>;
  handleDelete: (id: string) => void | Promise<void>;
  customCategoryColors?: Record<string, string>;
}) {
  const t = item.transaction;
  const meta = CATEGORY_META[t.category] ?? { label: t.category, color: customCategoryColors?.[t.category] ?? "#d4d4d4", icon: "📦" };
  const isExpense = t.type === "EXPENSE";
  const isEditing = editingId === t.id;
  const isPending = pendingId === t.id;

  return (
    <div className="flex flex-col gap-1.5 md:gap-2 border-2 border-dashed border-ink/60 rounded-[10px] md:rounded-[12px] px-2.5 md:px-3 py-1.5 md:py-2 bg-base">
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
                    void handleDelete(t.id);
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
            onClick={() => void saveEdit(t.id)}
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
}

export function TransactionsCard({
  transactions,
  bills = [],
  transactionsListMonth,
  transactionsListYear,
  onTransactionEdit,
  onTransactionDelete,
  onBillPaymentAmountEdit,
  onBillPaymentRevert,
  customCategoryColors,
}: {
  transactions: Transaction[];
  bills?: ApiBill[];
  transactionsListMonth: number;
  transactionsListYear: number;
  onTransactionEdit?: (id: string, patch: EditPatch) => Promise<void> | void;
  onTransactionDelete?: (id: string) => Promise<void> | void;
  onBillPaymentAmountEdit?: (billId: string, amount: number) => Promise<void> | void;
  onBillPaymentRevert?: (billId: string) => Promise<void> | void;
  customCategoryColors?: Record<string, string>;
}) {
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingBillPaymentId, setEditingBillPaymentId] = useState<string | null>(null);
  const [editBillPaymentAmount, setEditBillPaymentAmount] = useState("");
  const [pendingBillPaymentId, setPendingBillPaymentId] = useState<string | null>(null);
  const [menuBillPaymentId, setMenuBillPaymentId] = useState<string | null>(null);

  const billActionsEnabled = Boolean(onBillPaymentAmountEdit && onBillPaymentRevert);

  const merged = useMemo(
    () =>
      mergeTransactionsAndPaidBills(transactions, bills, transactionsListMonth, transactionsListYear),
    [transactions, bills, transactionsListMonth, transactionsListYear],
  );

  const cats = useMemo(() => mergedListCategories(merged), [merged]);
  const visible =
    txFilter === "all"
      ? merged
      : merged.filter((it) => mergedItemCategory(it) === txFilter);

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

  function startEditBillPayment(b: ApiBill) {
    setEditingBillPaymentId(b.id);
    setEditBillPaymentAmount(String(billPaymentDisplayAmount(b)));
  }

  async function saveBillPaymentEdit(billId: string) {
    const amount = parseFloat(editBillPaymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    setPendingBillPaymentId(billId);
    try {
      await onBillPaymentAmountEdit?.(billId, amount);
      setEditingBillPaymentId(null);
    } finally {
      setPendingBillPaymentId(null);
    }
  }

  async function revertBillPayment(billId: string) {
    if (!confirm("Remove this payment? The bill will show as unpaid again.")) return;
    setPendingBillPaymentId(billId);
    try {
      await onBillPaymentRevert?.(billId);
      setEditingBillPaymentId(null);
      setMenuBillPaymentId(null);
    } finally {
      setPendingBillPaymentId(null);
    }
  }

  return (
    <div className="h-full border-[2.5px] border-ink rounded-card shadow-neo-md bg-base overflow-hidden flex flex-col">
      <div className="flex-none flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-base">
        <h3 className="font-display font-black text-[14px] md:text-[16px] text-ink uppercase tracking-[1px]">
          Transactions
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col h-full px-2.5 md:px-3 pb-3">
          <div
            className="flex-none flex gap-2 overflow-x-auto pt-1 md:pt-2 pb-4 px-[5px] -mx-[5px]"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              type="button"
              onClick={() => setTxFilter("all")}
              className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                txFilter === "all" ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
              }`}
            >
              All
            </button>
            {cats.map((cat) => {
              const active = txFilter === cat;
              const label = CATEGORY_META[cat]?.label ?? String(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTxFilter(cat)}
                  className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                    active ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-1 flex flex-col gap-1.5 md:gap-2">
            {visible.length === 0 ? (
              <p className="font-body text-[11px] md:text-[12px] text-muted text-center py-4">
                {merged.length === 0
                  ? "No activity this month"
                  : "Nothing in this category"}
              </p>
            ) : (
              visible.map((item) =>
                item.kind === "bill_payment" ? (
                  <TxListMergedRowBill
                    key={`bill-payment:${item.bill.id}`}
                    item={item}
                    billActionsEnabled={billActionsEnabled}
                    editingBillPaymentId={editingBillPaymentId}
                    pendingBillPaymentId={pendingBillPaymentId}
                    menuBillPaymentId={menuBillPaymentId}
                    editBillPaymentAmount={editBillPaymentAmount}
                    setEditBillPaymentAmount={setEditBillPaymentAmount}
                    setEditingBillPaymentId={setEditingBillPaymentId}
                    setMenuBillPaymentId={setMenuBillPaymentId}
                    startEditBillPayment={startEditBillPayment}
                    saveBillPaymentEdit={saveBillPaymentEdit}
                    revertBillPayment={revertBillPayment}
                    customCategoryColors={customCategoryColors}
                  />
                ) : (
                  <TxListMergedRowTransaction
                    key={item.transaction.id}
                    item={item}
                    editingId={editingId}
                    pendingId={pendingId}
                    menuId={menuId}
                    editDesc={editDesc}
                    editAmount={editAmount}
                    setEditDesc={setEditDesc}
                    setEditAmount={setEditAmount}
                    setEditingId={setEditingId}
                    setMenuId={setMenuId}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    handleDelete={handleDelete}
                    customCategoryColors={customCategoryColors}
                  />
                ),
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillsCard({
  bills,
  onBillMarkPaid,
  onBillDelete,
  customCategoryColors,
}: {
  bills: ApiBill[];
  onBillMarkPaid?: (id: string) => Promise<void> | void;
  onBillDelete?: (id: string) => Promise<void> | void;
  customCategoryColors?: Record<string, string>;
}) {
  const [billFilter, setBillFilter] = useState<BillFilter>("all");
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<ApiBill | null>(null);

  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidThisMonthAmount = bills
    .filter((b) => paidThisMonth(b))
    .reduce((sum, b) => sum + billPaymentDisplayAmount(b), 0);
  const paidRatio = totalBillsAmount > 0 ? Math.min((paidThisMonthAmount / totalBillsAmount) * 100, 100) : 0;

  const filteredBills = useMemo(() => {
    const now = new Date();
    return bills.filter((b) => {
      const paidNow = paidThisMonth(b, now);
      if (billFilter === "all") return true;
      if (billFilter === "paid") return paidNow;
      if (billFilter === "upcoming") return !paidNow && new Date(b.dueDate) >= now;
      if (billFilter === "overdue") return !paidNow && new Date(b.dueDate) < now;
      return true;
    });
  }, [bills, billFilter]);

  const sortedBills = useMemo(() => {
    return [...filteredBills]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .sort((a, b) => Number(paidThisMonth(a)) - Number(paidThisMonth(b)))
      .sort((a, b) => {
        const ad = billDaysUntil(a.dueDate) < 0 && !paidThisMonth(a) ? -1 : 0;
        const bd = billDaysUntil(b.dueDate) < 0 && !paidThisMonth(b) ? -1 : 0;
        return ad - bd;
      });
  }, [filteredBills]);

  function startBillEdit(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    setEditingBill(bill);
    setBillModalOpen(true);
  }

  return (
    <>
      <div className="h-full border-[2.5px] border-ink rounded-card shadow-neo-md bg-base overflow-hidden flex flex-col">
        <div className="flex-none flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-base">
          <h3 className="font-display font-black text-[14px] md:text-[16px] text-ink uppercase tracking-[1px]">
            Bills
          </h3>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="w-full h-full px-3 md:px-4 py-1 md:py-2 flex flex-col overflow-hidden">
            {/* Sticky header area */}
            <div className="flex-none flex flex-col gap-2 md:gap-3 pb-2 bg-base">
              <div className="border-2 border-ink rounded-card shadow-neo-xs bg-base px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-income border border-ink" />
                      <span className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-ink">
                        Paid
                      </span>
                    </span>
                    <span className="font-body text-[10px] font-[800] text-ink">
                      {formatCurrency(paidThisMonthAmount, "ILS")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-primary border border-ink" />
                      <span className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-ink">
                        Total
                      </span>
                    </span>
                    <span className="font-body text-[10px] font-[800] text-ink">
                      {formatCurrency(totalBillsAmount, "ILS")}
                    </span>
                  </div>
                </div>

                <div className="mt-2 h-[12px] rounded-[30px] overflow-hidden relative bg-primary">
                  <div
                    className="absolute left-0 top-0 h-full bg-income"
                    style={{ width: `${paidRatio}%`, borderRadius: "27px 0 0 27px" }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBillModalOpen(true)}
                className="font-body w-full py-2.5 text-[12px] font-black uppercase tracking-[1.5px] text-primary border-2 border-dashed border-primary/50 rounded-[10px] active:bg-primary/5 transition-colors text-center"
              >
                + Add new bill
              </button>

              <div
                className="flex-none flex gap-2 overflow-x-auto pt-1 pb-2 px-[5px] -mx-[5px]"
                style={{ scrollbarWidth: "none" }}
              >
                {BILL_FILTERS.map((f) => {
                  const active = billFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setBillFilter(f.value)}
                      className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                        active ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable list only */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-3">
              {sortedBills.length === 0 ? (
                <p className="font-body text-[11px] md:text-[12px] text-muted text-center py-4">
                  No bills here.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {sortedBills.map((b) => (
                    <BillsPageBillRow
                      key={b.id}
                      bill={b}
                      onMarkPaid={onBillMarkPaid}
                      onEdit={startBillEdit}
                      onDelete={onBillDelete}
                      customCategoryColors={customCategoryColors}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddBillModal
        open={billModalOpen}
        initial={editingBill ?? undefined}
        onClose={() => {
          setBillModalOpen(false);
          setEditingBill(null);
        }}
      />
    </>
  );
}

export function BillsAndTransactionsCard({
  bills,
  transactions,
  transactionsListMonth,
  transactionsListYear,
  onTransactionEdit,
  onTransactionDelete,
  onBillMarkPaid,
  onBillDelete,
  onBillPaymentAmountEdit,
  onBillPaymentRevert,
  customCategoryColors,
}: {
  bills: ApiBill[];
  transactions: Transaction[];
  transactionsListMonth: number;
  transactionsListYear: number;
  onTransactionEdit?: (id: string, patch: EditPatch) => Promise<void> | void;
  onTransactionDelete?: (id: string) => Promise<void> | void;
  onBillMarkPaid?: (id: string) => Promise<void> | void;
  onBillDelete?: (id: string) => Promise<void> | void;
  onBillPaymentAmountEdit?: (billId: string, amount: number) => Promise<void> | void;
  onBillPaymentRevert?: (billId: string) => Promise<void> | void;
  customCategoryColors?: Record<string, string>;
}) {
  const [tab, setTab] = useState<"transactions" | "bills">("transactions");
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [billFilter, setBillFilter] = useState<BillFilter>("all");
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<ApiBill | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingBillPaymentId, setEditingBillPaymentId] = useState<string | null>(null);
  const [editBillPaymentAmount, setEditBillPaymentAmount] = useState("");
  const [pendingBillPaymentId, setPendingBillPaymentId] = useState<string | null>(null);
  const [menuBillPaymentId, setMenuBillPaymentId] = useState<string | null>(null);

  const billActionsEnabled = Boolean(onBillPaymentAmountEdit && onBillPaymentRevert);

  const mergedTx = useMemo(
    () =>
      mergeTransactionsAndPaidBills(transactions, bills, transactionsListMonth, transactionsListYear),
    [transactions, bills, transactionsListMonth, transactionsListYear],
  );

  const txCats = useMemo(() => mergedListCategories(mergedTx), [mergedTx]);
  const visibleTx =
    txFilter === "all"
      ? mergedTx
      : mergedTx.filter((it) => mergedItemCategory(it) === txFilter);

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

  function startEditBillPayment(b: ApiBill) {
    setEditingBillPaymentId(b.id);
    setEditBillPaymentAmount(String(billPaymentDisplayAmount(b)));
  }

  async function saveBillPaymentEdit(billId: string) {
    const amount = parseFloat(editBillPaymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    setPendingBillPaymentId(billId);
    try {
      await onBillPaymentAmountEdit?.(billId, amount);
      setEditingBillPaymentId(null);
    } finally {
      setPendingBillPaymentId(null);
    }
  }

  async function revertBillPayment(billId: string) {
    if (!confirm("Remove this payment? The bill will show as unpaid again.")) return;
    setPendingBillPaymentId(billId);
    try {
      await onBillPaymentRevert?.(billId);
      setEditingBillPaymentId(null);
      setMenuBillPaymentId(null);
    } finally {
      setPendingBillPaymentId(null);
    }
  }

  // Bills data
  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidThisMonthAmount = bills
    .filter((b) => paidThisMonth(b))
    .reduce((sum, b) => sum + billPaymentDisplayAmount(b), 0);
  const paidRatio = totalBillsAmount > 0 ? Math.min((paidThisMonthAmount / totalBillsAmount) * 100, 100) : 0;

  const filteredBills = useMemo(() => {
    const now = new Date();
    return bills.filter((b) => {
      const paidNow = paidThisMonth(b, now);
      if (billFilter === "all") return true;
      if (billFilter === "paid") return paidNow;
      if (billFilter === "upcoming") return !paidNow && new Date(b.dueDate) >= now;
      if (billFilter === "overdue") return !paidNow && new Date(b.dueDate) < now;
      return true;
    });
  }, [bills, billFilter]);

  const sortedBills = useMemo(() => {
    return [...filteredBills]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .sort((a, b) => Number(paidThisMonth(a)) - Number(paidThisMonth(b)))
      .sort((a, b) => {
        const ad = billDaysUntil(a.dueDate) < 0 && !paidThisMonth(a) ? -1 : 0;
        const bd = billDaysUntil(b.dueDate) < 0 && !paidThisMonth(b) ? -1 : 0;
        return ad - bd;
      });
  }, [filteredBills]);

  function startBillEdit(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    setEditingBill(bill);
    setBillModalOpen(true);
  }

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
        <div
          className="flex-1 min-h-0 no-scrollbar overflow-hidden"
        >
          {tab === "transactions" ? (
            <div className="w-full h-full px-2.5 md:px-3 py-1 md:py-2 flex flex-col overflow-hidden">
              <div
                className="flex-none flex gap-2 overflow-x-auto pt-0 pb-4 px-[5px] -mx-[5px]"
                style={{ scrollbarWidth: "none" }}
              >
                <button
                  type="button"
                  onClick={() => setTxFilter("all")}
                  className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                    txFilter === "all" ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
                  }`}
                >
                  All
                </button>
                {txCats.map((cat) => {
                  const active = txFilter === cat;
                  const label = CATEGORY_META[cat]?.label ?? String(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTxFilter(cat)}
                      className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                        active ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-1 pb-3 flex flex-col gap-1.5 md:gap-2">
                {visibleTx.length === 0 ? (
                  <p className="font-body text-[11px] md:text-[12px] text-muted text-center py-4">
                    {mergedTx.length === 0
                      ? "No activity this month"
                      : "Nothing in this category"}
                  </p>
                ) : (
                  visibleTx.map((item) =>
                    item.kind === "bill_payment" ? (
                      <TxListMergedRowBill
                        key={`bill-payment:${item.bill.id}`}
                        item={item}
                        billActionsEnabled={billActionsEnabled}
                        editingBillPaymentId={editingBillPaymentId}
                        pendingBillPaymentId={pendingBillPaymentId}
                        menuBillPaymentId={menuBillPaymentId}
                        editBillPaymentAmount={editBillPaymentAmount}
                        setEditBillPaymentAmount={setEditBillPaymentAmount}
                        setEditingBillPaymentId={setEditingBillPaymentId}
                        setMenuBillPaymentId={setMenuBillPaymentId}
                        startEditBillPayment={startEditBillPayment}
                        saveBillPaymentEdit={saveBillPaymentEdit}
                        revertBillPayment={revertBillPayment}
                        customCategoryColors={customCategoryColors}
                      />
                    ) : (
                      <TxListMergedRowTransaction
                        key={item.transaction.id}
                        item={item}
                        editingId={editingId}
                        pendingId={pendingId}
                        menuId={menuId}
                        editDesc={editDesc}
                        editAmount={editAmount}
                        setEditDesc={setEditDesc}
                        setEditAmount={setEditAmount}
                        setEditingId={setEditingId}
                        setMenuId={setMenuId}
                        startEdit={startEdit}
                        saveEdit={saveEdit}
                        handleDelete={handleDelete}
                        customCategoryColors={customCategoryColors}
                      />
                    ),
                  )
                )}
              </div>
            </div>
          ) : bills.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <p className="font-body text-[11px] md:text-[12px] text-muted">No bills yet</p>
            </div>
          ) : (
            <div className="w-full h-full px-3 md:px-4 py-1 md:py-2 flex flex-col overflow-hidden">
              {/* Sticky header area */}
              <div className="flex-none flex flex-col gap-2 md:gap-3 pb-2 bg-base">
                <div className="border-2 border-ink rounded-card shadow-neo-xs bg-base px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-income border border-ink" />
                        <span className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-ink">
                          Paid
                        </span>
                      </span>
                      <span className="font-body text-[10px] font-[800] text-ink">
                        {formatCurrency(paidThisMonthAmount, "ILS")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary border border-ink" />
                        <span className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-ink">
                          Total
                        </span>
                      </span>
                      <span className="font-body text-[10px] font-[800] text-ink">
                        {formatCurrency(totalBillsAmount, "ILS")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 h-[12px] rounded-[30px] overflow-hidden relative bg-primary">
                    <div
                      className="absolute left-0 top-0 h-full bg-income"
                      style={{ width: `${paidRatio}%`, borderRadius: "27px 0 0 27px" }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBillModalOpen(true)}
                  className="font-body w-full py-2.5 text-[12px] font-black uppercase tracking-[1.5px] text-primary border-2 border-dashed border-primary/50 rounded-[10px] active:bg-primary/5 transition-colors text-center"
                >
                  + Add new bill
                </button>

                <div
                  className="flex-none flex gap-2 overflow-x-auto pt-1 pb-2 px-[5px] -mx-[5px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  {BILL_FILTERS.map((f) => {
                    const active = billFilter === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setBillFilter(f.value)}
                        className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                          active ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable list only */}
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-3">
                {sortedBills.length === 0 ? (
                  <p className="font-body text-[11px] md:text-[12px] text-muted text-center py-4">
                    No bills here.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sortedBills.map((b) => (
                      <BillsPageBillRow
                        key={b.id}
                        bill={b}
                        onMarkPaid={onBillMarkPaid}
                        onEdit={startBillEdit}
                        onDelete={onBillDelete}
                        customCategoryColors={customCategoryColors}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddBillModal
        open={billModalOpen}
        initial={editingBill ?? undefined}
        onClose={() => {
          setBillModalOpen(false);
          setEditingBill(null);
        }}
      />
    </>
  );
}
