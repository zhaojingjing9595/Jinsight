import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

const categoryAllocationSchema = z.object({
  category: z.string(),
  limit: z.number().positive(),
});

export const budgetsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        month: z.number().int().min(1).max(12),
        year: z.number().int(),
      }),
    )
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { budgets: [], input };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { budget: null, id: input.id };
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        period: z.enum(["MONTHLY", "WEEKLY"]).default("MONTHLY"),
        month: z.number().int().min(1).max(12),
        year: z.number().int(),
        totalLimit: z.number().positive().optional(),
        rollover: z.boolean().default(false),
        categories: z.array(categoryAllocationSchema).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      // upsert Budget, then replace BudgetCategory rows
      return { id: "placeholder", ...input };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { deleted: input.id };
    }),
});
