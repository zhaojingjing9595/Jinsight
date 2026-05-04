"use client";

import { useEffect, useState } from "react";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { AddBillForm } from "@/components/bills/AddBillForm";

type Tab = "transaction" | "bill";

type AddModalProps = {
  open: boolean;
  onClose: () => void;
  defaultTab?: Tab;
};

export function AddModal({ open, onClose, defaultTab = "transaction" }: AddModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-base animate-[slideUp_200ms_cubic-bezier(0.2,0.8,0.2,1)]"
      role="dialog"
      aria-modal="true"
      aria-label={tab === "transaction" ? "Add transaction" : "Add bill"}
    >
      <div className="relative w-full max-w-[480px] mx-auto flex flex-col h-dvh">
        <div className="flex-none flex items-center justify-between gap-3 p-4 pb-3">
          <div className="w-9 shrink-0" aria-hidden />
          <h1 className="font-display font-black text-[15px] sm:text-[16px] text-ink uppercase tracking-[1px] text-center flex-1 min-w-0 leading-tight">
            Add transaction / bill
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 shrink-0 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-body text-[18px] font-bold leading-none text-ink"
          >
            ×
          </button>
        </div>

        <div className="flex-none flex gap-2 px-4 pt-1 pb-3">
          {(["transaction", "bill"] as Tab[]).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 px-1 border-2 border-ink rounded-[12px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  isActive
                    ? "bg-primary shadow-neo-sm -translate-x-px -translate-y-px"
                    : "bg-base shadow-[1px_1px_0_#ccc]"
                }`}
              >
                <span className="font-body text-[10px] sm:text-[11px] font-black uppercase tracking-[1px] sm:tracking-[1.5px] text-ink text-center leading-tight">
                  {t === "transaction" ? "Transaction" : "Bill"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px)+1rem)]">
          {tab === "transaction" ? (
            <AddTransactionForm onSaved={onClose} />
          ) : (
            <AddBillForm onSaved={onClose} />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
