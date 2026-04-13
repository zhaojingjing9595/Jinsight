"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Category } from "@jinsight/core";
import type { BudgetPlanType, CategoryAllocation } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { NumPad } from "@/components/NumPad";

// ─── Plan type options ─────────────────────────────────────────────────────────

const PLAN_TYPES: { value: BudgetPlanType; label: string; icon: string }[] = [
  { value: "trip",         label: "Trip",         icon: "✈️" },
  { value: "home_project", label: "Home Project", icon: "🏠" },
  { value: "event",        label: "Event",        icon: "🎉" },
  { value: "monthly",      label: "Monthly",      icon: "📅" },
  { value: "custom",       label: "Custom",       icon: "⚙️" },
];

// Expense categories only (no income)
const EXPENSE_CATS: Category[] = [
  "rent", "utilities", "subscriptions", "grocery", "dining",
  "shopping", "entertainment", "transport", "education", "travel", "other",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetPlanPage() {
  const [name, setName]           = useState("");
  const [planType, setPlanType]   = useState<BudgetPlanType>("trip");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [useDuration, setUseDuration] = useState(false);
  const [duration, setDuration]   = useState("7");
  const [endDate, setEndDate]     = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [editingTotal, setEditingTotal] = useState(false);
  const [allocations, setAllocations] = useState<CategoryAllocation[]>([]);
  const [notes, setNotes]         = useState("");
  const [saved, setSaved]         = useState(false);

  const totalNum   = parseFloat(totalAmount) || 0;
  const allocated  = allocations.reduce((s, a) => s + a.limit, 0);
  const remaining  = totalNum - allocated;

  function addAllocation() {
    const unused = EXPENSE_CATS.find((c) => !allocations.find((a) => a.category === c));
    if (unused) setAllocations([...allocations, { category: unused, limit: 0 }]);
  }

  function updateAllocation(index: number, field: "category" | "limit", value: string | number) {
    setAllocations(
      allocations.map((a, i) =>
        i === index ? { ...a, [field]: value } : a,
      ),
    );
  }

  function removeAllocation(index: number) {
    setAllocations(allocations.filter((_, i) => i !== index));
  }

  function handleSave() {
    // TODO: wire to API when auth/DB is ready
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName("");
      setTotalAmount("0");
      setAllocations([]);
      setNotes("");
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
          <Link
            href="/add"
            className="text-[13px] font-bold text-[#888] hover:text-[#111008] transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ← Add
          </Link>
          <h1
            className="text-[11px] font-black uppercase tracking-[3px] text-[#111008]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Budget Plan
          </h1>
        </div>

        {/* Type chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {PLAN_TYPES.map((pt) => {
            const isActive = planType === pt.value;
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => setPlanType(pt.value)}
                className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] border-[2px] text-[11px] font-bold uppercase tracking-[0.5px] transition-all"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  borderColor: "#111008",
                  backgroundColor: isActive ? "#a57dee" : "#fcfaeb",
                  color: isActive ? "#fff" : "#888",
                  boxShadow: isActive ? "2px 2px 0 #111008" : "none",
                }}
              >
                <span>{pt.icon}</span>
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form body ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4"
        style={{ paddingBottom: "calc(80px + 16px)" }}
      >
        {/* Plan name */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Plan Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              planType === "trip" ? "e.g. Tokyo March Trip" :
              planType === "event" ? "e.g. Jin's Birthday" :
              "Give it a name…"
            }
            className="w-full px-3 py-2.5 text-[14px] font-bold border-[2px] border-[#111008] rounded-[10px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee] focus:shadow-[2px_2px_0_#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", boxShadow: "2px 2px 0 #111008" }}
          />
        </div>

        {/* Dates */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className="text-[10px] font-bold uppercase tracking-[2px] text-[#111008]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Dates
            </label>
            <button
              type="button"
              onClick={() => setUseDuration((v) => !v)}
              className="text-[10px] font-bold text-[#a57dee] uppercase tracking-[1px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {useDuration ? "Use end date" : "Use duration"}
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-[9px] text-[#888] mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
            </div>
            {useDuration ? (
              <div style={{ width: "90px" }}>
                <p className="text-[9px] text-[#888] mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Days</p>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-[9px] text-[#888] mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>End</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[8px] bg-[#fcfaeb] focus:outline-none focus:border-[#a57dee]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Total budget */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Total Budget
          </label>
          <button
            type="button"
            onClick={() => setEditingTotal((v) => !v)}
            className="w-full border-[2.5px] border-[#111008] rounded-[12px] py-3 flex flex-col items-center transition-all"
            style={{
              backgroundColor: editingTotal ? "#fff9e6" : "#fcfaeb",
              boxShadow: "3px 3px 0 #111008",
            }}
          >
            <p
              className="font-black leading-none text-[#111008]"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(28px, 6vw, 40px)",
              }}
            >
              {formatCurrency(totalNum, "ILS")}
            </p>
            <p className="text-[9px] text-[#888] mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {editingTotal ? "tap to close numpad" : "tap to edit"}
            </p>
          </button>
          {editingTotal && (
            <div className="mt-3">
              <NumPad value={totalAmount} onChange={setTotalAmount} />
            </div>
          )}
        </div>

        {/* Category allocations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className="text-[10px] font-bold uppercase tracking-[2px] text-[#111008]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Category Breakdown
              <span className="ml-1 font-normal text-[#888]">(optional)</span>
            </label>
            <button
              type="button"
              onClick={addAllocation}
              disabled={allocations.length >= EXPENSE_CATS.length}
              className="text-[11px] font-bold text-[#a57dee] uppercase tracking-[1px] disabled:opacity-40"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              + Add category
            </button>
          </div>

          {allocations.length > 0 && (
            <div className="flex flex-col gap-2">
              {allocations.map((alloc, i) => {
                const meta = CATEGORY_META[alloc.category];
                const unusedCats = EXPENSE_CATS.filter(
                  (c) => c === alloc.category || !allocations.find((a) => a.category === c),
                );
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 border-[2px] border-[#111008] rounded-[10px]"
                    style={{ boxShadow: "2px 2px 0 #111008", backgroundColor: "#fcfaeb" }}
                  >
                    {/* Category select */}
                    <div
                      className="flex items-center justify-center text-[18px] border-[1.5px] border-[#111008] rounded-[8px] flex-none"
                      style={{ width: "36px", height: "36px", backgroundColor: meta.color }}
                    >
                      {meta.icon}
                    </div>
                    <select
                      value={alloc.category}
                      onChange={(e) => updateAllocation(i, "category", e.target.value)}
                      className="flex-1 bg-transparent border-none text-[12px] font-bold focus:outline-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#111008" }}
                    >
                      {unusedCats.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_META[c].label}
                        </option>
                      ))}
                    </select>
                    {/* Amount input */}
                    <input
                      type="number"
                      min="0"
                      value={alloc.limit || ""}
                      onChange={(e) => updateAllocation(i, "limit", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-[80px] px-2 py-1 text-[13px] font-bold text-right border-[1.5px] border-[#111008] rounded-[6px] bg-[#fcfaeb] focus:outline-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeAllocation(i)}
                      className="text-[#fc524f] font-bold text-[16px] flex-none"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {/* Allocation summary */}
              {totalNum > 0 && (
                <div
                  className="flex justify-between items-center px-3 py-2 rounded-[8px] border-[1.5px] border-[#111008]"
                  style={{ backgroundColor: remaining < 0 ? "#fff0f0" : "#f0fdf9" }}
                >
                  <span className="text-[11px] font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#888" }}>
                    Allocated
                  </span>
                  <span
                    className="text-[13px] font-black"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: remaining < 0 ? "#fc524f" : "#2ad2a3",
                    }}
                  >
                    {formatCurrency(allocated, "ILS")} / {formatCurrency(totalNum, "ILS")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-[#111008]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything to keep in mind…"
            rows={2}
            className="w-full px-3 py-2 text-[13px] border-[2px] border-[#111008] rounded-[10px] bg-[#fcfaeb] resize-none focus:outline-none focus:border-[#a57dee]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!name || totalNum === 0}
          className="w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-[#111008] rounded-[10px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            backgroundColor: saved ? "#cce972" : "#a57dee",
            color: saved ? "#111008" : "#fff",
            boxShadow: "4px 4px 0 #111008",
          }}
        >
          {saved ? "✓ Plan Created!" : "Create Budget Plan"}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
