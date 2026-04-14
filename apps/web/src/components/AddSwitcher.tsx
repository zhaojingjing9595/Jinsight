import Link from "next/link";

type AddTab = "transaction" | "budget" | "invest";

const TABS = [
  { id: "transaction" as const, label: "Transaction", href: "/add"              },
  { id: "budget" as const,      label: "Budget",      href: "/add/budget-plan"  },
  { id: "invest" as const,      label: "Invest",      href: "/add/investment"   },
];

export function AddSwitcher({ active }: { active: AddTab }) {
  return (
    <div className="flex-none flex gap-2.5 px-4 pt-5 pb-3">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const inner = (
          <div
            className={`flex-1 flex items-center justify-center py-3 border-2 border-ink rounded-[12px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              isActive ? "bg-primary shadow-neo-sm -translate-x-px -translate-y-px" : "bg-base shadow-[1px_1px_0_#ccc]"
            }`}
          >
            <span className="font-body text-[11px] font-black uppercase tracking-[1.5px] text-ink">
              {tab.label}
            </span>
          </div>
        );

        return isActive ? (
          <div key={tab.id} className="flex-1">{inner}</div>
        ) : (
          <Link key={tab.id} href={tab.href} className="flex-1">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
