import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

async function assertMember(ctx: { userId: string; prisma: any }, accountId: string) {
  const member = await ctx.prisma.accountMember.findUnique({
    where: { accountId_userId: { accountId, userId: ctx.userId } },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not your account" });
  return member;
}

async function assertOwner(ctx: { userId: string; prisma: any }, accountId: string) {
  const member = await assertMember(ctx, accountId);
  if (member.role !== "OWNER") throw new TRPCError({ code: "FORBIDDEN", message: "Only the owner can do this" });
  return member;
}

export const accountsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.prisma.account.findMany({
      where: { members: { some: { userId: ctx.userId } } },
      include: { members: true },
      orderBy: { createdAt: "asc" },
    });

    return { accounts };
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findUnique({
        where: { id: input.id },
        include: { members: true, transactions: { take: 20, orderBy: { date: "desc" } } },
      });

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const isMember = account.members.some((m: { userId: string }) => m.userId === ctx.userId);
      if (!isMember) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your account" });
      }

      return { account };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["PERSONAL", "SHARED"]).default("PERSONAL"),
        balance: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.create({
        data: {
          name: input.name,
          type: input.type,
          balance: input.balance,
          members: {
            create: { userId: ctx.userId, role: "OWNER" },
          },
        },
        include: { members: true },
      });

      return { account };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        balance: z.number().optional(),
        openingBalance: z.number().optional(),
        openingBalanceSources: z
          .array(z.object({ label: z.string(), amount: z.number() }))
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertMember(ctx, input.id);

      const { id, ...data } = input;
      const account = await ctx.prisma.account.update({ where: { id }, data });

      return { account };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx, input.id);

      await ctx.prisma.account.delete({ where: { id: input.id } });
      return { deleted: input.id };
    }),

  addMember: protectedProcedure
    .input(z.object({ accountId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx, input.accountId);

      const member = await ctx.prisma.accountMember.create({
        data: { accountId: input.accountId, userId: input.userId, role: "MEMBER" },
      });

      return { member };
    }),

  removeMember: protectedProcedure
    .input(z.object({ accountId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx, input.accountId);

      await ctx.prisma.accountMember.delete({
        where: { accountId_userId: { accountId: input.accountId, userId: input.userId } },
      });

      return { removed: true };
    }),
});
