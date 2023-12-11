import type { SessionIdStorageStrategy } from "@remix-run/node";
import { createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import crypto from "crypto";
import { db, schema, eq } from "@repo/database";
dayjs.extend(utc);

// write a encrypt methos using crypto to encrypt the session data

function encrypt(data: Record<string, any>): string {
  const algorithm = "aes-256-ctr";
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(process.env.SESSION_SECRET, "hex");

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data)),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(hash: string): Record<string, any> {
  const algorithm = "aes-256-ctr";
  const [iv, content] = hash.split(":");
  const key = Buffer.from(process.env.SESSION_SECRET, "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return JSON.parse(decrpyted.toString());
}

export function createDatabaseSessionStorage({
  cookie,
}: {
  cookie: SessionIdStorageStrategy["cookie"];
}) {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to invalidate the data somehow or
      // automatically purge this record from your database.
      const [session] = await db
        .insert(schema.sessions)
        .values({
          id: crypto.randomUUID(),
          data: encrypt(data),
          expires: dayjs(expires).utc().format(),
        })
        .returning();
      return session?.id ?? "";
    },
    async readData(id) {
      const [session] = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, id));
      return session?.data ? decrypt(session.data as string) : null;
    },
    async updateData(id, data, expires) {
      await db
        .update(schema.sessions)
        .set({
          data: encrypt(data),
          expires: dayjs(expires).utc().format(),
        })
        .where(eq(schema.sessions.id, id));
    },
    async deleteData(id) {
      await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
    },
  });
}
