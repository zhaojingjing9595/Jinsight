import { router } from "../lib/trpc";
import { authRouter } from "./auth";
import { accountsRouter } from "./accounts";
import { transactionsRouter } from "./transactions";
import { budgetsRouter } from "./budgets";
import { budgetPlansRouter } from "./budgetPlans";
import { goalsRouter } from "./goals";
import { billsRouter } from "./bills";
import { usersRouter } from "./users";
import { categoriesRouter } from "./categories";

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  accounts: accountsRouter,
  transactions: transactionsRouter,
  budgets: budgetsRouter,
  budgetPlans: budgetPlansRouter,
  goals: goalsRouter,
  bills: billsRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
