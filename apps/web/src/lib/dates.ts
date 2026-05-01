/** Local calendar date as YYYY-MM-DD — do not use toISOString().split("T")[0]. */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Interpret YYYY-MM-DD as that calendar date in UTC midnight.
 * Matches API month filtering when the API uses UTC month boundaries.
 */
export function dateKeyToUtcDatetimeISO(dateKey: string): string {
  const parts = dateKey.split("-").map(Number);
  const y = parts[0]!;
  const mo = parts[1]!;
  const d = parts[2]!;
  return new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0)).toISOString();
}
