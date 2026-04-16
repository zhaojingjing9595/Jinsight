# Jinsight — Plans Page Specification

> **Version:** 1.0  
> **Purpose:** Implementation reference for the Plans page and all sub-features  
> **Scope:** Budget Tab, Goals Tab, Wealth Tab + Active Goal lifecycle

---

## Table of Contents

1. [Plans Page Overview](#1-plans-page-overview)
2. [Budget Tab](#2-budget-tab)
3. [Goals Tab](#3-goals-tab)
4. [Wealth Tab](#4-wealth-tab)
5. [Bills & Subscriptions](#5-bills--subscriptions--home-page-surface)
6. [Data Models](#6-data-models--key-entities)
7. [State, Navigation & Edge Cases](#7-state-navigation--edge-cases)
8. [Alerts & Notifications](#8-alerts--notifications-plans-related)
9. [Implementation Notes](#9-implementation-notes)

---

## 1. Plans Page Overview

The Plans page is where users manage their **financial intentions** — budgets, saving goals, investments, and long-term wealth tracking. It is separated from:
- **Home** — shows actuals (current month spending/income/transactions)
- **Reports** — shows historical analysis

### 1.1 Bottom Navigation Position

| Property | Value |
|---|---|
| Nav Label | Plans |
| Nav Icon | Calendar / target icon |
| Nav Position | Second tab (Home → **Plans** → Reports → Profile) |
| Route | `/plans` |

### 1.2 Page Structure

The Plans page uses a **three-tab layout** at the top of the screen:

| Budget | Goals | Wealth |
|---|---|---|
| Monthly spending limits | Saving goals & trip plans | Investments & net worth |

- Each tab is a full scrollable view
- The selected tab **persists** on navigation back (no reset to default)
- Deep links: `/plans/budget`, `/plans/goals`, `/plans/wealth`

> 💡 **Bills are NOT a separate tab.** They surface on the Home page as a "Coming Up" card and deep-link to a dedicated Bills screen. This gives due dates the urgency treatment they deserve.

---

## 2. Budget Tab

Covers **recurring monthly spending limits only**. Answers the question: *"Am I staying within my limits this month?"*

### 2.1 Purpose

- Set per-category spending limits for the current (and future) months
- Track actual spending vs. limit in real time
- Visualize which categories are on track, approaching, or over budget

### 2.2 Default View — Current Month

On load, the Budget tab defaults to the current month. A month selector (chevron or swipe) allows navigation.

| State | Behavior |
|---|---|
| Month Selector | `< April 2025 >` with swipe gesture support |
| Default | Current month |
| Past months | Read-only — shows actuals vs. budget, no editing |
| Future months | Editable — plan ahead before the month starts |

### 2.3 Budget Card (per category)

Each category renders as a card showing:

- Category name + emoji icon
- Amount spent / budget limit (e.g., `$320 / $400`)
- Progress bar — color-coded by status
- Percentage used

**Progress bar color rules:**

| Spend % | Bar Color | Status Label |
|---|---|---|
| Under 75% | Mint green | On track |
| 75–99% | Amber / orange | Approaching limit |
| 100%+ | Red | Over budget |

### 2.4 Summary Bar (top of tab)

Above the category cards, a summary row shows:

- Total budgeted this month
- Total spent so far
- Remaining budget
- Quick ring chart or bar for overall utilization

### 2.5 Creating / Editing a Budget

- Tap `+` or "Set Budget" to add a new category budget
- **Fields:** Category (from list or custom), Monthly limit amount, Rollover toggle
- **Rollover toggle:** unspent balance from previous month carries forward
- **Edit:** tap any existing card → inline edit or sheet modal
- **Delete:** swipe left on card or long-press → delete option

### 2.6 Budget Types Supported

| Type | Description | Example |
|---|---|---|
| Standard | Fixed monthly limit per category | Food: $400/month |
| Rollover | Unused balance rolls into next month | Entertainment: unused $50 carries forward |
| Shared | Budget shared across linked accounts | Household groceries split with partner |

### 2.7 Out of Scope for Budget Tab

- Trip/event budgets → live in **Goals tab**
- Debt repayment plans → covered in **Goals tab**
- Investment contribution targets → covered in **Wealth tab**

---

## 3. Goals Tab

Where users plan for the future — saving toward a target, paying off debt, or planning a trip/event. Answers: *"What am I working toward, and am I on track?"*

### 3.1 Goal Types

| Goal Type | Description | Examples |
|---|---|---|
| Trip / Event | Save + spend plan for a bounded event | Tokyo trip, Wedding, Festival |
| Big Purchase | Save toward a single purchase | New laptop, Car down payment |
| Emergency Fund | Build a safety net (no end date) | 3–6 months of expenses |
| Debt Payoff | Eliminate a liability balance | Credit card, Student loan |
| Custom | Open-ended user-defined goal | Kid's college fund, Business startup |

### 3.2 Goal List View

Goals are displayed as cards, grouped by status:

- **Active** — currently saving or in-progress
- **Upcoming** — start date in the future
- **Completed** — archived, shown collapsed at the bottom

### 3.3 Goal Card (summary)

- Goal name + type icon + emoji (user-selected)
- Target amount and current saved amount
- Progress bar with percentage
- Target date and months remaining
- Monthly contribution required to stay on track
- Status chip: `On Track` / `Behind` / `At Risk`

### 3.4 Creating a Goal

Multi-step creation flow on tapping `+`:

| Step | Description |
|---|---|
| Step 1 | Select goal type (Trip/Event, Big Purchase, Emergency Fund, Debt Payoff, Custom) |
| Step 2 | Name the goal, pick emoji, set target amount |
| Step 3 | Set target date (or "No end date" for Emergency Fund) |
| Step 4 *(optional)* | Trip/Event only: build a spending breakdown by category |
| Step 5 *(optional)* | Link to a savings account or track virtually |

### 3.5 Trip / Event Goal — Spending Plan

The Trip/Event type unlocks an extra layer: a **spending breakdown** attached to the goal, converting a saving goal into a full trip budget.

- User adds trip-specific categories (Flights, Hotel, Food, Activities, Shopping, etc.)
- Each category has a budget amount
- Total of all categories should not exceed the goal's target amount
- Saving progress and spending plan are shown side-by-side on the goal detail screen

> 💡 The spending plan is **dormant during the saving phase**. It activates when the trip start date arrives (see Section 3.6).

### 3.6 Goal Lifecycle — Four Phases

| Phase | What Happens | Where It Lives |
|---|---|---|
| 1. Planning | Goal created, spending breakdown set up | Goals tab — card view |
| 2. Saving | User making monthly contributions toward target | Goals tab — progress bar updates |
| 3. Active | Trip/event start date has arrived | **Home page** — promoted card |
| 4. Complete | End date passed or user marks complete | Goals tab — archived section |

### 3.7 Active Phase — Home Page Promotion

When a Trip/Event goal enters **Active** phase (start date reached), it is promoted to the Home page as a **persistent card**, above the monthly summary.

The Active Goal card on Home shows:

- Goal name + emoji + `Active` badge
- Days remaining in the trip/event
- Mini spend tracker: total spent vs. trip budget
- Category breakdown (collapsed by default, expandable)
- `+ Log expense` button — quick-add scoped directly to this goal

> 💡 Users do not need to navigate to the Goals tab during the active phase. The card comes to them on the Home page.

**Multiple active goals:**  
Only the most urgent active goal card is shown on Home. A count badge (`+2 more active goals`) links to the Goals tab.

### 3.8 Transaction Tagging for Active Goals

When a user adds a transaction via the global `+` button:

- If there is an active Trip/Event goal, the transaction form shows an optional field: **"Part of a plan?"** with the active goal listed
- Tapping the goal tags the transaction to it
- Tagged transactions count against the trip's spending plan
- **Toggle: "Exclude from monthly budget"** — prevents double-counting (e.g., food spending in Tokyo should not inflate the regular monthly food budget)

### 3.9 Goal Detail Screen

Tapping any goal card opens a full detail screen:

- **Header:** goal name, emoji, type, status chip
- **Saving progress:** amount saved / target, progress ring, monthly needed
- **Spending plan** *(Trip/Event only):* category breakdown with budget vs. actual during active phase
- **Transaction history:** all transactions tagged to this goal
- **Actions:** Edit / Delete / Mark Complete

---

## 4. Wealth Tab

Gives users a **read-only overview** of their financial big picture — investments, net worth, and long-term asset tracking. Answers: *"How am I doing overall?"*

> 💡 This is NOT a trading or portfolio management tool. Users want context, not complexity. The value is seeing investments alongside everyday finances in one unified view.

### 4.1 Net Worth Summary (top)

- Total assets (cash + investments + property)
- Total liabilities (credit cards + loans + mortgage)
- Net worth = assets − liabilities
- Net worth trend sparkline (last 6 or 12 months)

### 4.2 Asset Sections

| Section | What It Tracks | Data Source |
|---|---|---|
| Cash & Accounts | Checking, savings, cash | Manual entry or linked account |
| Investments | Stocks, ETFs, crypto, 401k, IRA | Manual entry (v1); linked brokerage (v2+) |
| Property | Real estate, vehicles | Manual entry with estimated value |

### 4.3 Investment Cards

Each investment or account renders as a card showing:

- Account / asset name
- Current value
- Total gain/loss (amount and %) since first entry
- Last updated date (manual) or live price (linked, v2)

### 4.4 Contribution Tracking

- Users can set a monthly investment contribution target (e.g., "Invest $500/month")
- Progress indicator shows whether the target was hit this month
- Not a budget category — tracked separately in Wealth tab only

### 4.5 Liabilities Section

- List of outstanding debts: credit cards, student loans, car loans, mortgage
- Shows: balance, interest rate, minimum payment
- Links to a Debt Payoff goal if one exists in the Goals tab
- Projected payoff date shown if payoff method (avalanche/snowball) is configured

### 4.6 V1 Scope Limitations

The following are **out of scope for V1**:

- Automatic account linking (Plaid or Open Banking)
- Live stock price feeds
- Complex portfolio analytics (Sharpe ratio, sector breakdown, etc.)
- Tax optimization or capital gains tracking

---

## 5. Bills & Subscriptions — Home Page Surface

Bills and subscriptions are **NOT** in the Plans tabs. They live on the Home page as a "Coming Up" card, making due dates feel urgent and visible.

### 5.1 Home Page Card

- Title: "Upcoming Bills"
- Shows next 3–5 upcoming bills sorted by due date
- Each row: bill name, amount, days until due, status (`Paid` / `Unpaid`)
- "View all" deep-links to the full Bills screen

> 💡 This is the entry point for the **Bill Countdown** feature — the circular timer UI lives on the full Bills screen, not the Home card.

### 5.2 Bills Screen (deep-link from Home)

- Full list of all recurring bills and subscriptions
- Bill Countdown UI: circular timer showing time until next due date
- Tabs or filter: All / Upcoming / Paid / Overdue
- Quick actions: Mark as Paid, Snooze reminder, Edit

### 5.3 Adding a Bill

| Property | Detail |
|---|---|
| Fields | Name, amount, due day of month, recurrence (monthly/annual/custom), category, reminder days before |
| Subscription flag | Marks as subscription — surfaces in "Subscriptions I might be forgetting" nudge |
| Auto-match | When a recurring transaction is detected, prompt user to link it to a bill |

---

## 6. Data Models — Key Entities

### 6.1 Budget

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique identifier |
| `userId` | string | Owner |
| `category` | string | Spending category |
| `limitAmount` | number | Monthly limit in base currency |
| `month` | date | YYYY-MM (e.g., 2025-04) |
| `rollover` | boolean | Carry unused balance to next month |
| `shared` | boolean | Shared with linked accounts |
| `actualSpent` | number | Computed from transactions (not stored) |

### 6.2 Goal

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique identifier |
| `userId` | string | Owner |
| `type` | enum | `trip_event` \| `purchase` \| `emergency` \| `debt` \| `custom` |
| `name` | string | Display name |
| `emoji` | string | User-selected emoji |
| `targetAmount` | number | Total savings target |
| `currentAmount` | number | Amount saved so far |
| `startDate` | date | When saving started / trip begins |
| `endDate` | date | Target completion / trip end (nullable) |
| `status` | enum | `planning` \| `saving` \| `active` \| `complete` |
| `spendingPlan` | array | Trip/Event only: `[{ category, budget, actual }]` |
| `linkedAccountId` | string | Optional: savings account link |

### 6.3 Investment / Asset

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique identifier |
| `userId` | string | Owner |
| `type` | enum | `cash` \| `investment` \| `property` \| `liability` |
| `name` | string | Account or asset name |
| `currentValue` | number | Current estimated value |
| `costBasis` | number | Original purchase price (investments) |
| `interestRate` | number | For liabilities only |
| `lastUpdated` | date | Date of last manual update |
| `linkedGoalId` | string | Optional: link to debt payoff goal |

### 6.4 Bill

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique identifier |
| `userId` | string | Owner |
| `name` | string | Bill name |
| `amount` | number | Amount due |
| `dueDay` | number | Day of month (1–31) |
| `recurrence` | enum | `monthly` \| `annual` \| `weekly` \| `custom` |
| `category` | string | Utility, Subscription, Insurance, etc. |
| `isSubscription` | boolean | Flag for subscription detection |
| `reminderDays` | number | Days before due to send alert |
| `lastPaidDate` | date | Date of last payment |
| `status` | enum | `upcoming` \| `paid` \| `overdue` |

---

## 7. State, Navigation & Edge Cases

### 7.1 Active Goal Promotion Logic

| Property | Value |
|---|---|
| Condition | `goal.type === 'trip_event' AND goal.status === 'active'` |
| Trigger | `goal.startDate <= today AND goal.endDate >= today` |
| Home card | Render `ActiveGoalCard` above monthly summary |
| Max shown on Home | One card (most urgent by `startDate`) |
| Multiple active | Badge: "+2 more active goals" → links to Goals tab |

### 7.2 Tab Persistence

- Selected Plans tab is persisted in local state
- Navigating away and back restores last selected tab
- Deep-linking (`/plans/goals`, `/plans/budget`) sets the correct tab on mount

### 7.3 Empty States

| Screen | Empty State |
|---|---|
| Budget tab (no budgets) | Illustration + "Set your first budget" CTA |
| Goals tab (no goals) | Illustration + "Create a goal" CTA |
| Wealth tab (no assets) | Illustration + "Add your first asset" CTA |
| Goal with no transactions | Show spending plan with all actuals at zero |

### 7.4 Key UX Rules

- Monthly budgets and trip budgets must **never appear in the same view** — they are different mental models
- Completed goals are **archived, not deleted** — users want to see history
- Transactions tagged to an active goal are **excluded from monthly budgets by default** (user can override per transaction)
- The Wealth tab is **read-oriented in V1** — no transactions flow through it
- Bills on the Home card are sorted by **due date ascending** (most urgent first)

---

## 8. Alerts & Notifications (Plans-related)

| Alert | Trigger | Channel |
|---|---|---|
| Budget approaching limit | Spend reaches 80% of category budget | In-app + push |
| Budget exceeded | Spend goes over limit | In-app + push |
| Goal behind schedule | Savings pace will miss target date | Weekly digest |
| Goal reached target | Full amount saved | Celebration push |
| Active trip: no logs today | Trip is active and no transactions logged | Evening nudge |
| Bill due soon | X days before due date (user-configured) | Push + Home card |
| Bill overdue | Due date passed with no payment logged | Red badge + push |
| Subscription price change | Detected amount differs from expected | In-app alert |

---

## 9. Implementation Notes

### 9.1 Build Order Recommendation

| Priority | Feature | Rationale |
|---|---|---|
| 1 | Budget Tab | Core feature; needed before Goals |
| 2 | Bills Screen + Home card | High user value; relatively isolated |
| 3 | Goals Tab (saving goals) | Builds on Budget patterns |
| 4 | Trip/Event Goal + spending plan | Extension of Goals |
| 5 | Active goal Home promotion | Requires goal status tracking |
| 6 | Wealth Tab | Independent; lower urgency for V1 |

### 9.2 Shared Components

| Component | Used In |
|---|---|
| `ProgressBar` | Budget cards, Goal cards, Active goal Home card |
| `AmountInput` | Currency input with formatting — used across all tabs |
| `CategoryPicker` | Budget tab + Goal spending plan |
| `GoalStatusChip` | On Track / Behind / At Risk |
| `MonthSelector` | Budget tab month navigation |
| `ActiveGoalCard` | Home page component — reads from Goals state |

### 9.3 Story Mode Integration

Story Mode (AI narrative via Claude API) pulls from Plans data to generate richer narratives:

- **Monthly budget:** "You stayed under budget in 4 of 6 categories this month..."
- **Goal progress:** "At this pace, you'll reach your Tokyo goal 2 months early..."
- **Post-trip summary:** "You spent $2,840 of your $3,000 Tokyo budget. Your biggest splurge was restaurants at $620..."

### 9.4 Money Map Integration

The Money Map visualization can be extended with Plans context:

- Budget categories map to districts in the city
- Over-budget categories render with a visual alert indicator
- An active trip could appear as a special district or overlay on the map

---

*Jinsight — Plans Page Specification v1.0 · For internal use only. Update as decisions evolve.*
