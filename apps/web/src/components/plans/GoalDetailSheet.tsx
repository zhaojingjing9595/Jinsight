"use client";

import { useState, useEffect, useCallback } from "react";
import {
  formatCurrency,
  GOAL_TYPE_META,
  GOAL_STATUS_META,
  computeGoalProgress,
  getGoalHealthStatus,
} from "@jinsight/core";
import type { Goal, GoalStatus, SpendingPlanItem } from "@jinsight/core";
import { trpcQuery, trpcMutate } from "@/lib/api";
import { GoalStatusChip } from "./GoalStatusChip";
import { NumPad } from "@/components/NumPad";

/* ── Types ── */

type ApiTransaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string | null;
  date: string;
};

type GoalDetailSheetProps = {
  goal: Goal;
  onClose: () => void;
  onUpdated: () => void;
};

type Tab = "overview" | "spending" | "transactions";

const TRIP_CATEGORIES = ["Flights", "Hotel", "Food", "Activities", "Shopping", "Transport", "Other"];

/* ── Sub-components ── */

function ProgressRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const color = percent >= 100 ? "#2ad2a3" : percent >= 60 ? "#cce972" : "#a57dee";

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e5e0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500"
      />
    </svg>
  );
}

/* ── Main Component ── */

export function GoalDetailSheet({ goal: initialGoal, onClose, onUpdated }: GoalDetailSheetProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [tab, setTab] = useState<Tab>("overview");
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Edit states
  const [editing, setEditing] = useState<"name" | "target" | "saved" | "date" | null>(null);
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(String(goal.targetAmount));
  const [editSaved, setEditSaved] = useState(String(goal.savedAmount));
  const [editDate, setEditDate] = useState(goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : "");

  // Log expense states
  const [logOpen, setLogOpen] = useState(false);
  const [logAmount, setLogAmount] = useState("0");
  const [logCategory, setLogCategory] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logSaving, setLogSaving] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isTripEvent = goal.type === "TRIP_EVENT";
  const progress = computeGoalProgress(goal);
  const health = getGoalHealthStatus(progress);
  const spendingPlan: SpendingPlanItem[] = (goal.spendingPlan as SpendingPlanItem[] | null) ?? [];

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    ...(isTripEvent ? [{ id: "spending" as Tab, label: "Spending" }] : []),
    { id: "transactions", label: "History" },
  ];

  /* ── Data loading ── */

  const loadAccount = useCallback(async () => {
    try {
      const me = await trpcQuery<{ user: { accounts: { id: string }[] } }>("users.me");
      const accId = me.user.accounts?.[0]?.id ?? null;
      setAccountId(accId);
      return accId;
    } catch {
      return null;
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    let accId = accountId;
    if (!accId) accId = await loadAccount();
    if (!accId) return;

    setLoadingTx(true);
    try {
      const data = await trpcQuery<{ transactions: ApiTransaction[] }>("transactions.list", {
        accountId: accId,
        goalId: goal.id,
        limit: 100,
      });
      setTransactions(data.transactions);
    } catch (err) {
      console.error("Failed to load goal transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  }, [accountId, goal.id, loadAccount]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    if (tab === "transactions" || tab === "spending") {
      loadTransactions();
    }
  }, [tab, loadTransactions]);

  /* ── Mutations ── */

  async function updateGoal(fields: Record<string, unknown>) {
    try {
      const data = await trpcMutate<{ goal: Goal }>("goals.update", { id: goal.id, ...fields });
      setGoal(data.goal);
      setEditing(null);
      onUpdated();
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  }

  async function deleteGoal() {
    try {
      await trpcMutate("goals.delete", { id: goal.id });
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  }

  async function markComplete() {
    await updateGoal({ status: "COMPLETE" as GoalStatus });
  }

  async function logExpense() {
    if (!accountId || logSaving) return;
    const amount = parseFloat(logAmount) || 0;
    if (amount <= 0) return;

    setLogSaving(true);
    try {
      await trpcMutate("transactions.create", {
        accountId,
        amount,
        type: "EXPENSE",
        category: logCategory || "other",
        description: logDesc || undefined,
        date: new Date().toISOString(),
        goalId: goal.id,
        excludeFromBudget: true,
      });

      // Update spending plan actuals if trip/event
      if (isTripEvent && logCategory && spendingPlan.length > 0) {
        const updatedPlan = spendingPlan.map((item) =>
          item.category === logCategory
            ? { ...item, actual: item.actual + amount }
            : item,
        );
        await trpcMutate("goals.update", {
          id: goal.id,
          spendingPlan: updatedPlan,
        });
        setGoal((prev) => ({ ...prev, spendingPlan: updatedPlan }));
      }

      window.dispatchEvent(new CustomEvent("jinsight:transaction-added"));
      setLogOpen(false);
      setLogAmount("0");
      setLogCategory("");
      setLogDesc("");
      loadTransactions();
      onUpdated();
    } catch (err) {
      console.error("Failed to log expense:", err);
    } finally {
      setLogSaving(false);
    }
  }

  /* ── Inline edit helpers ── */

  function handleEditSave() {
    switch (editing) {
      case "name":
        if (editName.trim()) updateGoal({ name: editName.trim() });
        break;
      case "target": {
        const val = parseFloat(editTarget) || 0;
        if (val > 0) updateGoal({ targetAmount: val });
        break;
      }
      case "saved": {
        const val = parseFloat(editSaved) || 0;
        updateGoal({ savedAmount: val });
        break;
      }
      case "date":
        updateGoal({ endDate: editDate ? new Date(editDate).toISOString() : null });
        break;
    }
  }

  /* ── Computed spending totals ── */

  const totalSpent = transactions.reduce((s, tx) => s + tx.amount, 0);
  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-base animate-[slideUp_200ms_cubic-bezier(0.2,0.8,0.2,1)]"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[480px] mx-auto flex flex-col h-dvh">
        {/* ── Header ── */}
        <div className="flex-none px-4 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs font-body font-bold text-[14px] text-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              ←
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-[24px]">{goal.emoji}</span>
              {editing === "name" ? (
                <div className="flex-1 flex gap-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border-2 border-ink rounded-[6px] bg-base font-body text-[14px] font-bold text-ink focus:outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={handleEditSave} className="font-body text-[11px] font-bold text-primary px-2">Save</button>
                  <button type="button" onClick={() => setEditing(null)} className="font-body text-[11px] font-bold text-muted px-1">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setEditing("name")} className="text-left flex-1 min-w-0">
                  <p className="font-display font-black text-[20px] text-ink truncate">{goal.name}</p>
                </button>
              )}
            </div>
            <GoalStatusChip health={health} />
          </div>
          <div className="flex items-center gap-2 mt-1 ml-12">
            <span className="font-body text-[10px] font-bold text-muted uppercase tracking-[1px]">
              {GOAL_TYPE_META[goal.type].label}
            </span>
            <span
              className="inline-flex items-center px-2 py-[2px] border-[1.5px] border-ink rounded-[20px] font-body text-[9px] font-bold"
              style={{ backgroundColor: GOAL_STATUS_META[goal.status].color }}
            >
              {GOAL_STATUS_META[goal.status].label}
            </span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex-none flex gap-1.5 px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 border-[1.5px] border-ink rounded-[8px] font-body text-[10px] font-black uppercase tracking-[1px] transition-all ${
                tab === t.id ? "bg-primary text-white shadow-neo-xs" : "bg-base text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[100px]">
          {/* ═══ OVERVIEW TAB ═══ */}
          {tab === "overview" && (
            <div className="flex flex-col gap-4 pt-2">
              {/* Saving progress ring + amounts */}
              <div className="flex items-center gap-4 p-4 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md">
                <div className="relative flex-none">
                  <ProgressRing percent={progress.percentComplete} size={88} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-black text-[18px] text-ink">
                      {Math.round(progress.percentComplete)}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {/* Saved amount — editable */}
                  {editing === "saved" ? (
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">Saved</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={editSaved}
                          onChange={(e) => setEditSaved(e.target.value)}
                          className="w-[100px] px-2 py-1 border-2 border-ink rounded-[6px] bg-[#fff9e6] font-display font-black text-[16px] text-ink focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={handleEditSave} className="font-body text-[10px] font-bold text-primary px-1">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="font-body text-[10px] font-bold text-muted px-1">X</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setEditing("saved")} className="text-left">
                      <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">Saved</p>
                      <p className="font-display font-black text-[22px] text-ink leading-tight">
                        {formatCurrency(goal.savedAmount, "ILS")}
                      </p>
                    </button>
                  )}

                  {/* Target amount — editable */}
                  {editing === "target" ? (
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">Target</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={editTarget}
                          onChange={(e) => setEditTarget(e.target.value)}
                          className="w-[100px] px-2 py-1 border-2 border-ink rounded-[6px] bg-[#fff9e6] font-display font-black text-[16px] text-ink focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={handleEditSave} className="font-body text-[10px] font-bold text-primary px-1">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="font-body text-[10px] font-bold text-muted px-1">X</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setEditing("target")} className="text-left">
                      <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">Target</p>
                      <p className="font-body text-[13px] font-bold text-muted">
                        {formatCurrency(goal.targetAmount, "ILS")}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {/* Monthly needed + target date */}
              <div className="grid grid-cols-2 gap-2.5">
                {progress.monthlyNeeded !== null && progress.monthlyNeeded > 0 && !progress.isComplete && (
                  <div className="p-3 border-2 border-ink rounded-[12px] bg-[#a57dee]/10">
                    <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-primary mb-0.5">Monthly Needed</p>
                    <p className="font-display font-black text-[18px] text-ink">
                      {formatCurrency(progress.monthlyNeeded, "ILS")}
                    </p>
                  </div>
                )}
                <div className="p-3 border-2 border-ink rounded-[12px] bg-base">
                  {editing === "date" ? (
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted">Target Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-1 py-0.5 border-2 border-ink rounded-[4px] bg-base font-body text-[11px] focus:outline-none"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button type="button" onClick={handleEditSave} className="font-body text-[10px] font-bold text-primary">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="font-body text-[10px] font-bold text-muted">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setEditing("date")} className="text-left w-full">
                      <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted mb-0.5">Target Date</p>
                      <p className="font-display font-black text-[18px] text-ink">
                        {goal.endDate
                          ? new Date(goal.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "No deadline"}
                      </p>
                      {progress.monthsRemaining !== null && progress.monthsRemaining > 0 && (
                        <p className="font-body text-[10px] text-muted">{progress.monthsRemaining} months left</p>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Remaining */}
              <div className="p-3 border-2 border-ink rounded-[12px] bg-[#cce972]/15">
                <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-[#4a6000] mb-0.5">Remaining</p>
                <p className="font-display font-black text-[22px] text-ink">
                  {formatCurrency(progress.remaining, "ILS")}
                </p>
              </div>
            </div>
          )}

          {/* ═══ SPENDING TAB (Trip/Event only) ═══ */}
          {tab === "spending" && isTripEvent && (
            <div className="flex flex-col gap-3 pt-2">
              {/* Total spent vs budget */}
              <div className="p-3.5 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-body text-[10px] font-bold uppercase tracking-[1.5px] text-muted">Trip Spending</p>
                  <p className="font-body text-[11px] font-bold text-muted">
                    {formatCurrency(totalSpent, "ILS")} / {formatCurrency(goal.targetAmount, "ILS")}
                  </p>
                </div>
                <div className="h-[10px] rounded-[30px] border-[1.5px] border-ink overflow-hidden bg-[#f5f5f0]">
                  <div
                    className="h-full rounded-[30px] transition-all duration-300"
                    style={{
                      width: `${Math.min((totalSpent / goal.targetAmount) * 100, 100)}%`,
                      backgroundColor: totalSpent > goal.targetAmount ? "#fc524f" : "#2ad2a3",
                    }}
                  />
                </div>
              </div>

              {/* Category breakdown */}
              {spendingPlan.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="font-body text-[11px] font-bold uppercase tracking-[2px] text-muted">By Category</p>
                  {spendingPlan.map((item) => {
                    const actual = spentByCategory[item.category] ?? item.actual;
                    const pct = item.budget > 0 ? (actual / item.budget) * 100 : 0;
                    const barColor = pct >= 100 ? "#fc524f" : pct >= 75 ? "#feb704" : "#2ad2a3";

                    return (
                      <div key={item.category} className="p-2.5 border-2 border-ink rounded-[10px] bg-base">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-body text-[12px] font-bold text-ink">{item.category}</span>
                          <span className="font-body text-[11px] font-bold text-ink">
                            {formatCurrency(actual, "ILS")}
                            <span className="text-muted"> / {formatCurrency(item.budget, "ILS")}</span>
                          </span>
                        </div>
                        <div className="h-[8px] rounded-[30px] border-[1.5px] border-ink overflow-hidden bg-[#f5f5f0]">
                          <div
                            className="h-full rounded-[30px] transition-all duration-300"
                            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                          />
                        </div>
                        <p className="font-body text-[9px] font-bold mt-0.5" style={{ color: barColor }}>
                          {Math.round(pct)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <p className="font-body text-[12px] text-muted text-center">No spending breakdown set up yet.</p>
                  <p className="font-body text-[10px] text-muted text-center">
                    Expenses logged to this goal will still appear in History.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══ TRANSACTIONS TAB ═══ */}
          {tab === "transactions" && (
            <div className="flex flex-col gap-2.5 pt-2">
              {loadingTx ? (
                <p className="font-body text-[13px] font-bold text-muted animate-pulse text-center py-8">Loading...</p>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <span className="text-[32px]">📝</span>
                  <p className="font-body text-[12px] text-muted text-center">
                    No transactions logged for this goal yet.
                  </p>
                  <p className="font-body text-[10px] text-muted text-center">
                    Tap &quot;+ Log Expense&quot; below to record spending.
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-2.5 p-2.5 border-2 border-ink rounded-[10px] bg-base">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[12px] font-bold text-ink truncate">
                        {tx.description || tx.category}
                      </p>
                      <p className="font-body text-[10px] text-muted">
                        {tx.category} &middot; {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <p className="font-display font-black text-[16px] text-alert flex-none">
                      -{formatCurrency(tx.amount, "ILS")}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-[101]">
          <div className="max-w-[480px] mx-auto px-4 pb-5 pt-2 bg-base border-t-2 border-ink/10">
            {/* Log expense form (expandable) */}
            {logOpen && (
              <div className="mb-3 p-3 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md animate-[slideUp_150ms_ease-out]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display font-black text-[16px] text-ink uppercase tracking-[0.5px]">
                    Log Expense
                  </p>
                  <button
                    type="button"
                    onClick={() => setLogOpen(false)}
                    className="font-body text-[12px] font-bold text-muted"
                  >
                    Cancel
                  </button>
                </div>

                {/* Category picker for trip goals */}
                {isTripEvent && spendingPlan.length > 0 && (
                  <div className="mb-2">
                    <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {spendingPlan.map((item) => (
                        <button
                          key={item.category}
                          type="button"
                          onClick={() => setLogCategory(item.category)}
                          className={`px-2.5 py-1 border-[1.5px] border-ink rounded-[20px] font-body text-[10px] font-bold transition-all ${
                            logCategory === item.category
                              ? "bg-primary text-white"
                              : "bg-base text-ink"
                          }`}
                        >
                          {item.category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Non-trip: free text category */}
                {(!isTripEvent || spendingPlan.length === 0) && (
                  <div className="mb-2">
                    <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {TRIP_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setLogCategory(c)}
                          className={`px-2.5 py-1 border-[1.5px] border-ink rounded-[20px] font-body text-[10px] font-bold transition-all ${
                            logCategory === c ? "bg-primary text-white" : "bg-base text-ink"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-2">
                  <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">
                    Description
                  </label>
                  <input
                    type="text"
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    placeholder="What was this for?"
                    className="w-full px-2.5 py-1.5 border-2 border-ink rounded-[6px] bg-base font-body text-[12px] text-ink placeholder:text-muted/50 focus:outline-none"
                  />
                </div>

                <div className="mb-2">
                  <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">
                    Amount
                  </label>
                  <div className="border-2 border-ink rounded-[10px] py-2 flex flex-col items-center bg-[#fff9e6]">
                    <p className="font-display font-black text-[22px] text-ink">
                      {formatCurrency(parseFloat(logAmount) || 0, "ILS")}
                    </p>
                  </div>
                </div>
                <NumPad value={logAmount} onChange={setLogAmount} />

                <button
                  type="button"
                  onClick={logExpense}
                  disabled={(parseFloat(logAmount) || 0) <= 0 || logSaving}
                  className="font-body w-full mt-2 py-2.5 text-[12px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-alert text-white shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
                >
                  {logSaving ? "Saving..." : "Log Expense"}
                </button>
              </div>
            )}

            {/* Main action buttons */}
            {!logOpen && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLogOpen(true)}
                  className="font-body flex-1 py-2.5 text-[12px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-income text-ink shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  + Log Expense
                </button>
                {goal.status !== "COMPLETE" && (
                  <button
                    type="button"
                    onClick={markComplete}
                    className="font-body flex-none px-4 py-2.5 text-[11px] font-black uppercase tracking-[1px] border-[2.5px] border-ink rounded-[10px] bg-goal text-ink shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    Complete
                  </button>
                )}
                {confirmDelete ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={deleteGoal}
                      className="font-body flex-none px-3 py-2.5 text-[10px] font-black uppercase tracking-[1px] border-[2.5px] border-ink rounded-[10px] bg-alert text-white shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="font-body flex-none px-3 py-2.5 text-[10px] font-black uppercase tracking-[1px] border-2 border-ink rounded-[10px] bg-base text-ink"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="font-body flex-none px-3 py-2.5 text-[11px] font-black uppercase tracking-[1px] border-[2.5px] border-ink rounded-[10px] bg-alert text-white shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
