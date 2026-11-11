import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";

import { db } from "../../database/database.js";
import {
  encryptToken,
} from "../../database/encryption.js";

import {
  createMetaAuthUrl,
  exchangeMetaCode,
  exchangeLongLivedToken,
} from "./meta.oauth.js";

import { getMetaAccounts } from "./meta.accounts.js";

const COOKIE_NAME = "nf_session";

type SessionRow = {
  id: string;
  oauth_state: string | null;
  user_token_encrypted: string | null;
  token_expires_at: number | null;
};

type AccountRow = {
  id: string;
  platform: string;
  name: string;
  username: string | null;
  page_id: string | null;
  page_token_encrypted: string | null;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function createSessionId(): string {
  return randomBytes(32).toString("hex");
}

function getSession(id: string): SessionRow | undefined {
  return db.prepare(`
    SELECT *
    FROM meta_sessions
    WHERE id = ?
  `).get(id) as SessionRow | undefined;
}

function ensureSession(
  request: {
    cookies: Record<string, string | undefined>;
  },
  reply: {
    setCookie: (
      name: string,
      value: string,
      options: typeof cookieOptions & { maxAge: number }
    ) => unknown;
  }
): string {
  const existingId = request.cookies[COOKIE_NAME];

  if (existingId && getSession(existingId)) {
    return existingId;
  }

  const id = createSessionId();
  const now = Date.now();

  db.prepare(`
    INSERT INTO meta_sessions (
      id, created_at, updated_at
    )
    VALUES (?, ?, ?)
  `).run(id, now, now);

  reply.setCookie(COOKIE_NAME, id, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  return id;
}

export async function metaRoutes(app: FastifyInstance) {
  app.get("/connect", async (request, reply) => {
    const sessionId = ensureSession(
      request,
      reply
    );

    const state = randomBytes(32).toString("hex");

    db.prepare(`
      UPDATE meta_sessions
      SET oauth_state = ?,
          updated_at = ?
      WHERE id = ?
    `).run(state, Date.now(), sessionId);

    return reply.redirect(createMetaAuthUrl(state));
  });

  app.get<{
    Querystring: {
      code?: string;
      state?: string;
      error?: string;
    };
  }>("/callback", async (request, reply) => {
    const sessionId = request.cookies[COOKIE_NAME];

    if (!sessionId) {
      return reply.code(400).send({
        error: "Sesión OAuth no encontrada",
      });
    }

    const session = getSession(sessionId);

    if (
      !session ||
      !session.oauth_state ||
      !request.query.state ||
      session.oauth_state !== request.query.state ||
      !request.query.code
    ) {
      return reply.code(400).send({
        error: "Estado OAuth inválido",
      });
    }

    // Consumimos el state para evitar reutilizarlo.
    db.prepare(`
      UPDATE meta_sessions
      SET oauth_state = NULL,
          updated_at = ?
      WHERE id = ?
    `).run(Date.now(), sessionId);

    try {
      const shortToken = await exchangeMetaCode(
        request.query.code
      );

      const longToken = await exchangeLongLivedToken(
        shortToken.access_token
      );

      const token = longToken.access_token;

      const result = await getMetaAccounts(token);

      const expiresAt = longToken.expires_in
        ? Date.now() + longToken.expires_in * 1000
        : null;

      const saveAccounts = db.transaction(() => {
        db.prepare(`
          UPDATE meta_sessions
          SET user_token_encrypted = ?,
              token_expires_at = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          encryptToken(token),
          expiresAt,
          Date.now(),
          sessionId
        );

        db.prepare(`
          DELETE FROM meta_accounts
          WHERE session_id = ?
        `).run(sessionId);

        const insert = db.prepare(`
          INSERT INTO meta_accounts (
            session_id,
            id,
            platform,
            name,
            username,
            page_id,
            page_token_encrypted
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const account of result.accounts) {
          insert.run(
            sessionId,
            account.id,
            account.platform,
            account.name,
            null,
            null
          );
        }

        // Guardamos las credenciales de cada página
        // sin devolverlas al frontend.
        for (const page of result.pages) {
          db.prepare(`
            UPDATE meta_accounts
            SET page_id = ?,
                page_token_encrypted = ?
            WHERE session_id = ?
              AND id = ?
              AND platform = 'facebook'
          `).run(
            page.id,
            page.access_token
              ? encryptToken(page.access_token)
              : null,
            sessionId,
            page.id
          );
        }
      });

      saveAccounts();

      const frontend =
        process.env.FRONTEND_URL ??
        "http://localhost:5173";

      return reply.redirect(
        `${frontend}/accounts?meta=connected`
      );
    } catch (error) {
      app.log.error(error, "Error conectando Meta");

      return reply.code(502).send({
        error: "No se pudo completar la conexión con Meta",
      });
    }
  });

  app.get("/accounts", async (request) => {
    const sessionId = request.cookies[COOKIE_NAME];

    if (!sessionId || !getSession(sessionId)) {
      return { accounts: [] };
    }

    const rows = db.prepare(`
      SELECT id, platform, name, username
      FROM meta_accounts
      WHERE session_id = ?
      ORDER BY name
    `).all(sessionId) as Array<
      Pick<AccountRow, "id" | "platform" | "name" | "username">
    >;

    return {
      accounts: rows.map((row) => ({
        id: row.id,
        platform: row.platform,
        name: row.name,
        username: row.username,
      })),
    };
  });

  app.get("/status", async (request) => {
    const sessionId = request.cookies[COOKIE_NAME];

    if (!sessionId) {
      return { connected: false };
    }

    const session = getSession(sessionId);

    const connected = Boolean(
      session?.user_token_encrypted &&
      (!session.token_expires_at ||
        session.token_expires_at > Date.now())
    );

    return { connected };
  });

  app.post("/disconnect", async (request, reply) => {
    const sessionId = request.cookies[COOKIE_NAME];

    if (sessionId) {
      db.prepare(`
        DELETE FROM meta_sessions
        WHERE id = ?
      `).run(sessionId);
    }

    reply.clearCookie(COOKIE_NAME, {
      path: "/",
    });

    return { success: true };
  });
}