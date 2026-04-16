"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { BudgetPlanForm } from "@/components/BudgetPlanForm";
import { InvestmentHub } from "@/components/InvestmentHub";

type Tab = "plan" | "invest";

const TABS: { id: Tab; label: string }[] = [
  { id: "plan",   label: "Budget Plan" },
  { id: "invest", label: "Investment" },
];

export default function BudgetPlanPage() {
  const [tab, setTab] = useState<Tab>("plan");

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
                isActive ? "bg-primary shadow-neo-sm -translate-x-px -translate-y-px" : "bg-base shadow-[1px_1px_0_#ccc]"
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
        {tab === "plan" ? <BudgetPlanForm /> : <InvestmentHub />}
      </div>

      <BottomNav active="plan" />
    </div>
  );
}
