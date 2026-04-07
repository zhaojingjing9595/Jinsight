import { formatCurrency } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { TransactionList } from "@/components/TransactionList";
import { BottomNav } from "@/components/BottomNav";
import { StatCard } from "@/components/StatCard";
import { BudgetBar } from "@/components/BudgetBar";

// Mock data — will be replaced with real data in Phase 2
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    accountId: "acc1",
    amount: 8500,
    type: "INCOME",
    category: "income",
    description: "Monthly salary",
    date: new Date("2026-04-01"),
    isRecurring: true,
    createdAt: new Date("2026-04-01"),
  },
  {
    id: "2",
    accountId: "acc1",
    amount: 320,
    type: "EXPENSE",
    category: "food",
    description: "Weekly groceries",
    date: new Date("2026-04-06"),
    isRecurring: false,
    createdAt: new Date("2026-04-06"),
  },
  {
    id: "3",
    accountId: "acc1",
    amount: 180,
    type: "EXPENSE",
    category: "restaurants",
    description: "Dinner at Oasis",
    date: new Date("2026-04-05"),
    isRecurring: false,
    createdAt: new Date("2026-04-05"),
  },
  {
    id: "4",
    accountId: "acc1",
    amount: 49,
    type: "EXPENSE",
    category: "subscriptions",
    description: "Spotify + Netflix",
    date: new Date("2026-04-04"),
    isRecurring: true,
    createdAt: new Date("2026-04-04"),
  },
  {
    id: "5",
    accountId: "acc1",
    amount: 65,
    type: "EXPENSE",
    category: "transport",
    description: "Monthly transit pass",
    date: new Date("2026-04-03"),
    isRecurring: true,
    createdAt: new Date("2026-04-03"),
  },
];

const totalIncome = MOCK_TRANSACTIONS.filter((t) => t.type === "INCOME").reduce(
  (sum, t) => sum + t.amount,
  0,
);
const totalExpenses = MOCK_TRANSACTIONS.filter((t) => t.type === "EXPENSE").reduce(
  (sum, t) => sum + t.amount,
  0,
);
const balance = totalIncome - totalExpenses;
const leftToSpend = 3000 - totalExpenses; // mock budget limit

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen pb-28"
      style={{ backgroundColor: "#fcfaeb" }}
    >
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <p
          className="text-[10px] font-[700] uppercase tracking-[2px] text-[#888] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          April 2026
        </p>
        <h1
          className="text-[48px] font-[900] text-[#111008] leading-[1.0]"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-1px" }}
        >
          {formatCurrency(balance, "ILS")}
        </h1>
        <p
          className="text-[12px] font-[400] text-[#666] mt-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Current balance
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="px-4 grid grid-cols-2 gap-[10px] mb-4">
        <StatCard
          label="Income"
          value={formatCurrency(totalIncome, "ILS")}
          variant="income"
        />
        <StatCard
          label="Spent"
          value={formatCurrency(totalExpenses, "ILS")}
          variant="alert"
        />
        <StatCard
          label="Left to spend"
          value={formatCurrency(leftToSpend, "ILS")}
          variant="primary"
        />
        <StatCard
          label="Saved"
          value={formatCurrency(500, "ILS")}
          variant="goal"
        />
      </div>

      {/* Budget bars */}
      <div className="px-4 mb-4">
        <div
          className="border-[2.5px] border-[#111008] rounded-[14px] p-[14px] shadow-[4px_4px_0_#111008]"
          style={{ backgroundColor: "#fcfaeb" }}
        >
          <h2
            className="text-[20px] font-[900] text-[#111008] mb-3"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            BUDGETS
          </h2>
          <div className="flex flex-col gap-3">
            <BudgetBar label="Food & Drink" spent={320} limit={600} color="#2ad2a3" />
            <BudgetBar label="Restaurants" spent={180} limit={200} color="#f5a800" />
            <BudgetBar label="Subscriptions" spent={49} limit={100} color="#208870" />
            <BudgetBar label="Transport" spent={65} limit={200} color="#f07030" />
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4">
        <h2
          className="text-[20px] font-[900] text-[#111008] mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          RECENT
        </h2>
        <TransactionList transactions={MOCK_TRANSACTIONS} currency="ILS" />
      </div>

      <BottomNav active="home" />
    </div>
  );
}
