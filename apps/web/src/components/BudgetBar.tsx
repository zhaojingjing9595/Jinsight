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
        <span className="font-body text-[11px] font-[700] text-ink">
          {label}
        </span>
        <span className="font-body text-[11px] font-[400] text-[#666]">
          <span className={`font-[700] ${isOverspent ? "text-alert" : "text-ink"}`}>
            ₪{spent}
          </span>
          {" / "}₪{limit}
        </span>
      </div>
      <div className="h-[13px] rounded-[30px] overflow-hidden border-2 border-ink bg-[#ddd]">
        <div
          className="h-full rounded-[30px] transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: isOverspent ? "var(--color-alert)" : color,
          }}
        />
      </div>
    </div>
  );
}
