type StatCardVariant = "primary" | "income" | "goal" | "reward" | "alert" | "default";

type StatCardProps = {
  label: string;
  value: string;
  subLabel?: string;
  variant?: StatCardVariant;
};

const VARIANT_STYLES: Record<StatCardVariant, { bg: string; label: string; value: string }> = {
  primary: { bg: "bg-primary",  label: "text-primary-muted", value: "text-white"  },
  income:  { bg: "bg-income",   label: "text-income-dark",   value: "text-ink"    },
  goal:    { bg: "bg-goal",     label: "text-[#4a6000]",     value: "text-ink"    },
  reward:  { bg: "bg-reward",   label: "text-reward-dark",   value: "text-ink"    },
  alert:   { bg: "bg-alert",    label: "text-white",         value: "text-white"  },
  default: { bg: "bg-base",     label: "text-muted",         value: "text-ink"    },
};

export function StatCard({ label, value, subLabel, variant = "default" }: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`border-2 border-ink rounded-stat p-3 shadow-neo-sm ${styles.bg}`}>
      <p className={`font-body text-[9px] font-[700] uppercase tracking-[1.5px] mb-1 ${styles.label}`}>
        {label}
      </p>
      <p className={`font-display text-[28px] font-[900] leading-[1.1] ${styles.value}`}>
        {value}
      </p>
      {subLabel && (
        <p className={`font-body text-[10px] font-[500] mt-0.5 ${styles.label}`}>
          {subLabel}
        </p>
      )}
    </div>
  );
}
