import Link from "next/link";

const SUB_OPTIONS = [
  {
    href: "/add/investment/holding",
    icon: "📊",
    label: "Add a Holding",
    description: "Log a stock, ETF, crypto, or bond position",
    color: "#feb704",
  },
  {
    href: "/add/investment/goal",
    icon: "🎯",
    label: "Investment Goal",
    description: "Set a target — house, retirement, travel fund",
    color: "#cce972",
  },
  {
    href: "/add/investment/contribution",
    icon: "💰",
    label: "Log Contribution",
    description: "Record a DCA payment toward a holding or goal",
    color: "#2ad2a3",
  },
] as const;

export function InvestmentHub() {
  return (
    <div className="flex flex-col gap-3">
      {SUB_OPTIONS.map((opt) => (
        <Link key={opt.href} href={opt.href} className="block">
          <div
            className="flex items-center gap-4 p-4 border-[2.5px] border-ink rounded-card shadow-neo-md transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            style={{ backgroundColor: opt.color }}
          >
            <div className="w-[52px] h-[52px] flex items-center justify-center text-[28px] border-2 border-ink rounded-[10px] bg-white flex-none">
              {opt.icon}
            </div>
            <div>
              <p className="font-body text-[14px] font-black text-ink leading-tight">
                {opt.label}
              </p>
              <p className="font-body text-[11px] text-[#333] mt-0.5 leading-snug">
                {opt.description}
              </p>
            </div>
            <div className="ml-auto text-[18px] font-black text-ink">→</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
