export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string;
      GOOGLE_API_KEY: string;
      GOOGLE_SECRET: string;
    }
  }
}
