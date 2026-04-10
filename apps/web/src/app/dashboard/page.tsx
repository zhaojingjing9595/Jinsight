import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Transaction, Category } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { SpendingPieChart } from "@/components/SpendingPieChart";

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
    amount: 2200,
    type: "EXPENSE",
    category: "bills",
    description: "April rent",
    date: new Date("2026-04-01"),
    isRecurring: true,
    createdAt: new Date("2026-04-01"),
  },
  {
    id: "3",
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
    id: "4",
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
    id: "5",
    accountId: "acc1",
    amount: 150,
    type: "EXPENSE",
    category: "other",
    description: "Electricity & Internet",
    date: new Date("2026-04-03"),
    isRecurring: true,
    createdAt: new Date("2026-04-03"),
  },
  {
    id: "6",
    accountId: "acc1",
    amount: 45,
    type: "EXPENSE",
    category: "health",
    description: "Monthly gym membership",
    date: new Date("2026-04-02"),
    isRecurring: true,
    createdAt: new Date("2026-04-02"),
  },
  {
    id: "7",
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
    id: "8",
    accountId: "acc1",
    amount: 65,
    type: "EXPENSE",
    category: "transport",
    description: "Monthly transit pass",
    date: new Date("2026-04-03"),
    isRecurring: true,
    createdAt: new Date("2026-04-03"),
  },
  {
    id: "9",
    accountId: "acc1",
    amount: 150,
    type: "EXPENSE",
    category: "shopping",
    description: "New sneakers",
    date: new Date("2026-04-07"),
    isRecurring: false,
    createdAt: new Date("2026-04-07"),
  },
];

const CATEGORY_LABEL_OVERRIDES: Partial<Record<Category, string>> = {
  bills: "Rent & Bills",
  food: "Grocery",
  restaurants: "Food",
  health: "Gym",
  other: "Other",
};

const totalIncome = MOCK_TRANSACTIONS.filter((t) => t.type === "INCOME").reduce(
  (sum, t) => sum + t.amount,
  0,
);
const totalExpenses = MOCK_TRANSACTIONS.filter((t) => t.type === "EXPENSE").reduce(
  (sum, t) => sum + t.amount,
  0,
);
const balance = totalIncome - totalExpenses;
const spentRatio = Math.min((totalExpenses / totalIncome) * 100, 100);

// Aggregate expenses by category for the pie chart
const categoryTotals = MOCK_TRANSACTIONS.filter((t) => t.type === "EXPENSE").reduce<
  Record<string, { amount: number; color: string; label: string }>
>((acc, t) => {
  const meta = CATEGORY_META[t.category];
  const label = CATEGORY_LABEL_OVERRIDES[t.category] ?? meta.label;
  if (!acc[t.category]) {
    acc[t.category] = { amount: 0, color: meta.color, label };
  }
  acc[t.category].amount += t.amount;
  return acc;
}, {});

const pieSlices = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

export default function DashboardPage() {
  return (
    /*
     * Outer shell: exactly one viewport tall, flex column.
     * overflow-hidden prevents any child from causing a scrollbar.
     */
    <div
      className="flex flex-col overflow-hidden max-w-[480px] mx-auto px-4"
      style={{ height: "100dvh", backgroundColor: "#fcfaeb" }}
    >
      {/* ── Section 1: Balance hero (~26 % of viewport) ── */}
      <div
        className="min-h-0 flex flex-col pt-8 pb-3"
        style={{ flex: "0 0 18dvh" }}
      >
        <div
          className="flex-1 border-[2.5px] border-[#111008] rounded-[18px] shadow-[5px_5px_0_#111008] px-5 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: "#feb704" }}
        >
          <p
            className="text-[9px] font-[700] uppercase tracking-[2.5px] mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#6b4800" }}
          >
            April 2026 · Current Balance
          </p>
          <h1
            className="font-[500] leading-[1.0] text-[#111008]"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(34px, 5.5dvh, 56px)",
              letterSpacing: "0.01em",
            }}
          >
            {formatCurrency(balance, "ILS")}
          </h1>
          <p
            className="text-[10px] font-[500] mt-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#6b4800" }}
          >
            Income minus spending this month
          </p>
        </div>
      </div>

      {/* ── Section 2: Income vs Spent — single bar (~20 % of viewport) ── */}
      <div
        className="min-h-0 flex flex-col pb-3"
        style={{ flex: "0 0 15dvh" }}
      >
        <div
          className="flex-1 border-[2.5px] border-[#111008] rounded-[14px] shadow-[4px_4px_0_#111008] px-4 flex flex-col justify-center gap-2"
          style={{ backgroundColor: "#fcfaeb" }}
        >
          {/* Amount labels */}
          <div className="flex justify-between items-end">
            <div>
              <p
                className="text-[9px] font-[700] uppercase tracking-[1.5px]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#fc524f" }}
              >
                Spent
              </p>
              <p
                className="font-[500] leading-none text-[#111008]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(16px, 2.5dvh, 22px)",
                  letterSpacing: "0.01em",
                }}
              >
                {formatCurrency(totalExpenses, "ILS")}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[9px] font-[700] uppercase tracking-[1.5px]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#2ad2a3" }}
              >
                Income
              </p>
              <p
                className="font-[500] leading-none text-[#111008]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(16px, 2.5dvh, 22px)",
                  letterSpacing: "0.01em",
                }}
              >
                {formatCurrency(totalIncome, "ILS")}
              </p>
            </div>
          </div>

          {/* Single combined bar */}
          <div>
            <div
              className="h-[20px] rounded-[30px] border-[2px] border-[#111008] overflow-hidden relative"
              style={{ backgroundColor: "#2ad2a3" }}
            >
              <div
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${spentRatio}%`,
                  backgroundColor: "#fc524f",
                  borderRadius: "28px 0 0 28px",
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#111008]"
                style={{ left: `${spentRatio}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span
                className="text-[9px] font-[600]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#086b52" }}
              >
                {formatCurrency(totalIncome - totalExpenses, "ILS")} left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Spending breakdown pie (fills the rest) ── */}
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{ paddingBottom: "calc(80px + 20px)" }}
      >
        <div
          className="flex-1 min-h-0 border-[2.5px] border-[#111008] rounded-[14px] shadow-[4px_4px_0_#111008] px-4 pt-3 pb-2 flex flex-col overflow-hidden"
          style={{ backgroundColor: "#fcfaeb" }}
        >
          <h2
            className="flex-none text-[12px] font-[900] text-[#111008] mb-1 uppercase tracking-[1.5px]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Where It Went
          </h2>
          {/* Pie fills whatever height remains in the card */}
          <div className="flex-1 min-h-0">
            <SpendingPieChart
              slices={pieSlices}
              totalLabel={formatCurrency(totalExpenses, "ILS")}
            />
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
