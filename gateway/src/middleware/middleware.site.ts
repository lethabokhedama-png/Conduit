import type { MiddlewareHandler } from "hono";
import { resolveSite } from "@sites/sites.resolver";
import type { SiteProfile } from "@config/config.schema";

// ── Context key ───────────────────────────────────────────────────────────────

// Hono's Context.set/get is untyped — we use a module-level symbol as the key
// so there's never a string collision with other middleware.
const SITE_KEY = "site";
const HOST_KEY = "siteHost";

// ── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Resolves the UI variant for each incoming request by reading the Host
 * header and looking it up in the [sites] table of conduit.config.toml.
 *
 * The resolved SiteProfile is stored in the Hono context under "site" so
 * route handlers can read `c.get('site')` without repeating the lookup.
 * The raw (stripped) host is stored under "siteHost" for logging.
 *
 * Resolution always succeeds — unknown hosts resolve to the default profile
 * ({ variant: 'default' }) so a misconfigured DNS entry never causes a 500.
 * The resolver strips port suffixes so `localhost:4000` maps to `localhost`.
 */
export const siteMiddleware: MiddlewareHandler = async (c, next) => {
   const rawHost = c.req.header("Host") ?? "";
   // Strip port — config keys are bare hostnames
   const host = rawHost.split(":")[0] ?? rawHost;

   const profile = resolveSite(host);

   c.set(SITE_KEY, profile);
   c.set(HOST_KEY, host);

   await next();
};

// ── Typed accessor ────────────────────────────────────────────────────────────

/**
 * Type-safe accessor for the resolved site profile stored by siteMiddleware.
 * Returns the default profile if the middleware hasn't run (shouldn't happen
 * in practice, but guards against test environments that skip middleware).
 */
export function getSiteProfile(
   c: Parameters<MiddlewareHandler>[0]
): SiteProfile {
   return (
      (c.get(SITE_KEY) as SiteProfile | undefined) ?? { variant: "default" }
   );
}

export function getSiteHost(c: Parameters<MiddlewareHandler>[0]): string {
   return (c.get(HOST_KEY) as string | undefined) ?? "";
}
