import { describe, it, expect } from "vitest";
import { rollForward, rollBackward } from "../lib/billDates";

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/** Compare year/month/day in local time — avoids DST hour-offset failures since rollForward/rollBackward use local setMonth. */
function ymd(d: Date): [number, number, number] {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

describe("rollForward", () => {
  it("WEEKLY adds 7 days", () => {
    expect(ymd(rollForward(utc(2025, 5, 1), "WEEKLY"))).toEqual([2025, 5, 8]);
  });

  it("MONTHLY adds 1 month", () => {
    expect(ymd(rollForward(utc(2025, 1, 15), "MONTHLY"))).toEqual([2025, 2, 15]);
  });

  it("MONTHLY wraps year correctly", () => {
    expect(ymd(rollForward(utc(2025, 12, 10), "MONTHLY"))).toEqual([2026, 1, 10]);
  });

  it("BIMONTHLY adds 2 months", () => {
    expect(ymd(rollForward(utc(2025, 3, 1), "BIMONTHLY"))).toEqual([2025, 5, 1]);
  });

  it("QUARTERLY adds 3 months", () => {
    expect(ymd(rollForward(utc(2025, 1, 1), "QUARTERLY"))).toEqual([2025, 4, 1]);
  });

  it("QUARTERLY wraps year", () => {
    expect(ymd(rollForward(utc(2025, 11, 1), "QUARTERLY"))).toEqual([2026, 2, 1]);
  });

  it("ANNUAL adds 1 year", () => {
    expect(ymd(rollForward(utc(2025, 6, 15), "ANNUAL"))).toEqual([2026, 6, 15]);
  });

  it("does not mutate the input date", () => {
    const original = utc(2025, 5, 1);
    const originalTime = original.getTime();
    rollForward(original, "MONTHLY");
    expect(original.getTime()).toBe(originalTime);
  });

  it("MONTHLY on Jan 31 overflows to March (JS date overflow behaviour)", () => {
    const result = rollForward(utc(2025, 1, 31), "MONTHLY");
    // Jan31 + 1 month → Mar 3 (non-leap year) — JS Date overflow, document this known behaviour
    expect(result.getMonth()).toBe(2); // March (0-indexed)
  });
});

describe("rollBackward", () => {
  it("WEEKLY subtracts 7 days", () => {
    expect(ymd(rollBackward(utc(2025, 5, 8), "WEEKLY"))).toEqual([2025, 5, 1]);
  });

  it("MONTHLY subtracts 1 month", () => {
    expect(ymd(rollBackward(utc(2025, 3, 15), "MONTHLY"))).toEqual([2025, 2, 15]);
  });

  it("MONTHLY wraps year correctly", () => {
    expect(ymd(rollBackward(utc(2026, 1, 10), "MONTHLY"))).toEqual([2025, 12, 10]);
  });

  it("BIMONTHLY subtracts 2 months", () => {
    expect(ymd(rollBackward(utc(2025, 5, 1), "BIMONTHLY"))).toEqual([2025, 3, 1]);
  });

  it("QUARTERLY subtracts 3 months", () => {
    expect(ymd(rollBackward(utc(2025, 4, 1), "QUARTERLY"))).toEqual([2025, 1, 1]);
  });

  it("ANNUAL subtracts 1 year", () => {
    expect(ymd(rollBackward(utc(2026, 6, 15), "ANNUAL"))).toEqual([2025, 6, 15]);
  });

  it("does not mutate the input date", () => {
    const original = utc(2025, 5, 8);
    const originalTime = original.getTime();
    rollBackward(original, "WEEKLY");
    expect(original.getTime()).toBe(originalTime);
  });

  it("rollForward then rollBackward is identity for MONTHLY", () => {
    const date = utc(2025, 5, 1);
    expect(ymd(rollBackward(rollForward(date, "MONTHLY"), "MONTHLY"))).toEqual(ymd(date));
  });

  it("rollForward then rollBackward is identity for WEEKLY", () => {
    const date = utc(2025, 5, 1);
    expect(ymd(rollBackward(rollForward(date, "WEEKLY"), "WEEKLY"))).toEqual(ymd(date));
  });

  it("rollForward then rollBackward is identity for QUARTERLY", () => {
    const date = utc(2025, 1, 1);
    expect(ymd(rollBackward(rollForward(date, "QUARTERLY"), "QUARTERLY"))).toEqual(ymd(date));
  });

  it("rollForward then rollBackward is identity for ANNUAL", () => {
    const date = utc(2025, 6, 15);
    expect(ymd(rollBackward(rollForward(date, "ANNUAL"), "ANNUAL"))).toEqual(ymd(date));
  });
});
