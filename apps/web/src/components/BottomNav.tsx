"use client";

import Link from "next/link";
import { useAddModal } from "@/contexts/AddModalContext";

type NavItem = "home" | "plan" | "add" | "story" | "profile";

type BottomNavProps = {
  active?: NavItem;
};

const NAV_ITEMS: { id: NavItem; label: string; href: string; icon: string }[] = [
  { id: "home",    label: "HOME",  href: "/dashboard",    icon: "▦" },
  { id: "plan",    label: "PLANS", href: "/plans",         icon: "▤" },
  { id: "add",     label: "ADD",   href: "/add",          icon: "+" },
  { id: "story",   label: "STORY", href: "/story",        icon: "≈" },
  { id: "profile", label: "ME",    href: "/profile",      icon: "◉" },
];

export function BottomNav({ active }: BottomNavProps) {
  const { open } = useAddModal();

  return (
    <nav className="fixed bottom-4 left-4 right-4 flex items-center justify-around px-4 py-2 border-[2.5px] border-ink shadow-neo-md z-50 bg-base rounded-full">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const isAdd = item.id === "add";

        const inner = (
          <>
            <div
              className={`font-body flex items-center justify-center rounded-full border-2 border-ink font-bold transition-transform active:scale-95 ${
                isAdd
                  ? "w-[42px] h-[42px] text-[20px] bg-income text-white shadow-neo-xs -mt-1.5"
                  : `w-[34px] h-[34px] text-[14px] ${
                      isActive ? "bg-primary text-white" : "bg-white text-ink"
                    }`
              }`}
            >
              {item.icon}
            </div>
            {!isAdd && (
              <span
                className={`font-body text-[9px] font-[700] uppercase tracking-[1px] ${
                  isActive ? "text-ink" : "text-muted"
                }`}
              >
                {item.label}
              </span>
            )}
          </>
        );

        if (isAdd) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={open}
              aria-label="Add transaction"
              className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
            >
              {inner}
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
