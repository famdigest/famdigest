import { google } from "googleapis";

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

export async function getCalendarList(token: string) {
  auth.setCredentials({
    access_token: token,
  });
}
