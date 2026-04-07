import { initTRPC } from "@trpc/server";
import { z } from "zod";

export type Context = {
  userId: string | null;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error("UNAUTHORIZED");
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export { z };
