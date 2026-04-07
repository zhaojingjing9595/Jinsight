"use client";

import { useState } from "react";
import type { Transaction, Currency } from "@jinsight/core";
import { TransactionRow } from "@jinsight/ui";

type TransactionListProps = {
  transactions: Transaction[];
  currency?: Currency;
};

export function TransactionList({ transactions, currency = "ILS" }: TransactionListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="border-[2.5px] border-[#111008] rounded-[14px] shadow-[4px_4px_0_#111008] overflow-hidden">
      {transactions.map((tx, i) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          currency={currency}
          isActive={activeId === tx.id}
          isFirst={i === 0}
          isLast={i === transactions.length - 1}
          onClick={() => setActiveId(activeId === tx.id ? null : tx.id)}
        />
      ))}
    </div>
  );
}
