export function buildMilestones(
  goalId: string,
  startDate: Date,
  endDate: Date,
  targetAmount: number,
): { goalId: string; year: number; month: number; amount: number }[] {
  const milestones: { goalId: string; year: number; month: number; amount: number }[] = [];
  const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));

  while (cursor <= end) {
    milestones.push({ goalId, year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() + 1, amount: 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  if (milestones.length > 0) {
    const perMonth = targetAmount / milestones.length;
    for (const m of milestones) m.amount = perMonth;
  }

  return milestones;
}
