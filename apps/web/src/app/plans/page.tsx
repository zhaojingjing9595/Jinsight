"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { BudgetDashboard } from "@/components/plans/BudgetDashboard";

type Tab = "budget" | "goals" | "wealth";

const TABS: { id: Tab; label: string }[] = [
  { id: "budget", label: "Budget" },
  { id: "goals",  label: "Goals" },
  { id: "wealth", label: "Wealth" },
];

export default function PlansPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "budget";
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "budget",
  );

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      {/* Tab switcher */}
      <div className="flex-none flex gap-2.5 px-4 pt-5 pb-3">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center py-3 border-2 border-ink rounded-[12px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                isActive
                  ? "bg-primary shadow-neo-sm -translate-x-px -translate-y-px"
                  : "bg-base shadow-[1px_1px_0_#ccc]"
              }`}
            >
              <span className="font-body text-[11px] font-black uppercase tracking-[1.5px] text-ink">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[calc(80px+16px)]">
        {tab === "budget" && <BudgetDashboard />}
        {tab === "goals" && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-[40px]">🎯</span>
            <p className="font-body text-[14px] font-bold text-muted">Goals — coming soon</p>
          </div>
        )}
        {tab === "wealth" && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-[40px]">💎</span>
            <p className="font-body text-[14px] font-bold text-muted">Wealth — coming soon</p>
          </div>
        )}
      </div>

      <BottomNav active="plan" />
    </div>
  );
}
