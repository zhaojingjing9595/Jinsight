# Jinsight — Testing Guide

## Overview

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest (`services/api`) | Pure business logic — date rolling, calculations |
| E2E | Playwright (`apps/web`) | Critical user flows in a real browser |

Full manual testing checklist covering all 9 feature areas (Auth, Dashboard, Add Transaction, Bills, History, Budget, Goals, Profile, Edge Cases).
---

## Running Tests

```bash
# Unit tests (API)
cd services/api && pnpm test          # run once
cd services/api && pnpm test:watch    # watch mode

# E2E tests (Web)
cd apps/web && pnpm test:e2e          # headless
cd apps/web && pnpm test:e2e:ui       # Playwright UI mode

# All tests from monorepo root
pnpm test
```

> **Prerequisites for E2E:** dev server must be running (`pnpm dev`) and a `.env` with valid Supabase credentials must be present.

---

## Test Plan

### 1. Auth

| # | Test | Expected |
|---|------|----------|
| 1.1 | Sign up with a new email | Account created, redirected to dashboard |
| 1.2 | Sign up with an already-registered email | Error message shown |
| 1.3 | Log in with correct credentials | Redirected to dashboard |
| 1.4 | Log in with wrong password | Error message shown |
| 1.5 | Visit `/dashboard` while logged out | Redirected to login |
| 1.6 | Sign out from profile page | Redirected to splash `/` |

### 2. Dashboard

| # | Test | Expected |
|---|------|----------|
| 2.1 | Balance hero shows correct total | Sum of opening balance + all transactions |
| 2.2 | Edit opening balance via pencil icon | Modal opens, saves new value, balance updates |
| 2.3 | Income vs. spending bar reflects current month | Both segments visible and proportional |
| 2.4 | Spending pie chart renders all categories | No NaN/Infinity errors, correct %s |
| 2.5 | Pie chart with only 1 spending category | Shows 100% slice (no rendering bug) |
| 2.6 | Pie chart with no spending | Handles empty state gracefully |
| 2.7 | Bills tab shows upcoming bills | Correct countdown days and amounts |
| 2.8 | Transactions tab shows recent transactions | Date only (no time), correct amounts |
| 2.9 | "Mark as paid" from bills tab | Bill moves to paid state, transaction logged |

### 3. Add Transaction (Modal)

| # | Test | Expected |
|---|------|----------|
| 3.1 | Open modal from `+` button | Modal slides up, stays on current page |
| 3.2 | Enter amount with numpad | Amount updates correctly |
| 3.3 | Toggle Income / Expense type | Type updates, category picker refreshes |
| 3.4 | Select a category | Category highlighted, saved with transaction |
| 3.5 | Add a custom category | New category persisted and selectable |
| 3.6 | Pick a date from date strip | Date saved with transaction |
| 3.7 | Submit expense transaction | Transaction appears in list, balance decreases |
| 3.8 | Submit income transaction | Transaction appears in list, balance increases |
| 3.9 | Submit with no amount | Blocked / validation error |
| 3.10 | Close modal without submitting | No transaction created |

### 4. Bills (`/bills`)

| # | Test | Expected |
|---|------|----------|
| 4.1 | View all bills | List renders with countdown timers |
| 4.2 | Filter by status (paid / unpaid / all) | List filters correctly |
| 4.3 | Add a monthly bill | Appears with correct next-due date |
| 4.4 | Add a weekly bill | Recurrence badge shows "Weekly" |
| 4.5 | Add an annual bill | Correct next-due date |
| 4.6 | Add a bimonthly bill | Correct badge and due date |
| 4.7 | Add a quarterly bill | Correct badge and due date |
| 4.8 | Mark a bill as paid | Moves to paid, transaction created |
| 4.9 | Mark bill as paid — no duplicate transaction | Marking paid twice doesn't create 2 transactions |
| 4.10 | Delete a bill | Removed from list; associated transactions reverted |
| 4.11 | Edit a bill | Changes saved and reflected |

### 5. History (`/history`)

| # | Test | Expected |
|---|------|----------|
| 5.1 | Monthly bar chart renders 6 months | No NaN errors |
| 5.2 | Click a month pill | Transaction list updates to that month |
| 5.3 | Transactions grouped by category | Groups collapsible |
| 5.4 | Transaction dates show date only (no time) | No timestamp shown |
| 5.5 | Month with no transactions | Empty state shown |

### 6. Plans — Budget (`/plans/budget`)

| # | Test | Expected |
|---|------|----------|
| 6.1 | View current month's budget | Category cards with spending bars |
| 6.2 | Create a new budget category | Appears with ₪0 spent |
| 6.3 | Edit a budget category limit | New limit reflected in bar |
| 6.4 | Copy budgets from prior month | Categories + limits copied |
| 6.5 | Over-budget category | Bar turns red / alert state |

### 7. Plans — Goals (`/plans/goals`)

| # | Test | Expected |
|---|------|----------|
| 7.1 | Create a saving goal | Appears with PLANNING status |
| 7.2 | Add milestones to a goal | Milestone list in detail sheet |
| 7.3 | Mark a milestone achieved | Saved amount updates |
| 7.4 | Unmark an achieved milestone | Saved amount reverts |
| 7.5 | Reset all unachieved milestones | All unchecked, achieved ones untouched |
| 7.6 | Log a debt payoff transaction | Correct date/amount, no off-by-one |
| 7.7 | Goal status progression | PLANNING → SAVING → ACTIVE → COMPLETE |
| 7.8 | Delete a goal | Removed from list |

### 8. Profile

| # | Test | Expected |
|---|------|----------|
| 8.1 | Profile page loads | User info displayed |
| 8.2 | Sign out | Session cleared, redirected to `/` |

### 9. Edge Cases

| # | Test | Expected |
|---|------|----------|
| 9.1 | Add transaction while on `/history` | Modal appears, history updates after submit |
| 9.2 | No account / first-time user | Dashboard shows ₪0, no crashes |
| 9.3 | Very large amounts (₪999,999) | No overflow or display bug |
| 9.4 | All bills paid for the month | Bills tab shows empty/completed state |
| 9.5 | Transaction confirmation popup — cancel | No transaction created |
| 9.6 | Transaction confirmation popup — confirm | Transaction created |

---

## Unit Test Coverage (services/api)

### Bill date rolling (`src/routers/bills.ts`)
- `rollForward` — all 5 recurrence types (WEEKLY, MONTHLY, BIMONTHLY, QUARTERLY, ANNUAL)
- `rollBackward` — all 5 recurrence types
- Month-end edge cases (e.g. Jan 31 → Feb 28)

---

## Known Issues (Phase 3 backlog)

- Bar chart NaN/Infinity when income = 0
- Debt payoff transaction date off-by-one month (fixed in recent commit)
- Transaction timestamps — should show date only (fixed in recent commit)

## Unit Tests — Vitest (services/api)
29 tests across 2 files:

- services/api/src/tests/billDates.test.ts — Tests all 5 recurrence types for rollForward and rollBackward, including DST-safe comparisons, mutation safety, and round-trip identity checks.
- services/api/src/tests/goalMilestones.test.ts — Tests buildMilestones for month count, even splits, year wrapping, edge cases (start > end, zero target).

The pure logic was extracted into services/api/src/lib/billDates.ts and services/api/src/lib/goalMilestones.ts so it's testable without the DB or tRPC.

## E2E Tests — Playwright (apps/web)
6 spec files in apps/web/e2e/:

- auth.spec.ts — redirect guards, login errors, successful login, sign out
- dashboard.spec.ts — balance hero, NaN guards, chart rendering, modal
- add-transaction.spec.ts — modal, numpad, type toggle, zero-amount guard, full submit
- bills.spec.ts — add, filter, mark paid, delete
- history.spec.ts — chart, month pills, date format, expandable groups
- plans-goals.spec.ts — create, detail sheet, delete
- plans-budget.spec.ts — load, add category, summary bar, copy button

## How to run

### Unit tests (instant, no server needed)
Results print directly to the terminal. Run:

    export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
    cd services/api && pnpm test

For verbose output (each test name):
    pnpm test -- --reporter=verbose

### E2E (needs dev server running + E2E_TEST_EMAIL/E2E_TEST_PASSWORD env vars)
Playwright generates an HTML report automatically. Run:
    cd apps/web && pnpm test:e2e

Then open the report:
    npx playwright show-report

This opens a browser at http://localhost:9323 with:

For a live UI mode where you can watch each test run step-by-step:
    cd apps/web && pnpm test:e2e:ui

    Quick reference:

Mode	Command	Where to see results
Unit tests	cd services/api && pnpm test	Terminal
Unit tests verbose	pnpm test -- --reporter=verbose	Terminal
E2E headless	cd apps/web && pnpm test:e2e	Terminal + npx playwright show-report
E2E interactive	cd apps/web && pnpm test:e2e:ui	Browser UI