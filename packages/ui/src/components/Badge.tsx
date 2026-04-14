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
  pending:   "bg-primary text-white border-ink",
  income:    "bg-income text-ink border-ink",
  overspent: "bg-alert text-white border-ink",
  ontrack:   "bg-goal text-ink border-ink",
  fun:       "bg-fun text-ink border-ink",
  story:     "bg-story text-ink border-ink",
  reward:    "bg-reward text-ink border-ink",
  completed: "bg-base text-ink border-ink",
};

export function Badge({ variant = "pending", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-block px-[10px] py-[3px]",
        "border-[1.5px] rounded-pill",
        "text-[10px] font-[700] font-body",
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
