"use client";

import { useState } from "react";
import { GOAL_TYPE_META, formatCurrency } from "@jinsight/core";
import type { GoalType, SpendingPlanItem } from "@jinsight/core";
import { NumPad } from "@/components/NumPad";

/* ── Types ── */

export type GoalFormData = {
  type: GoalType;
  name: string;
  emoji: string;
  targetAmount: number;
  startDate: string;
  endDate: string | null;
  spendingPlan: SpendingPlanItem[] | null;
};

type GoalFormProps = {
  onSave: (data: GoalFormData) => void;
  onClose: () => void;
};

const GOAL_TYPES: GoalType[] = ["TRIP_EVENT", "PURCHASE", "EMERGENCY", "DEBT", "CUSTOM"];

const EMOJI_PICKS = ["🎯", "✈️", "🏠", "🚗", "💻", "🎓", "💍", "🏖️", "🛡️", "💳", "🎉", "🌍", "📱", "🎸", "🏋️", "🧳"];

const TRIP_CATEGORIES = ["Flights", "Hotel", "Food", "Activities", "Shopping", "Transport", "Other"];

/* ── Steps ── */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full border-[1.5px] border-ink transition-all ${
            i <= current ? "bg-primary" : "bg-[#f5f5f0]"
          }`}
        />
      ))}
    </div>
  );
}

/* Step 1: Select goal type */
function StepType({
  value,
  onChange,
}: {
  value: GoalType;
  onChange: (t: GoalType) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="font-display font-black text-[18px] text-ink uppercase tracking-[0.5px] mb-1">
        What are you saving for?
      </h3>
      {GOAL_TYPES.map((t) => {
        const meta = GOAL_TYPE_META[t];
        const isActive = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`w-full text-left p-3 border-2 border-ink rounded-[12px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              isActive
                ? "bg-primary shadow-neo-sm -translate-x-px -translate-y-px"
                : "bg-base shadow-[1px_1px_0_#ccc]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[24px]">{meta.emoji}</span>
              <div>
                <p className={`font-body text-[13px] font-bold ${isActive ? "text-white" : "text-ink"}`}>
                  {meta.label}
                </p>
                <p className={`font-body text-[10px] ${isActive ? "text-white/70" : "text-muted"}`}>
                  {meta.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* Step 2: Name, emoji, target amount */
function StepDetails({
  name,
  emoji,
  amount,
  onNameChange,
  onEmojiChange,
  onAmountChange,
}: {
  name: string;
  emoji: string;
  amount: string;
  onNameChange: (n: string) => void;
  onEmojiChange: (e: string) => void;
  onAmountChange: (a: string) => void;
}) {
  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display font-black text-[18px] text-ink uppercase tracking-[0.5px]">
        Goal details
      </h3>

      {/* Name */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Goal Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Tokyo Trip 2026"
          className="w-full px-3 py-2.5 border-2 border-ink rounded-[8px] bg-base font-body text-[14px] text-ink placeholder:text-muted/50 focus:outline-none focus:shadow-neo-xs"
        />
      </div>

      {/* Emoji picker */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Pick an Emoji
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_PICKS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onEmojiChange(e)}
              className={`w-[40px] h-[40px] flex items-center justify-center text-[20px] border-2 border-ink rounded-[8px] transition-all ${
                emoji === e
                  ? "bg-primary shadow-neo-xs -translate-x-px -translate-y-px"
                  : "bg-base"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Target Amount
        </label>
        <div className="border-[2.5px] border-ink rounded-[12px] py-2.5 flex flex-col items-center bg-[#fff9e6]">
          <p className="font-display font-black leading-none text-ink text-[28px]">
            {formatCurrency(amountNum, "ILS")}
          </p>
        </div>
      </div>

      <NumPad value={amount} onChange={onAmountChange} />
    </div>
  );
}

/* Step 3: Start date + target date */
function StepDate({
  goalType,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  goalType: GoalType;
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
}) {
  const isEmergency = goalType === "EMERGENCY";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display font-black text-[18px] text-ink uppercase tracking-[0.5px]">
        {isEmergency ? "When does it start?" : "When does it start and end?"}
      </h3>

      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-ink rounded-[8px] bg-base font-body text-[14px] text-ink focus:outline-none focus:shadow-neo-xs"
        />
      </div>

      {isEmergency ? (
        <div className="p-4 border-2 border-ink rounded-[12px] bg-[#cce972]/20">
          <p className="font-body text-[13px] text-ink">
            Emergency funds don&apos;t have a deadline — just keep saving at your own pace. 🛡️
          </p>
        </div>
      ) : (
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Target Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2.5 border-2 border-ink rounded-[8px] bg-base font-body text-[14px] text-ink focus:outline-none focus:shadow-neo-xs"
          />
        </div>
      )}
    </div>
  );
}

/* Step 4 (Trip/Event only): Spending breakdown */
function StepSpendingPlan({
  targetAmount,
  plan,
  onPlanChange,
}: {
  targetAmount: number;
  plan: SpendingPlanItem[];
  onPlanChange: (p: SpendingPlanItem[]) => void;
}) {
  const total = plan.reduce((s, p) => s + p.budget, 0);
  const remaining = targetAmount - total;

  function updateCategory(index: number, budget: number) {
    const updated = [...plan];
    updated[index] = { ...updated[index], budget };
    onPlanChange(updated);
  }

  function addCategory(category: string) {
    onPlanChange([...plan, { category, budget: 0, actual: 0 }]);
  }

  function removeCategory(index: number) {
    onPlanChange(plan.filter((_, i) => i !== index));
  }

  const usedCategories = plan.map((p) => p.category);
  const availableCategories = TRIP_CATEGORIES.filter((c) => !usedCategories.includes(c));

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display font-black text-[18px] text-ink uppercase tracking-[0.5px]">
        Spending Breakdown
      </h3>
      <p className="font-body text-[11px] text-muted -mt-1">
        Optional — plan how you&apos;ll spend your {formatCurrency(targetAmount, "ILS")} budget
      </p>

      {/* Existing categories */}
      {plan.map((item, i) => (
        <div
          key={item.category}
          className="flex items-center gap-2 p-2.5 border-2 border-ink rounded-[10px] bg-base"
        >
          <span className="font-body text-[12px] font-bold text-ink flex-1">{item.category}</span>
          <input
            type="number"
            value={item.budget || ""}
            onChange={(e) => updateCategory(i, parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-[90px] px-2 py-1 border-2 border-ink rounded-[6px] bg-[#fff9e6] font-display font-black text-[14px] text-ink text-right focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeCategory(i)}
            className="w-7 h-7 flex items-center justify-center border-[1.5px] border-ink rounded-full text-alert font-bold text-[12px] active:scale-95"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add category */}
      {availableCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => addCategory(c)}
              className="px-3 py-1.5 border-[1.5px] border-dashed border-primary/50 rounded-[20px] font-body text-[10px] font-bold text-primary active:bg-primary/5"
            >
              + {c}
            </button>
          ))}
        </div>
      )}

      {/* Total summary */}
      <div className="flex justify-between items-center p-2.5 border-2 border-ink rounded-[10px] bg-[#f5f5f0]">
        <span className="font-body text-[11px] font-bold text-ink uppercase tracking-[1px]">
          Allocated
        </span>
        <span
          className={`font-display font-black text-[16px] ${
            remaining < 0 ? "text-alert" : "text-ink"
          }`}
        >
          {formatCurrency(total, "ILS")} / {formatCurrency(targetAmount, "ILS")}
        </span>
      </div>
      {remaining < 0 && (
        <p className="font-body text-[10px] font-bold text-alert">
          Over budget by {formatCurrency(Math.abs(remaining), "ILS")}
        </p>
      )}
    </div>
  );
}

/* ── Main Form ── */

export function GoalForm({ onSave, onClose }: GoalFormProps) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<GoalType>("CUSTOM");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [amount, setAmount] = useState("0");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [spendingPlan, setSpendingPlan] = useState<SpendingPlanItem[]>([]);

  const amountNum = parseFloat(amount) || 0;
  const isTripEvent = type === "TRIP_EVENT";
  const isEmergency = type === "EMERGENCY";

  // Steps: 0=type, 1=details, 2=date, 3=spending (trip only)
  const totalSteps = isTripEvent ? 4 : 3;

  function canAdvance(): boolean {
    switch (step) {
      case 0: return true;
      case 1: return name.trim().length > 0 && amountNum > 0;
      case 2: return startDate.length > 0 && (isEmergency || endDate.length > 0);
      case 3: return true; // spending plan is optional
      default: return false;
    }
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleSave() {
    const planData = isTripEvent && spendingPlan.length > 0 ? spendingPlan : null;
    onSave({
      type,
      name: name.trim(),
      emoji,
      targetAmount: amountNum,
      startDate: new Date(startDate).toISOString(),
      endDate: isEmergency ? null : endDate ? new Date(endDate).toISOString() : null,
      spendingPlan: planData,
    });
  }

  const isLastStep = step === totalSteps - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-base animate-[slideUp_200ms_cubic-bezier(0.2,0.8,0.2,1)]"
      role="dialog"
      aria-modal="true"
      aria-label="Create a goal"
    >
      <div className="relative w-full max-w-[480px] mx-auto flex flex-col h-dvh">
        {/* Header */}
        <div className="flex-none relative flex items-center justify-center px-4 pt-5 pb-3">
          <h2 className="font-display font-black text-[20px] text-ink uppercase tracking-[1px]">
            New Goal
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

        <StepIndicator current={step} total={totalSteps} />

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5">
          {step === 0 && <StepType value={type} onChange={setType} />}
          {step === 1 && (
            <StepDetails
              name={name}
              emoji={emoji}
              amount={amount}
              onNameChange={setName}
              onEmojiChange={setEmoji}
              onAmountChange={setAmount}
            />
          )}
          {step === 2 && (
            <StepDate
              goalType={type}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          )}
          {step === 3 && isTripEvent && (
            <StepSpendingPlan
              targetAmount={amountNum}
              plan={spendingPlan}
              onPlanChange={setSpendingPlan}
            />
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex-none px-4 pb-6 pt-2 flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="font-body flex-none px-5 py-3 text-[12px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-base text-ink shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
            className="font-body flex-1 py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-primary text-white shadow-neo-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLastStep ? "Create Goal" : "Next"}
          </button>
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
