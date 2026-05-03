"use client";

import { useState, useEffect } from "react";
import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { ChartSection } from "@/components/ChartSection";
import { BillsAndTransactionsCard, BillsCard, TransactionsCard } from "@/components/BillsAndTransactionsCard";
import { BalanceEditModal } from "@/components/BalanceEditModal";
import { trpcQuery, trpcMutate } from "@/lib/api";

type ApiTransaction = {
  id: string;
  accountId: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string | null;
  date: string;
  isRecurring: boolean;
  createdAt: string;
};

function toTransaction(t: ApiTransaction): Transaction {
  return {
    ...t,
    category: t.category as Transaction["category"],
    date: new Date(t.date),
    createdAt: new Date(t.createdAt),
  };
}

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

type ApiBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurrence?: "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM";
  isRecurring?: boolean;
  isSubscription?: boolean;
  isPaid: boolean;
  lastPaidDate?: string | null;
  lastPaidAmount?: number | null;
  reminderDays?: number;
};

type ApiAccount = {
  id: string;
  balance: number;
  openingBalance: number | null;
  openingBalanceSources: { label: string; amount: number }[] | null;
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [balance, setBalance] = useState(0);
  const [openingBalance, setOpeningBalance] = useState<number | null>(null);
  const [bills, setBills] = useState<ApiBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);

  async function reloadBills() {
    const billsData = await trpcQuery<{ bills: ApiBill[] }>("bills.list", {});
    setBills(billsData.bills);
  }

  useEffect(() => {
    async function load() {
      try {
        const me = await trpcQuery<{
          user: { accounts: ApiAccount[] };
        }>("users.me");

        if (!me.user.accounts?.length) {
          setLoading(false);
          return;
        }

        const acct = me.user.accounts[0];
        setAccount(acct);
        setBalance(acct.balance);
        setOpeningBalance(acct.openingBalance ?? null);

        const [txData, billsData] = await Promise.all([
          trpcQuery<{ transactions: ApiTransaction[] }>("transactions.list", {
            accountId: acct.id,
            month: currentMonth,
            year: currentYear,
            limit: 50,
          }),
          trpcQuery<{ bills: ApiBill[] }>("bills.list", {}),
        ]);

        setTransactions(txData.transactions.map(toTransaction));
        setBills(billsData.bills);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const onAdded = () => load();
    const onBillChanged = () => load();
    window.addEventListener("jinsight:transaction-added", onAdded);
    window.addEventListener("jinsight:bill-changed", onBillChanged);
    return () => {
      window.removeEventListener("jinsight:transaction-added", onAdded);
      window.removeEventListener("jinsight:bill-changed", onBillChanged);
    };
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // If opening balance is set, derive current display balance from it
  const displayBalance = openingBalance != null
    ? openingBalance + totalIncome - totalExpenses
    : balance;

  const spentRatio = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;

  const categoryTotals = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce<Record<string, { amount: number; color: string; label: string }>>((acc, t) => {
      const meta = CATEGORY_META[t.category] ?? { color: "#d4d4d4", label: t.category };
      if (!acc[t.category]) {
        acc[t.category] = { amount: 0, color: meta.color, label: meta.label };
      }
      acc[t.category].amount += t.amount;
      return acc;
    }, {});

  const pieSlices = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[480px] mx-auto bg-base h-dvh">
        <div className="w-8 h-8 border-[3px] border-ink border-t-primary rounded-full animate-spin" />
        <p className="font-body text-[12px] text-muted mt-3">Loading your finances...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden max-w-[480px] md:max-w-[980px] mx-auto px-4 md:px-6 bg-base h-dvh gap-3 md:gap-4 pt-4 md:pt-6 pb-0">
      <div className="flex-none flex flex-col gap-3 md:gap-4 md:grid md:grid-cols-2">
        {/* ── Section 1: Balance + Income vs Spent (combined) ── */}
        <div className="border-[2.5px] border-ink rounded-card shadow-neo-lg px-4 md:px-5 py-3 md:py-4 flex flex-col gap-1.5 bg-primary">
          {/* Header row: label + edit button */}
          <div className="flex items-center justify-between">
            <p className="font-body text-[8px] md:text-[9px] font-bold uppercase tracking-[2.5px] text-white/80">
              Total Balance
            </p>
            <button
              type="button"
              onClick={() => setBalanceModalOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-pill bg-white/15 border border-white/30 hover:bg-white/25 transition-colors"
              aria-label="Edit balance"
            >
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              <span className="font-body text-[9px] font-bold uppercase tracking-[1px] text-white">Edit</span>
            </button>
          </div>

          {/* Balance */}
          <div className="flex flex-col items-center justify-start">
            <h1
              className="font-display font-bold leading-none text-white tracking-[0.01em]"
              style={{ fontSize: "clamp(28px, 4dvh, 48px)" }}
            >
              {formatCurrency(displayBalance, "ILS")}
            </h1>
          </div>

          {/* Income vs Spent bar */}
          <div className="flex flex-col gap-1 md:gap-1.5">
            {/* Legend */}
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-0.5 md:gap-1">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-sm bg-alert" />
                <span className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[1px] text-white">
                  Spent
                </span>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-sm bg-income" />
                <span className="font-body text-[7px] md:text-[8px] font-bold uppercase tracking-[1px] text-white">
                  Income
                </span>
              </div>
            </div>

            <div className="h-[12px] md:h-[14px] rounded-[30px] overflow-hidden relative bg-income">
              <div
                className="absolute left-0 top-0 h-full bg-alert"
                style={{ width: `${spentRatio}%`, borderRadius: "27px 0 0 27px" }}
              />
              <div
                className="absolute top-0 bottom-0 w-[2.5px] bg-transparent"
                style={{ left: `${spentRatio}%` }}
              />
            </div>

            <div className="flex justify-between items-center gap-1 text-[8px] md:text-[10px]">
              <p className="font-body font-semibold text-white leading-tight">
                {formatCurrency(totalExpenses, "ILS")}
              </p>
              <p className="font-body text-[7px] md:text-[9px] font-semibold text-white/90 whitespace-nowrap">
                {formatCurrency(totalIncome - totalExpenses, "ILS")} left
              </p>
              <p className="font-body font-semibold text-white leading-tight">
                {formatCurrency(totalIncome, "ILS")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Chart ── */}
        <div
          className="border-[2.5px] border-ink rounded-card shadow-neo-md px-3 md:px-4 pt-2 md:pt-3 pb-2 md:pb-3 flex flex-col bg-base"
          style={{ height: "clamp(170px, 22dvh, 240px)" }}
        >
          <div className="flex-1 min-h-0">
            <ChartSection
              title="Where It Went"
              slices={pieSlices}
              totalLabel={formatCurrency(totalExpenses, "ILS")}
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Bills & Transactions (tabbed card) ── */}
      <div className="flex-1 min-h-0">
        {/* Mobile: tabbed */}
        <div className="h-full md:hidden">
          <BillsAndTransactionsCard
            bills={bills}
            transactions={transactions}
            transactionsListMonth={currentMonth}
            transactionsListYear={currentYear}
            onTransactionEdit={async (id, patch) => {
              const { transaction } = await trpcMutate<{ transaction: ApiTransaction }>(
                "transactions.update",
                { id, description: patch.description ?? undefined, amount: patch.amount },
              );
              setTransactions((prev) =>
                prev.map((t) => (t.id === id ? toTransaction(transaction) : t)),
              );
            }}
            onTransactionDelete={async (id) => {
              await trpcMutate("transactions.delete", { id });
              setTransactions((prev) => prev.filter((t) => t.id !== id));
            }}
            onBillMarkPaid={async (id) => {
              await trpcMutate("bills.markPaid", { id });
              await reloadBills();
            }}
            onBillDelete={async (id) => {
              await trpcMutate("bills.delete", { id });
              await reloadBills();
            }}
            onBillPaymentAmountEdit={async (billId, amount) => {
              await trpcMutate("bills.updatePaymentAmount", { id: billId, amount });
              await reloadBills();
            }}
            onBillPaymentRevert={async (billId) => {
              await trpcMutate("bills.revertPayment", { id: billId });
              await reloadBills();
            }}
          />
        </div>

        {/* Desktop: split cards */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 h-full">
          <TransactionsCard
            bills={bills}
            transactions={transactions}
            transactionsListMonth={currentMonth}
            transactionsListYear={currentYear}
            onTransactionEdit={async (id, patch) => {
              const { transaction } = await trpcMutate<{ transaction: ApiTransaction }>(
                "transactions.update",
                { id, description: patch.description ?? undefined, amount: patch.amount },
              );
              setTransactions((prev) =>
                prev.map((t) => (t.id === id ? toTransaction(transaction) : t)),
              );
            }}
            onTransactionDelete={async (id) => {
              await trpcMutate("transactions.delete", { id });
              setTransactions((prev) => prev.filter((t) => t.id !== id));
            }}
            onBillPaymentAmountEdit={async (billId, amount) => {
              await trpcMutate("bills.updatePaymentAmount", { id: billId, amount });
              await reloadBills();
            }}
            onBillPaymentRevert={async (billId) => {
              await trpcMutate("bills.revertPayment", { id: billId });
              await reloadBills();
            }}
          />
          <BillsCard
            bills={bills}
            onBillMarkPaid={async (id) => {
              await trpcMutate("bills.markPaid", { id });
              await reloadBills();
            }}
            onBillDelete={async (id) => {
              await trpcMutate("bills.delete", { id });
              await reloadBills();
            }}
          />
        </div>
      </div>

      {/* Nav spacer — same gap as between cards, pushed down by nav height */}
      <div className="flex-none h-[69px]" />

      <BottomNav active="home" />

      {account && (
        <BalanceEditModal
          open={balanceModalOpen}
          onClose={() => setBalanceModalOpen(false)}
          accountId={account.id}
          currentBalance={balance}
          currentOpeningBalance={openingBalance}
          currentSources={account.openingBalanceSources}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          onSaved={(newBalance, newOpeningBalance, openingBalanceSources) => {
            setBalance(newBalance);
            setOpeningBalance(newOpeningBalance);
            setAccount((prev) =>
              prev
                ? {
                    ...prev,
                    balance: newBalance,
                    openingBalance: newOpeningBalance,
                    openingBalanceSources,
                  }
                : prev,
            );
          }}
        />
      )}
    </div>
  );
}
