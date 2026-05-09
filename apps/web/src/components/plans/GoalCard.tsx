"use client";

import { useState } from "react";
import {
  formatCurrency,
  GOAL_TYPE_META,
  computeGoalProgress,
  getGoalHealthStatus,
} from "@jinsight/core";
import type { Goal } from "@jinsight/core";
import { GoalStatusChip } from "./GoalStatusChip";

type GoalCardProps = {
  goal: Goal;
  onClick?: () => void;
  onMarkComplete?: () => void;
  onDelete?: () => void;
};

export function GoalCard({ goal, onClick, onMarkComplete, onDelete }: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const progress = computeGoalProgress(goal);
  const health = getGoalHealthStatus(progress);
  const typeMeta = GOAL_TYPE_META[goal.type];
  const barWidth = Math.min(progress.percentComplete, 100);

  const progressColor =
    progress.percentComplete >= 100
      ? "#2ad2a3"
      : progress.percentComplete >= 60
        ? "#cce972"
        : "#a57dee";

  function formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(false);
    setMenuOpen(true);
  }

  function closeMenu(e?: React.MouseEvent) {
    e?.stopPropagation();
    setMenuOpen(false);
    setConfirmDelete(false);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="w-full text-left p-3.5 border-[2.5px] border-ink rounded-[14px] bg-base shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
    >
      {/* Top row: emoji + name + status chip + three-dot */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <span className="text-[28px] leading-none flex-none">{goal.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[14px] font-bold text-ink truncate">
            {goal.name}
          </p>
          <p className="font-body text-[10px] font-bold text-muted uppercase tracking-[1px]">
            {typeMeta.label}
          </p>
        </div>
        {goal.status !== "COMPLETE" && <GoalStatusChip health={health} />}
        {goal.status === "COMPLETE" && (
          <span className="inline-flex items-center px-2.5 py-[3px] border-[1.5px] border-ink rounded-[20px] font-body text-[10px] font-bold tracking-[0.5px] bg-[#f5f5f0] text-muted">
            Complete
          </span>
        )}

        {/* Three-dot menu */}
        <div
          className="relative flex-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Goal actions"
            onClick={openMenu}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-ink/8 active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="#111008">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute right-0 top-8 z-30 min-w-[150px] border-2 border-ink rounded-[10px] bg-base shadow-neo-sm overflow-hidden">
                {goal.status !== "COMPLETE" && onMarkComplete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); closeMenu(); onMarkComplete(); }}
                    className="w-full text-left px-3 py-2.5 font-body text-[12px] font-[600] text-ink hover:bg-[#f5f5f0] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-income">✓</span> Mark Complete
                  </button>
                )}
                {onDelete && !confirmDelete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    className="w-full text-left px-3 py-2.5 font-body text-[12px] font-[600] text-alert hover:bg-alert/5 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
                {onDelete && confirmDelete && (
                  <div className="px-3 py-2.5">
                    <p className="font-body text-[10px] font-bold text-alert mb-2">Delete this goal?</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); closeMenu(); onDelete(); }}
                        className="flex-1 py-1.5 border-[1.5px] border-alert rounded-[6px] font-body text-[10px] font-black text-white bg-alert cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                        className="flex-1 py-1.5 border-[1.5px] border-ink rounded-[6px] font-body text-[10px] font-bold text-muted cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount row */}
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-display font-black text-[22px] text-ink leading-none">
          {formatCurrency(progress.savedAmount, "ILS")}
        </p>
        <p className="font-body text-[12px] font-bold text-muted">
          / {formatCurrency(progress.targetAmount, "ILS")}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-[12px] rounded-[30px] border-[1.5px] border-ink overflow-hidden bg-[#f5f5f0] relative mb-2">
        <div
          className="absolute left-0 top-0 h-full rounded-[30px] transition-all duration-300"
          style={{ width: `${barWidth}%`, backgroundColor: progressColor }}
        />
      </div>

      {/* Bottom row: percentage + target date + monthly needed */}
      <div className="flex items-center justify-between">
        <span className="font-body text-[11px] font-bold" style={{ color: progressColor }}>
          {Math.round(progress.percentComplete)}%
        </span>
        <div className="flex items-center gap-2">
          {progress.monthsRemaining !== null && progress.monthsRemaining > 0 && (
            <span className="font-body text-[10px] font-bold text-muted">
              {progress.monthsRemaining}mo left
            </span>
          )}
          {progress.monthlyNeeded !== null && progress.monthlyNeeded > 0 && !progress.isComplete && (
            <span className="font-body text-[10px] font-bold text-primary">
              {formatCurrency(progress.monthlyNeeded, "ILS")}/mo needed
            </span>
          )}
          {goal.endDate && (
            <span className="font-body text-[10px] text-muted">
              {formatDate(goal.endDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
