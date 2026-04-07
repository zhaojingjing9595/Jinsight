import React from "react";

type CardVariant = "default" | "dark" | "primary" | "income" | "goal" | "reward";

type CardProps = {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: "bg-[#fcfaeb] border-[#111008] shadow-[4px_4px_0_#111008]",
  dark: "bg-[#111008] border-[#333] shadow-[4px_4px_0_#555555]",
  primary: "bg-[#a57dee] border-[#111008] shadow-[4px_4px_0_#111008]",
  income: "bg-[#2ad2a3] border-[#111008] shadow-[4px_4px_0_#111008]",
  goal: "bg-[#cce972] border-[#111008] shadow-[4px_4px_0_#111008]",
  reward: "bg-[#feb704] border-[#111008] shadow-[4px_4px_0_#111008]",
};

const PADDING_STYLES = {
  sm: "p-3",
  md: "p-[14px]",
  lg: "p-5",
};

export function Card({
  variant = "default",
  children,
  className = "",
  padding = "md",
}: CardProps) {
  return (
    <div
      className={[
        "border-[2.5px] rounded-[14px]",
        VARIANT_STYLES[variant],
        PADDING_STYLES[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
