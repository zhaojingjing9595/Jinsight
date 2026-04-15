import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./routers/index";
import type { Context } from "./lib/trpc";
import { prisma } from "./lib/prisma";
import { supabaseAdmin } from "./lib/supabase";

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: [
    "http://localhost:3000",
    "http://localhost:8081",
  ],
});

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: async ({ req }): Promise<Context> => {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return { userId: null, userEmail: null, prisma };
      }

      const token = authHeader.slice(7);
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return { userId: null, userEmail: null, prisma };
      }

      return { userId: user.id, userEmail: user.email ?? null, prisma };
    },
  },
});

server.get("/health", async () => ({ status: "ok", app: "jinsight-api" }));

const port = Number(process.env.PORT ?? 3001);
await server.listen({ port, host: "0.0.0.0" });
console.log(`Jinsight API running on http://localhost:${port}`);
