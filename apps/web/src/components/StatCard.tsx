type StatCardVariant = "primary" | "income" | "goal" | "reward" | "alert" | "default";

type StatCardProps = {
  label: string;
  value: string;
  subLabel?: string;
  variant?: StatCardVariant;
};

const VARIANT_STYLES: Record<StatCardVariant, { bg: string; label: string; value: string }> = {
  primary: { bg: "#a57dee", label: "#e0ccff", value: "#ffffff" },
  income: { bg: "#2ad2a3", label: "#086b52", value: "#111008" },
  goal: { bg: "#cce972", label: "#4a6000", value: "#111008" },
  reward: { bg: "#feb704", label: "#6b4800", value: "#111008" },
  alert: { bg: "#fc524f", label: "#fff", value: "#ffffff" },
  default: { bg: "#fcfaeb", label: "#888", value: "#111008" },
};

export function StatCard({ label, value, subLabel, variant = "default" }: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className="border-2 border-[#111008] rounded-[12px] p-3 shadow-[3px_3px_0_#111008]"
      style={{ backgroundColor: styles.bg }}
    >
      <p
        className="text-[9px] font-[700] uppercase mb-1"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "1.5px",
          color: styles.label,
        }}
      >
        {label}
      </p>
      <p
        className="text-[28px] font-[900] leading-[1.1]"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          color: styles.value,
        }}
      >
        {value}
      </p>
      {subLabel && (
        <p
          className="text-[10px] font-[500] mt-0.5"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: styles.label }}
        >
          {subLabel}
        </p>
      )}
    </div>
  );
}
