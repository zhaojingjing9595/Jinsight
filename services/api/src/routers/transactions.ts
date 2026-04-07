import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

export const transactionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().optional(),
        category: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { transactions: [], input };
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        amount: z.number().positive(),
        type: z.enum(["INCOME", "EXPENSE"]),
        category: z.string(),
        description: z.string().optional(),
        date: z.string().datetime(),
        isRecurring: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { id: "placeholder", ...input };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { deleted: input.id };
    }),
});
