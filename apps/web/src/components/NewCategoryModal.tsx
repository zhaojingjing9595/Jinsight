"use client";

import { useState } from "react";
import { slugifyCustomCategory } from "@jinsight/core";
import type { CustomCategoryMeta } from "@jinsight/core";
import { trpcMutate } from "@/lib/api";

const PRESET_COLORS = [
  "#fc524f", // red
  "#feb704", // gold
  "#2ad2a3", // teal
  "#a57dee", // purple
  "#f07030", // orange
  "#ec4899", // pink
  "#3b82f6", // blue
  "#22c55e", // green
  "#f5a800", // amber
  "#9090cc", // slate-purple
  "#cce972", // lime
  "#06b6d4", // cyan
];

type NewCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (cat: CustomCategoryMeta) => void;
};

export function NewCategoryModal({ open, onClose, onCreated }: NewCategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setError(null);
    setSaving(true);
    try {
      const res = await trpcMutate<{ category: { id: string; name: string; color: string } }>(
        "categories.create",
        { name: trimmed, color },
      );
      const newCat: CustomCategoryMeta = {
        id: res.category.id,
        name: res.category.name,
        color: res.category.color,
        slug: slugifyCustomCategory(res.category.name),
      };
      window.dispatchEvent(new CustomEvent("jinsight:category-added"));
      onCreated(newCat);
      setName("");
      setColor(PRESET_COLORS[0]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[420px] bg-base border-[2.5px] border-ink rounded-[20px] px-5 pt-5 pb-6 flex flex-col gap-4 shadow-neo-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-[16px] uppercase tracking-[1px] text-ink">
            New Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-ink rounded-full bg-base font-body text-[18px] font-bold leading-none text-ink"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-alert/10 border-2 border-alert rounded-btn px-3 py-2 text-[12px] font-body font-bold text-alert">
            {error}
          </div>
        )}

        {/* Name input */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder="e.g. Coffee, Gym, Pets"
            maxLength={50}
            autoFocus
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#a57dee]"
          />
        </div>

        {/* Color picker */}
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[2px] mb-2 text-ink">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-9 h-9 rounded-[8px] border-[2.5px] transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#111008" : "transparent",
                  boxShadow: color === c ? "2px 2px 0 #111008" : "none",
                  transform: color === c ? "translate(-1px, -1px)" : "none",
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 px-3 py-2 border-2 border-ink/20 rounded-[10px] bg-[#f9f9f0]">
          <div
            className="w-10 h-10 rounded-[8px] border-[2px] border-ink flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111008" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <path d="M7 7h.01" />
            </svg>
          </div>
          <span className="font-body text-[13px] font-bold text-ink">
            {name.trim() || "Category name"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] bg-primary text-white shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none"
        >
          {saving ? "Creating..." : "Create Category"}
        </button>
      </div>
    </div>
  );
}
