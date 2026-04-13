"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { NumPad } from "@/components/NumPad";

// Mock data — replace with real holdings/goals from API
const MOCK_HOLDINGS = [
  { id: "h1", type: "holding" as const, label: "Apple Inc. (AAPL)", icon: "📈" },
  { id: "h2", type: "holding" as const, label: "Bitcoin (BTC)",       icon: "₿"  },
  { id: "h3", type: "holding" as const, label: "S&P 500 ETF (SPY)",   icon: "🗂️" },
];
const MOCK_GOALS = [
  { id: "g1", type: "goal" as const, label: "House Down Payment", icon: "🏠" },
  { id: "g2", type: "goal" as const, label: "Retirement Fund",    icon: "🌅" },
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
    // TODO: wire to API
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setAmount("0");
      setNotes("");
    }, 1500);
  }

  return (
    <div
      className="flex flex-col max-w-[480px] mx-auto bg-[#fcfaeb]"
      style={{ height: "100dvh" }}
    >
      {/* ── Top bar ── */}
      <div className="flex-none px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/add/investment" className="text-[13px] font-bold text-[#888]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            ← Investment
          </Link>
          <h1 className="text-[11px] font-black uppercase tracking-[3px] text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Log Contribution
          </h1>
        </div>
      </div>

      {/* ── Form ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4"
        style={{ paddingBottom: "calc(80px + 16px)" }}
      >
        {/* Target selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Toward
          </label>
          <div className="flex flex-col gap-2">
            {/* Holdings group */}
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#888]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Holdings</p>
            {MOCK_HOLDINGS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setTargetId(h.id)}
                className="flex items-center gap-3 px-3 py-2.5 border-[2px] rounded-[10px] text-left transition-all"
                style={{
                  borderColor: "#111008",
                  backgroundColor: targetId === h.id ? "#feb704" : "#fcfaeb",
                  boxShadow: targetId === h.id ? "2px 2px 0 #111008" : "none",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <span className="text-[20px]">{h.icon}</span>
                <span className="text-[13px] font-bold text-[#111008]">{h.label}</span>
                {targetId === h.id && <span className="ml-auto text-[#111008] font-black">✓</span>}
              </button>
            ))}
            {/* Goals group */}
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#888] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Goals</p>
            {MOCK_GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setTargetId(g.id)}
                className="flex items-center gap-3 px-3 py-2.5 border-[2px] rounded-[10px] text-left transition-all"
                style={{
                  borderColor: "#111008",
                  backgroundColor: targetId === g.id ? "#cce972" : "#fcfaeb",
                  boxShadow: targetId === g.id ? "2px 2px 0 #111008" : "none",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <span className="text-[20px]">{g.icon}</span>
                <span className="text-[13px] font-bold text-[#111008]">{g.label}</span>
                {targetId === g.id && <span className="ml-auto text-[#111008] font-black">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Amount
          </label>
          <div
            className="border-[2.5px] border-[#111008] rounded-[14px] flex flex-col items-center justify-center py-3 mb-3"
            style={{ boxShadow: "4px 4px 0 #111008", backgroundColor: "#fff9e6" }}
          >
            <p
              className="font-black leading-none text-[#111008]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(32px, 7vw, 44px)" }}
            >
              ₪{amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[9px] text-[#888] mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {selectedTarget.icon} → {selectedTarget.label}
            </p>
          </div>
          <NumPad value={amount} onChange={setAmount} />
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Notes <span className="font-normal text-[#888]">(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Monthly auto-invest"
            className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={amountNum === 0}
          className="w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-[#111008] rounded-[10px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            backgroundColor: saved ? "#cce972" : "#2ad2a3",
            color: "#111008",
            boxShadow: "4px 4px 0 #111008",
          }}
        >
          {saved ? "✓ Logged!" : "Log Contribution"}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
