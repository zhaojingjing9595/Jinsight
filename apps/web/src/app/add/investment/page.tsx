import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

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

export default function InvestmentHubPage() {
  return (
    <div
      className="flex flex-col max-w-[480px] mx-auto bg-[#fcfaeb]"
      style={{ height: "100dvh" }}
    >
      {/* ── Top bar ── */}
      <div className="flex-none px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-1">
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
            Investment
          </h1>
        </div>
        <p
          className="text-[12px] text-[#888] mt-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Track your portfolio, set goals, and log contributions.
        </p>
      </div>

      {/* ── Options ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-3 pt-2"
        style={{ paddingBottom: "calc(80px + 16px)" }}
      >
        {SUB_OPTIONS.map((opt) => (
          <Link key={opt.href} href={opt.href} className="block">
            <div
              className="flex items-center gap-4 p-4 border-[2.5px] border-[#111008] rounded-[14px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                backgroundColor: opt.color,
                boxShadow: "4px 4px 0 #111008",
              }}
            >
              <div
                className="flex items-center justify-center text-[28px] border-[2px] border-[#111008] rounded-[10px] bg-white flex-none"
                style={{ width: "52px", height: "52px" }}
              >
                {opt.icon}
              </div>
              <div>
                <p
                  className="text-[14px] font-black text-[#111008] leading-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {opt.label}
                </p>
                <p
                  className="text-[11px] text-[#333] mt-0.5 leading-snug"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {opt.description}
                </p>
              </div>
              <div className="ml-auto text-[18px] font-black text-[#111008]">→</div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav active="add" />
    </div>
  );
}
