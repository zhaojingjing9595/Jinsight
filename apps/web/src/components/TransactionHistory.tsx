import type { Transaction } from "@jinsight/core";
import { CATEGORY_META, formatCurrency } from "@jinsight/core";

function formatDateTime(date: Date) {
  const d = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const t = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${d} · ${t}`;
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mt-3 pb-1">
      <h3 className="font-body text-[12px] font-[900] uppercase tracking-[1.5px] text-ink mb-2">
        Transactions
      </h3>

      <div className="flex flex-col gap-2">
        {sorted.map((t) => {
          const meta = CATEGORY_META[t.category];
          const isExpense = t.type === "EXPENSE";

          return (
            <div
              key={t.id}
              className="flex items-center gap-3 border-2 border-ink rounded-[12px] shadow-neo-sm px-3 py-2 bg-base"
            >
              {/* Icon + category label */}
              <div className="flex-none flex flex-col items-center w-10">
                <div
                  className="w-9 h-9 rounded-[10px] border-2 border-ink flex items-center justify-center text-lg leading-none"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.icon}
                </div>
                <span className="font-body mt-0.5 text-center leading-tight text-[8px] font-semibold text-[#666] max-w-[40px] break-words">
                  {meta.label}
                </span>
              </div>

              {/* Description */}
              <p className="font-body flex-1 min-w-0 truncate text-[13px] font-[600] text-ink">
                {t.description ?? meta.label}
              </p>

              {/* Amount + datetime */}
              <div className="flex-none text-right">
                <p className={`font-body text-[14px] font-[700] leading-tight ${isExpense ? "text-alert" : "text-income"}`}>
                  {isExpense ? "−" : "+"}{formatCurrency(t.amount, "ILS")}
                </p>
                <p className="font-body mt-0.5 text-[9px] font-[500] text-[#999]">
                  {formatDateTime(t.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
