import { Connection } from "@repo/plugins/calendars/base";

export type Credentials = {
  refresh_token?: string | null;
  access_token: string;
  expires_in: number;
};
export type Office365Connection = Connection<"office365", Credentials>;
