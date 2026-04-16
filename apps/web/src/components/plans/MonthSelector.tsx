"use client";

type MonthSelectorProps = {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
};

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const label = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prev() {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  }

  function next() {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  }

  return (
    <div className="flex items-center justify-between py-2">
      <button
        type="button"
        onClick={prev}
        className="w-[36px] h-[36px] flex items-center justify-center border-2 border-ink rounded-[8px] bg-base shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
      >
        <span className="font-body text-[16px] font-black text-ink">‹</span>
      </button>

      <span className="font-body text-[14px] font-black uppercase tracking-[1.5px] text-ink">
        {label}
      </span>

      <button
        type="button"
        onClick={next}
        className="w-[36px] h-[36px] flex items-center justify-center border-2 border-ink rounded-[8px] bg-base shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
      >
        <span className="font-body text-[16px] font-black text-ink">›</span>
      </button>
    </div>
  );
}
