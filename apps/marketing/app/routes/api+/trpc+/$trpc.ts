import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "~/server/context";
import { appRouter } from "~/server/router";

export const loader = async (args: LoaderFunctionArgs) => {
  return handleRequest(args);
};

export const action = async (args: ActionFunctionArgs) => {
  return handleRequest(args);
};

function handleRequest(args: LoaderFunctionArgs | ActionFunctionArgs) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    responseMeta(opts) {
      const headers: Record<string, string> = {};
      for (const [name, value] of opts.ctx?.res.headers ?? new Headers()) {
        headers[name] = value.includes(",")
          ? value.split(",").slice(-1)[0]
          : value;
      }
      return {
        headers,
      };
    },
    router: appRouter,
    createContext,
  });
}
