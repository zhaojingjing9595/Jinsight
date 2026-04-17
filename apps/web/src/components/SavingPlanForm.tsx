"use client";

import { useState } from "react";
import { formatCurrency } from "@jinsight/core";
import { NumPad } from "@/components/NumPad";

const GOAL_ICON_PATHS: Record<string, string[]> = {
  emergency: ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 8v4", "M12 16h.01"],
  big_buy: ["M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z", "M3 6h18", "M16 10a4 4 0 01-8 0"],
  house: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
  travel: ["M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"],
  gift: ["M20 12v10H4V12", "M2 7h20v5H2z", "M12 22V7", "M12 7a4 4 0 00-4-4c-1.1 0-2 .9-2 2 0 2 6 2 6 2z", "M12 7a4 4 0 014-4c1.1 0 2 .9 2 2 0 2-6 2-6 2z"],
  custom: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
};

function GoalIcon({ type, size = 24 }: { type: string; size?: number }) {
  const paths = GOAL_ICON_PATHS[type] ?? GOAL_ICON_PATHS.custom;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#111008" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const GOAL_TYPES: {
  value: string;
  label: string;
  color: string;
}[] = [
  { value: "emergency",  label: "Emergency", color: "#feb704" },
  { value: "big_buy",    label: "Big Buy",   color: "#cdb1e7" },
  { value: "house",      label: "House",     color: "#2ad2a3" },
  { value: "travel",     label: "Travel",    color: "#3b82f6" },
  { value: "gift",       label: "Gift",      color: "#fdb6f0" },
  { value: "custom",     label: "Custom",    color: "#cce972" },
];

export function SavingPlanForm() {
  const [name, setName] = useState("");
  const [goalType, setGoalType] = useState("emergency");
  const [targetAmount, setTargetAmount] = useState("0");
  const [editingTarget, setEditingTarget] = useState(false);
  const [savedAmount, setSavedAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [autoMonthly, setAutoMonthly] = useState(false);
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const targetNum = parseFloat(targetAmount) || 0;
  const savedNum  = parseFloat(savedAmount) || 0;
  const progress  = targetNum > 0 ? Math.min((savedNum / targetNum) * 100, 100) : 0;

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName("");
      setTargetAmount("0");
      setSavedAmount("");
      setDeadline("");
      setMonthlyContribution("");
      setAutoMonthly(false);
      setNotes("");
    }, 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Goal type tiles */}
      <div className="flex gap-3 overflow-x-auto pt-1.5 pb-2 pl-[5px]" style={{ scrollbarWidth: "none" }}>
        {GOAL_TYPES.map((gt) => {
          const isActive = goalType === gt.value;
          return (
            <button
              key={gt.value}
              type="button"
              onClick={() => setGoalType(gt.value)}
              className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-[120ms]"
            >
              <div
                className="w-[52px] h-[52px] flex items-center justify-center border-[2.5px] border-ink rounded-[10px] transition-all duration-[120ms]"
                style={{
                  backgroundColor: gt.color,
                  boxShadow: isActive ? "var(--shadow-neo-md)" : "var(--shadow-neo-xs)",
                  transform: isActive ? "translate(-2px, -2px) scale(1.1)" : "none",
                  opacity: isActive ? 1 : 0.72,
                }}
              >
                <GoalIcon type={gt.value} size={26} />
              </div>
              <span
                className={`font-body text-center leading-tight text-[9px] max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap ${
                  isActive ? "font-[800] text-ink" : "font-[500] text-muted"
                }`}
              >
                {gt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Goal name */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Goal Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={
            goalType === "emergency" ? "e.g. 6-month cushion" :
            goalType === "house" ? "e.g. Down payment" :
            goalType === "travel" ? "e.g. Japan 2027" :
            "Give it a name…"
          }
          className="font-body w-full px-3 py-2.5 text-[14px] font-bold border-2 border-ink rounded-[10px] bg-base shadow-neo-xs focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#a57dee]"
        />
      </div>

      {/* Target amount */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Target Amount
        </label>
        <button
          type="button"
          onClick={() => setEditingTarget((v) => !v)}
          className={`w-full border-[2.5px] border-ink rounded-[12px] py-3 flex flex-col items-center shadow-neo-sm transition-all ${
            editingTarget ? "bg-[#fff9e6]" : "bg-base"
          }`}
        >
          <p className="font-display font-black leading-none text-ink text-[clamp(28px,6vw,40px)]">
            {formatCurrency(targetNum, "ILS")}
          </p>
          <p className="font-body text-[9px] text-muted mt-0.5">
            {editingTarget ? "tap to close numpad" : "tap to edit"}
          </p>
        </button>
        {editingTarget && (
          <div className="mt-3">
            <NumPad value={targetAmount} onChange={setTargetAmount} />
          </div>
        )}
      </div>

      {/* Already saved (optional) */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Already Saved <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          type="number"
          min="0"
          value={savedAmount}
          onChange={(e) => setSavedAmount(e.target.value)}
          placeholder="0"
          className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
        />
        {targetNum > 0 && savedNum > 0 && (
          <div className="mt-2">
            <div className="h-[12px] rounded-[30px] border-2 border-ink overflow-hidden relative bg-base">
              <div
                className="absolute left-0 top-0 h-full bg-goal"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-body text-[10px] font-bold text-muted">
                {progress.toFixed(0)}% there
              </span>
              <span className="font-body text-[10px] font-bold text-ink">
                {formatCurrency(targetNum - savedNum, "ILS")} to go
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deadline */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Deadline <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
        />
      </div>

      {/* Monthly auto-save */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-body text-[10px] font-bold uppercase tracking-[2px] text-ink">
            Monthly Contribution
          </label>
          <button
            type="button"
            onClick={() => setAutoMonthly((v) => !v)}
            className={`relative w-[46px] h-[26px] border-2 border-ink rounded-pill shadow-neo-xs transition-all ${
              autoMonthly ? "bg-primary" : "bg-[#d4d4d4]"
            }`}
          >
            <span
              className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white border-[1.5px] border-ink transition-all"
              style={{ left: autoMonthly ? "22px" : "3px" }}
            />
          </button>
        </div>
        {autoMonthly && (
          <input
            type="number"
            min="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="e.g. 500"
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why does this matter to you?"
          rows={2}
          className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-[10px] bg-base resize-none focus:outline-none focus:border-primary"
        />
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!name || targetNum === 0}
        className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
          saved ? "bg-goal text-ink" : "bg-primary text-white"
        }`}
      >
        {saved ? "✓ Goal Created!" : "Start Saving Plan"}
      </button>
    </div>
  );
}
