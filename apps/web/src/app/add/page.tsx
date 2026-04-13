"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@jinsight/core";
import type { Category, TransactionType } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { NumPad } from "@/components/NumPad";
import { CategoryPicker } from "@/components/CategoryPicker";
import { TypeToggle } from "@/components/TypeToggle";

const SWITCHER_TABS = [
  { label: "Transaction", href: null               },
  { label: "Budget",      href: "/add/budget-plan" },
  { label: "Invest",      href: "/add/investment"  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddPage() {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayAmount = formatCurrency(parseFloat(amount) || 0, "ILS");
  const isExpense = type === "EXPENSE";

  function handleSave() {
    // TODO: wire to API when auth/DB is ready
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setAmount("0");
      setCategory(null);
      setName("");
      setIsRecurring(false);
    }, 1500);
  }

  return (
    <div
      className="flex flex-col max-w-[480px] mx-auto bg-[#fcfaeb]"
      style={{ height: "100dvh" }}
    >
      {/* ── Type switcher — card tabs ── */}
      <div className="flex-none flex gap-2.5 px-4 pt-5 pb-3">
        {SWITCHER_TABS.map((tab) => {
          const isActive = tab.href === null;
          const inner = (
            <div
              className="flex-1 flex items-center justify-center py-3 border-[2px] border-[#111008] rounded-[12px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                backgroundColor: isActive ? "#a57dee" : "#fcfaeb",
                boxShadow: isActive ? "3px 3px 0 #111008" : "1px 1px 0 #ccc",
                transform: isActive ? "translate(-1px, -1px)" : "none",
              }}
            >
              <span
                className="text-[11px] font-black uppercase tracking-[1.5px]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#111008",
                }}
              >
                {tab.label}
              </span>
            </div>
          );

          return tab.href ? (
            <Link key={tab.label} href={tab.href} className="flex-1">
              {inner}
            </Link>
          ) : (
            <div key={tab.label} className="flex-1">{inner}</div>
          );
        })}
      </div>

      {/* ── Scrollable form body ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4"
        style={{ paddingBottom: "calc(80px + 16px)" }}
      >
        {/* Type toggle */}
        <div className="flex justify-center">
          <TypeToggle value={type} onChange={setType} />
        </div>

        {/* Category picker — above amount */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-[#111008]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Category
          </p>
          <CategoryPicker
            value={category}
            onChange={setCategory}
            includeIncome={type === "INCOME"}
            onAddNew={() => {
              // TODO: open new-category modal
            }}
          />
        </div>

        {/* Amount display */}
        <div
          className="border-[2.5px] border-[#111008] rounded-[14px] flex flex-col items-center justify-center py-4"
          style={{
            boxShadow: "4px 4px 0 #111008",
            backgroundColor: isExpense ? "#fff5f5" : "#f0fdf9",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[2px] mb-1"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: isExpense ? "#fc524f" : "#2ad2a3",
            }}
          >
            {isExpense ? "Spending" : "Earning"}
          </p>
          <p
            className="font-black leading-none text-[#111008]"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(36px, 8vw, 52px)",
            }}
          >
            {displayAmount}
          </p>
        </div>

        {/* NumPad */}
        <NumPad value={amount} onChange={setAmount} />

        {/* Name (optional) */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Name <span className="font-normal text-[#888]">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Coffee with Jun"
            className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee] focus:shadow-[2px_2px_0_#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        {/* More options (collapsed) — Date + Recurring only */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#888] self-start"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span
            style={{
              display: "inline-block",
              transition: "transform 150ms",
              transform: showMore ? "rotate(90deg)" : "none",
            }}
          >
            ▶
          </span>
          {showMore ? "Less options" : "More options"}
        </button>

        {showMore && (
          <div className="flex flex-col gap-3">
            {/* Date */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
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

            {/* Recurring */}
            <div className="flex items-center justify-between">
              <span
                className="text-[12px] font-bold text-[#111008]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Recurring
              </span>
              <button
                type="button"
                onClick={() => setIsRecurring((v) => !v)}
                className="border-[2px] border-[#111008] rounded-[20px] transition-all"
                style={{
                  width: "46px",
                  height: "26px",
                  backgroundColor: isRecurring ? "#a57dee" : "#d4d4d4",
                  boxShadow: "2px 2px 0 #111008",
                  position: "relative",
                }}
              >
                <span
                  className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white border-[1.5px] border-[#111008] transition-all"
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
          disabled={parseFloat(amount) === 0}
          className="w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-[#111008] rounded-[10px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            backgroundColor: saved ? "#cce972" : isExpense ? "#fc524f" : "#2ad2a3",
            color: saved ? "#111008" : isExpense ? "#fff" : "#111008",
            boxShadow: "4px 4px 0 #111008",
          }}
        >
          {saved ? "✓ Saved!" : `Save ${isExpense ? "Expense" : "Income"}`}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
