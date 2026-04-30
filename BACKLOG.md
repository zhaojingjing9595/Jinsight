# Jinsight Backlog

Running list of things to revisit later. Jot ideas down freely — triage later.

---

## Bugs

- [ ] Page transitions are slow — investigate Next.js prefetch / layout re-renders
- [ ] Dashboard: bar chart empty, y-axis shows `-Infinity` and `NaN` — likely division by zero when no data for a month
- [ ] Dashboard: transaction timestamps all show the same time per day — need to preserve time component when saving

---

## Small Adjustments

- [ ] Dashboard: total balance font size / weight needs refinement
- [ ] Add > Transaction: amount input should accept keyboard input (currently numpad only)
- [ ] Add > Transaction: missing "add new category" function (custom categories)
- [ ] Add > Transaction: assign transaction to a goal or budget plan from the form
- [ ] Goals: clarify UX for how savings contributions are recorded per goal
- [ ] Goals: redesign the Edit Goal sheet

---

## Features

- [ ] Transaction list: add swipe-to-edit and swipe-to-delete on each row
- [ ] Budget / Goals: allow user to reorder list items via drag
- [ ] Goals: "add saved money" flow — how does a deposit get attributed to a specific goal?
- [ ] Shared accounts: real-time balance sync via Supabase Realtime
- [ ] Story Mode: wire `@anthropic-ai/sdk` (already in API) to generate monthly narrative summaries
- [ ] Money Map: static D3/SVG city visualization of spending categories
- [ ] Push notifications: bill due reminders + overspend alerts

---

## Tech Debt / Refactors

- [ ] Add `.env.example` files to `apps/web` and `services/api` so required vars are documented
- [ ] tRPC error handling is inconsistent across routers — standardize TRPCError codes
- [ ] Bill `recurrence` CUSTOM type has no UI for setting a custom interval

---

## Ideas / Maybe

- [ ] iOS lock screen widget for upcoming bills
- [ ] Spending persona quiz on onboarding (persona field exists on User model)
- [ ] `apps/mobile` — Expo SDK 52 app (not yet created)
- [ ] Wealth tab: investment holdings via `Investment` type (already in `packages/core`)

---

## Done (recent)

- [x] Home UI: separate chart container from transaction list; invisible scroll
- [x] Home UI: transaction list category icons match Add page style
- [x] Home UI: pie chart colors and tooltip polish
- [x] Add UI: convert Add page to popup/modal overlay, background stays in place
- [x] Add UI: rename "Map" page to "Budget Plan"
- [x] Add UI: rearrange expense/income categories with top-3 shortcuts
- [x] Dashboard: opening balance edit button and modal
- [x] History page: 6-month bar chart + month picker pills + collapsible category groups
- [x] Bills page: countdown timers and recurrence badges
- [x] Plans page: Budget, Goals, Wealth tabs all functional
