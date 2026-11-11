
import type { FastifyPluginAsync } from "fastify";
import {
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  createOAuthState,
  createMetaAuthUrl,
  exchangeMetaCode,
  exchangeLongLivedToken,
} from "./meta.oauth.js";

import {
  getMetaAccounts,
  type ConnectedAccount,
} from "./meta.accounts.js";

type Session = {
  oauthState?: string;
  accounts: ConnectedAccount[];
  userToken?: string;
  pageTokens: Map<string, string>;
};

const sessions = new Map<string, Session>();

function equal(a?: string, b?: string) {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);

  return (
    x.length === y.length &&
    timingSafeEqual(x, y)
  );
}

function getSession(
  request: { cookies: Record<string, string | undefined> },
  reply: {
    setCookie: (name: string, value: string, options: object) => unknown;
  }
) {
  let id = request.cookies.nf_session;

  if (!id || !sessions.has(id)) {
    id = randomBytes(32).toString("hex");
    sessions.set(id, {
      accounts: [],
      pageTokens: new Map(),
    });

    reply.setCookie("nf_session", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/api/meta",
    });
  }

  return sessions.get(id)!;
}

export const metaRoutes: FastifyPluginAsync =
  async (app) => {
    // Solo para desarrollo local.
    app.addHook("onRequest", async (request, reply) => {
      const host = request.hostname.split(":")[0];

      if (host !== "localhost" && host !== "127.0.0.1") {
        return reply.code(403).send({
          error: "LOCAL_DEVELOPMENT_ONLY",
        });
      }
    });

    app.get("/status", async () => ({
      configured: Boolean(
        process.env.META_APP_ID &&
        process.env.META_APP_SECRET &&
        process.env.META_REDIRECT_URI
      ),
    }));

    app.get("/accounts", async (request, reply) => {
      const session = getSession(request, reply);
      return { accounts: session.accounts };
    });

    app.get("/connect", async (request, reply) => {
      if (
        !process.env.META_APP_ID ||
        !process.env.META_APP_SECRET
      ) {
        return reply.code(503).send({
          error: "META_NOT_CONFIGURED",
        });
      }

      const session = getSession(request, reply);
      const state = createOAuthState();

      session.oauthState = state;

      return reply.redirect(createMetaAuthUrl(state));
    });

    app.get<{
      Querystring: {
        code?: string;
        state?: string;
        error?: string;
      };
    }>("/callback", async (request, reply) => {
      const session = getSession(request, reply);
      const { code, state, error } = request.query;

      const expected = session.oauthState;
      session.oauthState = undefined;

      if (!equal(state, expected)) {
        return reply.code(400).send({
          error: "INVALID_OAUTH_STATE",
        });
      }

      if (error || !code) {
        return reply.redirect(
          `${process.env.FRONTEND_URL}/accounts?meta=denied`
        );
      }

      try {
        const shortToken = await exchangeMetaCode(code);

        let token = shortToken.access_token;

        try {
          const longToken =
            await exchangeLongLivedToken(token);

          token = longToken.access_token;
        } catch {
          app.log.warn(
            "No se obtuvo token de larga duración"
          );
        }

        const result = await getMetaAccounts(token);

        session.userToken = token;
        session.accounts = result.accounts;
        session.pageTokens = new Map(
          result.pages
            .filter((p) => p.access_token)
            .map((p) => [p.id, p.access_token!])
        );

        return reply.redirect(
          `${process.env.FRONTEND_URL}/accounts?meta=connected`
        );
      } catch (err) {
        app.log.error(
          { err },
          "Error conectando cuentas de Meta"
        );

        return reply.redirect(
          `${process.env.FRONTEND_URL}/accounts?meta=error`
        );
      }
    });

    app.post("/disconnect", async (request, reply) => {
      const session = getSession(request, reply);

      session.accounts = [];
      session.userToken = undefined;
      session.pageTokens.clear();

      return { success: true };
    });
  };
