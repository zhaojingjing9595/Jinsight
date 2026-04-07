import Link from "next/link";

type NavItem = "home" | "map" | "add" | "story" | "profile";

type BottomNavProps = {
  active?: NavItem;
};

const NAV_ITEMS: { id: NavItem; label: string; href: string; icon: string }[] = [
  { id: "home", label: "HOME", href: "/dashboard", icon: "▦" },
  { id: "map", label: "MAP", href: "/map", icon: "◎" },
  { id: "add", label: "ADD", href: "/add", icon: "+" },
  { id: "story", label: "STORY", href: "/story", icon: "≈" },
  { id: "profile", label: "ME", href: "/profile", icon: "◉" },
];

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-4 left-4 right-4 flex items-center justify-around px-3 py-2.5 border-[2.5px] border-[#111008] rounded-[16px] shadow-[4px_4px_0_#111008] z-50"
      style={{ backgroundColor: "#fcfaeb" }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const isAdd = item.id === "add";

        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
          >
            {/* Icon box */}
            <div
              className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] border-2 border-[#111008] text-[14px] font-bold"
              style={{
                backgroundColor: isAdd
                  ? "#2ad2a3"
                  : isActive
                    ? "#a57dee"
                    : "#ffffff",
                color: isActive || isAdd ? "#ffffff" : "#111008",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {item.icon}
            </div>
            {/* Label */}
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
            {/* Active dot */}
            {isActive && (
              <span
                className="absolute -bottom-0 w-[6px] h-[6px] rounded-full border-[1.5px] border-[#111008]"
                style={{ backgroundColor: "#a57dee" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
