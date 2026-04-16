"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AddSwitcher } from "@/components/AddSwitcher";
import { AddTransactionForm } from "@/components/AddTransactionForm";

export default function AddPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddSwitcher active="transaction" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[calc(80px+16px)]">
        <AddTransactionForm onSaved={() => router.refresh()} />
      </div>

      <BottomNav active="add" />
    </div>
  );
}
