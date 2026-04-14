import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

const categoryAllocationSchema = z.object({
  category: z.string(),
  limit: z.number().positive(),
});

export const budgetPlansRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PLANNED", "ACTIVE", "COMPLETED"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      // return plans where userId is a BudgetPlanMember
      return { budgetPlans: [], input };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { budgetPlan: null, id: input.id };
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
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      // create BudgetPlan, add creator as OWNER in BudgetPlanMember, insert categories
      return { id: "placeholder", ...input };
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
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma — OWNER only
      return { id: input.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma — OWNER only
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
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma — OWNER only
      return { planId: input.planId, userId: input.userId };
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma — OWNER only
      return { removed: true };
    }),
});
