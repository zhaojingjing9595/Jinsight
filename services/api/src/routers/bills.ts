import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

export const billsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        isPaid: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { bills: [], input };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { bill: null, id: input.id };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        amount: z.number().positive(),
        dueDate: z.string().datetime(),
        isRecurring: z.boolean().default(false),
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
        amount: z.number().positive().optional(),
        dueDate: z.string().datetime().optional(),
        isRecurring: z.boolean().optional(),
        isPaid: z.boolean().optional(),
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
