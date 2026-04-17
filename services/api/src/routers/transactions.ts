import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

export const transactionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().optional(),
        category: z.string().optional(),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        budgetPlanId: z.string().optional(),
        goalId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findUnique({ where: { id: input.accountId } });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const dateFilter: { gte?: Date; lt?: Date } = {};
      if (input.month && input.year) {
        dateFilter.gte = new Date(input.year, input.month - 1, 1);
        dateFilter.lt = new Date(input.year, input.month, 1);
      }

      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          accountId: input.accountId,
          ...(input.type && { type: input.type }),
          ...(input.category && { category: input.category }),
          ...(input.budgetPlanId && { budgetPlanId: input.budgetPlanId }),
          ...(input.goalId && { goalId: input.goalId }),
          ...(dateFilter.gte && { date: dateFilter }),
        },
        orderBy: { date: "desc" },
        take: input.limit,
        skip: input.offset,
      });

      return { transactions };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.prisma.transaction.findUnique({
        where: { id: input.id },
        include: { account: true },
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      return { transaction };
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
        budgetPlanId: z.string().optional(),
        goalId: z.string().optional(),
        excludeFromBudget: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findUnique({ where: { id: input.accountId } });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const balanceDelta = input.type === "INCOME" ? input.amount : -input.amount;

      const [transaction] = await ctx.prisma.$transaction([
        ctx.prisma.transaction.create({
          data: {
            accountId: input.accountId,
            amount: input.amount,
            type: input.type,
            category: input.category,
            description: input.description,
            date: new Date(input.date),
            isRecurring: input.isRecurring,
            budgetPlanId: input.budgetPlanId,
            goalId: input.goalId,
            excludeFromBudget: input.excludeFromBudget,
          },
        }),
        ctx.prisma.account.update({
          where: { id: input.accountId },
          data: { balance: { increment: balanceDelta } },
        }),
      ]);

      return { transaction };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        date: z.string().datetime().optional(),
        isRecurring: z.boolean().optional(),
        budgetPlanId: z.string().nullable().optional(),
        goalId: z.string().nullable().optional(),
        excludeFromBudget: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.transaction.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      const oldImpact = existing.type === "INCOME" ? existing.amount : -existing.amount;
      const newType = input.type ?? existing.type;
      const newAmount = input.amount ?? existing.amount;
      const newImpact = newType === "INCOME" ? newAmount : -newAmount;
      const balanceDelta = newImpact - oldImpact;

      const { id, date, ...rest } = input;

      const [transaction] = await ctx.prisma.$transaction([
        ctx.prisma.transaction.update({
          where: { id },
          data: {
            ...rest,
            ...(date && { date: new Date(date) }),
          },
        }),
        ctx.prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceDelta } },
        }),
      ]);

      return { transaction };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.transaction.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      const balanceDelta = existing.type === "INCOME" ? -existing.amount : existing.amount;

      await ctx.prisma.$transaction([
        ctx.prisma.transaction.delete({ where: { id: input.id } }),
        ctx.prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceDelta } },
        }),
      ]);

      return { deleted: input.id };
    }),
});
