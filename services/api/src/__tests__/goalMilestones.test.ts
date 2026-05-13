import { describe, it, expect } from "vitest";
import { buildMilestones } from "../lib/goalMilestones";

function utc(year: number, month: number, day = 1): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

describe("buildMilestones", () => {
  it("generates one milestone when start === end", () => {
    const result = buildMilestones("g1", utc(2025, 5), utc(2025, 5), 1200);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ goalId: "g1", year: 2025, month: 5, amount: 1200 });
  });

  it("generates correct number of months between two dates", () => {
    const result = buildMilestones("g1", utc(2025, 1), utc(2025, 6), 6000);
    expect(result).toHaveLength(6);
  });

  it("splits amount evenly across months", () => {
    const result = buildMilestones("g1", utc(2025, 1), utc(2025, 4), 1200);
    expect(result.every((m) => m.amount === 300)).toBe(true);
  });

  it("assigns correct year/month values", () => {
    const result = buildMilestones("g1", utc(2025, 11), utc(2026, 2), 400);
    expect(result.map((m) => [m.year, m.month])).toEqual([
      [2025, 11],
      [2025, 12],
      [2026, 1],
      [2026, 2],
    ]);
  });

  it("returns empty array when start > end", () => {
    const result = buildMilestones("g1", utc(2025, 6), utc(2025, 1), 1000);
    expect(result).toHaveLength(0);
  });

  it("handles zero target amount — all milestones get 0", () => {
    const result = buildMilestones("g1", utc(2025, 1), utc(2025, 3), 0);
    expect(result.every((m) => m.amount === 0)).toBe(true);
  });

  it("propagates goalId to all milestones", () => {
    const result = buildMilestones("goal-abc", utc(2025, 1), utc(2025, 3), 900);
    expect(result.every((m) => m.goalId === "goal-abc")).toBe(true);
  });

  it("each milestone amount sums to targetAmount", () => {
    const target = 1000;
    const result = buildMilestones("g1", utc(2025, 1), utc(2025, 4), target);
    const total = result.reduce((s, m) => s + m.amount, 0);
    expect(total).toBeCloseTo(target);
  });

  it("wraps year boundary correctly (Nov 2025 to Feb 2026)", () => {
    const result = buildMilestones("g1", utc(2025, 11), utc(2026, 2), 0);
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ year: 2025, month: 11 });
    expect(result[3]).toMatchObject({ year: 2026, month: 2 });
  });
});
