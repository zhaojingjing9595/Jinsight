import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

const RECURRENCE = z.enum(["MONTHLY", "ANNUAL", "WEEKLY", "CUSTOM"]);

function rollForward(date: Date, recurrence: "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM"): Date {
  const d = new Date(date);
  switch (recurrence) {
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      return d;
    case "ANNUAL":
      d.setFullYear(d.getFullYear() + 1);
      return d;
    case "MONTHLY":
    case "CUSTOM":
    default:
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}

function rollBackward(date: Date, recurrence: "MONTHLY" | "ANNUAL" | "WEEKLY" | "CUSTOM"): Date {
  const d = new Date(date);
  switch (recurrence) {
    case "WEEKLY":
      d.setDate(d.getDate() - 7);
      return d;
    case "ANNUAL":
      d.setFullYear(d.getFullYear() - 1);
      return d;
    case "MONTHLY":
    case "CUSTOM":
    default:
      d.setMonth(d.getMonth() - 1);
      return d;
  }
}

export const billsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["all", "upcoming", "paid", "overdue"]).optional(),
          limit: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const status = input?.status ?? "all";
      const now = new Date();

      const where: Record<string, unknown> = { userId: ctx.userId };
      if (status === "paid") where.isPaid = true;
      if (status === "upcoming") {
        where.isPaid = false;
        where.dueDate = { gte: now };
      }
      if (status === "overdue") {
        where.isPaid = false;
        where.dueDate = { lt: now };
      }

      const bills = await ctx.prisma.bill.findMany({
        where,
        orderBy: { dueDate: "asc" },
        take: input?.limit,
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
        category: z.string().default("utilities"),
        recurrence: RECURRENCE.default("MONTHLY"),
        isRecurring: z.boolean().default(true),
        isSubscription: z.boolean().default(false),
        reminderDays: z.number().int().min(0).max(60).default(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.prisma.bill.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          amount: input.amount,
          dueDate: new Date(input.dueDate),
          category: input.category,
          recurrence: input.recurrence,
          isRecurring: input.isRecurring,
          isSubscription: input.isSubscription,
          reminderDays: input.reminderDays,
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
        category: z.string().optional(),
        recurrence: RECURRENCE.optional(),
        isRecurring: z.boolean().optional(),
        isSubscription: z.boolean().optional(),
        reminderDays: z.number().int().min(0).max(60).optional(),
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

  markPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bill.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your bill" });
      }

      const now = new Date();

      if (existing.isRecurring) {
        const nextDue = rollForward(existing.dueDate, existing.recurrence);
        const bill = await ctx.prisma.bill.update({
          where: { id: input.id },
          data: {
            lastPaidDate: now,
            lastPaidAmount: null,
            dueDate: nextDue,
            isPaid: false,
          },
        });
        return { bill };
      }

      const bill = await ctx.prisma.bill.update({
        where: { id: input.id },
        data: { isPaid: true, lastPaidDate: now, lastPaidAmount: null },
      });
      return { bill };
    }),

  /** Overrides amount shown for the latest payment row only; does not change recurring bill template `amount`. */
  updatePaymentAmount: protectedProcedure
    .input(z.object({ id: z.string(), amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bill.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your bill" });
      }

      if (!existing.lastPaidDate) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Bill has no payment to edit" });
      }

      const bill = await ctx.prisma.bill.update({
        where: { id: input.id },
        data: { lastPaidAmount: input.amount },
      });

      return { bill };
    }),

  /** Clears last payment — bill becomes unpaid and recurring due date rolls back one period if applicable. */
  revertPayment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.bill.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your bill" });
      }

      if (!existing.lastPaidDate) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No payment to revert" });
      }

      if (existing.isRecurring) {
        const prevDue = rollBackward(existing.dueDate, existing.recurrence);
        const bill = await ctx.prisma.bill.update({
          where: { id: input.id },
          data: {
            lastPaidDate: null,
            lastPaidAmount: null,
            dueDate: prevDue,
            isPaid: false,
          },
        });
        return { bill };
      }

      const bill = await ctx.prisma.bill.update({
        where: { id: input.id },
        data: {
          isPaid: false,
          lastPaidDate: null,
          lastPaidAmount: null,
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
