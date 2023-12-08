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
    "free",
    [
      "No Code Builder",
      "Customize Everything",
      "Up to 100 Map Points",
      "Grouping and Filters",
      "Theme Designer",
      "Public Map Link",
      "Crowdsourcing",
      "Map Drawing Tools",
    ],
  ],
  [
    "basic",
    [
      "No Code Builder",
      "Customize Everything",
      "Up to 1,000 Map Points",
      "Grouping and Filters",
      "Theme Designer",
      "Publish & Embed Anywhere",
      "Crowdsourcing",
      "Map Drawing Tools",
      "Export as Image",
      "Print Maps",
    ],
  ],
  [
    "standard",
    [
      "Unlimited Map Points",
      "Sidebar Customization",
      "Popup Customization",
      "Private & Protected Maps",
      "Duplicate Maps",
      "Bulk Import",
      "Third Party Integrations",
      "1,000 Geocode Requests",
      "US/Canada Boundary Data",
    ],
  ],
  [
    "team",
    [
      "Realtime Collaboration",
      "3 Seats Included",
      "10,000 Geocode Requests",
      "Advanced Analytics",
      "Premium Support",
      "Prioritized Feature Requests",
      "Prioritized Chat Support",
      "Brand Templates*",
    ],
  ],
]);
