"use client";

import { useRouter } from "next/navigation";
import { AddFlowHeader } from "@/components/AddFlowHeader";
import { AddSwitcher } from "@/components/AddSwitcher";
import { AddTransactionForm } from "@/components/AddTransactionForm";

export default function AddPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddFlowHeader />
      <AddSwitcher active="transaction" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px)+1rem)]">
        <AddTransactionForm onSaved={() => router.refresh()} />
      </div>
    </div>
  );
}
