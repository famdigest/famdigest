import "./loadEnv";

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import split2 from "split2";
import pump from "pump";

import digestRoutes from "./routes/digests";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(timezone);
dayjs.extend(utc);

export const fastify = Fastify({ logger: true, bodyLimit: 10 * 1024 * 1024 });

fastify.register(fastifyMultipart);

fastify.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

fastify.addContentTypeParser("*", (_request, payload, done) => {
  done(null, pump(payload, split2(JSON.parse)));
});

fastify.get("/", async () => {
  return {
    status: "ok",
    serverTime: dayjs().toISOString(),
    timezone: dayjs().tz().format("Z"),
  };
});

fastify.get("/healthz", async () => {
  return {
    status: "ok",
  };
});

fastify.register(digestRoutes);

const start = async () => {
  try {
    await fastify.listen({
      port: (process.env.PORT as unknown as number) || 3001,
      host: process.env.HOST || "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
