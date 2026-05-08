"use client";

import { useState, useEffect, useCallback } from "react";
import type { Goal, GoalStatus } from "@jinsight/core";
import { trpcQuery, trpcMutate } from "@/lib/api";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import type { GoalFormData } from "./GoalForm";
import { GoalDetailSheet } from "./GoalDetailSheet";

type StatusGroup = { label: string; status: GoalStatus[]; goals: Goal[] };

function groupGoals(goals: Goal[]): StatusGroup[] {
  const active: Goal[] = [];
  const upcoming: Goal[] = [];
  const completed: Goal[] = [];

  for (const g of goals) {
    if (g.status === "COMPLETE") {
      completed.push(g);
    } else if (g.status === "PLANNING") {
      upcoming.push(g);
    } else {
      active.push(g);
    }
  }

  const groups: StatusGroup[] = [];
  if (active.length > 0) groups.push({ label: "Active", status: ["SAVING", "ACTIVE"], goals: active });
  if (upcoming.length > 0) groups.push({ label: "Upcoming", status: ["PLANNING"], goals: upcoming });
  if (completed.length > 0) groups.push({ label: "Completed", status: ["COMPLETE"], goals: completed });
  return groups;
}

export function GoalsDashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const load = useCallback(async () => {
    try {
      const [goalsData, me] = await Promise.all([
        trpcQuery<{ goals: Goal[] }>("goals.list"),
        trpcQuery<{ user: { accounts: { id: string }[] } }>("users.me"),
      ]);
      setGoals(goalsData.goals);
      setAccountId(me.user.accounts?.[0]?.id ?? null);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: GoalFormData) {
    if (!accountId) return;
    try {
      await trpcMutate("goals.create", {
        accountId,
        type: data.type,
        name: data.name,
        emoji: data.emoji,
        targetAmount: data.targetAmount,
        startDate: data.startDate,
        endDate: data.endDate ?? undefined,
        status: "SAVING",
        spendingPlan: data.spendingPlan ?? undefined,
      });
      setFormOpen(false);
      load();
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="font-body text-[13px] font-bold text-muted animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  const groups = groupGoals(goals);

  return (
    <div className="flex flex-col gap-3">
      {/* Header with add button */}
      {goals.length > 0 && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="font-body w-full py-2.5 text-[12px] font-black uppercase tracking-[1.5px] text-primary border-2 border-dashed border-primary/50 rounded-[10px] active:bg-primary/5 transition-colors"
        >
          + New Goal
        </button>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-[48px]">🎯</span>
          <p className="font-body text-[15px] font-bold text-ink text-center">
            What are you saving for?
          </p>
          <p className="font-body text-[12px] text-muted text-center max-w-[260px]">
            Create a goal to track your progress toward a trip, big purchase, emergency fund, or anything else.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="font-body mt-2 px-6 py-2.5 text-[12px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-primary text-white shadow-neo-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Grouped goal lists */}
      {groups.map((group) => {
        const isCompleted = group.label === "Completed";
        const showGoals = isCompleted ? completedExpanded : true;

        return (
          <div key={group.label}>
            {isCompleted ? (
              <button
                type="button"
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="flex items-center gap-1.5 mb-2"
              >
                <span className="font-body text-[11px] font-bold uppercase tracking-[2px] text-muted">
                  {group.label}
                </span>
                <span className="font-body text-[10px] font-bold text-muted bg-[#f5f5f0] border-[1.5px] border-ink rounded-full w-5 h-5 flex items-center justify-center">
                  {group.goals.length}
                </span>
                <span className="font-body text-[10px] text-muted ml-0.5">
                  {completedExpanded ? "▾" : "▸"}
                </span>
              </button>
            ) : (
              <p className="font-body text-[11px] font-bold uppercase tracking-[2px] text-muted mb-2">
                {group.label}
              </p>
            )}

            {showGoals && (
              <div className="flex flex-col gap-2.5">
                {group.goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoal(goal)} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Goal creation form */}
      {formOpen && (
        <GoalForm
          onSave={handleCreate}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Goal detail sheet */}
      {selectedGoal && (
        <GoalDetailSheet
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onUpdated={() => {
            setSelectedGoal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
