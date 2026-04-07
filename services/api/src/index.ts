import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./routers/index";
import type { Context } from "./lib/trpc";

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
    createContext: (): Context => ({
      // TODO: extract userId from Supabase JWT
      userId: null,
    }),
  },
});

server.get("/health", async () => ({ status: "ok", app: "jinsight-api" }));

const port = Number(process.env.PORT ?? 3001);
await server.listen({ port, host: "0.0.0.0" });
console.log(`Jinsight API running on http://localhost:${port}`);
