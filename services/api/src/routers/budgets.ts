import { z } from "zod";
import { TRPCError } from "@trpc/server";
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
    .query(async ({ ctx, input }) => {
      const budgets = await ctx.prisma.budget.findMany({
        where: {
          accountId: input.accountId,
          month: input.month,
          year: input.year,
        },
        include: { categories: true },
      });

      return { budgets };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const budget = await ctx.prisma.budget.findUnique({
        where: { id: input.id },
        include: { categories: true, account: true },
      });

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      return { budget };
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
    .mutation(async ({ ctx, input }) => {
      const budget = await ctx.prisma.budget.upsert({
        where: {
          accountId_month_year: {
            accountId: input.accountId,
            month: input.month,
            year: input.year,
          },
        },
        update: {
          period: input.period,
          totalLimit: input.totalLimit,
          rollover: input.rollover,
        },
        create: {
          accountId: input.accountId,
          period: input.period,
          month: input.month,
          year: input.year,
          totalLimit: input.totalLimit,
          rollover: input.rollover,
          createdBy: ctx.userId,
        },
      });

      if (input.categories) {
        await ctx.prisma.budgetCategory.deleteMany({ where: { budgetId: budget.id } });
        await ctx.prisma.budgetCategory.createMany({
          data: input.categories.map((c) => ({
            budgetId: budget.id,
            category: c.category,
            limit: c.limit,
          })),
        });
      }

      const result = await ctx.prisma.budget.findUnique({
        where: { id: budget.id },
        include: { categories: true },
      });

      return { budget: result };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const budget = await ctx.prisma.budget.findUnique({ where: { id: input.id } });
      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      await ctx.prisma.budget.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),
});
