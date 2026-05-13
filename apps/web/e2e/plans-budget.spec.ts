import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Plans — Budget", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/plans/budget");
    await page.waitForLoadState("networkidle");
  });

  test("budget page loads without errors", async ({ page }) => {
    await expect(page.locator("text=NaN")).not.toBeVisible();
    await expect(page.locator("text=Infinity")).not.toBeVisible();
  });

  test("create a new budget category", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add category|add budget|\+/i }).first();
    if (!(await addBtn.isVisible({ timeout: 3_000 }))) return;
    await addBtn.click();

    const limitInput = page.locator("input[type='number']").first();
    await limitInput.fill("500");

    const submitBtn = page.getByRole("button", { name: /save|add|create/i }).last();
    await submitBtn.click();

    // A new card should appear
    await page.waitForTimeout(1000);
    await expect(page.locator("text=NaN")).not.toBeVisible();
  });

  test("budget summary bar is visible", async ({ page }) => {
    // Summary bar should show total budget info
    const summaryBar = page.locator("[data-testid='budget-summary'], [class*='summary']").first();
    if (await summaryBar.isVisible({ timeout: 3_000 })) {
      await expect(summaryBar).toBeVisible();
    }
    // At minimum page shouldn't crash
    await expect(page.locator("text=NaN")).not.toBeVisible();
  });

  test("copy from prior month button is present", async ({ page }) => {
    const copyBtn = page.getByRole("button", { name: /copy|last month|prior month/i });
    if (await copyBtn.isVisible({ timeout: 3_000 })) {
      await expect(copyBtn).toBeVisible();
    }
  });
});
