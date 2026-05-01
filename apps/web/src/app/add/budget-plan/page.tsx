"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { BudgetPlanForm } from "@/components/BudgetPlanForm";

export default function AddBudgetPlanPage() {
  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <header className="flex-none flex items-center gap-3 px-4 pt-5 pb-3 border-b border-ink/15">
        <Link
          href="/plans"
          className="font-body text-[12px] font-bold text-primary underline-offset-2 hover:underline"
        >
          ← Plans
        </Link>
        <h1 className="font-display font-black text-[16px] text-ink uppercase tracking-[1px]">
          Budget plan
        </h1>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[calc(80px+16px)]">
        <BudgetPlanForm />
      </div>

      <BottomNav active="plan" />
    </div>
  );
}
