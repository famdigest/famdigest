import { Credentials } from "google-auth-library";
import { Connection } from "../types";

export type GoogleConnection = Connection<"google", Credentials>;
