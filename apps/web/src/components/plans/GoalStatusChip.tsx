"use client";

type HealthStatus = "on_track" | "behind" | "at_risk";

const HEALTH_CONFIG: Record<HealthStatus, { label: string; bg: string; text: string }> = {
  on_track: { label: "On Track", bg: "#cce972", text: "#111008" },
  behind:   { label: "Behind",   bg: "#feb704", text: "#111008" },
  at_risk:  { label: "At Risk",  bg: "#fc524f", text: "#ffffff" },
};

type GoalStatusChipProps = {
  health: HealthStatus;
};

export function GoalStatusChip({ health }: GoalStatusChipProps) {
  const config = HEALTH_CONFIG[health];

  return (
    <span
      className="inline-flex items-center px-2.5 py-[3px] border-[1.5px] border-ink rounded-[20px] font-body text-[10px] font-bold tracking-[0.5px]"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
