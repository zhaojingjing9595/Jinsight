type BudgetBarProps = {
  label: string;
  spent: number;
  limit: number;
  color: string;
};

export function BudgetBar({ label, spent, limit, color }: BudgetBarProps) {
  const percent = Math.min((spent / limit) * 100, 100);
  const isOverspent = spent > limit;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span
          className="text-[11px] font-[700] text-[#111008]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {label}
        </span>
        <span
          className="text-[11px] font-[400] text-[#666]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span
            className="font-[700]"
            style={{ color: isOverspent ? "#fc524f" : "#111008" }}
          >
            ₪{spent}
          </span>
          {" / "}₪{limit}
        </span>
      </div>
      <div
        className="h-[13px] rounded-[30px] overflow-hidden border-2 border-[#111008]"
        style={{ backgroundColor: "#ddd" }}
      >
        <div
          className="h-full rounded-[30px] transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: isOverspent ? "#fc524f" : color,
          }}
        />
      </div>
    </div>
  );
}
