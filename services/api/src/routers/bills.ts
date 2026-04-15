import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

export const billsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        isPaid: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const bills = await ctx.prisma.bill.findMany({
        where: {
          userId: ctx.userId,
          ...(input.isPaid !== undefined && { isPaid: input.isPaid }),
        },
        orderBy: { dueDate: "asc" },
      });

      return { bills };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.findUnique({ where: { id: input.id } });

      if (!bill || bill.userId !== ctx.userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bill not found" });
      }

      return { bill };
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
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          amount: input.amount,
          dueDate: new Date(input.dueDate),
          isRecurring: input.isRecurring,
        },
      });

      return { bill };
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
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bill.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your bill" });
      }

      const { id, dueDate, ...rest } = input;
      const bill = await ctx.prisma.bill.update({
        where: { id },
        data: {
          ...rest,
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });

      return { bill };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bill.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your bill" });
      }

      await ctx.prisma.bill.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),
});
