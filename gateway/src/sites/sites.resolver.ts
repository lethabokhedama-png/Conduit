import { loadConfig } from "@config/config.loader";
import type { SiteProfile } from "@config/config.schema";
import { DEFAULT_SITE_PROFILE } from "./sites.registry";

/**
 * Resolves the SiteProfile for an incoming request's hostname.
 *
 * Resolution order:
 * 1. Exact match against conduit.config.toml [sites] keys
 * 2. Wildcard subdomain match: `sub.example.com` → `*.example.com`
 * 3. Default profile ({ variant: 'default' }) when nothing matches
 *
 * The host argument must already be stripped of any port suffix — the
 * siteMiddleware handles that before calling here.
 *
 * This function is synchronous and cache-free; the config loader handles
 * memoization. Keeping this pure means it's trivially testable.
 */
export function resolveSite(host: string): SiteProfile {
   if (!host) return DEFAULT_SITE_PROFILE;

   const config = loadConfig();
   const sites = config.sites;

   // 1. Exact match
   const exact = sites[host];
   if (exact) return exact;

   // 2. Wildcard subdomain match (*.example.com)
   const parts = host.split(".");
   if (parts.length > 2) {
      const wildcard = `*.${parts.slice(1).join(".")}`;
      const wildcardMatch = sites[wildcard];
      if (wildcardMatch) return wildcardMatch;
   }

   // 3. Default
   return DEFAULT_SITE_PROFILE;
}

/**
 * Returns all explicitly configured site entries as an array of
 * [host, profile] tuples. Used by the sites route to expose the
 * full site map to the authenticated gateway dashboard.
 */
export function listSites(): Array<{ host: string; profile: SiteProfile }> {
   const config = loadConfig();
   return Object.entries(config.sites).map(([host, profile]) => ({
      host,
      profile
   }));
}
