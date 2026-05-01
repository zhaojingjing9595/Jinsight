"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@jinsight/core";
import { trpcMutate } from "@/lib/api";

type BalanceSource = { label: string; amount: string };

type Props = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  currentBalance: number;
  currentOpeningBalance: number | null;
  currentSources: { label: string; amount: number }[] | null;
  totalIncome: number;
  totalExpenses: number;
  onSaved: (
    newBalance: number,
    newOpeningBalance: number,
    openingBalanceSources: { label: string; amount: number }[],
  ) => void;
};

type Mode = "opening" | "current";

function emptySource(): BalanceSource {
  return { label: "", amount: "" };
}

export function BalanceEditModal({
  open,
  onClose,
  accountId,
  currentBalance,
  currentOpeningBalance,
  currentSources,
  totalIncome,
  totalExpenses,
  onSaved,
}: Props) {
  const [mode, setMode] = useState<Mode>("opening");
  const [sources, setSources] = useState<BalanceSource[]>([emptySource()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate from saved data when modal opens
  useEffect(() => {
    if (!open) return;
    if (currentSources && currentSources.length > 0) {
      setSources(currentSources.map((s) => ({ label: s.label, amount: String(s.amount) })));
      setMode(currentOpeningBalance != null ? "opening" : "current");
    } else {
      setSources([emptySource()]);
      setMode("opening");
    }
    setError(null);
  }, [open, currentSources, currentOpeningBalance]);

  if (!open) return null;

  const parsedSources = sources.map((s) => ({
    label: s.label || "Account",
    amount: parseFloat(s.amount) || 0,
  }));
  const total = parsedSources.reduce((sum, s) => sum + s.amount, 0);

  function addSource() {
    setSources((prev) => [...prev, emptySource()]);
  }

  function removeSource(i: number) {
    setSources((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSource(i: number, field: keyof BalanceSource, val: string) {
    setSources((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  }

  async function handleSave() {
    if (total <= 0) {
      setError("Please enter a valid balance amount.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let newBalance: number;
      let newOpeningBalance: number;

      if (mode === "opening") {
        newOpeningBalance = total;
        newBalance = total + totalIncome - totalExpenses;
      } else {
        newBalance = total;
        newOpeningBalance = total - totalIncome + totalExpenses;
      }

      await trpcMutate("accounts.update", {
        id: accountId,
        balance: newBalance,
        openingBalance: newOpeningBalance,
        openingBalanceSources: parsedSources,
      });

      onSaved(newBalance, newOpeningBalance, parsedSources);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const monthName = new Date().toLocaleDateString("en-US", { month: "long" });
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const firstLabel = firstOfMonth.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[440px] bg-base border-[2.5px] border-ink rounded-[20px] shadow-neo-lg px-5 pt-4 pb-6 flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
        {/* Handle + header */}
        <div className="flex items-center justify-between">
          <h2 className="font-body text-[14px] font-black uppercase tracking-[1.5px] text-ink">
            Set Your Balance
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-ink bg-base hover:bg-ink/5"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#111008" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex flex-col gap-2">
          {(["opening", "current"] as Mode[]).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-start gap-3 p-3 rounded-[12px] border-2 transition-all text-left ${
                  isActive ? "border-primary bg-primary/5 shadow-neo-xs" : "border-ink/20 bg-base"
                }`}
              >
                <div className={`flex-none mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? "border-primary" : "border-ink/30"}`}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="font-body text-[12px] font-[800] uppercase tracking-[1px] text-ink">
                    {m === "opening" ? `Opening Balance (${firstLabel})` : "Current Total Balance"}
                  </p>
                  <p className="font-body text-[10px] text-muted mt-0.5">
                    {m === "opening"
                      ? `What you had on ${firstLabel} — ${monthName} income & spending added automatically`
                      : "What you have right now — we'll back-calculate your opening balance"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sources */}
        <div className="flex flex-col gap-2">
          <p className="font-body text-[10px] font-bold uppercase tracking-[2px] text-ink">
            Sources
          </p>
          {sources.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={s.label}
                onChange={(e) => updateSource(i, "label", e.target.value)}
                placeholder="e.g. Bank, Cash, Savings"
                className="font-body flex-1 min-w-0 px-3 py-2 text-[12px] border-2 border-ink rounded-[8px] bg-base focus:outline-none focus:border-primary"
              />
              <input
                type="number"
                inputMode="decimal"
                value={s.amount}
                onChange={(e) => updateSource(i, "amount", e.target.value)}
                placeholder="0"
                className="font-body w-24 px-3 py-2 text-[12px] border-2 border-ink rounded-[8px] bg-base text-right focus:outline-none focus:border-primary"
              />
              {sources.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSource(i)}
                  className="flex-none w-7 h-7 flex items-center justify-center rounded-full border-2 border-ink/30 hover:border-alert hover:bg-alert/10 transition-colors"
                  aria-label="Remove source"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addSource}
            className="font-body flex items-center gap-1.5 text-[11px] font-[700] uppercase tracking-[1px] text-primary self-start"
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add source
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-ink/5 border border-ink/20">
          <span className="font-body text-[11px] font-bold uppercase tracking-[1px] text-muted">
            Total {mode === "opening" ? "Opening" : "Current"} Balance
          </span>
          <span className="font-display text-[16px] font-black text-ink">
            {formatCurrency(total, "ILS")}
          </span>
        </div>

        {error && (
          <p className="font-body text-[11px] text-alert font-[600]">{error}</p>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || total <= 0}
          className="font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-primary text-white shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
        >
          {saving ? "Saving…" : "Save Balance"}
        </button>
      </div>
      </div>
    </>
  );
}
