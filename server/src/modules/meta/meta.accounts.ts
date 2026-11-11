
const version =
  process.env.META_GRAPH_VERSION ?? "v25.0";

type MetaPage = {
  id: string;
  name: string;
  access_token?: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
};

type PageResponse = {
  data: MetaPage[];
  paging?: {
    next?: string;
  };
};

export type ConnectedAccount = {
  id: string;
  name: string;
  platform: "facebook" | "instagram";
  pageId?: string;
};

export async function getMetaAccounts(
  accessToken: string
) {
  const pages: MetaPage[] = [];

  const url = new URL(
    `https://graph.facebook.com/${version}/me/accounts`
  );

  url.searchParams.set(
    "fields",
    "id,name,access_token,instagram_business_account{id,username}"
  );
  url.searchParams.set("limit", "100");

  let next: string | undefined = url.toString();

  while (next) {
    const response: Response = await fetch(next, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error consultando cuentas: ${response.status}`
      );
    }

    const data =
      (await response.json()) as PageResponse;

    pages.push(...data.data);
    next = data.paging?.next;

    if (next) {
      const parsed = new URL(next);
      if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== "graph.facebook.com"
      ) {
        throw new Error("Paginación no permitida");
      }
    }
  }

  const accounts: ConnectedAccount[] = [];

  for (const page of pages) {
    accounts.push({
      id: page.id,
      name: page.name,
      platform: "facebook",
    });

    if (page.instagram_business_account) {
      accounts.push({
        id: page.instagram_business_account.id,
        name:
          page.instagram_business_account.username ??
          "Instagram",
        platform: "instagram",
        pageId: page.id,
      });
    }
  }

  return { accounts, pages };
}
