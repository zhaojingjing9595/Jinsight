"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { NumPad } from "@/components/NumPad";

// Mock data — replace with real holdings/goals from API
const MOCK_HOLDINGS = [
  // { id: "h1", type: "holding" as const, label: "Apple Inc. (AAPL)", icon: "📈" },
  // { id: "h2", type: "holding" as const, label: "Bitcoin (BTC)",       icon: "₿"  },
  // { id: "h3", type: "holding" as const, label: "S&P 500 ETF (SPY)",   icon: "🗂️" },
];
const MOCK_GOALS = [
  // { id: "g1", type: "goal" as const, label: "House Down Payment", icon: "🏠" },
  // { id: "g2", type: "goal" as const, label: "Retirement Fund",    icon: "🌅" },
];
const ALL_TARGETS = [...MOCK_HOLDINGS, ...MOCK_GOALS];

export default function LogContributionPage() {
  const [targetId, setTargetId]   = useState(ALL_TARGETS[0].id);
  const [amount, setAmount]       = useState("0");
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes]         = useState("");
  const [saved, setSaved]         = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const selectedTarget = ALL_TARGETS.find((t) => t.id === targetId)!;

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setAmount("0");
      setNotes("");
    }, 1500);
  }

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      {/* ── Top bar ── */}
      <div className="flex-none px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/add/investment" className="font-body text-[13px] font-bold text-muted">
            ← Investment
          </Link>
          <h1 className="font-body text-[11px] font-black uppercase tracking-[3px] text-ink">
            Log Contribution
          </h1>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4 pb-[calc(80px+16px)]">
        {/* Target selector */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
            Toward
          </label>
          <div className="flex flex-col gap-2">
            {/* Holdings group */}
            <p className="font-body text-[9px] font-bold uppercase tracking-[2px] text-muted">Holdings</p>
            {MOCK_HOLDINGS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setTargetId(h.id)}
                className={`font-body flex items-center gap-3 px-3 py-2.5 border-2 border-ink rounded-[10px] text-left transition-all ${
                  targetId === h.id ? "bg-reward shadow-neo-xs" : "bg-base shadow-none"
                }`}
              >
                <span className="text-[20px]">{h.icon}</span>
                <span className="text-[13px] font-bold text-ink">{h.label}</span>
                {targetId === h.id && <span className="ml-auto text-ink font-black">✓</span>}
              </button>
            ))}
            {/* Goals group */}
            <p className="font-body text-[9px] font-bold uppercase tracking-[2px] text-muted mt-1">Goals</p>
            {MOCK_GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setTargetId(g.id)}
                className={`font-body flex items-center gap-3 px-3 py-2.5 border-2 border-ink rounded-[10px] text-left transition-all ${
                  targetId === g.id ? "bg-goal shadow-neo-xs" : "bg-base shadow-none"
                }`}
              >
                <span className="text-[20px]">{g.icon}</span>
                <span className="text-[13px] font-bold text-ink">{g.label}</span>
                {targetId === g.id && <span className="ml-auto text-ink font-black">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Amount
          </label>
          <div className="border-[2.5px] border-ink rounded-card flex flex-col items-center justify-center py-3 mb-3 shadow-neo-md bg-[#fff9e6]">
            <p className="font-display font-black leading-none text-ink text-[clamp(32px,7vw,44px)]">
              ₪{amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="font-body text-[9px] text-muted mt-0.5">
              {selectedTarget.icon} → {selectedTarget.label}
            </p>
          </div>
          <NumPad value={amount} onChange={setAmount} />
        </div>

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

        {/* Notes */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Notes <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Monthly auto-invest"
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={amountNum === 0}
          className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md text-ink transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
            saved ? "bg-goal" : "bg-income"
          }`}
        >
          {saved ? "✓ Logged!" : "Log Contribution"}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
