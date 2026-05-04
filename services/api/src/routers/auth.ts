import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";

export const authRouter = router({
  /**
   * Called once after Supabase signup to provision the User row and a default
   * personal Account. Safe to call multiple times — uses upsert.
   */
  register: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        currency: z.string().length(3).default("ILS"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.upsert({
        where: { id: ctx.userId },
        update: {},
        create: {
          id: ctx.userId,
          email: ctx.userEmail ?? "",
          name: input.name,
          currency: input.currency,
        },
      });

      // Provision a default account if the user doesn't have one yet
      const existing = await ctx.prisma.accountMember.findFirst({
        where: { userId: ctx.userId },
        include: { account: true },
      });

      if (!existing) {
        await ctx.prisma.account.create({
          data: {
            name: "Personal",
            type: "PERSONAL",
            balance: 0,
            members: { create: { userId: ctx.userId, role: "OWNER" } },
          },
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        include: { accountMembers: { include: { account: true } } },
      });

      return { user };
    }),

  /**
   * Returns the current auth status — useful for the client to check if the
   * User row has been provisioned yet.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true },
    });

    return { provisioned: user !== null };
  }),
});
