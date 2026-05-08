"use client";

import { useState, useEffect } from "react";
import { formatCurrency, CATEGORY_META, slugifyCustomCategory } from "@jinsight/core";
import type { Category, CustomCategoryMeta } from "@jinsight/core";
import type { BudgetPlanType, CategoryAllocation } from "@jinsight/core";
import { NumPad } from "@/components/NumPad";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryPicker } from "@/components/CategoryPicker";
import { trpcQuery } from "@/lib/api";

const PLAN_TYPES: {
  value: BudgetPlanType;
  label: string;
  color: string;
  paths: string[];
}[] = [
  {
    value: "trip",
    label: "Trip",
    color: "#3b82f6",
    paths: [
      "M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
    ],
  },
  {
    value: "home_project",
    label: "Home Project",
    color: "#cdb1e7",
    paths: [
      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
      "M9 22V12h6v10",
    ],
  },
  {
    value: "event",
    label: "Event",
    color: "#fdb6f0",
    paths: [
      "M9 18V5l12-2v13",
      "M6 21a3 3 0 100-6 3 3 0 000 6z",
      "M18 19a3 3 0 100-6 3 3 0 000 6z",
    ],
  },
  {
    value: "monthly",
    label: "Monthly",
    color: "#2ad2a3",
    paths: [
      "M3 5h18a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z",
      "M2 10h20",
      "M8 3v4",
      "M16 3v4",
    ],
  },
  {
    value: "custom",
    label: "Custom",
    color: "#feb704",
    paths: [
      "M12 8a4 4 0 100 8 4 4 0 000-8z",
      "M19.4 13a7.5 7.5 0 000-2l2-1.6-2-3.4-2.4.8a7.5 7.5 0 00-1.7-1L15 3h-6l-.3 2.8a7.5 7.5 0 00-1.7 1l-2.4-.8-2 3.4L4.6 11a7.5 7.5 0 000 2l-2 1.6 2 3.4 2.4-.8c.5.4 1.1.7 1.7 1L9 21h6l.3-2.8c.6-.3 1.2-.6 1.7-1l2.4.8 2-3.4-2-1.6z",
    ],
  },
];

const EXPENSE_CATS: Category[] = [
  "rent", "utilities", "subscriptions", "grocery", "dining",
  "shopping", "entertainment", "transport", "education", "travel", "other",
];

export function BudgetPlanForm() {
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
  const [customCategories, setCustomCategories] = useState<CustomCategoryMeta[]>([]);
  const [pickingCategoryFor, setPickingCategoryFor] = useState<number | null>(null);

  async function loadCustomCategories() {
    try {
      const res = await trpcQuery<{ categories: { id: string; name: string; color: string }[] }>(
        "categories.list",
        {},
      );
      setCustomCategories(
        res.categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          slug: slugifyCustomCategory(c.name),
        })),
      );
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadCustomCategories();

    const onCategoryAdded = () => loadCustomCategories();
    window.addEventListener("jinsight:category-added", onCategoryAdded);
    return () => window.removeEventListener("jinsight:category-added", onCategoryAdded);
  }, []);

  const totalNum   = parseFloat(totalAmount) || 0;
  const allocated  = allocations.reduce((s, a) => s + a.limit, 0);
  const remaining  = totalNum - allocated;

  function addAllocation() {
    setAllocations([...allocations, { category: "", limit: 0 }]);
    setPickingCategoryFor(allocations.length);
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

  function selectCategoryForAllocation(index: number, category: string) {
    updateAllocation(index, "category", category);
    setPickingCategoryFor(null);
  }

  function handleSave() {
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
    <div className="flex flex-col gap-4">
      {/* Type tiles */}
      <div className="flex gap-3 overflow-x-auto pt-1.5 pb-2 pl-[5px]" style={{ scrollbarWidth: "none" }}>
        {PLAN_TYPES.map((pt) => {
          const isActive = planType === pt.value;
          return (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPlanType(pt.value)}
              className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-[120ms]"
            >
              <div
                className="w-[52px] h-[52px] flex items-center justify-center border-[2.5px] border-ink rounded-[10px] transition-all duration-[120ms]"
                style={{
                  backgroundColor: pt.color,
                  boxShadow: isActive ? "var(--shadow-neo-md)" : "var(--shadow-neo-xs)",
                  transform: isActive ? "translate(-2px, -2px) scale(1.1)" : "none",
                  opacity: isActive ? 1 : 0.72,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="26"
                  height="26"
                  fill="none"
                  stroke="#111008"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {pt.paths.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
              </div>
              <span
                className={`font-body text-center leading-tight text-[9px] max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap ${
                  isActive ? "font-[800] text-ink" : "font-[500] text-muted"
                }`}
              >
                {pt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plan name */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
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
          className="font-body w-full px-3 py-2.5 text-[14px] font-bold border-2 border-ink rounded-[10px] bg-base shadow-neo-xs focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#a57dee]"
        />
      </div>

      {/* Dates */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-body text-[10px] font-bold uppercase tracking-[2px] text-ink">
            Dates
          </label>
          <button
            type="button"
            onClick={() => setUseDuration((v) => !v)}
            className="font-body text-[10px] font-bold text-primary uppercase tracking-[1px]"
          >
            {useDuration ? "Use end date" : "Use duration"}
          </button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="font-body text-[9px] text-muted mb-0.5">Start</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
            />
          </div>
          {useDuration ? (
            <div className="w-[90px]">
              <p className="font-body text-[9px] text-muted mb-0.5">Days</p>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
              />
            </div>
          ) : (
            <div className="flex-1">
              <p className="font-body text-[9px] text-muted mb-0.5">End</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      </div>

      {/* Total budget */}
      <div>
        <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
          Total Budget
        </label>
        <button
          type="button"
          onClick={() => setEditingTotal((v) => !v)}
          className={`w-full border-[2.5px] border-ink rounded-[12px] py-3 flex flex-col items-center shadow-neo-sm transition-all ${
            editingTotal ? "bg-[#fff9e6]" : "bg-base"
          }`}
        >
          <p className="font-display font-black leading-none text-ink text-[clamp(28px,6vw,40px)]">
            {formatCurrency(totalNum, "ILS")}
          </p>
          <p className="font-body text-[9px] text-muted mt-0.5">
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
          <label className="font-body text-[10px] font-bold uppercase tracking-[2px] text-ink">
            Category Breakdown
            <span className="ml-1 font-normal text-muted">(optional)</span>
          </label>
          <button
            type="button"
            onClick={addAllocation}
            className="font-body text-[11px] font-bold text-primary uppercase tracking-[1px]"
          >
            + Add category
          </button>
        </div>

        {allocations.length > 0 && (
          <div className="flex flex-col gap-2">
            {allocations.map((alloc, i) => {
              const meta = alloc.category ? (CATEGORY_META[alloc.category] || customCategories.find((c) => c.slug === alloc.category)) : null;
              const isPickingCategory = pickingCategoryFor === i;
              return (
                <div
                  key={i}
                  className="flex flex-col gap-2 p-2 border-2 border-ink rounded-[10px] bg-base shadow-neo-xs"
                >
                  <div className="flex items-center gap-2">
                    {alloc.category && meta && (
                      <div
                        className="w-9 h-9 flex items-center justify-center border-[1.5px] border-ink rounded-icon flex-none"
                        style={{ backgroundColor: meta.color }}
                      >
                        <CategoryIcon category={alloc.category} size={20} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPickingCategoryFor(i)}
                      className={`font-body flex-1 text-left text-[12px] font-bold ${alloc.category ? "text-ink" : "text-muted"}`}
                    >
                      {alloc.category ? (meta?.label || meta?.name) : "Select category"}
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={alloc.limit || ""}
                      onChange={(e) => updateAllocation(i, "limit", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="font-body w-[80px] px-2 py-1 text-[13px] font-bold text-right border-[1.5px] border-ink rounded-[6px] bg-base focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeAllocation(i)}
                      className="text-alert font-bold text-[16px] flex-none"
                    >
                      ×
                    </button>
                  </div>
                  {isPickingCategory && (
                    <CategoryPicker
                      value={alloc.category}
                      onChange={(cat) => selectCategoryForAllocation(i, cat)}
                      mode="expense"
                      customCategories={customCategories}
                    />
                  )}
                </div>
              );
            })}

            {totalNum > 0 && (
              <div
                className={`flex justify-between items-center px-3 py-2 rounded-btn border-[1.5px] border-ink ${
                  remaining < 0 ? "bg-[#fff0f0]" : "bg-[#f0fdf9]"
                }`}
              >
                <span className="font-body text-[11px] font-bold text-muted">
                  Allocated
                </span>
                <span className={`font-body text-[13px] font-black ${remaining < 0 ? "text-alert" : "text-income"}`}>
                  {formatCurrency(allocated, "ILS")} / {formatCurrency(totalNum, "ILS")}
                </span>
              </div>
            )}
          </div>
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
          placeholder="Anything to keep in mind…"
          rows={2}
          className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-[10px] bg-base resize-none focus:outline-none focus:border-primary"
        />
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!name || totalNum === 0}
        className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
          saved ? "bg-goal text-ink" : "bg-primary text-white"
        }`}
      >
        {saved ? "✓ Plan Created!" : "Create Budget Plan"}
      </button>
    </div>
  );
}
