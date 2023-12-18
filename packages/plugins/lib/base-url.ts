export function getBaseUrl() {
  let url: string = "https://app.famdigest.com";
  if (process.env.VERCEL && process.env.VERCEL_ENV === "preview") {
    url = `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "development") {
    url = "http://localhost:3000";
  }
  return url;
}
