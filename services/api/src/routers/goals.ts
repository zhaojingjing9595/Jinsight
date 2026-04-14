import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

export const goalsRouter = router({
  list: protectedProcedure.query(async () => {
    // TODO: implement with Prisma
    return { goals: [] };
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { goal: null, id: input.id };
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
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { id: "placeholder", ...input };
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
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { id: input.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { deleted: input.id };
    }),
});
