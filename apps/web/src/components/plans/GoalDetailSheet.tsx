"use client";

import { useState, useEffect, useCallback } from "react";
import {
  formatCurrency,
  GOAL_TYPE_META,
  GOAL_STATUS_META,
  computeGoalProgress,
  getGoalHealthStatus,
} from "@jinsight/core";
import type { Goal, GoalMilestone, SpendingPlanItem } from "@jinsight/core";
import { trpcQuery, trpcMutate } from "@/lib/api";
import { formatLocalDateKey, dateKeyToUtcDatetimeISO } from "@/lib/dates";
import { GoalStatusChip } from "./GoalStatusChip";
import { NumPad } from "@/components/NumPad";
import { DropdownMenu } from "@/components/DropdownMenu";

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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e5e0" strokeWidth={stroke} />
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

/* ── Monthly Breakdown Tab ── */

function MonthlyTab({
  goal,
  milestones,
  onMilestonesChanged,
  addOpen,
  setAddOpen,
  onDebtAchieved,
  resetLoading,
}: {
  goal: Goal;
  milestones: GoalMilestone[];
  onMilestonesChanged: () => void;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
  onDebtAchieved?: (milestoneId: string, amount: number, year: number, month: number) => void;
  resetLoading?: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [addYear, setAddYear] = useState(new Date().getFullYear());
  const [addMonth, setAddMonth] = useState(new Date().getMonth() + 1);
  const [addAmount, setAddAmount] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  const existingKeys = new Set(milestones.map((m) => `${m.year}-${m.month}`));

  async function handleMarkAchieved(id: string, isAchieved: boolean) {
    // For debt goals, show confirmation popup instead of immediately marking
    if (!isAchieved && goal.type === "DEBT") {
      const milestone = milestones.find((m) => m.id === id);
      if (milestone && onDebtAchieved) {
        onDebtAchieved(id, milestone.amount, milestone.year, milestone.month);
        return;
      }
    }

    // For all other cases, mark immediately
    setLoadingId(id);
    try {
      const proc = isAchieved ? "goalMilestones.unmarkAchieved" : "goalMilestones.markAchieved";
      await trpcMutate(proc, { id });
      await onMilestonesChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSaveAmount(id: string) {
    const val = parseFloat(editAmount);
    if (isNaN(val) || val < 0) return;
    setLoadingId(id);
    try {
      await trpcMutate("goalMilestones.updateAmount", { id, amount: val });
      setEditingId(null);
      onMilestonesChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    setLoadingId(id);
    try {
      await trpcMutate("goalMilestones.delete", { id });
      setMenuOpenId(null);
      onMilestonesChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAddMilestone() {
    const val = parseFloat(addAmount);
    if (isNaN(val) || val < 0) return;
    setAddSaving(true);
    try {
      await trpcMutate("goalMilestones.create", {
        goalId: goal.id,
        year: addYear,
        month: addMonth,
        amount: val,
      });
      setAddOpen(false);
      setAddAmount("");
      onMilestonesChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setAddSaving(false);
    }
  }

  const milestoneModal = addOpen && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setAddOpen(false)}
        className="absolute inset-0 bg-ink/40 cursor-default"
      />
      <div className="relative z-10 w-full max-w-[340px]">
        <AddMonthForm
          existingKeys={existingKeys}
          addYear={addYear}
          addMonth={addMonth}
          addAmount={addAmount}
          saving={addSaving}
          onYearChange={setAddYear}
          onMonthChange={setAddMonth}
          onAmountChange={setAddAmount}
          onSave={handleAddMilestone}
          onCancel={() => setAddOpen(false)}
        />
      </div>
    </div>
  );

  if (milestones.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center py-10 gap-3">
          <span className="text-[32px]">📅</span>
          <p className="font-body text-[13px] font-bold text-muted text-center">
            No monthly breakdown yet.
          </p>
          <p className="font-body text-[11px] text-muted text-center">
            Set a start and end date to auto-generate your monthly plan, or tap the button above.
          </p>
        </div>
        {milestoneModal}
      </>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col relative">
      {/* Scrollable milestone list */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 relative" style={{ scrollbarWidth: "none" }}>
        {milestones.map((m) => (
            <div
              key={m.id}
              className={`relative flex items-center gap-3 px-3 py-1 border-2 border-dashed rounded-[10px] transition-colors ${
                m.isAchieved ? "border-income/60 bg-income/5" : "border-ink/60 bg-base"
              }`}
            >
              {/* Month label */}
              <div className="flex-none w-[44px] text-center">
                <p className="font-display font-black text-[14px] text-ink leading-tight">
                  {MONTH_NAMES[m.month - 1]}
                </p>
                <p className="font-body text-[9px] font-bold text-muted">{m.year}</p>
              </div>

              {/* Amount or edit field */}
              <div className="flex-1 min-w-0">
                {editingId === m.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-[90px] px-2 py-1 border-2 border-ink rounded-[6px] bg-[#fff9e6] font-display font-black text-[14px] text-ink focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveAmount(m.id)}
                      disabled={loadingId === m.id}
                      className="flex-none px-2.5 py-1 border-[2px] border-ink rounded-[8px] font-body text-[10px] font-black uppercase tracking-[0.5px] bg-primary text-white shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {loadingId === m.id ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-none px-2.5 py-1 border-[2px] border-ink rounded-[8px] font-body text-[10px] font-bold uppercase tracking-[0.5px] bg-base text-ink shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className={`font-display font-black text-[16px] ${m.isAchieved ? "text-income" : "text-ink"}`}>
                    {formatCurrency(m.amount, "ILS")}
                  </p>
                )}
                {m.isAchieved && m.achievedAt && (
                  <p className="font-body text-[9px] text-income font-bold">
                    ✓ {new Date(m.achievedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>

              {/* Mark achieved button — shows spinner while loading */}
              {loadingId === m.id ? (
                <div className="flex-none w-[26px] h-[26px] flex items-center justify-center">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="#e5e5e0" strokeWidth="2.5" />
                    <path d="M8 2 A6 6 0 0 1 14 8" stroke="#111008" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMarkAchieved(m.id, m.isAchieved)}
                  disabled={loadingId !== null}
                  className={`flex-none w-[26px] h-[26px] flex items-center justify-center border-[2px] border-ink rounded-full font-bold text-[12px] transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${
                    m.isAchieved ? "bg-income text-white" : "bg-base text-muted"
                  }`}
                  title={m.isAchieved ? "Unmark" : "Mark achieved"}
                >
                  ✓
                </button>
              )}

              {/* 3-dot menu — always visible */}
              <div className="flex-none">
                <DropdownMenu
                  disabled={loadingId === m.id}
                  aria-label="Milestone actions"
                  items={[
                    {
                      label: "Edit amount",
                      onClick: () => { setEditingId(m.id); setEditAmount(String(m.amount)); },
                    },
                    {
                      label: "Delete",
                      onClick: () => handleDelete(m.id),
                      variant: "danger",
                    },
                  ]}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Reset loading overlay */}
      {resetLoading && (
        <div className="absolute inset-0 bg-base/80 backdrop-blur-xs flex items-center justify-center rounded-[10px]">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#e5e5e0" strokeWidth="2.5" />
              <path d="M8 2 A6 6 0 0 1 14 8" stroke="#111008" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p className="font-body text-[11px] font-bold text-muted">Resetting…</p>
          </div>
        </div>
      )}
      </div>

      {milestoneModal}
    </>
  );
}

function AddMonthForm({
  existingKeys,
  addYear,
  addMonth,
  addAmount,
  saving,
  onYearChange,
  onMonthChange,
  onAmountChange,
  onSave,
  onCancel,
}: {
  existingKeys: Set<string>;
  addYear: number;
  addMonth: number;
  addAmount: string;
  saving: boolean;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onAmountChange: (a: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isDuplicate = existingKeys.has(`${addYear}-${addMonth}`);
  const val = parseFloat(addAmount);
  const canSave = !isDuplicate && !isNaN(val) && val >= 0;

  return (
    <div className="p-4 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-lg flex flex-col gap-3">
      <p className="font-display font-black text-[14px] text-ink uppercase tracking-[0.5px]">Add a Month</p>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-muted">Month</label>
          <select
            value={addMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 border-2 border-ink rounded-[8px] bg-base font-body text-[12px] text-ink focus:outline-none"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-muted">Year</label>
          <input
            type="number"
            value={addYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            min={2020}
            max={2100}
            className="w-full px-2 py-1.5 border-2 border-ink rounded-[8px] bg-base font-body text-[12px] text-ink focus:outline-none"
          />
        </div>
      </div>

      {isDuplicate && (
        <p className="font-body text-[10px] font-bold text-alert">That month already exists in the list.</p>
      )}

      <div>
        <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-muted">Amount</label>
        <input
          type="number"
          value={addAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          min={0}
          className="w-full px-2 py-1.5 border-2 border-ink rounded-[8px] bg-[#fff9e6] font-display font-black text-[16px] text-ink focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="flex-1 py-2 border-[2px] border-ink rounded-[8px] font-body text-[11px] font-black uppercase tracking-[1px] bg-primary text-white shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-none px-4 py-2 border-[1.5px] border-ink rounded-[8px] font-body text-[11px] font-bold text-muted cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Horizontal progress bar with timeline ── */

function buildTimelineLabels(startDate: string | null, endDate: string | null) {
  const labels: { label: string; pct: number }[] = [{ label: "NOW", pct: 0 }];
  if (!endDate) return labels;
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(endDate);
  const totalMs = end.getTime() - start.getTime();
  if (totalMs <= 0) return labels;
  for (const frac of [0.33, 0.55, 0.77]) {
    const d = new Date(start.getTime() + frac * totalMs);
    labels.push({ label: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), pct: frac * 100 });
  }
  labels.push({ label: String(end.getFullYear()), pct: 100 });
  return labels;
}

function HorizontalProgress({ percent, startDate, endDate }: { percent: number; startDate: string | null; endDate: string | null }) {
  const p = Math.min(Math.max(percent, 0), 100);
  const labels = buildTimelineLabels(startDate, endDate);
  const circleLeft = p < 4 ? "0%" : p > 96 ? "100%" : `${p}%`;
  const circleTranslate = p < 4 ? "translateX(0)" : p > 96 ? "translateX(-100%)" : "translateX(-50%)";
  const barColor = p >= 100 ? "#2ad2a3" : "#a57dee";

  return (
    <div className="mt-3">
      <div className="relative h-[40px] flex items-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[12px] rounded-full border-2 border-ink overflow-hidden bg-[#e5e5e0]">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, backgroundColor: barColor }} />
        </div>
        <div
          className="absolute z-10 w-[40px] h-[40px] rounded-full border-[2.5px] border-ink bg-base shadow-neo-xs flex items-center justify-center"
          style={{ left: circleLeft, transform: circleTranslate }}
        >
          <span className="font-display font-black text-[11px] text-ink">{Math.round(p)}%</span>
        </div>
      </div>
      {labels.length > 1 && (
        <div className="relative h-[18px] mt-0.5">
          {labels.map((item) => (
            <span
              key={item.pct}
              className="absolute font-body text-[9px] font-bold uppercase tracking-[1px] text-muted whitespace-nowrap"
              style={{
                left: `${item.pct}%`,
                transform: item.pct === 0 ? "translateX(0)" : item.pct === 100 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */

export function GoalDetailSheet({ goal: initialGoal, onClose, onUpdated }: GoalDetailSheetProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [tab, setTab] = useState<Tab>("overview");
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(String(goal.targetAmount));
  const [editDate, setEditDate] = useState(goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : "");

  // Log expense states
  const [logOpen, setLogOpen] = useState(false);
  const [logAmount, setLogAmount] = useState("0");
  const [logCategory, setLogCategory] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logYear, setLogYear] = useState(new Date().getFullYear());
  const [logMonth, setLogMonth] = useState(new Date().getMonth() + 1);
  const [logSaving, setLogSaving] = useState(false);

  // Transaction confirmation popups
  const [pendingDebtTransaction, setPendingDebtTransaction] = useState<{ id: string; amount: number; year: number; month: number } | null>(null);
  const [pendingExpenseTransaction, setPendingExpenseTransaction] = useState<{ amount: number; category: string; desc: string; year?: number; month?: number } | null>(null);

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

  const loadMilestones = useCallback(async () => {
    try {
      const data = await trpcQuery<{ milestones: GoalMilestone[] }>("goalMilestones.list", { goalId: goal.id });
      setMilestones(data.milestones);
    } catch (err) {
      console.error("Failed to load milestones:", err);
    }
  }, [goal.id]);

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
    loadMilestones();
  }, [loadAccount, loadMilestones]);

  useEffect(() => {
    if (tab === "transactions" || tab === "spending") {
      loadTransactions();
    }
  }, [tab, loadTransactions]);

  /* ── Milestone refresh — also re-fetch goal to get updated savedAmount ── */
  const handleMilestonesChanged = useCallback(async () => {
    await loadMilestones();
    try {
      const data = await trpcQuery<{ goal: Goal }>("goals.get", { id: goal.id });
      setGoal(data.goal);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }, [loadMilestones, goal.id, onUpdated]);

  /* ── Mutations ── */

  async function updateGoal(fields: Record<string, unknown>) {
    try {
      const data = await trpcMutate<{ goal: Goal }>("goals.update", { id: goal.id, ...fields });
      setGoal(data.goal);
      onUpdated();
      // If targetAmount changed, milestones were recalculated server-side — reload them
      if ("targetAmount" in fields || "endDate" in fields) {
        loadMilestones();
      }
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  }

  async function handleResetUnachieved() {
    setResetLoading(true);
    try {
      await trpcMutate<{ milestones: GoalMilestone[] }>("goalMilestones.resetUnachieved", {
        goalId: goal.id,
      });
      await handleMilestonesChanged();
    } catch (err) {
      console.error("Failed to reset milestones:", err);
    } finally {
      setResetLoading(false);
    }
  }

  async function handleDebtAchieved(milestoneId: string, amount: number, year: number, month: number) {
    setPendingDebtTransaction({ id: milestoneId, amount, year, month });
  }

  async function confirmAddDebtTransaction(add: boolean) {
    if (!pendingDebtTransaction) {
      setPendingDebtTransaction(null);
      return;
    }

    try {
      // First mark the milestone as achieved
      await trpcMutate("goalMilestones.markAchieved", { id: pendingDebtTransaction.id });

      // Then create transaction if user wants
      if (add && accountId) {
        await trpcMutate("transactions.create", {
          accountId,
          amount: pendingDebtTransaction.amount,
          type: "EXPENSE",
          category: "debt_payment",
          description: `${goal.name} - Debt Payoff`,
          date: dateKeyToUtcDatetimeISO(`${pendingDebtTransaction.year}-${String(pendingDebtTransaction.month).padStart(2, "0")}-01`),
          goalId: goal.id,
          milestoneId: pendingDebtTransaction.id,
          excludeFromBudget: true,
        });
        window.dispatchEvent(new CustomEvent("jinsight:transaction-added"));
      }

      await handleMilestonesChanged();
    } catch (err) {
      console.error("Failed to confirm debt transaction:", err);
    } finally {
      setPendingDebtTransaction(null);
    }
  }

  async function confirmAddExpenseTransaction(add: boolean) {
    if (!add || !pendingExpenseTransaction) {
      setPendingExpenseTransaction(null);
      return;
    }

    if (!accountId) {
      setPendingExpenseTransaction(null);
      return;
    }

    try {
      await trpcMutate("transactions.create", {
        accountId,
        amount: pendingExpenseTransaction.amount,
        type: "EXPENSE",
        category: pendingExpenseTransaction.category || "other",
        description: pendingExpenseTransaction.desc || undefined,
        date: dateKeyToUtcDatetimeISO(formatLocalDateKey(new Date())),
        goalId: goal.id,
        excludeFromBudget: true,
      });
      window.dispatchEvent(new CustomEvent("jinsight:transaction-added"));
    } catch (err) {
      console.error("Failed to add expense transaction:", err);
    } finally {
      setPendingExpenseTransaction(null);
    }
  }

  async function logExpense() {
    if (!accountId || logSaving) return;
    const amount = parseFloat(logAmount) || 0;
    if (amount <= 0) return;

    // Update spending plan if trip event
    if (isTripEvent && logCategory && spendingPlan.length > 0) {
      setLogSaving(true);
      try {
        const updatedPlan = spendingPlan.map((item) =>
          item.category === logCategory ? { ...item, actual: item.actual + amount } : item,
        );
        await trpcMutate("goals.update", { id: goal.id, spendingPlan: updatedPlan });
        setGoal((prev) => ({ ...prev, spendingPlan: updatedPlan }));
      } catch (err) {
        console.error("Failed to update spending plan:", err);
        setLogSaving(false);
        return;
      }
      setLogSaving(false);
    }

    // Show confirmation to add to transactions
    setPendingExpenseTransaction({
      amount,
      category: logCategory || "other",
      desc: logDesc,
      year: logYear,
      month: logMonth,
    });
  }

  async function finalizeExpenseLog(addToTransactions: boolean) {
    if (!pendingExpenseTransaction || !accountId) {
      setPendingExpenseTransaction(null);
      return;
    }

    setLogSaving(true);
    try {
      if (addToTransactions) {
        const txMonth = pendingExpenseTransaction.month || logMonth;
        const txYear = pendingExpenseTransaction.year || logYear;
        await trpcMutate("transactions.create", {
          accountId,
          amount: pendingExpenseTransaction.amount,
          type: "EXPENSE",
          category: pendingExpenseTransaction.category,
          description: pendingExpenseTransaction.desc || undefined,
          date: dateKeyToUtcDatetimeISO(`${txYear}-${String(txMonth).padStart(2, "0")}-01`),
          goalId: goal.id,
          excludeFromBudget: true,
        });
        window.dispatchEvent(new CustomEvent("jinsight:transaction-added"));
        loadTransactions();
      }

      setLogOpen(false);
      setLogAmount("0");
      setLogCategory("");
      setLogDesc("");
      setLogYear(new Date().getFullYear());
      setLogMonth(new Date().getMonth() + 1);
      onUpdated();
    } catch (err) {
      console.error("Failed to finalize expense:", err);
    } finally {
      setLogSaving(false);
      setPendingExpenseTransaction(null);
    }
  }

  /* ── Edit modal helpers ── */

  function openEditModal() {
    setEditName(goal.name);
    setEditTarget(String(goal.targetAmount));
    setEditDate(goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : "");
    setEditModalOpen(true);
  }

  async function handleEditModalSave() {
    const fields: Record<string, unknown> = {};
    if (editName.trim() && editName.trim() !== goal.name) fields.name = editName.trim();
    const targetVal = parseFloat(editTarget);
    if (!isNaN(targetVal) && targetVal > 0 && targetVal !== goal.targetAmount) fields.targetAmount = targetVal;
    const currentEndDateStr = goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : "";
    if (editDate !== currentEndDateStr) fields.endDate = editDate ? new Date(editDate).toISOString() : null;
    if (Object.keys(fields).length > 0) await updateGoal(fields);
    setEditModalOpen(false);
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
              className="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs font-body font-bold text-[14px] text-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            >
              ←
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-[24px]">{goal.emoji}</span>
              <p className="font-display font-black text-[20px] text-ink truncate flex-1 min-w-0">{goal.name}</p>
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
            {goal.type !== "DEBT" && (
              <button
                type="button"
                onClick={() => setLogOpen((v) => !v)}
                className="ml-auto font-body text-[10px] font-black uppercase tracking-[1px] px-3 py-[3px] border-[1.5px] border-ink rounded-[20px] bg-income text-ink active:opacity-75 cursor-pointer"
              >
                + Log Expense
              </button>
            )}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex-none flex gap-1.5 px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 border-[1.5px] border-ink rounded-[8px] font-body text-[10px] font-black uppercase tracking-[1px] transition-all cursor-pointer ${
                tab === t.id ? "bg-primary text-white shadow-neo-xs" : "bg-base text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className={`flex-1 min-h-0 px-4 pb-6 ${tab === "overview" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>

          {/* ═══ OVERVIEW TAB ═══ */}
          {tab === "overview" && (
            <div className="flex-1 min-h-0 flex flex-col gap-3 pt-2">

              {/* ── Hero card: name + target + progress timeline ── */}
              <div className="flex-none border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md p-4">
                <div className="flex items-start gap-3 mb-1">
                  {/* Left: saving for + name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[9px] font-bold uppercase tracking-[2px] text-muted mb-0.5">Saving for</p>
                    <p className="font-display font-black text-[24px] text-ink leading-tight truncate">{goal.name}</p>
                  </div>
                  {/* Right: target label + amount */}
                  <div className="flex-none text-right">
                    <p className="font-body text-[9px] font-bold uppercase tracking-[2px] text-muted mb-0.5">Target</p>
                    <p className="font-display font-black text-[22px] text-ink leading-tight">{formatCurrency(goal.targetAmount, "ILS")}</p>
                  </div>
                  {/* Edit button — far right, aligned to top */}
                  <button
                    type="button"
                    onClick={openEditModal}
                    aria-label="Edit goal"
                    className="flex-none self-start w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-ink/8 active:scale-95 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#111008" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>

                <HorizontalProgress
                  percent={progress.percentComplete}
                  startDate={goal.startDate ? String(goal.startDate) : null}
                  endDate={goal.endDate ? String(goal.endDate) : null}
                />
              </div>

              {/* ── Stats row: saved · monthly needed · remaining ── */}
              <div className="flex-none flex gap-2.5">
                <div className="flex-1 px-3 py-2 border-2 border-ink rounded-[12px] bg-base">
                  <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-muted mb-0.5">Saved</p>
                  <p className="font-display font-black text-[18px] text-ink">{formatCurrency(goal.savedAmount, "ILS")}</p>
                </div>
                {progress.monthlyNeeded !== null && progress.monthlyNeeded > 0 && !progress.isComplete && (
                  <div className="flex-1 px-3 py-2 border-2 border-ink rounded-[12px] bg-[#a57dee]/15">
                    <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-primary mb-0.5">Monthly Needed</p>
                    <p className="font-display font-black text-[18px] text-ink">{formatCurrency(progress.monthlyNeeded, "ILS")}</p>
                  </div>
                )}
                <div className="flex-1 px-3 py-2 border-2 border-ink rounded-[12px] bg-[#cce972]/15">
                  <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-[#4a6000] mb-0.5">Remaining</p>
                  <p className="font-display font-black text-[18px] text-ink">{formatCurrency(progress.remaining, "ILS")}</p>
                </div>
              </div>

              {/* ── Monthly breakdown card ── */}
              <div className="flex-1 min-h-0 flex flex-col border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md overflow-hidden">
                <div className="flex-none flex items-center justify-between gap-2 px-3 pt-3 pb-1.5">
                  <p className="font-body text-[11px] font-bold uppercase tracking-[2px] text-muted">Monthly Breakdown</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleResetUnachieved()}
                      disabled={resetLoading}
                      className="font-body text-[9px] font-bold uppercase tracking-[1px] px-2 py-[2px] border-[1.5px] border-muted rounded-[16px] bg-base text-muted hover:border-ink hover:text-ink active:opacity-75 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
                    >
                      {resetLoading ? "Resetting…" : "Reset"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMilestoneOpen(true)}
                      className="font-body text-[10px] font-black uppercase tracking-[1px] px-3 py-[3px] border-[1.5px] border-ink rounded-[20px] bg-income text-ink active:opacity-75 cursor-pointer"
                    >
                      + Achievement
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 px-3 pb-3">
                  <MonthlyTab
                    goal={goal}
                    milestones={milestones}
                    onMilestonesChanged={handleMilestonesChanged}
                    addOpen={addMilestoneOpen}
                    setAddOpen={setAddMilestoneOpen}
                    onDebtAchieved={goal.type === "DEBT" ? handleDebtAchieved : undefined}
                    resetLoading={resetLoading}
                  />
                </div>
              </div>

            </div>
          )}

          {/* ═══ SPENDING TAB (Trip/Event only) ═══ */}
          {tab === "spending" && isTripEvent && (
            <div className="flex flex-col gap-3 pt-2">
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
                          <div className="h-full rounded-[30px] transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                        </div>
                        <p className="font-body text-[9px] font-bold mt-0.5" style={{ color: barColor }}>{Math.round(pct)}%</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <p className="font-body text-[12px] text-muted text-center">No spending breakdown set up yet.</p>
                  <p className="font-body text-[10px] text-muted text-center">Expenses logged to this goal will still appear in History.</p>
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
                  <p className="font-body text-[12px] text-muted text-center">No transactions logged for this goal yet.</p>
                  <p className="font-body text-[10px] text-muted text-center">Tap &quot;+ Log Expense&quot; below to record spending.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-2.5 p-2.5 border-2 border-ink rounded-[10px] bg-base">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[12px] font-bold text-ink truncate">{tx.description || tx.category}</p>
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

        {/* ── Log Expense panel (fixed bottom, shown only when open) ── */}
        {logOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-[101]">
            <div className="max-w-[480px] mx-auto px-4 pb-5 pt-3 bg-base border-t-2 border-ink/10">
              <div className="p-3 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md animate-[slideUp_150ms_ease-out]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display font-black text-[16px] text-ink uppercase tracking-[0.5px]">Log Expense</p>
                  <button type="button" onClick={() => setLogOpen(false)} className="font-body text-[12px] font-bold text-muted cursor-pointer">Cancel</button>
                </div>

                {isTripEvent && spendingPlan.length > 0 && (
                  <div className="mb-2">
                    <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {spendingPlan.map((item) => (
                        <button
                          key={item.category}
                          type="button"
                          onClick={() => setLogCategory(item.category)}
                          className={`px-2.5 py-1 border-[1.5px] border-ink rounded-[20px] font-body text-[10px] font-bold transition-all cursor-pointer ${logCategory === item.category ? "bg-primary text-white" : "bg-base text-ink"}`}
                        >
                          {item.category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(!isTripEvent || spendingPlan.length === 0) && (
                  <div className="mb-2">
                    <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TRIP_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setLogCategory(c)}
                          className={`px-2.5 py-1 border-[1.5px] border-ink rounded-[20px] font-body text-[10px] font-bold transition-all cursor-pointer ${logCategory === c ? "bg-primary text-white" : "bg-base text-ink"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-2">
                  <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">Month & Year</label>
                  <div className="flex gap-2">
                    <select
                      value={logMonth}
                      onChange={(e) => setLogMonth(Number(e.target.value))}
                      className="flex-1 px-2 py-1.5 border-2 border-ink rounded-[6px] bg-base font-body text-[12px] text-ink focus:outline-none"
                    >
                      {MONTH_NAMES.map((name, i) => (
                        <option key={name} value={i + 1}>{name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={logYear}
                      onChange={(e) => setLogYear(Number(e.target.value))}
                      min={2020}
                      max={2100}
                      className="flex-1 px-2 py-1.5 border-2 border-ink rounded-[6px] bg-base font-body text-[12px] text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">Description</label>
                  <input
                    type="text"
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    placeholder="What was this for?"
                    className="w-full px-2.5 py-1.5 border-2 border-ink rounded-[6px] bg-base font-body text-[12px] text-ink placeholder:text-muted/50 focus:outline-none"
                  />
                </div>

                <div className="mb-2">
                  <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-ink">Amount</label>
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
                  className="font-body w-full mt-2 py-2.5 text-[12px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-alert text-white shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  {logSaving ? "Saving..." : "Log Expense"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Goal Modal ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setEditModalOpen(false)}
            className="absolute inset-0 bg-ink/40 cursor-default"
          />
          <div className="relative z-10 w-full max-w-[340px] p-4 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-lg flex flex-col gap-3">
            <p className="font-display font-black text-[14px] text-ink uppercase tracking-[0.5px]">Edit Goal</p>

            <div>
              <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-muted">Goal Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-2.5 py-1.5 border-2 border-ink rounded-[8px] bg-base font-body text-[14px] font-bold text-ink focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-muted">Target Amount</label>
              <input
                type="number"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                min={0}
                className="w-full px-2.5 py-1.5 border-2 border-ink rounded-[8px] bg-[#fff9e6] font-display font-black text-[16px] text-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body block text-[9px] font-bold uppercase tracking-[1.5px] mb-1 text-muted">Target Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border-2 border-ink rounded-[8px] bg-base font-body text-[12px] text-ink focus:outline-none"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleEditModalSave}
                className="flex-1 py-2 border-[2px] border-ink rounded-[8px] font-body text-[11px] font-black uppercase tracking-[1px] bg-primary text-white shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-none px-4 py-2 border-[1.5px] border-ink rounded-[8px] font-body text-[11px] font-bold text-muted cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Debt Transaction Confirmation Modal ── */}
      {pendingDebtTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => confirmAddDebtTransaction(false)}
            className="absolute inset-0 bg-ink/40 cursor-default"
          />
          <div className="relative z-10 w-full max-w-[340px] p-4 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-lg flex flex-col gap-3">
            <p className="font-display font-black text-[16px] text-ink uppercase tracking-[0.5px]">Add to Transactions?</p>
            <p className="font-body text-[13px] text-ink">
              Add this {formatCurrency(pendingDebtTransaction.amount, "ILS")} payoff to your transaction history?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => confirmAddDebtTransaction(true)}
                className="flex-1 py-2 border-[2px] border-ink rounded-[8px] font-body text-[11px] font-black uppercase tracking-[1px] bg-primary text-white shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                Yes, Add It
              </button>
              <button
                type="button"
                onClick={() => confirmAddDebtTransaction(false)}
                className="flex-1 py-2 border-[2px] border-ink rounded-[8px] font-body text-[11px] font-black uppercase tracking-[1px] bg-base text-ink shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expense Transaction Confirmation Modal ── */}
      {pendingExpenseTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => finalizeExpenseLog(false)}
            className="absolute inset-0 bg-ink/40 cursor-default"
          />
          <div className="relative z-10 w-full max-w-[340px] p-4 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-lg flex flex-col gap-3">
            <p className="font-display font-black text-[16px] text-ink uppercase tracking-[0.5px]">Add to Transactions?</p>
            <p className="font-body text-[13px] text-ink">
              Add this {formatCurrency(pendingExpenseTransaction.amount, "ILS")} expense to your transaction history?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => finalizeExpenseLog(true)}
                className="flex-1 py-2 border-[2px] border-ink rounded-[8px] font-body text-[11px] font-black uppercase tracking-[1px] bg-primary text-white shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                Yes, Add It
              </button>
              <button
                type="button"
                onClick={() => finalizeExpenseLog(false)}
                className="flex-1 py-2 border-[2px] border-ink rounded-[8px] font-body text-[11px] font-black uppercase tracking-[1px] bg-base text-ink shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
