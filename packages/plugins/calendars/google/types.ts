import { Credentials } from "google-auth-library";
import type { Connection } from "../base";

export type GoogleConnection = Connection<"google", Credentials>;
