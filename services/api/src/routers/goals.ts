import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

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
        name: z.string().min(1),
        targetAmount: z.number().positive(),
        savedAmount: z.number().min(0).default(0),
        deadline: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.prisma.goal.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          targetAmount: input.targetAmount,
          savedAmount: input.savedAmount,
          deadline: input.deadline ? new Date(input.deadline) : null,
        },
      });

      return { goal };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        targetAmount: z.number().positive().optional(),
        savedAmount: z.number().min(0).optional(),
        deadline: z.string().datetime().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your goal" });
      }

      const { id, deadline, ...rest } = input;
      const goal = await ctx.prisma.goal.update({
        where: { id },
        data: {
          ...rest,
          ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
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
