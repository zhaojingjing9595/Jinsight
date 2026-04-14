"use client";

import React from "react";

type ButtonVariant = "primary" | "income" | "dark" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  fullWidth?: boolean;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border-ink shadow-neo-sm hover:shadow-neo-md hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed",
  income:
    "bg-income text-ink border-ink shadow-neo-sm hover:shadow-neo-md hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed",
  dark:
    "bg-ink text-primary border-[#333] shadow-[3px_3px_0_#555555] hover:shadow-neo-dark hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#555555]",
  ghost:
    "bg-base text-ink border-ink hover:-translate-x-px hover:-translate-y-px",
  danger:
    "bg-alert text-white border-ink shadow-neo-sm hover:shadow-neo-md hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-4 py-2 text-[13px]",
  lg: "px-6 py-3 text-[14px]",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
  fullWidth,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-[700] font-body",
        "border-2 rounded-btn",
        "transition-all duration-150 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
