import { google } from "googleapis";
import type { Credentials } from "google-auth-library";

const scopes = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "email",
  "profile",
  "openid",
];

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET,
  `http://localhost:5173/providers/google`
);

const calendar = google.calendar("v3");

export function generateAuthUrl() {
  const authorizeUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
  });
  return authorizeUrl;
}

export async function getToken(code: string) {
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export async function getCalendarList(tokens: Credentials) {
  auth.setCredentials({
    ...tokens,
  });

  google.options({ auth });

  return await calendar.calendarList.list();
}
