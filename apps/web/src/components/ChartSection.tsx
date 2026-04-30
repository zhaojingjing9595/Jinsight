"use client";

import { formatCurrency } from "@jinsight/core";
import { SpendingPieChart } from "./SpendingPieChart";
import type { SliceData } from "./SpendingPieChart";

const MAX_LEGEND_ITEMS = 5;

export function ChartSection({
  slices,
  totalLabel,
  title,
}: {
  slices: SliceData[];
  totalLabel: string;
  monthlyData?: unknown[];
  title?: string;
}) {
  const visibleSlices = slices.slice(0, MAX_LEGEND_ITEMS);
  const extraCount = slices.length - MAX_LEGEND_ITEMS;

  return (
    <div className="flex flex-col h-full">
      {title && (
        <h2 className="flex-none font-body text-[12px] font-black uppercase tracking-[1.5px] text-ink mb-1">
          {title}
        </h2>
      )}

      <div className="flex-1 min-h-0 flex items-center gap-2">
        {/* Donut chart */}
        <div className="flex-none h-full aspect-square">
          {slices.length > 0 ? (
            <SpendingPieChart slices={slices} totalLabel={totalLabel} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="font-body text-[10px] text-muted text-center">No spending yet</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
          {visibleSlices.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              <span
                className="flex-none w-2 h-2 rounded-[3px] border border-ink/30"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-body text-[10px] font-[600] text-ink truncate flex-1 min-w-0">
                {s.label}
              </span>
              <span className="font-body text-[10px] font-[700] text-ink flex-none">
                {formatCurrency(s.amount, "ILS")}
              </span>
            </div>
          ))}
          {extraCount > 0 && (
            <p className="font-body text-[9px] text-muted mt-0.5">+{extraCount} more</p>
          )}
          {slices.length === 0 && (
            <p className="font-body text-[10px] text-muted">Add transactions to see a breakdown</p>
          )}
        </div>
      </div>
    </div>
  );
}
