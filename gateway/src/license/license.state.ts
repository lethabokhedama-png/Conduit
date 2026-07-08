import { query } from "@db/postgres/postgres.client";
import { fetchAndVerifyManifest, manifestSatisfied } from "./license.verify";
import { getVersion } from "@config/utils/config.version";
import { loadConfig } from "@config/config.loader";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LicenseStatus = "ok" | "update_required" | "unknown";

export interface LicenseState {
   installedVersion: string;
   minimumVersion: string;
   status: LicenseStatus;
   lastCheckedAt: Date | null;
}

// ── Postgres reads/writes ──────────────────────────────────────────────────────

/**
 * Reads the current license state from the single-row `license_state` table.
 * This table is always populated by the 002.keys.sql migration — the row
 * with id=1 always exists.
 */
export async function getLicenseState(): Promise<LicenseState> {
   const { rows } = await query<{
      installed_version: string;
      minimum_version: string;
      status: LicenseStatus;
      last_checked_at: Date | null;
   }>(
      "SELECT installed_version, minimum_version, status, last_checked_at FROM license_state WHERE id = 1"
   );

   const row = rows[0];
   if (!row) {
      // Should never happen — migration seeds this row. Return a safe default.
      return {
         installedVersion: getVersion(),
         minimumVersion: "0.0.0",
         status: "unknown",
         lastCheckedAt: null
      };
   }

   return {
      installedVersion: row.installed_version,
      minimumVersion: row.minimum_version,
      status: row.status,
      lastCheckedAt: row.last_checked_at
   };
}

async function writeLicenseState(
   installedVersion: string,
   minimumVersion: string,
   status: LicenseStatus
): Promise<void> {
   await query(
      `UPDATE license_state
     SET installed_version = $1,
         minimum_version   = $2,
         status            = $3,
         last_checked_at   = now()
     WHERE id = 1`,
      [installedVersion, minimumVersion, status]
   );
}

// ── Check loop ────────────────────────────────────────────────────────────────

let _checkTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Performs one license manifest check: fetches, verifies, and persists the
 * result to `license_state`. Called at startup and then on a schedule
 * controlled by `license.check_interval_hours` in conduit.config.toml.
 *
 * Fail-open semantics: if the manifest can't be fetched (network outage,
 * server down), we keep the last known status from Postgres rather than
 * locking users out. Only a successfully verified manifest that signals
 * `update_required` triggers a block.
 *
 * Fail-closed semantics on key misconfiguration: if the public key is
 * invalid or the signature doesn't verify, we log a warning but don't
 * lock users out — the operator needs to fix their config, not users.
 */
export async function checkLicense(): Promise<LicenseState> {
   const installedVersion = getVersion();
   const result = await fetchAndVerifyManifest();

   if (!result.valid || !result.manifest) {
      // Could not verify manifest — log but keep last known state
      if (result.error) {
         console.warn(`[license] Manifest check failed: ${result.error}`);
      }

      // Still update installed_version so it's always current
      const current = await getLicenseState();
      await writeLicenseState(
         installedVersion,
         current.minimumVersion,
         "unknown"
      );
      return getLicenseState();
   }

   const satisfied = manifestSatisfied(installedVersion, result.manifest);
   const status: LicenseStatus = satisfied ? "ok" : "update_required";

   if (!satisfied) {
      console.warn(
         `[license] Version lock: installed=${installedVersion}, required>=${result.manifest.minimumVersion}. ` +
            `Locked endpoints will return HTTP 426 until Conduit is updated.`
      );
   }

   await writeLicenseState(
      installedVersion,
      result.manifest.minimumVersion,
      status
   );

   return getLicenseState();
}

/**
 * Starts the periodic license check loop. Should be called once at startup
 * (inside index.ts) only when the license system is configured.
 *
 * Uses setTimeout-based recursion rather than setInterval so a slow network
 * call doesn't overlap with the next scheduled check.
 */
export function startLicenseCheckLoop(): void {
   const manifestUrl = process.env.LICENSE_MANIFEST_URL;
   const publicKey = process.env.LICENSE_PUBLIC_KEY;

   if (!manifestUrl || !publicKey) return; // License system not configured

   const config = loadConfig();
   const intervalMs = config.license.check_interval_hours * 60 * 60 * 1_000;

   const schedule = (): void => {
      _checkTimer = setTimeout(async () => {
         try {
            await checkLicense();
         } catch (err) {
            console.warn(
               "[license] Periodic check error:",
               err instanceof Error ? err.message : err
            );
         }
         schedule();
      }, intervalMs);
   };

   schedule();
   console.log(
      `[license] Check loop started — interval: ${config.license.check_interval_hours}h`
   );
}

/**
 * Stops the license check loop. Called on graceful shutdown.
 */
export function stopLicenseCheckLoop(): void {
   if (_checkTimer !== null) {
      clearTimeout(_checkTimer);
      _checkTimer = null;
   }
}
