
import { randomBytes } from "node:crypto";

const permissions = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
];

const version =
  process.env.META_GRAPH_VERSION ?? "v25.0";

const graphUrl =
  `https://graph.facebook.com/${version}`;

export function createOAuthState(): string {
  return randomBytes(32).toString("hex");
}

export function createMetaAuthUrl(
  state: string
): string {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    throw new Error(
      "Faltan META_APP_ID o META_REDIRECT_URI"
    );
  }

  const url = new URL(
    `https://www.facebook.com/${version}/dialog/oauth`
  );

  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", permissions.join(","));
  url.searchParams.set("state", state);

  return url.toString();
}

type MetaTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

async function requestToken(
  url: URL
): Promise<MetaTokenResponse> {
  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      `Meta OAuth error: ${response.status}`
    );
  }

  return data as MetaTokenResponse;
}

// Intercambiar código OAuth por token de usuario
export async function exchangeMetaCode(
  code: string
): Promise<MetaTokenResponse> {
  const url = new URL(
    `${graphUrl}/oauth/access_token`
  );

  url.searchParams.set(
    "client_id",
    process.env.META_APP_ID!
  );

  url.searchParams.set(
    "client_secret",
    process.env.META_APP_SECRET!
  );

  url.searchParams.set(
    "redirect_uri",
    process.env.META_REDIRECT_URI!
  );

  url.searchParams.set("code", code);

  return requestToken(url);
}

// Solicitar token de mayor duración
export async function exchangeLongLivedToken(
  shortToken: string
): Promise<MetaTokenResponse> {
  const url = new URL(
    `${graphUrl}/oauth/access_token`
  );

  url.searchParams.set(
    "grant_type",
    "fb_exchange_token"
  );

  url.searchParams.set(
    "client_id",
    process.env.META_APP_ID!
  );

  url.searchParams.set(
    "client_secret",
    process.env.META_APP_SECRET!
  );

  url.searchParams.set(
    "fb_exchange_token",
    shortToken
  );

  return requestToken(url);
}
