"use client";

import { useRouter } from "next/navigation";
import { AddFlowHeader } from "@/components/AddFlowHeader";
import { AddSwitcher } from "@/components/AddSwitcher";
import { AddBillForm } from "@/components/bills/AddBillForm";

export default function AddBillPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddFlowHeader />
      <AddSwitcher active="bill" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px)+1rem)]">
        <AddBillForm onSaved={() => router.refresh()} />
      </div>
    </div>
  );
}
