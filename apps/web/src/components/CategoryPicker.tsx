"use client";

import { useState, useEffect, useRef } from "react";
import { CATEGORY_META, EXPENSE_CATEGORY_ORDER, INCOME_CATEGORY_ORDER } from "@jinsight/core";
import type { Category, CustomCategoryMeta } from "@jinsight/core";
import { CategoryIcon } from "./CategoryIcon";

// ─── Shared item type ────────────────────────────────────────────────────────

type CatItem = { slug: string; label: string; color: string };

function buildItems(builtIns: Category[], customs: CustomCategoryMeta[]): CatItem[] {
  return [
    ...builtIns.map((s) => ({ slug: s, label: CATEGORY_META[s].label, color: CATEGORY_META[s].color })),
    ...customs.map((c) => ({ slug: c.slug, label: c.name, color: c.color })),
  ];
}

function applySaved(saved: string[], all: CatItem[]): CatItem[] {
  const map = Object.fromEntries(all.map((i) => [i.slug, i]));
  const result: CatItem[] = [];
  const seen = new Set<string>();
  for (const slug of saved) {
    if (map[slug]) { result.push(map[slug]); seen.add(slug); }
  }
  // Append any new items not in the saved order (e.g. newly created custom categories)
  for (const item of all) {
    if (!seen.has(item.slug)) result.push(item);
  }
  return result;
}

function readSaved(key: string): string[] | null {
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); } catch { return null; }
}

// ─── Category button (shared) ────────────────────────────────────────────────

function CatButton({
  item,
  isSelected,
  isDragging,
  onClickCat,
  dragProps,
}: {
  item: CatItem;
  isSelected: boolean;
  isDragging: boolean;
  onClickCat: () => void;
  dragProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      data-cat-slug={item.slug}
      onClick={onClickCat}
      className="flex-none flex flex-col items-center gap-1.5 transition-all duration-[100ms]"
      style={{ opacity: isDragging ? 0.3 : 1 }}
      {...dragProps}
    >
      <div
        className="w-[52px] h-[52px] flex items-center justify-center border-[2.5px] border-ink rounded-[10px] transition-all duration-[120ms]"
        style={{
          backgroundColor: item.color,
          boxShadow: isSelected && !isDragging ? "var(--shadow-neo-md)" : "var(--shadow-neo-xs)",
          transform: isSelected && !isDragging ? "translate(-2px, -2px) scale(1.1)" : "none",
          opacity: isSelected ? 1 : 0.72,
        }}
      >
        <CategoryIcon category={item.slug} size={26} />
      </div>
      <span
        className={`font-body text-center leading-tight text-[9px] max-w-[52px] overflow-hidden text-ellipsis whitespace-nowrap ${
          isSelected && !isDragging ? "font-[800] text-ink" : "font-[500] text-muted"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

type CategoryPickerProps = {
  value: string | null;
  onChange: (category: string) => void;
  mode?: "expense" | "income";
  /** Override the built-in list (non-reorderable mode only). */
  categories?: Category[];
  customCategories?: CustomCategoryMeta[];
  onAddNew?: () => void;
  /** When true, the unified list (built-ins + customs) is drag-reorderable and
   *  the order is persisted to localStorage per mode. */
  reorderable?: boolean;
};

export function CategoryPicker({
  value,
  onChange,
  mode = "expense",
  categories,
  customCategories = [],
  onAddNew,
  reorderable = false,
}: CategoryPickerProps) {
  const storageKey = `jinsight:cat-order:${mode}`;
  const builtInCats: Category[] = categories ?? (mode === "income" ? INCOME_CATEGORY_ORDER : EXPENSE_CATEGORY_ORDER);

  // ── Reorderable state ────────────────────────────────────────────────────
  const [items, setItemsRaw] = useState<CatItem[]>([]);
  const itemsRef = useRef<CatItem[]>([]);

  /** slug currently being dragged (pointer captured) */
  const [dragSlug, setDragSlug] = useState<string | null>(null);
  /** slug that triggered pointerdown — used until the threshold is crossed */
  const pendingRef = useRef<{ slug: string; startX: number; startY: number } | null>(null);
  const originalRef = useRef<CatItem[]>([]);
  /** Prevents the click from firing after a drag completes */
  const wasDraggedRef = useRef(false);

  function setItems(next: CatItem[]) {
    itemsRef.current = next;
    setItemsRaw(next);
  }

  // Rebuild ordered list when customCategories change (new category added, etc.)
  const customKey = customCategories.map((c) => c.slug).join(",");
  useEffect(() => {
    if (!reorderable) return;
    const all = buildItems(builtInCats, customCategories);
    const saved = readSaved(storageKey);
    setItems(saved ? applySaved(saved, all) : all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorderable, storageKey, customKey]);

  // Apply global cursor + no-select while dragging
  useEffect(() => {
    if (!dragSlug) return;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragSlug]);

  // ── Pointer handlers ─────────────────────────────────────────────────────

  function onPointerDown(e: React.PointerEvent, slug: string) {
    // Capture so pointermove always fires here even when the pointer leaves
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pendingRef.current = { slug, startX: e.clientX, startY: e.clientY };
  }

  function onPointerMove(e: React.PointerEvent) {
    const pending = pendingRef.current;
    if (!pending) return;

    // Cross the drag threshold before committing
    if (!dragSlug) {
      if (Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY) < 6) return;
      originalRef.current = [...itemsRef.current];
      setDragSlug(pending.slug);
      return;
    }

    // Active drag — find which category the pointer is physically over
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const catEl = el?.closest("[data-cat-slug]") as HTMLElement | null;
    const targetSlug = catEl?.dataset.catSlug;
    if (!targetSlug || targetSlug === dragSlug) return;

    const from = itemsRef.current.findIndex((i) => i.slug === dragSlug);
    const to = itemsRef.current.findIndex((i) => i.slug === targetSlug);
    if (from < 0 || to < 0) return;

    const next = [...itemsRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  }

  function onPointerUp() {
    pendingRef.current = null;
    if (!dragSlug) return;
    wasDraggedRef.current = true;
    localStorage.setItem(storageKey, JSON.stringify(itemsRef.current.map((i) => i.slug)));
    setDragSlug(null);
  }

  function onPointerCancel() {
    pendingRef.current = null;
    if (dragSlug) {
      setItems(originalRef.current);
      setDragSlug(null);
    }
  }

  // ── Non-reorderable render ───────────────────────────────────────────────

  if (!reorderable) {
    return (
      <div className="flex gap-3 overflow-x-auto pt-1.5 pb-2 pl-[5px]" style={{ scrollbarWidth: "none" }}>
        {builtInCats.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isSelected = value === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-[120ms]"
            >
              <div
                className="w-[52px] h-[52px] flex items-center justify-center border-[2.5px] border-ink rounded-[10px] transition-all duration-[120ms]"
                style={{
                  backgroundColor: meta.color,
                  boxShadow: isSelected ? "var(--shadow-neo-md)" : "var(--shadow-neo-xs)",
                  transform: isSelected ? "translate(-2px, -2px) scale(1.1)" : "none",
                  opacity: isSelected ? 1 : 0.72,
                }}
              >
                <CategoryIcon category={cat} size={26} />
              </div>
              <span className={`font-body text-center leading-tight text-[9px] max-w-[52px] overflow-hidden text-ellipsis whitespace-nowrap ${isSelected ? "font-[800] text-ink" : "font-[500] text-muted"}`}>
                {meta.label}
              </span>
            </button>
          );
        })}

        {customCategories.map((cat) => {
          const isSelected = value === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.slug)}
              className="flex-none flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-[120ms]"
            >
              <div
                className="w-[52px] h-[52px] flex items-center justify-center border-[2.5px] border-ink rounded-[10px] transition-all duration-[120ms]"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: isSelected ? "var(--shadow-neo-md)" : "var(--shadow-neo-xs)",
                  transform: isSelected ? "translate(-2px, -2px) scale(1.1)" : "none",
                  opacity: isSelected ? 1 : 0.72,
                }}
              >
                <CategoryIcon category={cat.slug} size={26} />
              </div>
              <span className={`font-body text-center leading-tight text-[9px] max-w-[52px] overflow-hidden text-ellipsis whitespace-nowrap ${isSelected ? "font-[800] text-ink" : "font-[500] text-muted"}`}>
                {cat.name}
              </span>
            </button>
          );
        })}

        {onAddNew && <AddNewButton onClick={onAddNew} />}
      </div>
    );
  }

  // ── Reorderable render ───────────────────────────────────────────────────

  return (
    <div
      className="flex gap-3 overflow-x-auto pt-1.5 pb-2 pl-[5px]"
      style={{ scrollbarWidth: "none", touchAction: dragSlug ? "none" : undefined }}
    >
      {items.map((item) => (
        <CatButton
          key={item.slug}
          item={item}
          isSelected={value === item.slug}
          isDragging={dragSlug === item.slug}
          onClickCat={() => {
            if (wasDraggedRef.current) { wasDraggedRef.current = false; return; }
            onChange(item.slug);
          }}
          dragProps={{
            className: "flex-none flex flex-col items-center gap-1.5 transition-all duration-[100ms] cursor-grab",
            onPointerDown: (e) => onPointerDown(e, item.slug),
            onPointerMove,
            onPointerUp,
            onPointerCancel,
          }}
        />
      ))}

      {onAddNew && <AddNewButton onClick={onAddNew} />}
    </div>
  );
}

function AddNewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-none flex flex-col items-center gap-1.5 transition-all active:scale-95"
    >
      <div className="w-[52px] h-[52px] flex items-center justify-center border-2 border-dashed border-[#aaa] rounded-[10px] bg-[#f4f4f4]">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <span className="font-body text-[9px] font-[500] text-[#aaa]">New</span>
    </button>
  );
}
