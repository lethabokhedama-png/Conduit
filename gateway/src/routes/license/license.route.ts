import { Hono } from "hono";
import { handleLicenseStatus, handleLicenseRefresh } from "./license.check";

/**
 * License routes.
 *
 * GET  /api/license         → current license state (public)
 * POST /api/license/refresh → force an immediate manifest re-check (internal)
 */
const licenseRoute = new Hono();

licenseRoute.get("/", handleLicenseStatus);
licenseRoute.post("/refresh", handleLicenseRefresh);

export { licenseRoute };
