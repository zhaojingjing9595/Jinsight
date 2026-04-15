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
      const user = await ctx.prisma.user.upsert({
        where: { id: ctx.userId },
        update: {},
        create: {
          id: ctx.userId,
          email: ctx.userEmail ?? "",
          name: input.name,
          currency: input.currency,
          accounts: {
            create: {
              name: "Personal",
              type: "PERSONAL",
              balance: 0,
            },
          },
        },
        include: { accounts: true },
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
