export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_KEY: string;
      PRIVATE_STRIPE_KEY: string;
      PRIVATE_STRIPE_WEBHOOK_SECRET: string;
      PUBLIC_STRIPE_KEY: string;
      DATABASE_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_API_KEY: string;
      GOOGLE_SECRET: string;
      HUMANLOOP_API_KEY: string;
      HUMANLOOP_PROJECT_ID: string;
      OPENAI_API_KEY: string;
      TWILIO_SID: string;
      TWILIO_SERVICE_SID: string;
      TWILIO_TOKEN: string;
      TWILIO_PHONE: string;
      RESEND_KEY: string;
      MIXPANEL_TOKEN: string;
      MSFT_CLOUD_INSTANCE: string;
      MSFT_TENANT_ID: string;
      MSFT_CLIENT_ID: string;
      MSFT_CLIENT_SECRET: string;
      MSFT_GRAPH_API_ENDPOINT: string;
      CALENDSO_ENCRYPTION_KEY: string;
    }
  }

  interface Window {
    env: {
      NODE_ENV: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      PUBLIC_STRIPE_KEY: string;
      GA_TRACKING_ID: string | undefined;
      GTM_TRACKING_ID: string | undefined;
      FACEBOOK_PIXEL_ID: string | undefined;
      ENABLE_TRACKING: boolean;
      MIXPANEL_TOKEN: string;
    };
    // tracking
    fbq?: any;
    dataLayer: any;
    gtag?: (
      option: string,
      gaTrackingId: string,
      options: Record<string, unknown>
    ) => void;
  }
}
