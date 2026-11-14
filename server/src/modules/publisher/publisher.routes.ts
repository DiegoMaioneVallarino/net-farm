import type { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { db } from "../../database/database.js";
import { decryptToken } from "../../database/encryption.js";

const imageDir = resolve(process.cwd(), "data", "images");
const COOKIE_NAME = "nf_session_v2"; // Debe coincidir con meta.routes.ts

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

type ImageRow = {
  id: string;
  filename: string;
  mime_type: string;
  original_name: string;
};

type PageRow = {
  page_token_encrypted: string;
};

export async function publisherRoutes(app: FastifyInstance) {
  await mkdir(imageDir, { recursive: true });

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  });

  db.exec(`
    CREATE TABLE IF NOT EXISTS publisher_images (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id)
        REFERENCES meta_sessions(id)
        ON DELETE CASCADE
    );
  `);

  function sessionId(request: {
    cookies: Record<string, string | undefined>;
  }) {
    const id = request.cookies[COOKIE_NAME];
    if (!id) return null;

    const session = db.prepare(
      "SELECT id FROM meta_sessions WHERE id = ?"
    ).get(id);

    return session ? id : null;
  }

  app.post("/images", async (request, reply) => {
    const session = sessionId(request);
    if (!session) return reply.code(401).send({ error: "Sin sesión" });

    const file = await request.file();
    if (!file || !allowed.has(file.mimetype)) {
      return reply.code(400).send({ error: "Imagen inválida" });
    }

    const bytes = await file.toBuffer();
    const id = randomUUID();
    const extension =
      file.mimetype === "image/png" ? ".png" :
      file.mimetype === "image/webp" ? ".webp" : ".jpg";
    const filename = id + extension;

    await writeFile(resolve(imageDir, filename), bytes, {
      flag: "wx",
    });

    db.prepare(`
      INSERT INTO publisher_images
      (id, session_id, filename, original_name, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id, session, filename, file.filename,
      file.mimetype, Date.now()
    );

    return { id, name: file.filename };
  });

  app.get("/images", async (request, reply) => {
    const session = sessionId(request);
    if (!session) return reply.code(401).send({ error: "Sin sesión" });

    const images = db.prepare(`
      SELECT id, original_name AS name
      FROM publisher_images
      WHERE session_id = ?
      ORDER BY created_at DESC
    `).all(session);

    return { images };
  });

  app.get<{ Params: { id: string } }>(
    "/images/:id",
    async (request, reply) => {
      const session = sessionId(request);
      if (!session) return reply.code(401).send({ error: "Sin sesión" });

      const image = db.prepare(`
        SELECT * FROM publisher_images
        WHERE id = ? AND session_id = ?
      `).get(request.params.id, session) as ImageRow | undefined;

      if (!image) return reply.code(404).send();

      const bytes = await readFile(resolve(imageDir, image.filename));
      return reply
        .header("Cache-Control", "private, no-store")
        .type(image.mime_type)
        .send(bytes);
    }
  );

  app.post<{
    Body: { imageId: string; pageId: string; caption?: string };
  }>("/publish", async (request, reply) => {
    const session = sessionId(request);
    if (!session) return reply.code(401).send({ error: "Sin sesión" });

    const { imageId, pageId, caption = "" } = request.body ?? {};
    if (!imageId || !pageId || typeof caption !== "string") {
      return reply.code(400).send({ error: "Datos inválidos" });
    }

    const image = db.prepare(`
      SELECT * FROM publisher_images
      WHERE id = ? AND session_id = ?
    `).get(imageId, session) as ImageRow | undefined;

    const page = db.prepare(`
      SELECT page_token_encrypted
      FROM meta_accounts
      WHERE session_id = ? AND id = ? AND platform = 'facebook'
    `).get(session, pageId) as PageRow | undefined;

    if (!image || !page?.page_token_encrypted) {
      return reply.code(404).send({
        error: "Imagen o página no disponible",
      });
    }

    const token = decryptToken(page.page_token_encrypted);
    const bytes = await readFile(resolve(imageDir, image.filename));

    const form = new FormData();
    form.set("source", new Blob([new Uint8Array(bytes)], {
      type: image.mime_type,
    }), image.filename);
    form.set("caption", caption);
    form.set("published", "true");

    const version = process.env.META_GRAPH_VERSION ?? "v25.0";
    const response = await fetch(
      `https://graph.facebook.com/${version}/${pageId}/photos`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );

    const result = await response.json() as {
      id?: string;
      post_id?: string;
      error?: { code?: number; message?: string };
    };

    if (!response.ok) {
      app.log.warn({
        status: response.status,
        metaCode: result.error?.code,
      }, "Meta rechazó la publicación");

      return reply.code(502).send({
        error: "Meta rechazó la publicación",
        metaCode: result.error?.code,
        detail: result.error?.message,
      });
    }

    return {
      success: true,
      photoId: result.id,
      postId: result.post_id,
    };
  });
}