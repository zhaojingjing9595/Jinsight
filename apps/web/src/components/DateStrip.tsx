"use client";

import { useState, useRef } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

type DateStripProps = {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
};

export function DateStrip({ value, onChange }: DateStripProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // weekOffset: 0 = current week, -1 = previous week, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      if (dx > 0) {
        // swiped left → go to older week (only if not already showing a past week that goes into the future)
        setWeekOffset((o) => o - 1);
      } else {
        // swiped right → go forward, but not past current week
        setWeekOffset((o) => Math.min(o + 1, 0));
      }
    }
    touchStartX.current = null;
  }

  const canGoForward = weekOffset < 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="font-body text-[10px] font-bold uppercase tracking-[2px] text-ink">Date</p>
        {weekOffset < 0 && (
          <p className="font-body text-[9px] text-muted">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" – "}
            {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
      </div>

      <div
        className="flex gap-1 touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous week arrow */}
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o - 1)}
          className="flex-none flex items-center justify-center w-6 h-full text-muted hover:text-ink transition-colors"
          aria-label="Previous week"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Day pills */}
        <div className="flex-1 grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const dateStr = toDateString(day);
            const isSelected = value === dateStr;
            const isFuture = day > today;
            const isToday = toDateString(day) === toDateString(today);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isFuture}
                onClick={() => onChange(dateStr)}
                className={`flex flex-col items-center py-1.5 rounded-[8px] border-2 transition-all active:scale-95 ${
                  isFuture
                    ? "border-ink/10 opacity-30 cursor-not-allowed"
                    : isSelected
                      ? "border-ink bg-primary shadow-neo-xs -translate-y-px"
                      : "border-ink/20 bg-base hover:border-ink/50"
                }`}
              >
                <span
                  className={`font-body text-[8px] font-bold uppercase tracking-[0.5px] ${
                    isSelected ? "text-white" : isToday ? "text-primary" : "text-muted"
                  }`}
                >
                  {DAY_LABELS[day.getDay()]}
                </span>
                <span
                  className={`font-body text-[12px] font-[700] leading-tight ${
                    isSelected ? "text-white" : "text-ink"
                  }`}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next week arrow */}
        <button
          type="button"
          onClick={() => setWeekOffset((o) => Math.min(o + 1, 0))}
          disabled={!canGoForward}
          className="flex-none flex items-center justify-center w-6 h-full text-muted hover:text-ink transition-colors disabled:opacity-20"
          aria-label="Next week"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
