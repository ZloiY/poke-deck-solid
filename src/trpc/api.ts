import superjson from "superjson";

import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./router";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (import.meta.env.VERCEL_URL)
    return `https://${import.meta.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${import.meta.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,

  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
