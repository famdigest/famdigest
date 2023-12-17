export const SESSION_KEYS = {
  workspace: "__saas-workspace",
  theme: "__saas-theme",
};

export const DEFAULT_GEO = {
  city: "Charlotte",
  region: "NC",
  country: "US",
  latitude: 35.201134,
  longitude: -80.9787741,
};
export const PLAN_FEATURES = new Map<string, string[]>([
  [
    "you-yours",
    [
      "Unlimited Calendars",
      "1 Connected Contact",
      "Daily texts",
      "Customizable Delivery Times",
    ],
  ],
  [
    "you-crew",
    [
      'Everything in "You & Yours" plan',
      "3 Connected Contact",
      "Customizeable Digest Template",
    ],
  ],
]);
export function getPlanFeatures(metadata: Record<string, any>) {
  return PLAN_FEATURES.get(metadata.slug) ?? [];
}
