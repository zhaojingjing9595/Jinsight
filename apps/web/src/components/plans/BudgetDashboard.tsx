"use client";

import { useState, useEffect, useCallback } from "react";
import { EXPENSE_CATEGORY_ORDER } from "@jinsight/core";
import type { Category, ExpenseCategory } from "@jinsight/core";
import { trpcQuery, trpcMutate } from "@/lib/api";
import { MonthSelector } from "./MonthSelector";
import { BudgetSummaryBar } from "./BudgetSummaryBar";
import { BudgetCategoryCard } from "./BudgetCategoryCard";
import { BudgetCategoryForm } from "./BudgetCategoryForm";

/* ── API response shapes ── */

type ApiBudgetCategory = {
  id: string;
  budgetId: string;
  category: string;
  limit: number;
};

type ApiBudget = {
  id: string;
  accountId: string;
  period: string;
  month: number;
  year: number;
  totalLimit: number | null;
  rollover: boolean;
  categories: ApiBudgetCategory[];
};

type ApiTransaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
};

/* ── Component ── */

const now = new Date();

export function BudgetDashboard() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [accountId, setAccountId] = useState<string | null>(null);
  const [budget, setBudget] = useState<ApiBudget | null>(null);
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    category: ExpenseCategory;
    limit: number;
  } | null>(null);

  const isCurrentOrFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);

  /* ── Data fetching ── */

  const load = useCallback(async () => {
    try {
      // Get account
      let accId = accountId;
      if (!accId) {
        const me = await trpcQuery<{
          user: { accounts: { id: string }[] };
        }>("users.me");
        if (!me.user.accounts?.length) {
          setLoading(false);
          return;
        }
        accId = me.user.accounts[0].id;
        setAccountId(accId);
      }

      // Fetch budget + transactions in parallel
      const [budgetData, txData] = await Promise.all([
        trpcQuery<{ budgets: ApiBudget[] }>("budgets.list", {
          accountId: accId,
          month,
          year,
        }),
        trpcQuery<{ transactions: ApiTransaction[] }>("transactions.list", {
          accountId: accId,
          month,
          year,
          type: "EXPENSE",
          limit: 100,
        }),
      ]);

      let currentBudget = budgetData.budgets[0] ?? null;

      // Auto-copy from previous month if no budget exists for this month
      if (!currentBudget && accId) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        try {
          const copied = await trpcMutate<{ budget: ApiBudget }>(
            "budgets.copyFromMonth",
            {
              accountId: accId,
              fromMonth: prevMonth,
              fromYear: prevYear,
              toMonth: month,
              toYear: year,
            },
          );
          if (copied.budget) {
            currentBudget = copied.budget;
          }
        } catch {
          // No previous month budget — that's fine
        }
      }

      setBudget(currentBudget);

      // Group expenses by category
      const spent: Record<string, number> = {};
      for (const tx of txData.transactions) {
        spent[tx.category] = (spent[tx.category] ?? 0) + tx.amount;
      }
      setSpentByCategory(spent);
    } catch (err) {
      console.error("Failed to load budget data:", err);
    } finally {
      setLoading(false);
    }
  }, [accountId, month, year]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Listen for transaction changes
  useEffect(() => {
    const onTxChange = () => load();
    window.addEventListener("jinsight:transaction-added", onTxChange);
    return () => window.removeEventListener("jinsight:transaction-added", onTxChange);
  }, [load]);

  /* ── Budget mutations ── */

  async function saveCategoryBudget(category: ExpenseCategory, limit: number) {
    if (!accountId) return;

    const existingCategories = (budget?.categories ?? []).map((c) => ({
      category: c.category,
      limit: c.limit,
    }));

    // Replace or add
    const idx = existingCategories.findIndex((c) => c.category === category);
    if (idx >= 0) {
      existingCategories[idx].limit = limit;
    } else {
      existingCategories.push({ category, limit });
    }

    await trpcMutate("budgets.upsert", {
      accountId,
      month,
      year,
      rollover: budget?.rollover ?? false,
      categories: existingCategories,
    });

    setFormOpen(false);
    setEditingCategory(null);
    load();
  }

  async function deleteCategoryBudget() {
    if (!accountId || !budget || !editingCategory) return;

    const remaining = budget.categories
      .filter((c) => c.category !== editingCategory.category)
      .map((c) => ({ category: c.category, limit: c.limit }));

    if (remaining.length === 0) {
      // Delete the whole budget
      await trpcMutate("budgets.delete", { id: budget.id });
    } else {
      await trpcMutate("budgets.upsert", {
        accountId,
        month,
        year,
        rollover: budget.rollover,
        categories: remaining,
      });
    }

    setFormOpen(false);
    setEditingCategory(null);
    load();
  }

  /* ── Render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="font-body text-[13px] font-bold text-muted animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  const categories = budget?.categories ?? [];
  const totalBudgeted = categories.reduce((s, c) => s + c.limit, 0);
  const totalSpent = categories.reduce(
    (s, c) => s + (spentByCategory[c.category] ?? 0),
    0,
  );
  const usedCats = categories.map((c) => c.category as ExpenseCategory);

  return (
    <div className="flex flex-col gap-3">
      <MonthSelector
        month={month}
        year={year}
        onChange={(m, y) => {
          setMonth(m);
          setYear(y);
        }}
      />

      {categories.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-[48px]">📊</span>
          <p className="font-body text-[14px] font-bold text-muted text-center">
            No budget set for this month
          </p>
          {isCurrentOrFuture && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setFormOpen(true);
              }}
              className="font-body mt-2 px-5 py-2.5 text-[12px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-primary text-white shadow-neo-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Set Your First Budget
            </button>
          )}
        </div>
      ) : (
        <>
          <BudgetSummaryBar
            totalBudgeted={totalBudgeted}
            totalSpent={totalSpent}
          />

          <div className="flex flex-col gap-2.5">
            {categories.map((cat) => (
              <BudgetCategoryCard
                key={cat.category}
                category={cat.category as Category}
                limit={cat.limit}
                spent={spentByCategory[cat.category] ?? 0}
                readOnly={!isCurrentOrFuture}
                onEdit={() => {
                  setEditingCategory({
                    category: cat.category as ExpenseCategory,
                    limit: cat.limit,
                  });
                  setFormOpen(true);
                }}
              />
            ))}
          </div>

          {/* Add another category */}
          {isCurrentOrFuture && usedCats.length < EXPENSE_CATEGORY_ORDER.length && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setFormOpen(true);
              }}
              className="font-body w-full py-2.5 text-[12px] font-black uppercase tracking-[1.5px] text-primary border-2 border-dashed border-primary/50 rounded-[10px] active:bg-primary/5 transition-colors"
            >
              + Add Category
            </button>
          )}
        </>
      )}

      {/* Category form sheet */}
      {formOpen && (
        <BudgetCategoryForm
          initial={editingCategory ?? undefined}
          usedCategories={usedCats}
          onSave={saveCategoryBudget}
          onDelete={editingCategory ? deleteCategoryBudget : undefined}
          onClose={() => {
            setFormOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
