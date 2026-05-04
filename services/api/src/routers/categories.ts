import { TRPCError } from "@trpc/server";
import { z, router, protectedProcedure } from "../lib/trpc";

function slugify(name: string): string {
  return "custom_" + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function getAccountId(ctx: { userId: string; prisma: any }): Promise<string> {
  const member = await ctx.prisma.accountMember.findFirst({
    where: { userId: ctx.userId },
    select: { accountId: true },
  });
  if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "No account found" });
  return member.accountId;
}

export const categoriesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const accountId = await getAccountId(ctx);
    const categories = await ctx.prisma.customCategory.findMany({
      where: { accountId },
      orderBy: { createdAt: "asc" },
    });
    return { categories };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50).trim(),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#d4d4d4"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const accountId = await getAccountId(ctx);
      const slug = slugify(input.name);

      const existing = await ctx.prisma.customCategory.findFirst({
        where: { accountId, name: { equals: input.name, mode: "insensitive" } },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A category with this name already exists" });
      }

      const category = await ctx.prisma.customCategory.create({
        data: { accountId, name: input.name, color: input.color },
      });
      return { category, slug };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const accountId = await getAccountId(ctx);
      const cat = await ctx.prisma.customCategory.findUnique({ where: { id: input.id } });
      if (!cat || cat.accountId !== accountId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }
      await ctx.prisma.customCategory.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
