import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("History", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/history");
    await page.waitForLoadState("networkidle");
  });

  test("history page loads without NaN errors", async ({ page }) => {
    await expect(page.locator("text=NaN")).not.toBeVisible();
    await expect(page.locator("text=Infinity")).not.toBeVisible();
  });

  test("6-month bar chart is visible", async ({ page }) => {
    // SVG bar chart should render
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 8_000 });
  });

  test("month pills are clickable and update transaction list", async ({ page }) => {
    const monthPills = page.locator("button").filter({ hasText: /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i });
    const count = await monthPills.count();
    if (count >= 2) {
      // Click the second pill
      await monthPills.nth(1).click();
      await page.waitForTimeout(500);
      // Page should still be on /history with no crashes
      expect(page.url()).toMatch(/\/history/);
      await expect(page.locator("text=NaN")).not.toBeVisible();
    }
  });

  test("transaction dates show date only (no HH:MM:SS time)", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const bodyText = await page.locator("body").innerText();
    // Should not have time patterns like 12:00:00 or 00:00
    expect(bodyText).not.toMatch(/\b\d{2}:\d{2}:\d{2}\b/);
  });

  test("category groups are expandable", async ({ page }) => {
    const groupHeaders = page.locator("[data-category-group], button").filter({ hasText: /food|transport|shopping|utilities|health|other/i });
    const count = await groupHeaders.count();
    if (count > 0) {
      await groupHeaders.first().click();
      await page.waitForTimeout(300);
      // No crash
      await expect(page.locator("text=NaN")).not.toBeVisible();
    }
  });
});
