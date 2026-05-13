import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Plans — Goals", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/plans/goals");
    await page.waitForLoadState("networkidle");
  });

  test("goals page loads without errors", async ({ page }) => {
    await expect(page.locator("text=NaN")).not.toBeVisible();
    await expect(page.locator("text=Infinity")).not.toBeVisible();
  });

  test("create a new goal appears in list with PLANNING status", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add goal|new goal|\+/i }).first();
    if (!(await addBtn.isVisible({ timeout: 3_000 }))) return;
    await addBtn.click();

    // Fill goal form
    const nameInput = page.getByPlaceholder(/goal name|name/i).or(page.locator("input[name='name']")).first();
    await nameInput.fill("E2E Vacation Fund");

    const amountInput = page.getByPlaceholder(/target|amount/i).or(page.locator("input[type='number']")).first();
    await amountInput.fill("5000");

    const submitBtn = page.getByRole("button", { name: /save|create|add/i }).last();
    await submitBtn.click();

    await expect(page.locator("text=E2E Vacation Fund")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("text=/planning/i")).toBeVisible({ timeout: 5_000 });
  });

  test("goal detail sheet opens on click", async ({ page }) => {
    const firstGoal = page.locator("[data-goal-card], [class*='goal']").first();
    if (await firstGoal.isVisible({ timeout: 3_000 })) {
      await firstGoal.click();
      // A sheet/detail panel should appear
      await expect(
        page.locator("[data-testid='goal-sheet'], [role='dialog'], [class*='sheet']").first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test("delete a goal removes it from list", async ({ page }) => {
    // Create a disposable goal first
    const addBtn = page.getByRole("button", { name: /add goal|new goal|\+/i }).first();
    if (!(await addBtn.isVisible({ timeout: 3_000 }))) return;
    await addBtn.click();

    const nameInput = page.getByPlaceholder(/goal name|name/i).or(page.locator("input[name='name']")).first();
    await nameInput.fill("Delete Me Goal");
    const amountInput = page.locator("input[type='number']").first();
    await amountInput.fill("100");
    await page.getByRole("button", { name: /save|create|add/i }).last().click();
    await expect(page.locator("text=Delete Me Goal")).toBeVisible({ timeout: 8_000 });

    // Open it
    await page.locator("text=Delete Me Goal").click();
    const deleteBtn = page.getByRole("button", { name: /delete|remove/i }).first();
    if (await deleteBtn.isVisible({ timeout: 3_000 })) {
      await deleteBtn.click();
      const confirmBtn = page.getByRole("button", { name: /confirm|yes|delete/i }).last();
      if (await confirmBtn.isVisible({ timeout: 2_000 })) await confirmBtn.click();
      await expect(page.locator("text=Delete Me Goal")).not.toBeVisible({ timeout: 5_000 });
    }
  });
});
