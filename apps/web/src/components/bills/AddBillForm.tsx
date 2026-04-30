"use client";

import { useState } from "react";
import type { Category } from "@jinsight/core";
import { trpcMutate } from "@/lib/api";
import { CategoryPicker } from "@/components/CategoryPicker";

type Recurrence = "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM";

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "CUSTOM", label: "Custom" },
];

const BILL_CATEGORIES: Category[] = [
  "utilities",
  "subscriptions",
  "rent",
  "transport",
  "education",
  "other",
];

type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurrence: Recurrence;
  isRecurring: boolean;
  isSubscription: boolean;
  reminderDays: number;
};

type AddBillFormProps = {
  initial?: Partial<Bill>;
  onSaved?: (bill: Bill) => void;
};

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function AddBillForm({ initial, onSaved }: AddBillFormProps) {
  const editing = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState<string>(
    initial?.amount !== undefined ? String(initial.amount) : "",
  );
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? new Date(initial.dueDate).toISOString().split("T")[0] : todayPlus(7),
  );
  const [category, setCategory] = useState<Category>((initial?.category as Category) ?? "utilities");
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? "MONTHLY");
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? true);
  const [isSubscription, setIsSubscription] = useState(initial?.isSubscription ?? false);
  const [reminderDays, setReminderDays] = useState(initial?.reminderDays ?? 3);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount);
  const valid = name.trim().length > 0 && amountNum > 0 && Boolean(dueDate);

  async function handleSave() {
    if (!valid || saving) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        amount: amountNum,
        dueDate: new Date(dueDate).toISOString(),
        category,
        recurrence,
        isRecurring,
        isSubscription,
        reminderDays,
      };

      const res = editing
        ? await trpcMutate<{ bill: Bill }>("bills.update", { id: initial!.id, ...payload })
        : await trpcMutate<{ bill: Bill }>("bills.create", payload);

      window.dispatchEvent(new CustomEvent("jinsight:bill-changed"));
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSaved?.(res.bill);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-alert/10 border-2 border-alert rounded-btn px-3 py-2 text-[12px] font-body font-bold text-alert whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Bill name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electricity, Netflix"
          className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#a57dee]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Amount
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Next due
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <p className="font-body text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
          Category
        </p>
        <CategoryPicker
          value={category}
          onChange={setCategory}
          mode="expense"
          categories={BILL_CATEGORIES}
        />
      </div>

      <div>
        <p className="font-body text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
          Recurrence
        </p>
        <div className="grid grid-cols-4 gap-2">
          {RECURRENCE_OPTIONS.map((r) => {
            const active = recurrence === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRecurrence(r.value)}
                className={`px-2 py-2 border-2 border-ink rounded-btn font-body text-[11px] font-bold uppercase tracking-[1px] transition-all ${
                  active ? "bg-ink text-base" : "bg-base text-ink"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Remind me (days before)
        </label>
        <input
          type="number"
          min={0}
          max={60}
          value={reminderDays}
          onChange={(e) => setReminderDays(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
          className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-3">
        <ToggleRow
          label="Recurring"
          value={isRecurring}
          onChange={setIsRecurring}
          hint="Auto-roll forward after marked paid"
        />
        <ToggleRow
          label="Subscription"
          value={isSubscription}
          onChange={setIsSubscription}
          hint="Flag as subscription"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!valid || saving}
        className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
          saved ? "bg-goal text-ink" : "bg-primary text-white"
        }`}
      >
        {saved ? "✓ Saved!" : saving ? "Saving..." : editing ? "Update Bill" : "Save Bill"}
      </button>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-body text-[12px] font-bold text-ink">{label}</span>
        {hint && (
          <p className="font-body text-[10px] text-muted mt-0.5">{hint}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-[46px] h-[26px] border-2 border-ink rounded-pill shadow-neo-xs transition-all ${
          value ? "bg-primary" : "bg-[#d4d4d4]"
        }`}
      >
        <span
          className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white border-[1.5px] border-ink transition-all"
          style={{ left: value ? "22px" : "3px" }}
        />
      </button>
    </div>
  );
}
