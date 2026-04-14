import { formatCurrency, CATEGORY_META } from "@jinsight/core";
import type { Transaction } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { ChartSection } from "@/components/ChartSection";
import { TransactionHistory } from "@/components/TransactionHistory";
import type { MonthData } from "@/components/MonthlyBarChart";

// ─── Mock data (Phase 1 — replaced with real data in Phase 2) ────────────────

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    accountId: "acc1",
    amount: 8500,
    type: "INCOME",
    category: "income",
    description: "Monthly salary",
    date: new Date("2026-04-01T09:00:00"),
    isRecurring: true,
    createdAt: new Date("2026-04-01"),
  },
  {
    id: "2",
    accountId: "acc1",
    amount: 2200,
    type: "EXPENSE",
    category: "rent",
    description: "April rent",
    date: new Date("2026-04-01T10:30:00"),
    isRecurring: true,
    createdAt: new Date("2026-04-01"),
  },
  {
    id: "3",
    accountId: "acc1",
    amount: 150,
    type: "EXPENSE",
    category: "utilities",
    description: "Electricity & Internet",
    date: new Date("2026-04-03T08:00:00"),
    isRecurring: true,
    createdAt: new Date("2026-04-03"),
  },
  {
    id: "4",
    accountId: "acc1",
    amount: 49,
    type: "EXPENSE",
    category: "subscriptions",
    description: "Spotify + Netflix",
    date: new Date("2026-04-04T12:00:00"),
    isRecurring: true,
    createdAt: new Date("2026-04-04"),
  },
  {
    id: "5",
    accountId: "acc1",
    amount: 320,
    type: "EXPENSE",
    category: "grocery",
    description: "Weekly groceries",
    date: new Date("2026-04-06T17:30:00"),
    isRecurring: false,
    createdAt: new Date("2026-04-06"),
  },
  {
    id: "6",
    accountId: "acc1",
    amount: 180,
    type: "EXPENSE",
    category: "dining",
    description: "Dinner at Oasis",
    date: new Date("2026-04-05T19:45:00"),
    isRecurring: false,
    createdAt: new Date("2026-04-05"),
  },
  {
    id: "7",
    accountId: "acc1",
    amount: 150,
    type: "EXPENSE",
    category: "shopping",
    description: "New sneakers",
    date: new Date("2026-04-07T14:30:00"),
    isRecurring: false,
    createdAt: new Date("2026-04-07"),
  },
  {
    id: "8",
    accountId: "acc1",
    amount: 65,
    type: "EXPENSE",
    category: "transport",
    description: "Monthly transit pass",
    date: new Date("2026-04-03T09:00:00"),
    isRecurring: true,
    createdAt: new Date("2026-04-03"),
  },
  {
    id: "9",
    accountId: "acc1",
    amount: 45,
    type: "EXPENSE",
    category: "other",
    description: "Monthly gym membership",
    date: new Date("2026-04-02T07:00:00"),
    isRecurring: true,
    createdAt: new Date("2026-04-02"),
  },
];

// Last 6 months of income vs. spending (Nov 2025 – Apr 2026)
const MONTHLY_DATA: MonthData[] = [
  { month: "Nov", income: 8200, spent: 7800 },
  { month: "Dec", income: 8200, spent: 9200 },
  { month: "Jan", income: 8500, spent: 6500 },
  { month: "Feb", income: 8500, spent: 7100 },
  { month: "Mar", income: 8500, spent: 8600 },
  { month: "Apr", income: 8500, spent: 3159 },
];

// ─── Derived values ───────────────────────────────────────────────────────────

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

const categoryTotals = MOCK_TRANSACTIONS.filter((t) => t.type === "EXPENSE").reduce<
  Record<string, { amount: number; color: string; label: string }>
>((acc, t) => {
  const meta = CATEGORY_META[t.category];
  if (!acc[t.category]) {
    acc[t.category] = { amount: 0, color: meta.color, label: meta.label };
  }
  acc[t.category].amount += t.amount;
  return acc;
}, {});

const pieSlices = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div
      className="flex flex-col overflow-hidden max-w-[480px] mx-auto px-4 bg-base h-dvh"
    >
      {/* ── Section 1: Balance hero (~18 dvh) ── */}
      <div
        className="min-h-0 flex flex-col pt-8 pb-3"
        style={{ flex: "0 0 18dvh" }}
      >
        <div className="flex-1 border-[2.5px] border-ink rounded-[18px] shadow-neo-lg px-5 flex flex-col items-center justify-center text-center bg-reward">
          <p className="font-body text-[9px] font-bold uppercase tracking-[2.5px] mb-1 text-reward-dark">
            April 2026 · Current Balance
          </p>
          <h1
            className="font-display font-medium leading-none text-ink tracking-[0.01em]"
            style={{ fontSize: "clamp(34px, 5.5dvh, 56px)" }}
          >
            {formatCurrency(balance, "ILS")}
          </h1>
          <p className="font-body text-[10px] font-medium mt-1 text-reward-dark">
            Income minus spending this month
          </p>
        </div>
      </div>

      {/* ── Section 2: Income vs Spent bar (~15 dvh) ── */}
      <div
        className="min-h-0 flex flex-col pb-3"
        style={{ flex: "0 0 15dvh" }}
      >
        <div className="flex-1 border-[2.5px] border-ink rounded-card shadow-neo-md px-4 flex flex-col justify-center gap-2 bg-base">
          {/* Amount labels */}
          <div className="flex justify-between items-end">
            <div>
              <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-alert">
                Spent
              </p>
              <p
                className="font-display font-medium leading-none text-ink tracking-[0.01em]"
                style={{ fontSize: "clamp(16px, 2.5dvh, 22px)" }}
              >
                {formatCurrency(totalExpenses, "ILS")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-body text-[9px] font-bold uppercase tracking-[1.5px] text-income">
                Income
              </p>
              <p
                className="font-display font-medium leading-none text-ink tracking-[0.01em]"
                style={{ fontSize: "clamp(16px, 2.5dvh, 22px)" }}
              >
                {formatCurrency(totalIncome, "ILS")}
              </p>
            </div>
          </div>

          {/* Single combined bar */}
          <div>
            <div className="h-[20px] rounded-[30px] border-[2px] border-ink overflow-hidden relative bg-income">
              <div
                className="absolute left-0 top-0 h-full bg-alert"
                style={{ width: `${spentRatio}%`, borderRadius: "28px 0 0 28px" }}
              />
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-ink"
                style={{ left: `${spentRatio}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="font-body text-[9px] font-semibold text-income-dark">
                {formatCurrency(totalIncome - totalExpenses, "ILS")} left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Charts + transaction history (scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-[calc(80px+16px)]">
        {/* Chart card */}
        <div
          className="border-[2.5px] border-ink rounded-card shadow-neo-md px-4 pt-3 pb-2 flex flex-col bg-base"
          style={{ height: "clamp(220px, 38dvh, 320px)" }}
        >
          <h2 className="font-body flex-none text-[12px] font-black uppercase tracking-[1.5px] text-ink mb-1">
            Where It Went
          </h2>
          <div className="flex-1 min-h-0">
            <ChartSection
              slices={pieSlices}
              totalLabel={formatCurrency(totalExpenses, "ILS")}
              monthlyData={MONTHLY_DATA}
            />
          </div>
        </div>

        {/* Transaction history list */}
        <TransactionHistory transactions={MOCK_TRANSACTIONS} />
      </div>

      <BottomNav active="home" />
    </div>
  );
}
