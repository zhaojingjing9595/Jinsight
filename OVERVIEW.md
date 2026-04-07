# OVERVIEW.md — Jinsight

> This file is the initial idea on how we build Jinsight together.

---

## What We're Building

**Jinsight** — a personal finance app. The golden view of your finances.

A personal finance app combining income & expense tracking, shared accounts, goal saving, and emotionally intelligent insights — built around how people actually feel about money. Most budget apps show you data. Jinsight tells you a story — about your habits, your mood, and your future self. We believe the best financial tool is one that feels like a trusted coach, not a spreadsheet.

Platforms iOS · Android · Web

North Star: Every user, after their first month, should feel more confident about money than before — not because they were lectured, but because they finally understand their own patterns.

### Core Features

- Income & Expense Tracking (MVP): Log transactions manually (under 5 seconds) or sync via open banking. Smart auto-categorization learns from history. Recurring transactions auto-detected. Offline-first architecture — no lost entries.
- Individual & Shared Accounts (MVP): Toggle between your personal view and a shared household space. Split expenses between partners or housemates. Lightweight — no separate app needed. Shared balance visible to all members. Settlement suggestions weekly.
- Set budgets, limits, and saving goals (MVP): Monthly category caps with visual burn-rate bars. A "left to spend" daily number prominently shown. Saving goals with progress bars, target dates, and projected timelines. Auto-save rules ("round up every purchase").
- Reports & Insights (v1.1): Monthly spending breakdown by category with trend arrows. Net worth tracker over time. Peer benchmarking (anonymized): "You spend 30% less on dining than similar households." Weekly email digest. Exportable CSV/PDF.
- Alerts & reminders (MVP): Bill due-date reminders (7, 3, 1 day before). Overspend alerts by category. Low balance warnings. Unusual spending detection. Personalized nudge timing based on past engagement patterns.

### Delight Layer — Fun Features
- Monthly "Story Mode" narrative (via Claude API)  (v1.1): "What Did My Money Do This Month?" On the 1st of every month, app generates a narrative summary instead of a boring report. Written in warm, human language: "You fed yourself 47 times, treated yourself 8 times, invested in your future twice, and spent 12 evenings at home." Technical approach: LLM-generated (GPT-4/Claude API) from transaction data. Categories mapped to human verbs. Personalized tone based on user's spending persona. Shareable as a card image. Optional weekly micro-summaries. Engagement driver: Users look forward to the 1st. Creates emotional resonance — people remember stories, not pie charts.
- Visual "Money Map" — spending as a Neobrutalism city  (v1.1): Your Spending as a City
Idea 7 · Visual Identity. Spending categories rendered as a beautiful illustrated city or landscape — not a pie chart. Rent is the big house. Food is the market street. Transport is the road. Entertainment is the park, etc.. The bigger the spend, the bigger the building. Technical approach: SVG-based generative city layout. Category budgets drive building scale. Animated (subtle breathing, moving clouds). Tap a building to drill into that category. Shareable as a poster image. Seasonal themes (winter snow, summer sun). Engagement driver: Highly shareable on social media. Creates a personal "feel" for money. No two users' cities look the same — becomes a signature.
- Bill countdown timers with visual urgency: Instead of a flat list of bill due dates, show animated visual countdowns — circular timer rings that drain as the due date approaches. Color shifts from calm green (14+ days) to warm amber (7 days) to urgent red (3 days or less). Technical approach: SVG circular progress rings with CSS animations. Each bill has its own ring. Grouped in a scrollable horizontal carousel. Lock screen widget (iOS/Android) shows the next 2 urgent bills. Push notification integration. Engagement driver: Creates daily check-in habit. Reduces financial anxiety by converting vague dread into a clear countdown. Users open the app just to check.


**Design style:** Neobrutalism ( see details in ./DESIGN.md)

---

## Who's Building This

- **You (the user)** — architecture, product decisions, design feedback, direction
- **Claude (me)** — brainstorm, research, code, debugging, implementation, testing, deploy

No large team. We ship iteratively, feature by feature, keeping things simple and working at every step. Prefer small working increments over big ambitious PRs.

**Working style:**
- Always have a runnable app — never break `main`
- Build one feature fully before starting the next
- Ask before making large structural changes
- Keep code readable over clever
- Always test and ask for review before committing any changes

---

## Tech Stack

### Architecture: Monorepo
One repo, shared logic, separate native UIs per platform.

```
jinsight/
├── apps/
│   ├── web/          # Next.js 15 (App Router)
│   └── mobile/       # Expo SDK 52 (React Native)
├── packages/
│   ├── core/         # ★ shared business logic, types, hooks, API client
│   ├── ui/           # Tamagui design system (Neobrutalism theme)
│   └── config/       # shared tsconfig, eslint, prettier
└── services/
    └── api/          # Node.js + tRPC + Prisma backend
```

### Full Stack

| Layer | Technology | Notes |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | Remote caching enabled |
| Web | Next.js 15 (App Router) | Deployed on Vercel |
| Mobile | Expo SDK 52 + Expo Router v4 | EAS Build + EAS Update |
| UI System | Tamagui | Universal components, Neobrutalism theme |
| Shared state | Zustand + TanStack Query | Same API on web and mobile |
| API | tRPC + Node.js (Fastify) | End-to-end typesafe |
| Database | Supabase (PostgreSQL) + Prisma | Row-level security |
| Auth | Supabase Auth | Email, Google, Apple, passkey |
| Realtime | Supabase Realtime | Shared accounts live sync |
| Offline | WatermelonDB (mobile) | Transaction entry never fails |
| Charts | Victory Native XL | Works web + mobile |
| Money Map | D3.js (web) + react-native-svg (mobile) | SVG city generator |
| AI / Story | Anthropic Claude API | claude-sonnet-4-5 |
| Bank sync | TrueLayer (IL/EU) + Plaid (US) | Open banking |
| Styling (web) | Tailwind CSS v4 + Tamagui tokens | Neobrutalism utilities |
| Analytics | PostHog (self-hosted) | Feature flags + A/B |
| Deploy: API | Railway | Auto-deploy from main |
| Deploy: Web | Vercel | Preview per PR |
| Deploy: Mobile | Expo EAS | App Store + Play Store |

---

## Design System — Neobrutalism

These rules apply to EVERY component, screen, and UI element. Non-negotiable.

Colors , Typography, Component Rules and other UX/UI design style -> please follow DESIGN.md

---

## Project Structure In Detail

### packages/core — The Heart
Everything shared between web and mobile lives here. If logic exists on both platforms, it goes here.

```
packages/core/
├── api/
│   └── client.ts         # tRPC client (configured per platform)
├── hooks/
│   ├── useTransactions.ts
│   ├── useBudgets.ts
│   ├── useGoals.ts
│   └── useSharedAccounts.ts
├── stores/
│   ├── authStore.ts       # Zustand
│   ├── budgetStore.ts
│   └── uiStore.ts
├── types/
│   ├── transaction.ts
│   ├── budget.ts
│   ├── goal.ts
│   └── user.ts
└── utils/
    ├── currency.ts        # formatCurrency(amount, currency)
    ├── dates.ts           # getMonthRange, daysUntil
    └── categories.ts      # CATEGORY_LIST, getCategoryIcon
```

### packages/ui — Design System
Tamagui components with Neobrutalism theme. Write once, renders on web + mobile.

```
packages/ui/
├── tokens/
│   └── index.ts           # colors, spacing, radius, shadows
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── BudgetBar.tsx
│   ├── TransactionRow.tsx
│   ├── CategoryBadge.tsx
│   └── BillRing.tsx       # circular countdown ring
└── theme/
    └── neobrutalism.ts    # full Tamagui theme
```

### services/api — Backend
```
services/api/
├── routers/
│   ├── transactions.ts
│   ├── budgets.ts
│   ├── goals.ts
│   ├── shared.ts          # shared accounts
│   ├── story.ts           # Claude API story generation
│   └── notifications.ts
├── db/
│   ├── schema.prisma
│   └── migrations/
├── ai/
│   └── storyGenerator.ts  # Claude API prompt templates
└── lib/
    ├── supabase.ts
    └── trpc.ts
```

---

## Database Schema (Key Tables)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  currency      String   @default("ILS")
  accounts      Account[]
  transactions  Transaction[]
}

model Account {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        AccountType  // PERSONAL | SHARED
  balance     Float
  members     AccountMember[]
}

model Transaction {
  id          String   @id @default(uuid())
  accountId   String
  amount      Float
  type        TxType   // INCOME | EXPENSE
  category    String
  description String?
  date        DateTime
  isRecurring Boolean  @default(false)
}

model Budget {
  id          String   @id @default(uuid())
  userId      String
  category    String
  limit       Float
  period      Period   // MONTHLY | WEEKLY
  month       Int
  year        Int
}

model Goal {
  id          String   @id @default(uuid())
  userId      String
  name        String
  targetAmount Float
  savedAmount  Float   @default(0)
  deadline    DateTime?
}

model Bill {
  id          String   @id @default(uuid())
  userId      String
  name        String
  amount      Float
  dueDate     DateTime
  isRecurring Boolean
  isPaid      Boolean  @default(false)
}
```

---

## Feature Priority (Build Order)

### Phase 1 — Make it work
1. Monorepo scaffold + CI/CD
2. Supabase + Prisma + tRPC API skeleton
3. Tamagui Neobrutalism theme in packages/ui
4. Auth (email + Google) on web + mobile
5. Onboarding flow (currency, name, first budget)
6. Add transaction screen (< 5 seconds to log)
7. Dashboard: "left to spend" hero number
8. Budget setup per category
9. Transaction list with filters

### Phase 2 — Make it delightful
10. Bill Countdown rings UI
11. iOS lock screen widget for bills
12. Shared accounts (invite link, real-time sync)
13. Saving goals with progress bar
14. Story Mode (Claude API integration)
15. Push notifications (bill reminders, overspend alerts)
16. Money Map v1 (static SVG city)

### Phase 3 — Make it smart
17. TrueLayer bank sync (auto-import transactions)
18. Smart auto-categorisation
19. Reports: trends, net worth, peer comparison
20. Money Map v2 (animated, seasonal)
21. Multi-currency + live exchange rates

### Phase 4 — Ship it
22. Performance audit + optimisation
23. Accessibility (WCAG 2.1 AA)
24. Jinsight Pro tier (paywall via RevenueCat)
25. App Store + Play Store submission
26. Marketing landing page

---

## Development Commands

```bash
# Install all dependencies
pnpm install

# Run everything in dev
pnpm dev                    # starts web + api in parallel

# Run individually
pnpm --filter web dev       # Next.js on localhost:3000
pnpm --filter mobile start  # Expo on localhost:8081
pnpm --filter api dev       # tRPC API on localhost:3001

# Database
pnpm --filter api db:push   # push schema to Supabase
pnpm --filter api db:studio # Prisma Studio

# Build
pnpm build                  # build all apps

# Type check everything
pnpm typecheck

# Lint
pnpm lint

# Test
pnpm test
```

---

## Environment Variables

```bash
# services/api/.env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
TRUELAYER_CLIENT_ID=
TRUELAYER_CLIENT_SECRET=

# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## Claude API — Story Mode

The monthly narrative is generated by the Claude API. Keep prompts in `services/api/ai/storyGenerator.ts`.

### Prompt principles
- Warm, human tone — never clinical or preachy
- Frame spending as actions, not numbers: "you fed yourself 47 times" not "food: ₪820"
- Celebrate wins. Mention concerns gently, once.
- Max 200 words per story
- Always end with one forward-looking sentence

### Spending personas (calibrate tone per user)
- **Comfort spender** — loves convenience, tends to overspend on subscriptions
- **Experience seeker** — spends on travel, dining, events; saves less
- **Steady saver** — consistent, risk-averse, sometimes over-restricts
- **Spontaneous spender** — inconsistent, high variance month to month

```ts
// services/api/ai/storyGenerator.ts
export async function generateStory(data: MonthlyData): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: buildStoryPrompt(data)
    }]
  })
  return response.content[0].text
}
```

---

## Coding Conventions

### TypeScript
- Strict mode always (`"strict": true`)
- No `any`. Use `unknown` + type guard if needed.
- Prefer `type` over `interface` for data shapes
- Zod for all runtime validation (API input + output)

### Component structure (React / React Native)
```tsx
// 1. Imports
// 2. Types
// 3. Component
// 4. Styles (if not using Tamagui)
// 5. Export

// Always named exports (no default exports except pages/screens)
export function TransactionRow({ transaction }: TransactionRowProps) { ... }
```

### File naming
```
components/   PascalCase.tsx
hooks/        useCamelCase.ts
utils/        camelCase.ts
types/        camelCase.ts
api routes/   kebab-case/route.ts (Next.js convention)
```

### Commits
```
feat: add bill countdown ring component
fix: correct currency formatting for ILS
chore: update Tamagui to v1.120
refactor: move date utils to packages/core
```

### What goes where
| Code | Location |
|---|---|
| TypeScript types | `packages/core/types/` |
| API call logic | `packages/core/api/` |
| React hooks with business logic | `packages/core/hooks/` |
| UI components (universal) | `packages/ui/components/` |
| Web-only UI | `apps/web/components/` |
| Mobile-only UI | `apps/mobile/components/` |
| Backend route handlers | `services/api/routers/` |
| Database queries | `services/api/db/` |

---

## Key Decisions Log

| # | Decision | Reason |
|---|---|---|
| 1 | App name: Jinsight | Jin (金, gold) + insight. The golden view of your finances. |
| 2 | Neobrutalism UI | Young, modern, high-contrast, unique in fintech. Makes financial data punchy. |
| 3 | Monorepo (Approach 3) | Share logic, not UI. Best balance for a 2-person team going cross-platform. |
| 4 | Tamagui over NativeWind | True universal components — same JSX on web and mobile, not just styles. |
| 5 | tRPC over REST | End-to-end types. A backend change immediately surfaces as a TS error in the app. |
| 6 | Supabase over Firebase | PostgreSQL (relational) fits financial data better. Built-in RLS for multi-user. |
| 7 | Expo over bare RN | EAS Build + OTA updates. Smaller team overhead. Full access to native APIs. |
| 8 | WatermelonDB for offline | Transaction entry must work without internet. Sync to Supabase on reconnect. |
| 9 | Claude API for Story Mode | Warm, human tone. Best model for financial narrative generation. |
| 10 | TrueLayer over Plaid | Better IL/EU coverage. Plaid as fallback for US users. |
| 11 | PostHog over Mixpanel | Self-hosted, privacy-first. Feature flags + A/B testing in one tool. |

---

## What NOT to Do

- ❌ Never use `any` in TypeScript
- ❌ Never add rounded corners > 4px to UI components
- ❌ Never put business logic inside a component — it goes in `packages/core/hooks/`
- ❌ Never duplicate a type — if it's shared, it lives in `packages/core/types/`
- ❌ Never commit broken builds to `main`
- ❌ Never store raw bank credentials — use TrueLayer/Plaid tokens only
- ❌ Never use gradients or blur in UI — Neobrutalism is flat
- ❌ Never make a screen that isn't accessible (min touch target: 44×44px)
- ❌ Never hardcode currency symbols — always use `formatCurrency()` from core/utils

---

## Session Startup Checklist

At the start of each work session, Claude should:

1. Re-read CLAUDE.md
2. Check what phase we're in and what feature is next
3. Confirm the last thing that was built is working
4. Ask if any decisions in this file have changed
5. Then start building the next thing

---

## Current Status

> Update Claude.md at the end of every session.

- **Current phase:** Phase 1 — Foundation
- **Last completed:** Project design and planning
- **Next task:** Monorepo scaffold setup
- **Blockers:** None
- **Notes:** Starting fresh. First task is to initialise the Turborepo monorepo, install core dependencies, and get `pnpm dev` running with a placeholder web and mobile app.

---

*Jinsight — built by two. Shipped for many.*
