import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

const categoryAllocationSchema = z.object({
  category: z.string(),
  limit: z.number().positive(),
});

async function assertOwner(ctx: { userId: string; prisma: any }, planId: string) {
  const membership = await ctx.prisma.budgetPlanMember.findUnique({
    where: { planId_userId: { planId, userId: ctx.userId } },
  });
  if (!membership || membership.role !== "OWNER") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only the plan owner can do this" });
  }
}

export const budgetPlansRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PLANNED", "ACTIVE", "COMPLETED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const budgetPlans = await ctx.prisma.budgetPlan.findMany({
        where: {
          members: { some: { userId: ctx.userId } },
          ...(input.status && { status: input.status }),
        },
        include: { members: true, categories: true },
        orderBy: { createdAt: "desc" },
      });

      return { budgetPlans };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const budgetPlan = await ctx.prisma.budgetPlan.findUnique({
        where: { id: input.id },
        include: {
          members: true,
          categories: true,
          transactions: { take: 50, orderBy: { date: "desc" } },
        },
      });

      if (!budgetPlan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget plan not found" });
      }

      return { budgetPlan };
    }),

  create: protectedProcedure
    .input(
      z.object({
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
      const budgetPlan = await ctx.prisma.budgetPlan.create({
        data: {
          name: input.name,
          type: input.type,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
          totalLimit: input.totalLimit,
          notes: input.notes,
          createdBy: ctx.userId,
          members: {
            create: { userId: ctx.userId, role: "OWNER" },
          },
          ...(input.categories && {
            categories: {
              create: input.categories.map((c) => ({
                category: c.category,
                limit: c.limit,
              })),
            },
          }),
        },
        include: { members: true, categories: true },
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
      await assertOwner(ctx, input.id);

      const { id, categories, startDate, endDate, ...rest } = input;

      const budgetPlan = await ctx.prisma.budgetPlan.update({
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

      const result = await ctx.prisma.budgetPlan.findUnique({
        where: { id },
        include: { members: true, categories: true },
      });

      return { budgetPlan: result };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx, input.id);
      await ctx.prisma.budgetPlan.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        userId: z.string(),
        role: z.enum(["OWNER", "MEMBER"]).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx, input.planId);

      const member = await ctx.prisma.budgetPlanMember.create({
        data: { planId: input.planId, userId: input.userId, role: input.role },
      });

      return { member };
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx, input.planId);

      await ctx.prisma.budgetPlanMember.delete({
        where: { planId_userId: { planId: input.planId, userId: input.userId } },
      });

      return { removed: true };
    }),
});
