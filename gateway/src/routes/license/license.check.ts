import type { Context } from "hono";
import { getLicenseState, checkLicense } from "@license/license.state";

/**
 * GET /api/license
 *
 * Returns the current license state from Postgres. Public — the UI needs
 * this to show an "update required" banner without being version-locked.
 *
 * Does NOT trigger a fresh manifest fetch; that's done on the check loop
 * schedule. Returns the last known state from Postgres.
 */
export async function handleLicenseStatus(c: Context): Promise<Response> {
   const state = await getLicenseState();

   return c.json({
      status: state.status,
      installedVersion: state.installedVersion,
      minimumVersion: state.minimumVersion,
      lastCheckedAt: state.lastCheckedAt?.toISOString() ?? null,
      licenseEnabled: !!(
         process.env.LICENSE_MANIFEST_URL && process.env.LICENSE_PUBLIC_KEY
      )
   });
}

/**
 * POST /api/license/refresh
 *
 * Triggers an immediate manifest fetch and re-check. Useful after an update
 * so the user doesn't have to wait for the next scheduled check.
 *
 * Internal only — not exposed publicly. Mounted by server.ts.
 */
export async function handleLicenseRefresh(c: Context): Promise<Response> {
   const state = await checkLicense();

   return c.json({
      status: state.status,
      installedVersion: state.installedVersion,
      minimumVersion: state.minimumVersion,
      lastCheckedAt: state.lastCheckedAt?.toISOString() ?? null
   });
}
