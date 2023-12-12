import { google } from "googleapis";
import type { Credentials } from "google-auth-library";

const scopes = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "email",
  "profile",
  "openid",
];

let url: string = "localhost:3000";
if (process.env.VERCEL_URL) {
  url = `https://${process.env.VERCEL_URL}`;
}

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET,
  `${url}/providers/google`
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

export async function getEvents({
  tokens,
  calendarId,
  timeMin,
  timeMax,
}: {
  tokens: Credentials;
  calendarId: string;
  timeMin: string;
  timeMax: string;
}) {
  auth.setCredentials({
    ...tokens,
  });

  google.options({ auth });

  return await calendar.events.list({ calendarId, timeMin, timeMax });
}

export async function getCalendarList(tokens: Credentials) {
  auth.setCredentials({
    ...tokens,
  });

  google.options({ auth });

  return await calendar.calendarList.list();
}
