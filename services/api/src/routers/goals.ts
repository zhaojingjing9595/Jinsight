import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

const GoalTypeEnum = z.enum(["TRIP_EVENT", "PURCHASE", "EMERGENCY", "DEBT", "CUSTOM"]);
const GoalStatusEnum = z.enum(["PLANNING", "SAVING", "ACTIVE", "COMPLETE"]);

const SpendingPlanItem = z.object({
  category: z.string(),
  budget: z.number().min(0),
  actual: z.number().min(0).default(0),
});

export const goalsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const goals = await ctx.prisma.goal.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });

    return { goals };
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const goal = await ctx.prisma.goal.findUnique({ where: { id: input.id } });

      if (!goal || goal.userId !== ctx.userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Goal not found" });
      }

      return { goal };
    }),

  create: protectedProcedure
    .input(
      z.object({
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
      const goal = await ctx.prisma.goal.create({
        data: {
          userId: ctx.userId,
          type: input.type,
          name: input.name,
          emoji: input.emoji,
          targetAmount: input.targetAmount,
          savedAmount: input.savedAmount,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          status: input.status,
          spendingPlan: input.spendingPlan ?? undefined,
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
      const existing = await ctx.prisma.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your goal" });
      }

      const { id, startDate, endDate, ...rest } = input;
      const goal = await ctx.prisma.goal.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        },
      });

      return { goal };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your goal" });
      }

      await ctx.prisma.goal.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),
});
