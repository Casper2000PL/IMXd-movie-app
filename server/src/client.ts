import { hc } from "hono/client";
import type { AppType } from "./index";

export type Client = ReturnType<typeof hc<AppType>>;

// Default client with base URL
export const client = hc<AppType>("http://localhost:3000", {
  init: {
    credentials: "include",
  },
});

// Optional: Keep the flexible version if you need it
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);
