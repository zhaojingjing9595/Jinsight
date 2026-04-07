import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

export const budgetsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        month: z.number().int().min(1).max(12),
        year: z.number().int(),
      }),
    )
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { budgets: [], input };
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().positive(),
        period: z.enum(["MONTHLY", "WEEKLY"]),
        month: z.number().int().min(1).max(12),
        year: z.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { id: "placeholder", ...input };
    }),
});
