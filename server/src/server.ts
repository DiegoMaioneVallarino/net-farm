
import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";

import { metaRoutes } from "./modules/meta/meta.routes.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
});

await app.register(cookie);

app.get("/api/health", async () => {
  return {
    status: "ok",
    service: "net-farm-api",
    version: "0.1.0",
  };
});

await app.register(metaRoutes, {
  prefix: "/api/meta",
});

const PORT = Number(process.env.PORT ?? 3001);

try {
  await app.listen({
    port: PORT,
    host: "127.0.0.1",
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
