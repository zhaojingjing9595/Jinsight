import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// The Add Transaction form lives inside AddModal, triggered by the BottomNav "+" button.
// There is no standalone /add page for transactions — goto("/add") would 404.

test.describe("Add Transaction", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Open the AddModal from the BottomNav + button (aria-label="Add — transaction or bill")
    await page.getByRole("button", { name: "Add — transaction or bill" }).click();
    // Modal should be visible
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
    // Ensure we're on the Transaction tab (default)
    await page.getByRole("button", { name: "Transaction" }).click();
  });

  test("modal opens and shows the transaction form", async ({ page }) => {
    // Amount display should show ₪0
    await expect(page.locator("text=/₪/").first()).toBeVisible();
    // NumPad should be visible — check for digit buttons
    await expect(page.getByRole("button", { name: "1" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "5" }).first()).toBeVisible();
  });

  test("numpad updates the displayed amount", async ({ page }) => {
    await page.getByRole("button", { name: "1" }).first().click();
    await page.getByRole("button", { name: "5" }).first().click();
    await page.getByRole("button", { name: "0" }).first().click();
    // Amount display should now show 150
    await expect(page.locator("text=/150/").first()).toBeVisible({ timeout: 3_000 });
  });

  test("type toggle switches between Expense and Income", async ({ page }) => {
    // Default is Expense — save button should say "Save Expense"
    await expect(page.getByRole("button", { name: /Save Expense/i })).toBeVisible();

    // Switch to Income
    await page.getByRole("button", { name: "Income" }).click();
    await expect(page.getByRole("button", { name: /Save Income/i })).toBeVisible();

    // Switch back to Expense
    await page.getByRole("button", { name: "Expense" }).click();
    await expect(page.getByRole("button", { name: /Save Expense/i })).toBeVisible();
  });

  test("save button is disabled when amount is zero", async ({ page }) => {
    // Amount starts at 0 — save button should be disabled
    const saveBtn = page.getByRole("button", { name: /Save Expense/i });
    await expect(saveBtn).toBeDisabled();
  });

  test("save button is disabled without a category or name", async ({ page }) => {
    // Enter an amount but no category/name
    await page.getByRole("button", { name: "5" }).first().click();
    await page.getByRole("button", { name: "0" }).first().click();
    const saveBtn = page.getByRole("button", { name: /Save Expense/i });
    await expect(saveBtn).toBeDisabled();
  });

  test("save button enables after entering amount and category", async ({ page }) => {
    // Enter amount
    await page.getByRole("button", { name: "5" }).first().click();
    await page.getByRole("button", { name: "0" }).first().click();

    // Pick first category (has data-cat-slug attribute)
    await page.locator("[data-cat-slug]").first().click();

    // Save button should now be enabled
    const saveBtn = page.getByRole("button", { name: /Save Expense/i });
    await expect(saveBtn).toBeEnabled({ timeout: 3_000 });
  });

  test("submitting an expense closes the modal", async ({ page }) => {
    // Enter amount
    await page.getByRole("button", { name: "5" }).first().click();
    await page.getByRole("button", { name: "0" }).first().click();

    // Pick a category
    await page.locator("[data-cat-slug]").first().click();

    // Save
    await page.getByRole("button", { name: /Save Expense/i }).click();

    // Button briefly shows "✓ Saved!" then modal closes
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });
  });

  test("closing modal with × button does not create a transaction", async ({ page }) => {
    // Enter amount and category
    await page.getByRole("button", { name: "5" }).first().click();
    await page.locator("[data-cat-slug]").first().click();

    // Close without saving
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3_000 });

    // Reopen modal — amount should be reset to 0
    await page.getByRole("button", { name: "Add — transaction or bill" }).click();
    await page.getByRole("button", { name: "Transaction" }).click();
    await expect(page.locator("text=/₪0/").first()).toBeVisible({ timeout: 3_000 });
  });
});
