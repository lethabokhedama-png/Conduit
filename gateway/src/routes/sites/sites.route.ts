import { Hono } from "hono";
import { handleSiteConfig, handleListSites } from "./sites.resolver";

/**
 * Site routing endpoints.
 *
 * GET /api/sites/config  → resolved profile for the current Host header (public)
 * GET /api/sites         → full site map (internal dashboard use)
 */
const sitesRoute = new Hono();

sitesRoute.get("/config", handleSiteConfig);
sitesRoute.get("/", handleListSites);

export { sitesRoute };
