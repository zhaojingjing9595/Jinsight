"use client";

import { useState, useRef } from "react";
import { SpendingPieChart } from "./SpendingPieChart";
import type { SliceData } from "./SpendingPieChart";
import { MonthlyBarChart } from "./MonthlyBarChart";
import type { MonthData } from "./MonthlyBarChart";

type View = "pie" | "bar";

export function ChartSection({
  slices,
  totalLabel,
  monthlyData,
}: {
  slices: SliceData[];
  totalLabel: string;
  monthlyData: MonthData[];
}) {
  const [view, setView] = useState<View>("pie");
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      setView(dx > 0 ? "bar" : "pie");
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Tab toggle ── */}
      <div
        className="flex-none flex gap-0.5 mb-2 p-0.5 rounded-[10px] border-[2px] border-[#111008] w-fit self-end"
        style={{ backgroundColor: "#111008" }}
      >
        {(["pie", "bar"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-3 py-[3px] rounded-[7px] text-[10px] font-[700] uppercase tracking-[0.8px] transition-colors"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              backgroundColor: view === v ? "#feb704" : "transparent",
              color: view === v ? "#111008" : "#fcfaeb",
            }}
          >
            {v === "pie" ? "Breakdown" : "6-Month"}
          </button>
        ))}
      </div>

      {/* ── Chart area (swipeable) ── */}
      <div
        className="flex-1 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {view === "pie" ? (
          <SpendingPieChart slices={slices} totalLabel={totalLabel} />
        ) : (
          <MonthlyBarChart months={monthlyData} />
        )}
      </div>
    </div>
  );
}
