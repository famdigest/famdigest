import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  watchPaths: ["../../packages/**/*"],
  tailwind: true,
  postcss: true,
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    /endent/,
    /dedent/,
    /objectorarray/,
    /fast-json-parse/,
  ],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes, {
      ignoredRouteFiles: [
        ".*",
        "**/*.css",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/__*.*",
      ],
    });
  },
};
