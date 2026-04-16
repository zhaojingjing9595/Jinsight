"use client";

import { BottomNav } from "@/components/BottomNav";
import { AddSwitcher } from "@/components/AddSwitcher";
import { BudgetPlanForm } from "@/components/BudgetPlanForm";

export default function AddBudgetPlanPage() {
  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddSwitcher active="budget" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[calc(80px+16px)]">
        <BudgetPlanForm />
      </div>

      <BottomNav active="add" />
    </div>
  );
}
