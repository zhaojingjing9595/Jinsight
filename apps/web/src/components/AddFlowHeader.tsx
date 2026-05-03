"use client";

import { useRouter } from "next/navigation";

export function AddFlowHeader() {
  const router = useRouter();

  return (
    <header className="flex-none flex items-center justify-between gap-3 p-4 pb-3">
      <div className="w-9 shrink-0" aria-hidden />
      <h1 className="font-display font-black text-[15px] sm:text-[16px] text-ink uppercase tracking-[1px] text-center flex-1 min-w-0 leading-tight">
        Add transaction / bill
      </h1>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-9 h-9 shrink-0 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-body text-[18px] font-bold leading-none text-ink"
        aria-label="Close"
      >
        ×
      </button>
    </header>
  );
}
