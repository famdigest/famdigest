export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MIXPANEL_TOKEN: string;
    }
  }
}
