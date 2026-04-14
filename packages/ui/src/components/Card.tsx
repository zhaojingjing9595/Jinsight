import React from "react";

type CardVariant = "default" | "dark" | "primary" | "income" | "goal" | "reward";

type CardProps = {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: "bg-base border-ink shadow-neo-md",
  dark:    "bg-ink border-[#333] shadow-neo-dark",
  primary: "bg-primary border-ink shadow-neo-md",
  income:  "bg-income border-ink shadow-neo-md",
  goal:    "bg-goal border-ink shadow-neo-md",
  reward:  "bg-reward border-ink shadow-neo-md",
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
        "border-[2.5px] rounded-card",
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
