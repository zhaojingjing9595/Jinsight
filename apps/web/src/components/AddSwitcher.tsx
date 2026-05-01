import Link from "next/link";

export type AddTab = "transaction" | "bill";

const TABS: { id: AddTab; label: string; href: string }[] = [
  { id: "transaction", label: "Transaction", href: "/add" },
  { id: "bill", label: "Bill", href: "/add/bill" },
];

export function AddSwitcher({ active }: { active: AddTab }) {
  return (
    <div className="flex-none flex gap-2 px-4 pt-5 pb-3">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const inner = (
          <div
            className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 px-1 border-2 border-ink rounded-[12px] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              isActive ? "bg-primary shadow-neo-sm -translate-x-px -translate-y-px" : "bg-base shadow-[1px_1px_0_#ccc]"
            }`}
          >
            <span className="font-body text-[10px] sm:text-[11px] font-black uppercase tracking-[1px] sm:tracking-[1.5px] text-ink text-center leading-tight">
              {tab.label}
            </span>
          </div>
        );

        return isActive ? (
          <div key={tab.id} className="flex-1 min-w-0">{inner}</div>
        ) : (
          <Link key={tab.id} href={tab.href} className="flex-1 min-w-0">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
