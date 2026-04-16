"use client";

import { useState, useEffect } from "react";
import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { ChartSection } from "@/components/ChartSection";
import { TransactionHistory } from "@/components/TransactionHistory";
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
const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await trpcQuery<{
          user: { accounts: { id: string; balance: number }[] };
        }>("users.me");

        if (!me.user.accounts?.length) {
          setLoading(false);
          return;
        }

        const account = me.user.accounts[0];
        setBalance(account.balance);

        const txData = await trpcQuery<{ transactions: ApiTransaction[] }>(
          "transactions.list",
          {
            accountId: account.id,
            month: currentMonth,
            year: currentYear,
            limit: 50,
          },
        );

        setTransactions(txData.transactions.map(toTransaction));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const onAdded = () => load();
    window.addEventListener("jinsight:transaction-added", onAdded);
    return () => window.removeEventListener("jinsight:transaction-added", onAdded);
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthBalance = totalIncome - totalExpenses;
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

  const monthlyData = [
    {
      month: now.toLocaleDateString("en-US", { month: "short" }),
      income: totalIncome,
      spent: totalExpenses,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[480px] mx-auto bg-base h-dvh">
        <div className="w-8 h-8 border-[3px] border-ink border-t-primary rounded-full animate-spin" />
        <p className="font-body text-[12px] text-muted mt-3">Loading your finances...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden max-w-[480px] mx-auto px-4 bg-base h-dvh">
      {/* ── Section 1: Balance hero (~18 dvh) ── */}
      <div className="min-h-0 flex flex-col pt-8 pb-3" style={{ flex: "0 0 18dvh" }}>
        <div className="flex-1 border-[2.5px] border-ink rounded-[18px] shadow-neo-lg px-5 flex flex-col items-center justify-center text-center bg-reward">
          <p className="font-body text-[9px] font-bold uppercase tracking-[2.5px] mb-1 text-reward-dark">
            {monthLabel} · Current Balance
          </p>
          <h1
            className="font-display font-medium leading-none text-ink tracking-[0.01em]"
            style={{ fontSize: "clamp(34px, 5.5dvh, 56px)" }}
          >
            {formatCurrency(monthBalance, "ILS")}
          </h1>
          <p className="font-body text-[10px] font-medium mt-1 text-reward-dark">
            Income minus spending this month
          </p>
        </div>
      </div>

      {/* ── Section 2: Income vs Spent bar (~12 dvh) ── */}
      <div className="min-h-0 flex flex-col pb-3" style={{ flex: "0 0 12dvh" }}>
        <div className="flex-1 border-[2.5px] border-ink rounded-card shadow-neo-md px-4 py-2 flex flex-col justify-center gap-1.5 bg-base">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-alert">
                Spent
              </p>
              <p
                className="font-display font-medium leading-none text-ink tracking-[0.01em]"
                style={{ fontSize: "clamp(16px, 2.5dvh, 22px)" }}
              >
                {formatCurrency(totalExpenses, "ILS")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-income">
                Income
              </p>
              <p
                className="font-display font-medium leading-none text-ink tracking-[0.01em]"
                style={{ fontSize: "clamp(16px, 2.5dvh, 22px)" }}
              >
                {formatCurrency(totalIncome, "ILS")}
              </p>
            </div>
          </div>

          <div>
            <div className="h-[20px] rounded-[30px] border-[2px] border-ink overflow-hidden relative bg-income">
              <div
                className="absolute left-0 top-0 h-full bg-alert"
                style={{ width: `${spentRatio}%`, borderRadius: "28px 0 0 28px" }}
              />
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-ink"
                style={{ left: `${spentRatio}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="font-body text-[9px] font-semibold text-income-dark">
                {formatCurrency(totalIncome - totalExpenses, "ILS")} left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Chart (fixed) ── */}
      <div
        className="flex-none border-[2.5px] border-ink rounded-card shadow-neo-md px-4 pt-3 pb-2 flex flex-col bg-base mb-3"
        style={{ height: "clamp(220px, 38dvh, 320px)" }}
      >
        <div className="flex-1 min-h-0">
          <ChartSection
            title="Where It Went"
            slices={pieSlices}
            totalLabel={formatCurrency(totalExpenses, "ILS")}
            monthlyData={monthlyData}
          />
        </div>
      </div>

      {/* ── Section 4: Transaction history (card scrolls internally) ── */}
      <div className="flex-1 min-h-0 pb-[calc(80px+16px)]">
        <TransactionHistory
          transactions={transactions}
          onEdit={async (id, patch) => {
            const { transaction } = await trpcMutate<{ transaction: ApiTransaction }>(
              "transactions.update",
              { id, description: patch.description ?? undefined, amount: patch.amount },
            );
            setTransactions((prev) =>
              prev.map((t) => (t.id === id ? toTransaction(transaction) : t)),
            );
          }}
          onDelete={async (id) => {
            await trpcMutate("transactions.delete", { id });
            setTransactions((prev) => prev.filter((t) => t.id !== id));
          }}
        />
      </div>

      <BottomNav active="home" />
    </div>
  );
}
