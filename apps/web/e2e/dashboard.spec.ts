import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("renders balance hero", async ({ page }) => {
    // Balance section should show a currency value, not NaN
    const hero = page.locator("text=/[₪$€]/").first();
    await expect(hero).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=NaN")).not.toBeVisible();
    await expect(page.locator("text=Infinity")).not.toBeVisible();
  });

  test("income vs spending bar renders without NaN", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=NaN")).not.toBeVisible();
    await expect(page.locator("text=Infinity")).not.toBeVisible();
  });

  test("spending pie chart renders without errors", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    // SVG pie chart should be present
    const svg = page.locator("svg").first();
    await expect(svg).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("text=NaN")).not.toBeVisible();
  });

  test("bills tab shows bill list", async ({ page }) => {
    await page.getByRole("tab", { name: /bills/i }).click();
    // Tab content should be visible (even if empty state)
    await expect(page.locator("[data-tab='bills'], [role='tabpanel']").first()).toBeVisible({ timeout: 8_000 });
  });

  test("transactions tab shows recent transactions", async ({ page }) => {
    await page.getByRole("tab", { name: /transactions/i }).click();
    await page.waitForLoadState("networkidle");
    // Dates should not include a time component (no HH:MM pattern next to dates)
    const timePattern = /\d{2}:\d{2}:\d{2}/;
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(timePattern);
  });

  test("opening balance edit modal opens and closes", async ({ page }) => {
    // Look for the pencil/edit button near the balance
    const editBtn = page.getByRole("button", { name: /edit.*balance|balance.*edit/i })
      .or(page.locator("button[aria-label*='edit'], button[aria-label*='balance']"))
      .first();

    // If no labeled button, try the pencil icon button in the hero area
    const heroSection = page.locator("section, div").filter({ hasText: /balance/i }).first();
    const pencilBtn = heroSection.locator("button").first();

    // Try labeled button first, fall back to pencil in hero
    const btn = (await editBtn.count()) > 0 ? editBtn : pencilBtn;
    await btn.click();

    // A modal/dialog should appear
    await expect(page.locator("dialog, [role='dialog'], [data-modal]").or(
      page.locator("input[type='number']")
    )).toBeVisible({ timeout: 5_000 });

    // Close by pressing Escape
    await page.keyboard.press("Escape");
  });
});
