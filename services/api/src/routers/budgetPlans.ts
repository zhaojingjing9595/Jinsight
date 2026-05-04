import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

const categoryAllocationSchema = z.object({
  category: z.string(),
  limit: z.number().positive(),
});

async function assertPlanAccess(ctx: { userId: string; prisma: any }, planId: string) {
  const plan = await ctx.prisma.budgetPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Budget plan not found" });

  const member = await ctx.prisma.accountMember.findUnique({
    where: { accountId_userId: { accountId: plan.accountId, userId: ctx.userId } },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your budget plan" });

  return plan;
}

export const budgetPlansRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
        status: z.enum(["PLANNED", "ACTIVE", "COMPLETED"]).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const accountFilter = input?.accountId
        ? { accountId: input.accountId }
        : { account: { members: { some: { userId: ctx.userId } } } };

      const budgetPlans = await ctx.prisma.budgetPlan.findMany({
        where: { ...accountFilter, ...(input?.status && { status: input.status }) },
        include: { categories: true },
        orderBy: { createdAt: "desc" },
      });

      return { budgetPlans };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertPlanAccess(ctx, input.id);

      const budgetPlan = await ctx.prisma.budgetPlan.findUnique({
        where: { id: input.id },
        include: {
          categories: true,
          transactions: { take: 50, orderBy: { date: "desc" } },
        },
      });

      return { budgetPlan };
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        name: z.string().min(1),
        type: z.enum(["TRIP", "EDUCATION", "MOVING", "EVENT", "CUSTOM"]),
        startDate: z.string().datetime(),
        endDate: z.string().datetime().optional(),
        totalLimit: z.number().positive(),
        notes: z.string().optional(),
        categories: z.array(categoryAllocationSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.accountMember.findUnique({
        where: { accountId_userId: { accountId: input.accountId, userId: ctx.userId } },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your account" });

      const { accountId, categories, startDate, endDate, ...rest } = input;
      const budgetPlan = await ctx.prisma.budgetPlan.create({
        data: {
          accountId,
          createdBy: ctx.userId,
          ...rest,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          ...(categories && {
            categories: {
              create: categories.map((c) => ({ category: c.category, limit: c.limit })),
            },
          }),
        },
        include: { categories: true },
      });

      return { budgetPlan };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().nullable().optional(),
        totalLimit: z.number().positive().optional(),
        status: z.enum(["PLANNED", "ACTIVE", "COMPLETED"]).optional(),
        notes: z.string().nullable().optional(),
        categories: z.array(categoryAllocationSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlanAccess(ctx, input.id);

      const { id, categories, startDate, endDate, ...rest } = input;

      await ctx.prisma.budgetPlan.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        },
      });

      if (categories) {
        await ctx.prisma.budgetPlanCategory.deleteMany({ where: { planId: id } });
        await ctx.prisma.budgetPlanCategory.createMany({
          data: categories.map((c) => ({ planId: id, category: c.category, limit: c.limit })),
        });
      }

      const budgetPlan = await ctx.prisma.budgetPlan.findUnique({
        where: { id },
        include: { categories: true },
      });

      return { budgetPlan };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertPlanAccess(ctx, input.id);
      await ctx.prisma.budgetPlan.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),
});
