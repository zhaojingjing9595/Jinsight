"use client";

import { useState, useRef, useEffect } from "react";
import { formatLocalDateKey } from "@/lib/dates";

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

type DateStripProps = {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  /** When true, future days are selectable and later weeks are reachable (e.g. expected income). */
  allowFutureDates?: boolean;
};

export function DateStrip({ value, onChange, allowFutureDates = false }: DateStripProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // weekOffset: 0 = current week, -1 = previous week, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (allowFutureDates) return;
    setWeekOffset((o) => Math.min(o, 0));
  }, [allowFutureDates]);

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
        setWeekOffset((o) => o - 1);
      } else {
        setWeekOffset((o) => (allowFutureDates ? o + 1 : Math.min(o + 1, 0)));
      }
    }
    touchStartX.current = null;
  }

  const canGoForward = allowFutureDates || weekOffset < 0;

  return (
    <div className="flex flex-col py-2.5 px-1 sm:px-2">
      <div
        className="flex gap-1 items-center touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous week arrow */}
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o - 1)}
          className="flex-none flex items-center justify-center w-6 py-1 text-muted hover:text-ink transition-colors"
          aria-label="Previous week"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Day pills */}
        <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-1.5 place-items-center">
          {days.map((day) => {
            const dateStr = formatLocalDateKey(day);
            const isSelected = value === dateStr;
            const isFuture = day > today;
            const isDisabled = isFuture && !allowFutureDates;
            const isToday = formatLocalDateKey(day) === formatLocalDateKey(today);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => onChange(dateStr)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 min-h-[3.35rem] w-10 max-w-full mx-auto rounded-full border-2 transition-all active:scale-95 ${
                  isDisabled
                    ? "border-ink/10 opacity-30 cursor-not-allowed"
                    : isFuture && allowFutureDates
                      ? isSelected
                        ? "border-ink bg-primary shadow-neo-xs -translate-y-px"
                        : "border-primary/35 bg-base hover:border-primary/60"
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
          onClick={() =>
            setWeekOffset((o) => (allowFutureDates ? o + 1 : Math.min(o + 1, 0)))
          }
          disabled={!canGoForward}
          className="flex-none flex items-center justify-center w-6 py-1 text-muted hover:text-ink transition-colors disabled:opacity-20"
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
