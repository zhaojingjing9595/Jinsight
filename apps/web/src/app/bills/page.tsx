"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { BillCountdown } from "@/components/bills/BillCountdown";
import { BillRow, daysUntil } from "@/components/bills/BillRow";
import { AddBillModal } from "@/components/bills/AddBillModal";
import { trpcQuery, trpcMutate } from "@/lib/api";

type Recurrence = "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM";

type ApiBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurrence: Recurrence;
  isRecurring: boolean;
  isSubscription: boolean;
  reminderDays: number;
  isPaid: boolean;
  lastPaidDate: string | null;
};

type Filter = "all" | "upcoming" | "paid" | "overdue";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function BillsPage() {
  const [bills, setBills] = useState<ApiBill[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiBill | null>(null);

  async function load() {
    try {
      const data = await trpcQuery<{ bills: ApiBill[] }>("bills.list", {});
      setBills(data.bills);
    } catch (err) {
      console.error("Failed to load bills:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onChanged = () => load();
    window.addEventListener("jinsight:bill-changed", onChanged);
    return () => window.removeEventListener("jinsight:bill-changed", onChanged);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return bills.filter((b) => {
      if (filter === "all") return true;
      if (filter === "paid") return b.isPaid;
      if (filter === "upcoming") return !b.isPaid && new Date(b.dueDate) >= now;
      if (filter === "overdue") return !b.isPaid && new Date(b.dueDate) < now;
      return true;
    });
  }, [bills, filter]);

  const nextDue = useMemo(() => {
    const upcoming = bills
      .filter((b) => !b.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return upcoming[0] ?? null;
  }, [bills]);

  const totalUnpaid = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  async function handleMarkPaid(id: string) {
    try {
      await trpcMutate("bills.markPaid", { id });
      load();
    } catch (err) {
      console.error("Failed to mark paid:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bill?")) return;
    try {
      await trpcMutate("bills.delete", { id });
      load();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  function handleEdit(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    setEditing(bill);
    setModalOpen(true);
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[480px] mx-auto bg-base h-dvh">
        <div className="w-8 h-8 border-[3px] border-ink border-t-primary rounded-full animate-spin" />
        <p className="font-body text-[12px] text-muted mt-3">Loading bills...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden max-w-[480px] mx-auto px-4 bg-base h-dvh gap-3 pt-6 pb-0">
      <div className="flex items-center justify-between flex-none">
        <Link
          href="/dashboard"
          className="font-body text-[12px] font-bold uppercase tracking-[1.5px] text-muted"
        >
          ← Home
        </Link>
        <h1 className="font-display font-black text-[18px] text-ink uppercase tracking-[1px]">
          Bills
        </h1>
        <button
          type="button"
          onClick={openAdd}
          aria-label="Add bill"
          className="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-full bg-primary text-white shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold text-[16px]"
        >
          +
        </button>
      </div>

      <div className="flex-none border-[2.5px] border-ink rounded-card shadow-neo-md bg-base">
        {nextDue ? (
          <BillCountdown
            name={nextDue.name}
            amount={nextDue.amount}
            dueDate={nextDue.dueDate}
            category={nextDue.category}
            reminderDays={nextDue.reminderDays}
          />
        ) : (
          <div className="py-8 text-center">
            <p className="font-display font-black text-[16px] text-ink">All caught up</p>
            <p className="font-body text-[12px] text-muted mt-1">No upcoming bills</p>
          </div>
        )}
        <div className="border-t-2 border-ink px-4 py-2 flex justify-between text-[11px] font-body">
          <span className="text-muted font-bold uppercase tracking-[1px]">Outstanding</span>
          <span className="font-bold text-ink">{formatCurrency(totalUnpaid, "ILS")}</span>
        </div>
      </div>

      <div className="flex-none flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`font-body text-[11px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border-2 border-ink rounded-pill flex-none transition-all ${
                active ? "bg-ink text-base shadow-neo-xs" : "bg-base text-ink"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-[calc(80px+16px)] flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-body text-[12px] text-muted">No bills here.</p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-3 font-body text-[12px] font-bold uppercase tracking-[1.5px] px-4 py-2 border-2 border-ink rounded-pill bg-primary text-white shadow-neo-xs"
            >
              + Add a bill
            </button>
          </div>
        ) : (
          filtered
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .sort((a, b) => Number(a.isPaid) - Number(b.isPaid))
            .sort((a, b) => {
              const ad = daysUntil(a.dueDate) < 0 && !a.isPaid ? -1 : 0;
              const bd = daysUntil(b.dueDate) < 0 && !b.isPaid ? -1 : 0;
              return ad - bd;
            })
            .map((b) => (
              <BillRow
                key={b.id}
                bill={b}
                onMarkPaid={handleMarkPaid}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
        )}
      </div>

      <AddBillModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initial={editing ?? undefined}
      />

      <BottomNav active="home" />
    </div>
  );
}
