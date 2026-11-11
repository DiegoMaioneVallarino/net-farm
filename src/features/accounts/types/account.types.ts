
export type ConnectedAccount = {
  id: string;
  name: string;
  platform: "facebook" | "instagram";
  pageId?: string;
};

export type AccountsResponse = {
  accounts: ConnectedAccount[];
};
