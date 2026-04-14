"use client";

import React from "react";

type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
};

export function Input({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  type = "text",
  error,
  disabled,
  name,
  id,
  className = "",
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-[700] uppercase tracking-[2px] text-ink font-body"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        className={[
          "w-full px-3 py-2.5",
          "bg-base text-ink",
          "border-2 border-ink rounded-btn",
          "text-[13px] font-[400] font-body",
          "placeholder:text-muted",
          "focus:outline-none focus:border-primary focus:shadow-[3px_3px_0_#a57dee]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-150",
          error ? "border-alert shadow-[3px_3px_0_#fc524f]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && (
        <span className="text-[11px] text-alert font-[700] font-body">
          {error}
        </span>
      )}
    </div>
  );
}
