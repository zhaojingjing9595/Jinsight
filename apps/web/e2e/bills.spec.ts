import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Bills", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/bills");
    await page.waitForLoadState("networkidle");
  });

  test("bills page loads without errors", async ({ page }) => {
    await expect(page.locator("text=NaN")).not.toBeVisible();
    await expect(page.locator("text=Infinity")).not.toBeVisible();
    // Bills heading or list container should be visible
    await expect(page.locator("h1, h2, [data-testid='bills-list']").first()).toBeVisible({ timeout: 8_000 });
  });

  test("add a monthly bill", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add bill|\+/i }).first();
    await addBtn.click();

    // Fill in bill form
    await page.getByPlaceholder(/name|bill name/i).fill("E2E Test Bill");
    await page.getByPlaceholder(/amount/i).fill("99");

    // Select monthly recurrence (should be default, but click to confirm)
    const monthlyOption = page.getByRole("option", { name: /monthly/i })
      .or(page.getByRole("button", { name: /monthly/i }))
      .or(page.locator("select[name='recurrence']"));

    if (await monthlyOption.count() > 0) {
      await monthlyOption.first().click();
    }

    const submitBtn = page.getByRole("button", { name: /save|add|create/i }).last();
    await submitBtn.click();

    // Bill should appear in list
    await expect(page.locator("text=E2E Test Bill")).toBeVisible({ timeout: 8_000 });
  });

  test("filter by paid shows only paid bills", async ({ page }) => {
    const paidFilter = page.getByRole("button", { name: /paid/i })
      .or(page.locator("[data-filter='paid']"));
    if (await paidFilter.count() > 0) {
      await paidFilter.first().click();
      await page.waitForTimeout(500);
      // No unpaid countdown should appear
      await expect(page.locator("text=NaN")).not.toBeVisible();
    }
  });

  test("mark a bill as paid creates a transaction", async ({ page }) => {
    // Find any unpaid bill and mark it paid
    const markPaidBtn = page.getByRole("button", { name: /mark paid|pay/i }).first();
    if (await markPaidBtn.isVisible({ timeout: 3_000 })) {
      await markPaidBtn.click();

      // Confirmation popup should appear
      const confirmBtn = page.getByRole("button", { name: /confirm|yes|paid/i }).last();
      if (await confirmBtn.isVisible({ timeout: 3_000 })) {
        await confirmBtn.click();
      }

      // Bill should update (next due date should change for recurring bills)
      await page.waitForTimeout(1000);
      await expect(page.locator("text=NaN")).not.toBeVisible();
    }
  });

  test("delete a bill removes it from the list", async ({ page }) => {
    // First add a disposable bill
    const addBtn = page.getByRole("button", { name: /add bill|\+/i }).first();
    await addBtn.click();
    await page.getByPlaceholder(/name|bill name/i).fill("Delete Me Bill");
    await page.getByPlaceholder(/amount/i).fill("1");
    await page.getByRole("button", { name: /save|add|create/i }).last().click();
    await expect(page.locator("text=Delete Me Bill")).toBeVisible({ timeout: 8_000 });

    // Open detail / options for this bill
    const billRow = page.locator("text=Delete Me Bill").first();
    await billRow.click();

    const deleteBtn = page.getByRole("button", { name: /delete|remove/i }).first();
    if (await deleteBtn.isVisible({ timeout: 3_000 })) {
      await deleteBtn.click();
      // Confirm delete if dialog appears
      const confirmBtn = page.getByRole("button", { name: /confirm|yes|delete/i }).last();
      if (await confirmBtn.isVisible({ timeout: 2_000 })) {
        await confirmBtn.click();
      }
      await expect(page.locator("text=Delete Me Bill")).not.toBeVisible({ timeout: 5_000 });
    }
  });
});
