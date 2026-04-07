import React from "react";

type BadgeVariant =
  | "pending"
  | "income"
  | "overspent"
  | "ontrack"
  | "fun"
  | "story"
  | "reward"
  | "completed";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  pending: "bg-[#a57dee] text-white border-[#111008]",
  income: "bg-[#2ad2a3] text-[#111008] border-[#111008]",
  overspent: "bg-[#fc524f] text-white border-[#111008]",
  ontrack: "bg-[#cce972] text-[#111008] border-[#111008]",
  fun: "bg-[#fdb6f0] text-[#111008] border-[#111008]",
  story: "bg-[#cdb1e7] text-[#111008] border-[#111008]",
  reward: "bg-[#feb704] text-[#111008] border-[#111008]",
  completed: "bg-[#fcfaeb] text-[#111008] border-[#111008]",
};

export function Badge({ variant = "pending", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-block px-[10px] py-[3px]",
        "border-[1.5px] rounded-[20px]",
        "text-[10px] font-[700] font-[Space_Grotesk,sans-serif]",
        VARIANT_STYLES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
