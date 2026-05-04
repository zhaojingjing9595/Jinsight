import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib/trpc";
import { supabaseAdmin } from "../lib/supabase";

export const usersRouter = router({
  /** Return the current user's profile. */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      include: { accountMembers: { include: { account: true } } },
    });
    // Flatten to match existing API shape (user.accounts)
    const shaped = user ? {
      ...user,
      accounts: user.accountMembers.map((m) => m.account),
    } : null;

    if (!shaped) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found. Call auth.register first.",
      });
    }

    return { user: shaped };
  }),

  /** Update display name, preferred currency, or persona tag. */
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        currency: z.string().length(3).optional(),
        persona: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: input,
      });

      return { user };
    }),

  /**
   * Permanently delete the account.
   * Removes the Prisma User row (cascades to all data) then deletes the
   * Supabase auth user so the email can be re-used.
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.delete({ where: { id: ctx.userId } });

    const { error } = await supabaseAdmin.auth.admin.deleteUser(ctx.userId);
    if (error) {
      // Log but don't fail — Prisma data is already gone.
      console.error("Failed to delete Supabase auth user:", error.message);
    }

    return { deleted: true };
  }),
});
