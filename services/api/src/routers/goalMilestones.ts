import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

async function assertMilestoneAccess(ctx: { userId: string; prisma: any }, milestoneId: string) {
  const milestone = await ctx.prisma.goalMilestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });
  if (!milestone) throw new TRPCError({ code: "NOT_FOUND", message: "Milestone not found" });

  const member = await ctx.prisma.accountMember.findUnique({
    where: {
      accountId_userId: { accountId: milestone.goal.accountId, userId: ctx.userId },
    },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your goal" });

  return milestone;
}

async function assertGoalAccess(ctx: { userId: string; prisma: any }, goalId: string) {
  const goal = await ctx.prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new TRPCError({ code: "NOT_FOUND", message: "Goal not found" });

  const member = await ctx.prisma.accountMember.findUnique({
    where: { accountId_userId: { accountId: goal.accountId, userId: ctx.userId } },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your goal" });

  return goal;
}

/** Redistribute remaining amount equally among unachieved, non-custom milestones.
 * Achieved and custom milestones are locked and not recalculated. */
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

export const goalMilestonesRouter = router({
  list: protectedProcedure
    .input(z.object({ goalId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertGoalAccess(ctx, input.goalId);
      const milestones = await ctx.prisma.goalMilestone.findMany({
        where: { goalId: input.goalId },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      });
      return { milestones };
    }),

  markAchieved: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await assertMilestoneAccess(ctx, input.id);
      if (milestone.isAchieved) return { milestone };

      const updated = await ctx.prisma.goalMilestone.update({
        where: { id: input.id },
        data: { isAchieved: true, achievedAt: new Date() },
      });

      // Recalculate remaining unachieved months
      await recalcUnachieved(ctx.prisma, milestone.goalId, milestone.goal.targetAmount);

      return { milestone: updated };
    }),

  unmarkAchieved: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await assertMilestoneAccess(ctx, input.id);
      if (!milestone.isAchieved) return { milestone };

      const updated = await ctx.prisma.goalMilestone.update({
        where: { id: input.id },
        data: { isAchieved: false, achievedAt: null },
      });

      await recalcUnachieved(ctx.prisma, milestone.goalId, milestone.goal.targetAmount);

      return { milestone: updated };
    }),

  updateAmount: protectedProcedure
    .input(z.object({ id: z.string(), amount: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await assertMilestoneAccess(ctx, input.id);

      const updated = await ctx.prisma.goalMilestone.update({
        where: { id: input.id },
        data: { amount: input.amount, isCustom: true },
      });

      // If there's a linked transaction (e.g., from debt payoff), update its amount too
      await ctx.prisma.transaction.updateMany({
        where: { milestoneId: input.id },
        data: { amount: input.amount },
      });

      // Only recalculate if milestone is not achieved
      if (!milestone.isAchieved) {
        // Recalculate other AUTO (non-custom) unachieved milestones based on what remains
        const all = await ctx.prisma.goalMilestone.findMany({ where: { goalId: milestone.goalId } });
        const achieved = all.filter((m: any) => m.isAchieved);
        const custom = all.filter((m: any) => m.isCustom && !m.isAchieved && m.id !== input.id);
        const otherAuto = all.filter((m: any) => !m.isAchieved && !m.isCustom && m.id !== input.id);

        if (otherAuto.length > 0) {
          const achievedSum = achieved.reduce((s: number, m: any) => s + m.amount, 0);
          const customSum = custom.reduce((s: number, m: any) => s + m.amount, 0);
          const remaining = Math.max(0, milestone.goal.targetAmount - achievedSum - customSum - input.amount);
          const perMonth = remaining / otherAuto.length;

          await ctx.prisma.goalMilestone.updateMany({
            where: {
              goalId: milestone.goalId,
              isAchieved: false,
              isCustom: false,
              id: { not: input.id },
            },
            data: { amount: perMonth },
          });
        }
      }

      return { milestone: updated };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await assertMilestoneAccess(ctx, input.id);

      await ctx.prisma.goalMilestone.delete({ where: { id: input.id } });

      // Recalculate remaining unachieved after deletion
      if (!milestone.isAchieved) {
        await recalcUnachieved(ctx.prisma, milestone.goalId, milestone.goal.targetAmount);
      }

      return { deleted: input.id };
    }),

  create: protectedProcedure
    .input(
      z.object({
        goalId: z.string(),
        year: z.number().int().min(2000).max(2100),
        month: z.number().int().min(1).max(12),
        amount: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await assertGoalAccess(ctx, input.goalId);

      // Prevent duplicate month
      const existing = await ctx.prisma.goalMilestone.findUnique({
        where: {
          goalId_year_month: { goalId: input.goalId, year: input.year, month: input.month },
        },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A milestone for that month already exists" });
      }

      const milestone = await ctx.prisma.goalMilestone.create({
        data: {
          goalId: input.goalId,
          year: input.year,
          month: input.month,
          amount: input.amount,
          isCustom: true,
        },
      });

      // Recalculate other AUTO (non-custom) unachieved milestones accounting for the new custom one's amount
      const all = await ctx.prisma.goalMilestone.findMany({ where: { goalId: input.goalId } });
      const achieved = all.filter((m: any) => m.isAchieved);
      const custom = all.filter((m: any) => m.isCustom && !m.isAchieved && m.id !== milestone.id);
      const otherAuto = all.filter((m: any) => !m.isAchieved && !m.isCustom && m.id !== milestone.id);

      if (otherAuto.length > 0) {
        const achievedSum = achieved.reduce((s: number, m: any) => s + m.amount, 0);
        const customSum = custom.reduce((s: number, m: any) => s + m.amount, 0);
        const remaining = Math.max(0, goal.targetAmount - achievedSum - customSum - input.amount);
        const perMonth = remaining / otherAuto.length;

        await ctx.prisma.goalMilestone.updateMany({
          where: { goalId: input.goalId, isAchieved: false, isCustom: false, id: { not: milestone.id } },
          data: { amount: perMonth },
        });
      }

      return { milestone };
    }),

  resetUnachieved: protectedProcedure
    .input(z.object({ goalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const goal = await assertGoalAccess(ctx, input.goalId);

      // Reset all unachieved milestones to auto-generated (isCustom = false)
      await ctx.prisma.goalMilestone.updateMany({
        where: { goalId: input.goalId, isAchieved: false },
        data: { isCustom: false },
      });

      // Recalculate amounts
      await recalcUnachieved(ctx.prisma, input.goalId, goal.targetAmount);

      // Return updated milestones
      const milestones = await ctx.prisma.goalMilestone.findMany({
        where: { goalId: input.goalId },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      });

      return { milestones };
    }),
});
