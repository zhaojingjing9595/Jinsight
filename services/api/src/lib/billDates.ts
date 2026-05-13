export type RecurrenceType = "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "ANNUAL" | "WEEKLY";

export function rollForward(date: Date, recurrence: RecurrenceType): Date {
  const d = new Date(date);
  switch (recurrence) {
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      return d;
    case "ANNUAL":
      d.setFullYear(d.getFullYear() + 1);
      return d;
    case "BIMONTHLY":
      d.setMonth(d.getMonth() + 2);
      return d;
    case "QUARTERLY":
      d.setMonth(d.getMonth() + 3);
      return d;
    case "MONTHLY":
    default:
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}

export function rollBackward(date: Date, recurrence: RecurrenceType): Date {
  const d = new Date(date);
  switch (recurrence) {
    case "WEEKLY":
      d.setDate(d.getDate() - 7);
      return d;
    case "ANNUAL":
      d.setFullYear(d.getFullYear() - 1);
      return d;
    case "BIMONTHLY":
      d.setMonth(d.getMonth() - 2);
      return d;
    case "QUARTERLY":
      d.setMonth(d.getMonth() - 3);
      return d;
    case "MONTHLY":
    default:
      d.setMonth(d.getMonth() - 1);
      return d;
  }
}
