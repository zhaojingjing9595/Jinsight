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
    "bg-[#a57dee] text-white border-[#111008] shadow-[3px_3px_0_#111008] hover:shadow-[4px_4px_0_#111008] hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111008]",
  income:
    "bg-[#2ad2a3] text-[#111008] border-[#111008] shadow-[3px_3px_0_#111008] hover:shadow-[4px_4px_0_#111008] hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111008]",
  dark: "bg-[#111008] text-[#a57dee] border-[#333] shadow-[3px_3px_0_#555555] hover:shadow-[4px_4px_0_#555555] hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#555555]",
  ghost:
    "bg-[#fcfaeb] text-[#111008] border-[#111008] hover:-translate-x-px hover:-translate-y-px",
  danger:
    "bg-[#fc524f] text-white border-[#111008] shadow-[3px_3px_0_#111008] hover:shadow-[4px_4px_0_#111008] hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111008]",
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
        "font-[700] font-[Space_Grotesk,sans-serif]",
        "border-2 rounded-[8px]",
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
