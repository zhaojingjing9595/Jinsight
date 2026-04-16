"use client";

import { useEffect } from "react";
import { AddTransactionForm } from "@/components/AddTransactionForm";

type AddTransactionModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
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
      aria-label="Add transaction"
    >
      <div className="relative w-full max-w-[480px] mx-auto flex flex-col h-dvh">
        <div className="flex-none relative flex items-center justify-center px-4 pt-5 pb-3">
          <h2 className="font-display font-black text-[20px] text-ink uppercase tracking-[1px]">
            Add Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-2 border-ink rounded-full bg-base shadow-neo-xs font-body font-bold text-[15px] text-ink transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-5">
          <AddTransactionForm onSaved={onClose} />
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
