# Budget Plan

The Budget Plan page (`/budget-plan`) is where users plan and track spending for specific goals — trips, events, home projects, or monthly budgets. It lives under a 3-tab layout shared with **Saving** and **Invest**.

## Tabs

| Tab | Component | Status |
|---|---|---|
| Budget | `BudgetPlanForm` | UI built, no backend |
| Saving | `SavingPlanForm` | UI built, no backend |
| Invest/Wealth | `InvestmentHub` | Stub links only |

## Budget Tab

### What it includes

- Category budgets for this month, recurring
<!-- - Enter a **plan name** with contextual placeholders per type -->
<!-- - Set **start/end dates** or toggle to **duration in days** -->
- Set a **total budget** via NumPad
- Add **category allocations** (select from expense categories, set limit per category)
- Shows allocated vs. total with color feedback (green = under, red = over)
- Add free-text **notes**
<!-- - "Create Budget Plan" button — currently resets form after 1.5 s (no persistence) -->


<!-- 
### Plan types

`trip` | `home_project` | `event` | `monthly` | `custom`

Each has an SVG icon and accent color.

### What's missing / next steps

- [ ] Persist plans to DB (Supabase via tRPC)
- [ ] List existing plans with progress tracking
- [ ] Edit / delete a plan
- [ ] Link actual transactions to a plan and show spend vs. budget
- [ ] Budget alerts / notifications when nearing limit -->

## Saving Tab

### What it does today

- Pick a **goal type**: Emergency, Big Buy, House, Travel, Gift, Custom (emoji tile selector)
- Enter **goal name**, **target amount** (NumPad), optional **already saved**
- Progress bar when both target and saved amounts are set
- Optional **deadline** date
- **Monthly contribution** toggle with amount input
- Notes field
- "Start Saving Plan" button — currently resets form (no persistence)

### What's missing / next steps

- [ ] Persist saving goals to DB
- [ ] Track contributions over time
- [ ] Dashboard widget showing progress toward active goals
- [ ] Reminders for monthly contributions

## Invest Tab

### What it does today

- Three link cards: Add a Holding, Investment Goal, Log Contribution
- Links point to `/add/investment/*` routes (not yet built)

### What's missing / next steps

- [ ] Build the destination pages for each link
- [ ] Portfolio overview / holdings list
- [ ] Performance tracking (gains/losses)
- [ ] Integration with market data API (stretch)

## Key Files

- [page.tsx](../apps/web/src/app/budget-plan/page.tsx) — page layout + tab switcher
- [BudgetPlanForm.tsx](../apps/web/src/components/BudgetPlanForm.tsx) — budget tab form
- [SavingPlanForm.tsx](../apps/web/src/components/SavingPlanForm.tsx) — saving tab form
- [InvestmentHub.tsx](../apps/web/src/components/InvestmentHub.tsx) — invest tab links

## Design Notes

- Neobrutalism style: thick borders, `shadow-neo-*`, uppercase labels, bold typography
- Currency formatted as ILS via `formatCurrency` from `@jinsight/core`
- Category metadata (icons, colors, labels) from `CATEGORY_META` in `@jinsight/core`
