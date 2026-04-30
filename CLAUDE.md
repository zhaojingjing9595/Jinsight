# Jinsight

Personal finance app. Fun, young, modern — not corporate or clinical.

## Stack

| Layer | Tech |
|---|---|
| Web | Next.js 15 (`apps/web`) — Turbopack, React 19, Tailwind CSS v4 |
| Mobile | Expo SDK 52 (`apps/mobile`) — planned, not yet created |
| Shared logic | `packages/core` — types, utils, category metadata |
| Shared UI | `packages/ui` — Neobrutalism tokens + base components |
| API | Fastify 5 + tRPC 11 (`services/api`) — 9 routers, Zod validation |
| Database | Supabase (PostgreSQL) + Prisma 6 |
| Auth | Supabase Auth — email/password, OAuth ready |
| Monorepo | Turborepo + pnpm workspaces |
| Visualization | D3 / SVG (pie chart, bar chart) |
| AI narrative | Anthropic Claude API (`@anthropic-ai/sdk`) — integrated in API, not yet wired to UI |

## Design System

See [`DESIGN.md`](./DESIGN.md) for the full Neobrutalism spec. Apply it to every new UI component.

**Core tokens (from `packages/ui/src/tokens/index.ts`):**
- Colors: base `#fcfaeb` (cream), primary `#a57dee` (purple), income `#2ad2a3` (teal), alert `#fc524f` (red), reward `#feb704` (gold), goal `#cce972` (lime), ink `#111008`
- Shadows: `shadow-neo-lg` (5px), `shadow-neo-md` (4px), `shadow-neo-sm` (3px)
- Fonts: Barlow Condensed (display, 900wt), Space Grotesk (body, 500–700wt)
- Borders: 2.5px ink on cards, 2px on buttons

## Conventions

- TypeScript everywhere, strict mode on
- Web-specific components stay in `apps/web/src/components/`; shareable components go in `packages/ui`
- Shared business logic and types go in `packages/core`
- Use server components by default in Next.js; opt into `"use client"` only when needed
- Prefer named exports
- Env vars live in `.env` at the workspace level (never committed); no `.env.local` in this project
- API runs on `localhost:3001`, web on `localhost:3000`
- tRPC procedures use `protectedProcedure` (requires userId in context) for all data mutations

## Routes (apps/web)

| Route | Purpose |
|---|---|
| `/` | Onboarding splash |
| `/login` | Email/password login |
| `/signup` | Account creation |
| `/dashboard` | Home — balance hero, income/expense bar, spending pie chart, bills & transactions card |
| `/add` | Add transaction (modal overlay, stays on current page after submit) |
| `/add/budget-plan` | Add budget plan |
| `/plans` | 3-tab layout: Budget · Goals · Wealth |
| `/plans/budget` | Monthly category budgets — create, edit, copy from prior month |
| `/plans/goals` | Saving goals — create, track progress, update status |
| `/plans/wealth` | Coming soon placeholder |
| `/history` | 6-month transaction history — bar chart + collapsible category groups |
| `/bills` | Bills & subscriptions — countdown timers, filters, mark paid |
| `/profile` | User settings |
| `/auth/callback` | Supabase OAuth callback |

## API Routers (services/api)

| Router | Key Procedures |
|---|---|
| `auth` | session helpers |
| `users` | `me` |
| `accounts` | `list`, `get`, `create`, `updateBalance` |
| `transactions` | `list`, `get`, `create`, `update`, `delete` (filter by month/year/category/type/plan/goal) |
| `budgets` | `list`, `get`, `upsert`, `copyFromMonth` |
| `budgetPlans` | `list`, `get`, `create`, `update`, `delete`, `addMember`, `removeMember`, `leave` |
| `goals` | `list`, `get`, `create`, `update`, `delete`, `updateStatus` |
| `bills` | `list`, `get`, `create`, `update`, `delete`, `markPaid` |

## Database Models (Prisma)

`User` · `Account` · `AccountMember` · `Transaction` · `Budget` · `BudgetCategory` · `BudgetPlan` · `BudgetPlanMember` · `BudgetPlanCategory` · `Goal` · `Bill`

Key fields to know:
- `Account` has `openingBalance` + `openingBalanceSources` (editable from dashboard)
- `Transaction` has `budgetPlanId` and `goalId` for linking to plans/goals
- `Bill` has `recurrence` (MONTHLY | ANNUAL | WEEKLY | CUSTOM), `reminderDays`, `isPaid`
- `Goal` has `spendingPlan` (JSON array of categories), `status` (PLANNING→SAVING→ACTIVE→COMPLETE)
- Default currency: `ILS`

## Build Phases

1. **Foundation** — auth, DB schema, basic transaction CRUD ✅
2. **Core UI** — dashboard, transaction list, category management ✅
3. **Insights** — Money Map (D3), spending trends, budgets — *in progress*
4. **Story Mode** — Claude API narrative summaries of spending — *planned*

## Current Status

> Update this block at the end of every session.

**Phase 1 — Foundation ✅ Complete**
- [x] Monorepo scaffold — pnpm workspaces + Turborepo
- [x] `packages/config` — shared tsconfigs (base, nextjs, react-native)
- [x] `packages/core` — types (Transaction, Budget, BudgetPlan, Goal, Bill, User, Investment) + utils (currency, dates, categories with icons/colors)
- [x] `packages/ui` — Neobrutalism tokens + Button, Card, Input, Badge, TransactionRow
- [x] Supabase project connected — auth working (email/password)
- [x] Prisma schema complete — all models defined and synced
- [x] `services/api` — Fastify + tRPC with 9 full routers (accounts, transactions, budgets, budgetPlans, goals, bills, users, auth)

**Phase 2 — Core UI ✅ Complete**
- [x] `/dashboard` — balance hero (editable opening balance), income vs. spending bar, spending pie chart, bills & transactions tabbed card, bottom nav
- [x] `/add` — modal overlay transaction form with numpad, category picker, date strip, type toggle, goal/plan assignment
- [x] `/plans` — 3-tab layout: Budget (monthly category limits, copy-from-month), Goals (create/track/update), Wealth (stub)
- [x] `/history` — 6-month bar chart + month picker pills + collapsible category-grouped transaction list
- [x] `/bills` — bill list with countdown timers, recurrence badges, mark-paid, filters

**Phase 3 — Insights (in progress)**
- [ ] Fix bar chart NaN/Infinity rendering bug on dashboard
- [ ] Fix transaction timestamp display (all show same time per day)
- [ ] Money Map v1 — static SVG city visualization
- [ ] Keyboard input on amount numpad
- [ ] Transaction edit/delete from list
- [ ] Assign transactions to goals/budget plans from add form
- [ ] Budget plan spending tracking

**Phase 4 — Story Mode (planned)**
- [ ] Wire `@anthropic-ai/sdk` (already in API deps) to monthly narrative generation
- [ ] Story page UI
- [ ] Push notifications — bill reminders, overspend alerts

**Not yet started**
- [ ] `apps/mobile` — Expo app
- [ ] Shared accounts — real-time sync via Supabase Realtime
- [ ] iOS lock screen widget

- Last worked on: 2026-04-30
