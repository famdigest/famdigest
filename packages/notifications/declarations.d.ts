export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TWILIO_SID: string;
      TWILIO_SERVICE_SID: string;
      TWILIO_TOKEN: string;
      TWILIO_PHONE: string;
      RESEND_KEY: string;
    }
  }
}
