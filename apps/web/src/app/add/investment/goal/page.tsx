"use client";

import { useState } from "react";
import Link from "next/link";
import type { AssetType } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { NumPad } from "@/components/NumPad";

const GOAL_PRESETS = [
  { icon: "🏠", label: "House",       targetHint: "500000" },
  { icon: "✈️", label: "Travel",      targetHint: "10000"  },
  { icon: "📚", label: "Education",   targetHint: "30000"  },
  { icon: "🌅", label: "Retirement",  targetHint: "1000000"},
  { icon: "🚗", label: "Vehicle",     targetHint: "80000"  },
  { icon: "⭐", label: "Custom",       targetHint: "0"      },
];

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "stock",       label: "Stocks" },
  { value: "etf",         label: "ETFs"   },
  { value: "crypto",      label: "Crypto" },
  { value: "bond",        label: "Bonds"  },
  { value: "other",       label: "Mixed"  },
];

export default function InvestmentGoalPage() {
  const [preset, setPreset]           = useState(0);
  const [name, setName]               = useState("");
  const [targetAmount, setTargetAmount] = useState("0");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [editingTarget, setEditingTarget]   = useState(false);
  const [editingCurrent, setEditingCurrent] = useState(false);
  const [targetDate, setTargetDate]   = useState("");
  const [assetType, setAssetType]     = useState<AssetType | null>(null);
  const [saved, setSaved]             = useState(false);

  const targetNum  = parseFloat(targetAmount) || 0;
  const currentNum = parseFloat(currentAmount) || 0;
  const progress   = targetNum > 0 ? Math.min((currentNum / targetNum) * 100, 100) : 0;

  function handlePreset(idx: number) {
    setPreset(idx);
    const p = GOAL_PRESETS[idx];
    if (p.label !== "Custom") setName(p.label);
    if (p.targetHint !== "0") setTargetAmount(p.targetHint);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName(""); setTargetAmount("0"); setCurrentAmount("0"); setTargetDate("");
    }, 1500);
  }

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      {/* ── Top bar ── */}
      <div className="flex-none px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/add/investment" className="font-body text-[13px] font-bold text-muted">
            ← Investment
          </Link>
          <h1 className="font-body text-[11px] font-black uppercase tracking-[3px] text-ink">
            Investment Goal
          </h1>
        </div>

        {/* Preset chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {GOAL_PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(i)}
              className={`font-body flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-pill border-2 border-ink text-[11px] font-bold uppercase tracking-[0.5px] transition-all ${
                preset === i ? "bg-goal text-ink shadow-neo-xs" : "bg-base text-muted shadow-none"
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4 pb-[calc(80px+16px)]">
        {/* Goal name */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Goal Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tokyo House Down Payment"
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
            onClick={() => { setEditingTarget((v) => !v); setEditingCurrent(false); }}
            className={`w-full border-[2.5px] border-ink rounded-[12px] py-3 flex flex-col items-center shadow-neo-sm transition-all ${
              editingTarget ? "bg-[#fff9e6]" : "bg-base"
            }`}
          >
            <p className="font-display font-black leading-none text-ink text-[36px]">
              ₪{parseInt(targetAmount || "0").toLocaleString()}
            </p>
            <p className="font-body text-[9px] text-muted mt-0.5">
              {editingTarget ? "tap to close" : "tap to edit"}
            </p>
          </button>
          {editingTarget && <div className="mt-3"><NumPad value={targetAmount} onChange={setTargetAmount} /></div>}
        </div>

        {/* Current amount */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Already Saved <span className="font-normal text-muted">(optional)</span>
          </label>
          <button
            type="button"
            onClick={() => { setEditingCurrent((v) => !v); setEditingTarget(false); }}
            className={`w-full border-2 border-ink rounded-[10px] py-2.5 flex flex-col items-center shadow-neo-xs transition-all ${
              editingCurrent ? "bg-[#f0fdf9]" : "bg-base"
            }`}
          >
            <p className="font-display font-bold text-[18px] leading-none text-ink">
              ₪{parseInt(currentAmount || "0").toLocaleString()}
            </p>
          </button>
          {editingCurrent && <div className="mt-3"><NumPad value={currentAmount} onChange={setCurrentAmount} /></div>}
        </div>

        {/* Progress bar */}
        {targetNum > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-body text-[10px] font-bold text-muted">Progress</span>
              <span className="font-body text-[10px] font-bold text-income">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-[12px] border-2 border-ink rounded-pill overflow-hidden bg-base">
              <div
                className="h-full bg-income transition-all"
                style={{ width: `${progress}%`, borderRadius: "inherit" }}
              />
            </div>
          </div>
        )}

        {/* Target date */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Target Date <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        </div>

        {/* Asset preference */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
            Asset Type <span className="font-normal text-muted">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ASSET_TYPES.map((at) => (
              <button
                key={at.value}
                type="button"
                onClick={() => setAssetType(assetType === at.value ? null : at.value)}
                className={`font-body px-3 py-1.5 rounded-btn border-2 border-ink text-[11px] font-bold text-ink transition-all ${
                  assetType === at.value ? "bg-goal shadow-neo-xs" : "bg-base shadow-none"
                }`}
              >
                {at.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!name || targetNum === 0}
          className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md text-ink transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
            saved ? "bg-income" : "bg-goal"
          }`}
        >
          {saved ? "✓ Goal Set!" : "Set Goal"}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
