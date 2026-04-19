"use client";

const CATEGORY_ICONS: Record<string, string> = {
  utilities: "⚡",
  subscriptions: "📱",
  rent: "🏠",
  transport: "🚌",
  education: "📚",
  other: "📦",
};

type BillCountdownProps = {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  reminderDays: number;
};

export function BillCountdown({
  name,
  amount,
  dueDate,
  category,
  reminderDays,
}: BillCountdownProps) {
  const now = new Date();
  const due = new Date(dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / msPerDay);

  const window = Math.max(reminderDays, 14);
  const clamped = Math.max(0, Math.min(window, daysLeft));
  const progress = window > 0 ? clamped / window : 0;

  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const isOverdue = daysLeft < 0;
  const isUrgent = !isOverdue && daysLeft <= reminderDays;

  const ringColor = isOverdue
    ? "#ef4444"
    : isUrgent
      ? "#f5a800"
      : "#2ad2a3";

  const label = isOverdue
    ? `${Math.abs(daysLeft)}d late`
    : daysLeft === 0
      ? "Due today"
      : `${daysLeft}d left`;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative" style={{ width: radius * 2 + stroke * 2, height: radius * 2 + stroke * 2 }}>
        <svg
          width={radius * 2 + stroke * 2}
          height={radius * 2 + stroke * 2}
          viewBox={`0 0 ${radius * 2 + stroke * 2} ${radius * 2 + stroke * 2}`}
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="white"
            stroke="#0a0a0a"
            strokeWidth={2.5}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={stroke}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
            style={{ transition: "stroke-dashoffset 400ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px]">{CATEGORY_ICONS[category] ?? "📦"}</span>
          <span className="font-display font-black text-[16px] text-ink leading-none mt-1">
            {label}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-display font-black text-[18px] text-ink uppercase tracking-[0.5px]">
          {name}
        </p>
        <p className="font-body text-[12px] text-muted mt-0.5">
          Due {due.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ₪{amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
