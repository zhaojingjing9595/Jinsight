"use client";

import Link from "next/link";

type NavItem = "home" | "plan" | "add" | "history" | "profile";

type BottomNavProps = {
  active?: NavItem;
};

const NAV_ICON_PATHS: Record<NavItem, string[]> = {
  home: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
  plan: ["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", "M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z", "M9 14l2 2 4-4"],
  add: ["M12 5v14", "M5 12h14"],
  history: ["M3 20v-8", "M9 20V8", "M15 20V4", "M21 20v-6"],
  profile: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 3a4 4 0 100 8 4 4 0 000-8z"],
};

function NavIcon({ id, size = 18 }: { id: NavItem; size?: number }) {
  const paths = NAV_ICON_PATHS[id];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const NAV_ITEMS: { id: NavItem; label: string; href: string }[] = [
  { id: "home",    label: "HOME",    href: "/dashboard" },
  { id: "plan",    label: "PLANS",   href: "/plans" },
  { id: "add",     label: "ADD",     href: "/add" },
  { id: "history", label: "HISTORY", href: "/history" },
  { id: "profile", label: "ME",      href: "/profile" },
];

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-3 left-4 right-4 flex items-center justify-around px-4 py-1 border-[2.5px] border-ink shadow-neo-md z-50 bg-base rounded-full">
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
              <NavIcon id={item.id} size={isAdd ? 22 : 18} />
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

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-label={isAdd ? "Add — transaction, budget, or bill" : item.label}
            className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
