import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";

export const accountsRouter = router({
  list: protectedProcedure.query(async () => {
    // TODO: implement with Prisma
    // return accounts owned by ctx.userId + accounts where userId is an AccountMember
    return { accounts: [] };
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: implement with Prisma
      return { account: null };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["PERSONAL", "SHARED"]).default("PERSONAL"),
        balance: z.number().default(0),
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
        balance: z.number().optional(),
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

  addMember: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { accountId: input.accountId, userId: input.userId };
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: implement with Prisma
      return { removed: true };
    }),
});
