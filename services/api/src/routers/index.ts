import { router } from "../lib/trpc";
import { transactionsRouter } from "./transactions";
import { budgetsRouter } from "./budgets";

export const appRouter = router({
  transactions: transactionsRouter,
  budgets: budgetsRouter,
});

export type AppRouter = typeof appRouter;
