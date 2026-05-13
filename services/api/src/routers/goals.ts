import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "../lib/trpc";
import { buildMilestones } from "../lib/goalMilestones";

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

/**
 * Recalculate unachieved milestone amounts after a change.
 * Achieved and custom rows are locked; remaining budget is split equally among auto-generated unachieved rows.
 */
async function recalcUnachieved(prisma: any, goalId: string, targetAmount: number) {
  const all = await prisma.goalMilestone.findMany({ where: { goalId } });
  const achieved = all.filter((m: any) => m.isAchieved);
  const custom = all.filter((m: any) => m.isCustom && !m.isAchieved);
  const autoUnachieved = all.filter((m: any) => !m.isAchieved && !m.isCustom);

  if (autoUnachieved.length === 0) return;

  const achievedSum = achieved.reduce((s: number, m: any) => s + m.amount, 0);
  const customSum = custom.reduce((s: number, m: any) => s + m.amount, 0);
  const remaining = Math.max(0, targetAmount - achievedSum - customSum);
  const perMonth = remaining / autoUnachieved.length;

  await prisma.goalMilestone.updateMany({
    where: { goalId, isAchieved: false, isCustom: false },
    data: { amount: perMonth },
  });
}

/** Compute savedAmount from achieved milestones for the API response. */
async function computeSavedAmount(prisma: any, goalId: string): Promise<number> {
  const result = await prisma.goalMilestone.aggregate({
    where: { goalId, isAchieved: true },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

function attachSavedAmount(goal: any, savedAmount: number) {
  return { ...goal, savedAmount };
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
        include: {
          milestones: { select: { amount: true, isAchieved: true } },
        },
      });

      const goalsWithSaved = goals.map((g: any) => {
        const savedAmount = g.milestones
          .filter((m: any) => m.isAchieved)
          .reduce((s: number, m: any) => s + m.amount, 0);
        const { milestones, ...rest } = g;
        return { ...rest, savedAmount };
      });

      return { goals: goalsWithSaved };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertGoalAccess(ctx, input.id);
      const goal = await ctx.prisma.goal.findUnique({
        where: { id: input.id },
        include: { milestones: { orderBy: [{ year: "asc" }, { month: "asc" }] } },
      });
      const savedAmount = await computeSavedAmount(ctx.prisma, input.id);
      return { goal: attachSavedAmount(goal, savedAmount) };
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        type: GoalTypeEnum,
        name: z.string().min(1),
        emoji: z.string().default("🎯"),
        targetAmount: z.number().positive(),
        startDate: z.string().datetime(),
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
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;

      const goal = await ctx.prisma.goal.create({
        data: {
          accountId,
          createdBy: ctx.userId,
          ...rest,
          startDate: start,
          endDate: end,
          spendingPlan: spendingPlan ?? undefined,
        },
      });

      // Auto-generate milestones when both dates are set
      if (end) {
        const milestones = buildMilestones(goal.id, start, end, input.targetAmount);
        if (milestones.length > 0) {
          await ctx.prisma.goalMilestone.createMany({ data: milestones });
        }
      }

      return { goal: attachSavedAmount(goal, 0) };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: GoalTypeEnum.optional(),
        name: z.string().min(1).optional(),
        emoji: z.string().optional(),
        targetAmount: z.number().positive().optional(),
        startDate: z.string().datetime().nullable().optional(),
        endDate: z.string().datetime().nullable().optional(),
        status: GoalStatusEnum.optional(),
        spendingPlan: z.array(SpendingPlanItem).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await assertGoalAccess(ctx, input.id);

      const { id, startDate, endDate, spendingPlan, ...rest } = input;

      const newStartDate = startDate !== undefined
        ? (startDate ? new Date(startDate) : existing.startDate)
        : existing.startDate;
      const newEndDate = endDate !== undefined
        ? (endDate ? new Date(endDate) : null)
        : existing.endDate;
      const newTarget = rest.targetAmount ?? existing.targetAmount;

      const goal = await ctx.prisma.goal.update({
        where: { id },
        data: {
          ...rest,
          startDate: newStartDate,
          ...(endDate !== undefined && { endDate: newEndDate }),
          ...(spendingPlan !== undefined && { spendingPlan: spendingPlan === null ? Prisma.DbNull : spendingPlan }),
        },
      });

      const targetChanged = rest.targetAmount !== undefined && rest.targetAmount !== existing.targetAmount;
      const endDateChanged = endDate !== undefined && String(newEndDate) !== String(existing.endDate);
      const startDateChanged = startDate !== undefined && String(newStartDate) !== String(existing.startDate);

      if (endDateChanged || startDateChanged) {
        // Regenerate unachieved auto-generated milestones for the new date range,
        // preserving achieved and custom ones.
        const achieved = await ctx.prisma.goalMilestone.findMany({
          where: { goalId: id, isAchieved: true },
        });
        const custom = await ctx.prisma.goalMilestone.findMany({
          where: { goalId: id, isCustom: true, isAchieved: false },
        });
        await ctx.prisma.goalMilestone.deleteMany({ where: { goalId: id, isAchieved: false, isCustom: false } });

        if (newEndDate) {
          const achievedSum = achieved.reduce((s: number, m: any) => s + m.amount, 0);
          const customSum = custom.reduce((s: number, m: any) => s + m.amount, 0);
          const remaining = Math.max(0, newTarget - achievedSum - customSum);
          const newMilestones = buildMilestones(id, newStartDate, newEndDate, remaining);
          // Skip months that already have an achieved or custom row
          const preservedKeys = new Set(
            [...achieved, ...custom].map((m: any) => `${m.year}-${m.month}`)
          );
          const toInsert = newMilestones.filter((m) => !preservedKeys.has(`${m.year}-${m.month}`));
          if (toInsert.length > 0) {
            await ctx.prisma.goalMilestone.createMany({ data: toInsert, skipDuplicates: true });
          }
        }
      } else if (targetChanged) {
        await recalcUnachieved(ctx.prisma, id, newTarget);
      }

      const savedAmount = await computeSavedAmount(ctx.prisma, id);
      return { goal: attachSavedAmount(goal, savedAmount) };
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
      const savedAmount = await computeSavedAmount(ctx.prisma, input.id);
      return { goal: attachSavedAmount(goal, savedAmount) };
    }),
});
