"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export type DropdownMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
  disabled?: boolean;
};

type DropdownMenuProps = {
  items: DropdownMenuItem[];
  disabled?: boolean;
  "aria-label"?: string;
};

const VARIANT_CLASSES: Record<NonNullable<DropdownMenuItem["variant"]>, string> = {
  default: "text-ink hover:bg-ink/5",
  danger: "text-alert hover:bg-alert/10",
  success: "text-income hover:bg-income/10",
};

const MENU_WIDTH = 160;
const MENU_HEIGHT = 160;

type MenuPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export function DropdownMenu({ items, disabled, "aria-label": ariaLabel }: DropdownMenuProps) {
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleOpen() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;

    const vertical: MenuPosition =
      spaceBelow < MENU_HEIGHT
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 };

    const horizontal: MenuPosition =
      spaceRight < MENU_WIDTH
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left };

    setPos({ ...vertical, ...horizontal });
  }

  useEffect(() => {
    if (!pos) return;
    function handleScroll() { setPos(null); }
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [pos]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel ?? "More actions"}
        disabled={disabled}
        onClick={handleOpen}
        className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-ink/5 active:scale-95 disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#111008">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {pos && createPortal(
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setPos(null)}
            className="fixed inset-0 z-[9998] cursor-default"
          />
          <div
            className="fixed z-[9999] flex flex-col min-w-[130px] border-2 border-ink rounded-[10px] shadow-neo-sm bg-base overflow-hidden"
            style={pos as React.CSSProperties}
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setPos(null);
                  item.onClick();
                }}
                className={`font-body flex items-center gap-2 px-3 py-2 text-[12px] font-[600] text-left disabled:opacity-40 ${
                  VARIANT_CLASSES[item.variant ?? "default"]
                }`}
              >
                {item.icon && <span className="flex-none">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
