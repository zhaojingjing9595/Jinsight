import Link from "next/link";

type NavItem = "home" | "map" | "add" | "story" | "profile";

type BottomNavProps = {
  active?: NavItem;
};

const NAV_ITEMS: { id: NavItem; label: string; href: string; icon: string }[] = [
  { id: "home",    label: "HOME",  href: "/dashboard", icon: "▦" },
  { id: "map",     label: "MAP",   href: "/map",       icon: "◎" },
  { id: "add",     label: "ADD",   href: "/add",       icon: "+" },
  { id: "story",   label: "STORY", href: "/story",     icon: "≈" },
  { id: "profile", label: "ME",    href: "/profile",   icon: "◉" },
];

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-4 left-4 right-4 flex items-center justify-around px-4 py-2 border-[2.5px] border-[#111008] shadow-[4px_4px_0_#111008] z-50"
      style={{ backgroundColor: "#fcfaeb", borderRadius: "999px" }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const isAdd = item.id === "add";

        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          >
            {/* Circular icon */}
            <div
              className="flex items-center justify-center rounded-full border-[2px] border-[#111008] font-bold transition-transform active:scale-95"
              style={{
                width: isAdd ? "42px" : "34px",
                height: isAdd ? "42px" : "34px",
                fontSize: isAdd ? "20px" : "14px",
                backgroundColor: isAdd
                  ? "#2ad2a3"
                  : isActive
                    ? "#a57dee"
                    : "#ffffff",
                color: isActive || isAdd ? "#ffffff" : "#111008",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: isAdd ? "2px 2px 0 #111008" : "none",
                marginTop: isAdd ? "-6px" : "0",
              }}
            >
              {item.icon}
            </div>
            {/* Label */}
            {!isAdd && (
              <span
                className="text-[9px] font-[700] uppercase"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "1px",
                  color: isActive ? "#111008" : "#888",
                }}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
