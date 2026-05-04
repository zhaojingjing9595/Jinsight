import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "../lib/trpc";

const GoalTypeEnum = z.enum(["TRIP_EVENT", "PURCHASE", "EMERGENCY", "DEBT", "CUSTOM"]);
const GoalStatusEnum = z.enum(["PLANNING", "SAVING", "ACTIVE", "COMPLETE"]);

const SpendingPlanItem = z.object({
  category: z.string(),
  budget: z.number().min(0),
  actual: z.number().min(0).default(0),
});

async function assertGoalAccess(ctx: { userId: string; prisma: any }, goalId: string) {
  const goal = await ctx.prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new TRPCError({ code: "NOT_FOUND", message: "Goal not found" });

  const member = await ctx.prisma.accountMember.findUnique({
    where: { accountId_userId: { accountId: goal.accountId, userId: ctx.userId } },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your goal" });

  return goal;
}

export const goalsRouter = router({
  list: protectedProcedure
    .input(z.object({ accountId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.accountId
        ? { accountId: input.accountId }
        : { account: { members: { some: { userId: ctx.userId } } } };

      const goals = await ctx.prisma.goal.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return { goals };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const goal = await assertGoalAccess(ctx, input.id);
      return { goal };
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        type: GoalTypeEnum,
        name: z.string().min(1),
        emoji: z.string().default("🎯"),
        targetAmount: z.number().positive(),
        savedAmount: z.number().min(0).default(0),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        status: GoalStatusEnum.default("SAVING"),
        spendingPlan: z.array(SpendingPlanItem).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.accountMember.findUnique({
        where: { accountId_userId: { accountId: input.accountId, userId: ctx.userId } },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your account" });

      const { accountId, startDate, endDate, spendingPlan, ...rest } = input;
      const goal = await ctx.prisma.goal.create({
        data: {
          accountId,
          createdBy: ctx.userId,
          ...rest,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          spendingPlan: spendingPlan ?? undefined,
        },
      });

      return { goal };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: GoalTypeEnum.optional(),
        name: z.string().min(1).optional(),
        emoji: z.string().optional(),
        targetAmount: z.number().positive().optional(),
        savedAmount: z.number().min(0).optional(),
        startDate: z.string().datetime().nullable().optional(),
        endDate: z.string().datetime().nullable().optional(),
        status: GoalStatusEnum.optional(),
        spendingPlan: z.array(SpendingPlanItem).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertGoalAccess(ctx, input.id);

      const { id, startDate, endDate, spendingPlan, ...rest } = input;
      const goal = await ctx.prisma.goal.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          ...(spendingPlan !== undefined && { spendingPlan: spendingPlan === null ? Prisma.DbNull : spendingPlan }),
        },
      });

      return { goal };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertGoalAccess(ctx, input.id);
      await ctx.prisma.goal.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: GoalStatusEnum }))
    .mutation(async ({ ctx, input }) => {
      await assertGoalAccess(ctx, input.id);
      const goal = await ctx.prisma.goal.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return { goal };
    }),
});
