"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@jinsight/core";
import type { Category, TransactionType } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { AddSwitcher } from "@/components/AddSwitcher";
import { NumPad } from "@/components/NumPad";
import { CategoryPicker } from "@/components/CategoryPicker";
import { TypeToggle } from "@/components/TypeToggle";
import { trpcQuery, trpcMutate } from "@/lib/api";

export default function AddPage() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    trpcQuery<{ user: { accounts: { id: string }[] } }>("users.me")
      .then((data) => setAccountId(data.user.accounts?.[0]?.id ?? null))
      .catch(console.error);
  }, []);

  const displayAmount = formatCurrency(parseFloat(amount) || 0, "ILS");
  const isExpense = type === "EXPENSE";

  async function handleSave() {
    if (!accountId || saving) return;

    setSaveError(null);
    setSaving(true);
    try {
      await trpcMutate("transactions.create", {
        accountId,
        amount: parseFloat(amount),
        type,
        category: category ?? "other",
        description: name || undefined,
        date: new Date(date).toISOString(),
        isRecurring,
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setAmount("0");
        setCategory(null);
        setName("");
        setIsRecurring(false);
        router.refresh();
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSaveError(message);
      console.error("Failed to save transaction:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddSwitcher active="transaction" />

      {/* ── Scrollable form body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4 pb-[calc(80px+16px)]">
        {saveError && (
          <div className="bg-alert/10 border-2 border-alert rounded-btn px-3 py-2 text-[12px] font-body font-[700] text-alert whitespace-pre-wrap">
            {saveError}
          </div>
        )}
        {/* Type toggle */}
        <div className="flex justify-center">
          <TypeToggle value={type} onChange={(t) => { setType(t); setCategory(null); }} />
        </div>

        {/* Category picker — above amount */}
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
            Category
          </p>
          <CategoryPicker
            value={category}
            onChange={setCategory}
            mode={isExpense ? "expense" : "income"}
            onAddNew={() => {
              // TODO: open new-category modal
            }}
          />
        </div>

        {/* Amount display */}
        <div
          className={`border-[2.5px] border-ink rounded-card flex flex-col items-center justify-center py-4 shadow-neo-md ${
            isExpense ? "bg-[#fff5f5]" : "bg-[#f0fdf9]"
          }`}
        >
          <p className={`font-body text-[11px] font-bold uppercase tracking-[2px] mb-1 ${isExpense ? "text-alert" : "text-income"}`}>
            {isExpense ? "Spending" : "Earning"}
          </p>
          <p className="font-display font-black leading-none text-ink text-[clamp(36px,8vw,52px)]">
            {displayAmount}
          </p>
        </div>

        {/* NumPad */}
        <NumPad value={amount} onChange={setAmount} />

        {/* Name — optional when category is set, required otherwise */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Name{" "}
            {category ? (
              <span className="font-normal text-muted">(optional)</span>
            ) : (
              <span className="font-normal text-alert">(required)</span>
            )}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={category ? "e.g. Coffee with Jun" : "What was this for?"}
            className={`font-body w-full px-3 py-2 text-[13px] border-2 rounded-btn bg-base focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#a57dee] ${
              !category && !name.trim() ? "border-alert" : "border-ink"
            }`}
          />
        </div>

        {/* Assign to category — shown when no category picked and name entered */}
        {!category && name.trim() && (
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
              Assign &quot;{name.trim()}&quot; to a category
            </p>
            <CategoryPicker
              value={category}
              onChange={setCategory}
              mode={isExpense ? "expense" : "income"}
            />
          </div>
        )}

        {/* More options (collapsed) — Date + Recurring only */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="font-body flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] text-muted self-start"
        >
          <span
            className="inline-block transition-transform duration-150"
            style={{ transform: showMore ? "rotate(90deg)" : "none" }}
          >
            ▶
          </span>
          {showMore ? "Less options" : "More options"}
        </button>

        {showMore && (
          <div className="flex flex-col gap-3">
            {/* Date */}
            <div>
              <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center justify-between">
              <span className="font-body text-[12px] font-bold text-ink">
                Recurring
              </span>
              <button
                type="button"
                onClick={() => setIsRecurring((v) => !v)}
                className={`relative w-[46px] h-[26px] border-2 border-ink rounded-pill shadow-neo-xs transition-all ${
                  isRecurring ? "bg-primary" : "bg-[#d4d4d4]"
                }`}
              >
                <span
                  className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white border-[1.5px] border-ink transition-all"
                  style={{ left: isRecurring ? "22px" : "3px" }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={parseFloat(amount) === 0 || (!category && !name.trim()) || !accountId || saving}
          className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
            saved
              ? "bg-goal text-ink"
              : isExpense
                ? "bg-alert text-white"
                : "bg-income text-ink"
          }`}
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : `Save ${isExpense ? "Expense" : "Income"}`}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
