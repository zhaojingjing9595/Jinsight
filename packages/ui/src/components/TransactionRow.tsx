import React from "react";
import type { Transaction } from "@jinsight/core";
import { getCategoryColor, getCategoryIcon, getCategoryLabel } from "@jinsight/core";
import type { Currency } from "@jinsight/core";
import { formatCurrency, formatShortDate } from "@jinsight/core";

type TransactionRowProps = {
  transaction: Transaction;
  currency?: Currency;
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: () => void;
};

export function TransactionRow({
  transaction,
  currency = "ILS",
  isActive = false,
  isFirst = false,
  isLast = false,
  onClick,
}: TransactionRowProps) {
  const categoryColor = getCategoryColor(transaction.category);
  const categoryIcon = getCategoryIcon(transaction.category);
  const categoryLabel = getCategoryLabel(transaction.category);
  const isIncome = transaction.type === "INCOME";

  return (
    <div
      onClick={onClick}
      className={[
        "flex items-center gap-3 px-3 py-[9px] cursor-pointer",
        "border-[#111008] transition-colors duration-150",
        isActive
          ? "bg-[#a57dee]"
          : "bg-[#fcfaeb] hover:bg-[#f0eede]",
        isFirst ? "rounded-t-[10px]" : "",
        isLast ? "rounded-b-[10px]" : "border-b-2",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Category icon box */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-[8px] border-2 border-[#111008] flex-shrink-0 text-[14px]"
        style={{ backgroundColor: categoryColor }}
      >
        {categoryIcon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            "text-[12px] font-[700] font-[Space_Grotesk,sans-serif] truncate",
            isActive ? "text-white" : "text-[#111008]",
          ].join(" ")}
        >
          {transaction.description ?? categoryLabel}
        </p>
        <p
          className={[
            "text-[10px] font-[400] font-[Space_Grotesk,sans-serif]",
            isActive ? "text-[#e0ccff]" : "text-[#666]",
          ].join(" ")}
        >
          {categoryLabel} · {formatShortDate(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <p
        className={[
          "text-[17px] font-[900] flex-shrink-0",
          "font-[Barlow_Condensed,sans-serif]",
          isActive
            ? "text-white"
            : isIncome
              ? "text-[#2ad2a3]"
              : "text-[#fc524f]",
        ].join(" ")}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount, currency)}
      </p>
    </div>
  );
}
