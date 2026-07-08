import type { Context } from "hono";
import { getSiteProfile, getSiteHost } from "@middleware/middleware.site";
import { listSites } from "@sites/sites.resolver";

/**
 * GET /api/sites/config
 *
 * Returns the resolved site profile for the current request's hostname.
 * Called by every interface on load to determine which variant it should
 * render (chat, media, tester, or default).
 *
 * Public — no auth, no version lock. The interface needs this before it
 * can render anything, so locking it would create a chicken-and-egg problem
 * where the UI can't even show the "please update" screen.
 */
export async function handleSiteConfig(c: Context): Promise<Response> {
   const profile = getSiteProfile(c);
   const host = getSiteHost(c);

   return c.json({ host, ...profile });
}

/**
 * GET /api/sites
 *
 * Returns all configured site entries. Used by the gateway dashboard to
 * display and edit the site map.
 *
 * Internal only — not exposed publicly since site configs aren't sensitive
 * but also aren't useful to external callers.
 */
export async function handleListSites(c: Context): Promise<Response> {
   return c.json({ sites: listSites() });
}
