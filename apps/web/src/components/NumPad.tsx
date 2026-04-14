"use client";

type NumPadProps = {
  value: string;
  onChange: (value: string) => void;
};

const KEYS = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  ".", "0", "⌫",
];

export function NumPad({ value, onChange }: NumPadProps) {
  function handleKey(key: string) {
    if (key === "⌫") {
      onChange(value.slice(0, -1) || "0");
      return;
    }
    if (key === "." && value.includes(".")) return;
    // Cap at 2 decimal places
    if (value.includes(".")) {
      const decimals = value.split(".")[1];
      if (decimals && decimals.length >= 2) return;
    }
    const next = value === "0" && key !== "." ? key : value + key;
    // Max 8 digits before decimal
    const [intPart] = next.split(".");
    if (intPart.length > 8) return;
    onChange(next);
  }

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={`font-body flex items-center justify-center h-14 font-bold text-[20px] border-2 border-ink rounded-[10px] shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
            key === "⌫" ? "bg-alert text-white" : "bg-base text-ink"
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
