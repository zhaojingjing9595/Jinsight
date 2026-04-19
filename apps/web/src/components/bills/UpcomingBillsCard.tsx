"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@jinsight/core";
import { trpcQuery } from "@/lib/api";

const CATEGORY_ICONS: Record<string, string> = {
  utilities: "⚡",
  subscriptions: "📱",
  rent: "🏠",
  transport: "🚌",
  education: "📚",
  other: "📦",
};

type ApiBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
};

function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusFor(b: ApiBill) {
  if (b.isPaid) return { label: "Paid", color: "text-income-dark" };
  const d = daysUntil(b.dueDate);
  if (d < 0) return { label: `${Math.abs(d)}d late`, color: "text-alert" };
  if (d === 0) return { label: "Today", color: "text-reward-dark" };
  return { label: `${d}d`, color: d <= 3 ? "text-reward-dark" : "text-muted" };
}

export function UpcomingBillsCard() {
  const [bills, setBills] = useState<ApiBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await trpcQuery<{ bills: ApiBill[] }>("bills.list", {
          status: "upcoming",
          limit: 3,
        });
        setBills(data.bills);
      } catch (err) {
        console.error("Failed to load upcoming bills:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const onChanged = () => load();
    window.addEventListener("jinsight:bill-changed", onChanged);
    return () => window.removeEventListener("jinsight:bill-changed", onChanged);
  }, []);

  if (loading) return null;

  return (
    <div className="border-[2.5px] border-ink rounded-card shadow-neo-md bg-base px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-body text-[10px] font-bold uppercase tracking-[2px] text-ink">
          Upcoming Bills
        </p>
        <Link
          href="/bills"
          className="font-body text-[10px] font-bold uppercase tracking-[1.5px] text-primary"
        >
          View all →
        </Link>
      </div>

      {bills.length === 0 ? (
        <Link
          href="/bills"
          className="block py-2 text-center font-body text-[12px] text-muted"
        >
          No bills yet — <span className="text-primary font-bold">add one</span>
        </Link>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {bills.map((b) => {
            const s = statusFor(b);
            return (
              <li key={b.id} className="flex items-center gap-2.5">
                <span className="w-7 h-7 flex items-center justify-center border border-ink rounded-full bg-base text-[13px] flex-none">
                  {CATEGORY_ICONS[b.category] ?? "📦"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-[12px] text-ink truncate">{b.name}</p>
                  <p className="font-body text-[10px] text-muted">
                    {formatCurrency(b.amount, "ILS")}
                  </p>
                </div>
                <span className={`font-body text-[11px] font-bold ${s.color} flex-none`}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
