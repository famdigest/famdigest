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
