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
      <h3
        className="text-[12px] font-[900] uppercase tracking-[1.5px] text-[#111008] mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Transactions
      </h3>

      <div className="flex flex-col gap-2">
        {sorted.map((t) => {
          const meta = CATEGORY_META[t.category];
          const isExpense = t.type === "EXPENSE";

          return (
            <div
              key={t.id}
              className="flex items-center gap-3 border-[2px] border-[#111008] rounded-[12px] shadow-[3px_3px_0_#111008] px-3 py-2"
              style={{ backgroundColor: "#fcfaeb" }}
            >
              {/* Icon + category label */}
              <div className="flex-none flex flex-col items-center w-10">
                <div
                  className="w-9 h-9 rounded-[10px] border-[2px] border-[#111008] flex items-center justify-center text-lg leading-none"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.icon}
                </div>
                <span
                  className="mt-0.5 text-center leading-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "8px",
                    fontWeight: 600,
                    color: "#666",
                    maxWidth: "40px",
                    overflowWrap: "break-word",
                  }}
                >
                  {meta.label}
                </span>
              </div>

              {/* Description */}
              <p
                className="flex-1 min-w-0 truncate text-[13px] font-[600] text-[#111008]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t.description ?? meta.label}
              </p>

              {/* Amount + datetime */}
              <div className="flex-none text-right">
                <p
                  className="text-[14px] font-[700] leading-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: isExpense ? "#fc524f" : "#2ad2a3",
                  }}
                >
                  {isExpense ? "−" : "+"}{formatCurrency(t.amount, "ILS")}
                </p>
                <p
                  className="mt-0.5 text-[9px] font-[500]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#999" }}
                >
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
