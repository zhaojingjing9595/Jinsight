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
    // TODO: wire to API
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName(""); setTargetAmount("0"); setCurrentAmount("0"); setTargetDate("");
    }, 1500);
  }

  return (
    <div
      className="flex flex-col max-w-[480px] mx-auto bg-[#fcfaeb]"
      style={{ height: "100dvh" }}
    >
      {/* ── Top bar ── */}
      <div className="flex-none px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/add/investment" className="text-[13px] font-bold text-[#888]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            ← Investment
          </Link>
          <h1 className="text-[11px] font-black uppercase tracking-[3px] text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
              className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] border-[2px] text-[11px] font-bold uppercase tracking-[0.5px] transition-all"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                borderColor: "#111008",
                backgroundColor: preset === i ? "#cce972" : "#fcfaeb",
                color: preset === i ? "#111008" : "#888",
                boxShadow: preset === i ? "2px 2px 0 #111008" : "none",
              }}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4"
        style={{ paddingBottom: "calc(80px + 16px)" }}
      >
        {/* Goal name */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Goal Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tokyo House Down Payment"
            className="w-full px-3 py-2.5 text-[14px] font-bold border-[2px] border-[#111008] rounded-[10px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee] focus:shadow-[2px_2px_0_#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", boxShadow: "2px 2px 0 #111008" }}
          />
        </div>

        {/* Target amount */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Target Amount
          </label>
          <button
            type="button"
            onClick={() => { setEditingTarget((v) => !v); setEditingCurrent(false); }}
            className="w-full border-[2.5px] border-[#111008] rounded-[12px] py-3 flex flex-col items-center transition-all"
            style={{ backgroundColor: editingTarget ? "#fff9e6" : "#fcfaeb", boxShadow: "3px 3px 0 #111008" }}
          >
            <p className="font-black leading-none text-[#111008]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px" }}>
              ₪{parseInt(targetAmount || "0").toLocaleString()}
            </p>
            <p className="text-[9px] text-[#888] mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {editingTarget ? "tap to close" : "tap to edit"}
            </p>
          </button>
          {editingTarget && <div className="mt-3"><NumPad value={targetAmount} onChange={setTargetAmount} /></div>}
        </div>

        {/* Current amount */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Already Saved <span className="font-normal text-[#888]">(optional)</span>
          </label>
          <button
            type="button"
            onClick={() => { setEditingCurrent((v) => !v); setEditingTarget(false); }}
            className="w-full border-[2px] border-[#111008] rounded-[10px] py-2.5 flex flex-col items-center transition-all"
            style={{ backgroundColor: editingCurrent ? "#f0fdf9" : "#fcfaeb", boxShadow: "2px 2px 0 #111008" }}
          >
            <p className="font-bold text-[18px] leading-none text-[#111008]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              ₪{parseInt(currentAmount || "0").toLocaleString()}
            </p>
          </button>
          {editingCurrent && <div className="mt-3"><NumPad value={currentAmount} onChange={setCurrentAmount} /></div>}
        </div>

        {/* Progress bar */}
        {targetNum > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] font-bold text-[#888]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Progress</span>
              <span className="text-[10px] font-bold text-[#2ad2a3]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-[12px] border-[2px] border-[#111008] rounded-[20px] overflow-hidden bg-[#fcfaeb]">
              <div
                className="h-full bg-[#2ad2a3] transition-all"
                style={{ width: `${progress}%`, borderRadius: "inherit" }}
              />
            </div>
          </div>
        )}

        {/* Target date */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Target Date <span className="font-normal text-[#888]">(optional)</span>
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        {/* Asset preference */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Asset Type <span className="font-normal text-[#888]">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ASSET_TYPES.map((at) => (
              <button
                key={at.value}
                type="button"
                onClick={() => setAssetType(assetType === at.value ? null : at.value)}
                className="px-3 py-1.5 rounded-[8px] border-[2px] text-[11px] font-bold transition-all"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  borderColor: "#111008",
                  backgroundColor: assetType === at.value ? "#cce972" : "#fcfaeb",
                  color: "#111008",
                  boxShadow: assetType === at.value ? "2px 2px 0 #111008" : "none",
                }}
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
          className="w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-[#111008] rounded-[10px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            backgroundColor: saved ? "#2ad2a3" : "#cce972",
            color: "#111008",
            boxShadow: "4px 4px 0 #111008",
          }}
        >
          {saved ? "✓ Goal Set!" : "Set Goal"}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
