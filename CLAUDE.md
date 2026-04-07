# Jinsight

Personal finance app. Fun, young, modern — not corporate or clinical.

## Stack

| Layer | Tech |
|---|---|
| Web | Next.js 15 (`apps/web`) |
| Mobile | Expo SDK 52 (`apps/mobile`) |
| Shared | `packages/core` (logic), `packages/ui` (components) |
| Database | Supabase (PostgreSQL) + Prisma
| Monorepo | Turborepo + pnpm workspaces |
| Visualization | D3 / SVG |
| AI narrative | Anthropic Claude API |

## Design System

See [`DESIGN.md`](./DESIGN.md) for the full Neobrutalism spec. Apply it to every new UI component.

## Conventions

- TypeScript everywhere, strict mode on
- Components in `packages/ui`, shared logic in `packages/core`
- Use server components by default in Next.js; opt into `"use client"` only when needed
- Prefer named exports
- Env vars live in `.env.local` (never committed)

## Build Phases

1. **Foundation** — auth, DB schema, basic transaction CRUD
2. **Core UI** — dashboard, transaction list, category management
3. **Insights** — Money Map (D3), spending trends, budgets
4. **Story Mode** — Claude API narrative summaries of spending

## Current Status

> Update this block at the end of every session.

- [x] Monorepo scaffold complete — pnpm workspaces + Turborepo
- [x] packages/config — shared tsconfigs (base, nextjs, react-native)
- [x] packages/core — all types (User, Transaction, Budget, Goal) + utils (currency, dates, categories)
- [x] packages/ui — Neobrutalism tokens + Button, Card, Input, Badge, TransactionRow components
- [x] apps/web — Next.js 15 (Turbopack) running on localhost:3000 with:
  - `/` — Neobrutalism onboarding splash screen
  - `/dashboard` — hero balance, 4 stat cards, budget bars, transaction list, bottom nav
- [x] services/api — Fastify + tRPC skeleton with transactions + budgets routers, Prisma schema
- [ ] Phase 1 next: Supabase project setup → connect Prisma → auth (Supabase Auth)
- Last worked on: 2026-04-07
