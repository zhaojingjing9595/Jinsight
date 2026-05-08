"use client";

import { useState, useEffect, useRef } from "react";
import { formatCurrency, CATEGORY_META, slugifyCustomCategory } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { MonthlyLineChart } from "@/components/MonthlyLineChart";
import { CategoryIcon } from "@/components/CategoryIcon";
import { trpcQuery } from "@/lib/api";

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

function getMonthRange(): { month: number; year: number; label: string; shortLabel: string }[] {
  const result = [];
  const now = new Date();
  for (let i = -11; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    result.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      shortLabel: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return result;
}

type CategoryGroup = {
  category: string;
  label: string;
  color: string;
  total: number;
  transactions: Transaction[];
};

function groupByCategory(transactions: Transaction[], customColorMap: Record<string, string> = {}): CategoryGroup[] {
  const map: Record<string, CategoryGroup> = {};
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    const meta = CATEGORY_META[t.category] ?? { label: t.category, color: customColorMap[t.category] ?? "#d4d4d4" };
    if (!map[t.category]) {
      map[t.category] = { category: t.category, label: meta.label, color: meta.color, total: 0, transactions: [] };
    }
    map[t.category].total += t.amount;
    map[t.category].transactions.push(t);
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function HistoryPage() {
  const twelveMonths = getMonthRange();
  const now = new Date();
  const currentMonthIdx = twelveMonths.findIndex(
    (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1,
  );

  const [selectedIdx, setSelectedIdx] = useState(currentMonthIdx);
  const pillsScrollRef = useRef<HTMLDivElement>(null);
  const [monthlyTransactions, setMonthlyTransactions] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [customColorMap, setCustomColorMap] = useState<Record<string, string>>({});

  // Center the current month pill once data is ready
  useEffect(() => {
    if (loading) return;
    const container = pillsScrollRef.current;
    if (!container) return;
    const pill = container.querySelectorAll("button")[currentMonthIdx] as HTMLElement | undefined;
    if (!pill) return;
    container.scrollLeft = pill.offsetLeft - container.offsetWidth / 2 + pill.offsetWidth / 2;
  }, [loading]);

  useEffect(() => {
    async function init() {
      try {
        const me = await trpcQuery<{ user: { accounts: { id: string }[] } }>("users.me");
        const acct = me.user.accounts?.[0];
        if (!acct) return;

        // Fetch custom categories separately
        try {
          const customCatsData = await trpcQuery<{ categories: { name: string; color: string }[] }>("categories.list", {});
          const colorMap: Record<string, string> = Object.fromEntries(
            customCatsData.categories.map((c) => [slugifyCustomCategory(c.name), c.color]),
          );
          setCustomColorMap(colorMap);
        } catch (err) {
          console.warn("Failed to load custom categories:", err);
          setCustomColorMap({});
        }

        await fetchAllMonths(acct.id);
      } catch (err) {
        console.error("History load error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchAllMonths(acctId: string) {
    const results = await Promise.all(
      twelveMonths.map((m) =>
        trpcQuery<{ transactions: ApiTransaction[] }>("transactions.list", {
          accountId: acctId,
          month: m.month,
          year: m.year,
          limit: 200,
        }).catch(() => ({ transactions: [] as ApiTransaction[] })),
      ),
    );
    const map: Record<string, Transaction[]> = {};
    twelveMonths.forEach((m, i) => {
      map[`${m.year}-${m.month}`] = results[i].transactions.map(toTransaction);
    });
    setMonthlyTransactions(map);

    // Default: current month categories expanded, past collapsed
    const defaults: Record<string, boolean> = {};
    const currentKey = `${twelveMonths[currentMonthIdx].year}-${twelveMonths[currentMonthIdx].month}`;
    const currentGroups = groupByCategory(map[currentKey] ?? [], customColorMap);
    currentGroups.forEach((g) => { defaults[`${currentKey}-${g.category}`] = true; });
    setExpandedCategories(defaults);
  }

  const selected = twelveMonths[selectedIdx];
  const selectedKey = `${selected.year}-${selected.month}`;
  const selectedTxns = monthlyTransactions[selectedKey] ?? [];
  const categoryGroups = groupByCategory(selectedTxns, customColorMap);

  const chartData = twelveMonths.map((m) => {
    const txns = monthlyTransactions[`${m.year}-${m.month}`] ?? [];
    const income = txns.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const spent = txns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    return { month: m.shortLabel, income, spent };
  });

  const selectedIncome = selectedTxns.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const selectedExpenses = selectedTxns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  function toggleCategory(key: string) {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[480px] mx-auto bg-base h-dvh">
        <div className="w-8 h-8 border-[3px] border-ink border-t-primary rounded-full animate-spin" />
        <p className="font-body text-[12px] text-muted mt-3">Loading history…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden max-w-[480px] mx-auto px-4 bg-base h-dvh gap-3 pt-4 pb-0">
      {/* Header */}
      <div className="flex-none">
        <h1 className="font-body text-[18px] font-black uppercase tracking-[2px] text-ink">History</h1>
      </div>

      {/* 12-Month Line Chart */}
      <div
        className="flex-none border-[2.5px] border-ink rounded-card shadow-neo-md bg-base px-3 pt-2 pb-1"
        style={{ height: "clamp(130px, 22dvh, 200px)" }}
      >
        <MonthlyLineChart months={chartData} selectedIdx={selectedIdx} />
      </div>

      {/* Month picker pills */}
      <div className="flex-none relative -mx-4">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #fcfaeb 40%, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #fcfaeb 40%, transparent)" }} />

        <div ref={pillsScrollRef} className="flex gap-1.5 px-4 overflow-x-auto no-scrollbar">
          {twelveMonths.map((m, i) => {
            const isSelected = i === selectedIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedIdx(i);
                  const key = `${m.year}-${m.month}`;
                  const groups = groupByCategory(monthlyTransactions[key] ?? [], customColorMap);
                  setExpandedCategories((prev) => {
                    const next = { ...prev };
                    groups.forEach((g) => {
                      const k = `${key}-${g.category}`;
                      if (!(k in next)) next[k] = true;
                    });
                    return next;
                  });
                }}
                className={`font-body flex-none px-3 py-1.5 rounded-full border-2 text-[11px] font-[700] uppercase tracking-[0.8px] transition-all active:scale-95 ${
                  isSelected
                    ? "border-ink bg-primary text-white shadow-neo-xs"
                    : "border-ink/30 bg-base text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {m.shortLabel} {m.year !== new Date().getFullYear() ? m.year : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected month summary */}
      <div className="flex-none flex items-center justify-between">
        <p className="font-body text-[11px] font-black uppercase tracking-[1.5px] text-ink">
          {selected.label}
        </p>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-income" />
            <span className="font-body text-[10px] font-[600] text-ink">{formatCurrency(selectedIncome, "ILS")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-alert" />
            <span className="font-body text-[10px] font-[600] text-ink">{formatCurrency(selectedExpenses, "ILS")}</span>
          </div>
        </div>
      </div>

      {/* Category-grouped transaction list */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto no-scrollbar border-[2.5px] border-ink rounded-card shadow-neo-md bg-base">
          {categoryGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="font-body text-[13px] font-bold text-muted">No expenses in {selected.label}</p>
            </div>
          ) : (
            <>
              {categoryGroups.map((group, groupIdx) => {
                const catKey = `${selectedKey}-${group.category}`;
                const isExpanded = expandedCategories[catKey] ?? false;
                const sortedTxns = [...group.transactions].sort(
                  (a, b) => b.date.getTime() - a.date.getTime(),
                );
                const isLast = groupIdx === categoryGroups.length - 1;

                return (
                  <div
                    key={group.category}
                    className={!isLast ? "border-b-[2px] border-ink/15" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(catKey)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-ink/5 transition-colors"
                    >
                      <div
                        className="flex-none w-8 h-8 rounded-[8px] border-2 border-ink flex items-center justify-center"
                        style={{ backgroundColor: group.color }}
                      >
                        <CategoryIcon category={group.category} size={16} strokeWidth={2} />
                      </div>
                      <span className="font-body flex-1 text-left text-[13px] font-[700] text-ink">
                        {group.label}
                      </span>
                      <span className="font-body text-[13px] font-[800] text-ink">
                        {formatCurrency(group.total, "ILS")}
                      </span>
                      <svg
                        viewBox="0 0 24 24" width="14" height="14"
                        fill="none" stroke="#111008" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`flex-none transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="flex flex-col border-t-[2px] border-ink/15">
                        {sortedTxns.map((t, i) => (
                          <div
                            key={t.id}
                            className={`flex items-center gap-2 px-3 py-2 bg-ink/[0.02] ${i < sortedTxns.length - 1 ? "border-b border-ink/10" : ""}`}
                          >
                            <p className="font-body flex-1 min-w-0 text-[12px] font-[500] text-ink truncate">
                              {t.description ?? group.label}
                            </p>
                            <p className="font-body text-[10px] text-muted flex-none">
                              {formatDate(t.date)}
                            </p>
                            <p className="font-body text-[12px] font-[700] text-alert flex-none">
                              {formatCurrency(t.amount, "ILS")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="flex-none h-[69px]" />
      <BottomNav active="history" />
    </div>
  );
}
