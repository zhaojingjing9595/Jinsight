"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AddSwitcher } from "@/components/AddSwitcher";
import { AddBillForm } from "@/components/bills/AddBillForm";

export default function AddBillPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddSwitcher active="bill" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[calc(80px+16px)]">
        <AddBillForm onSaved={() => router.refresh()} />
      </div>

      <BottomNav active="add" />
    </div>
  );
}
