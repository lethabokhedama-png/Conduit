import type { MiddlewareHandler } from "hono";
import { getLicenseState, type LicenseState } from "@license/license.state";
import type { ErrorResponse } from "./middleware.error";

// ── In-process license state cache ────────────────────────────────────────────

/**
 * Caches the license state in memory for 5 seconds so the version check
 * is not a Postgres round-trip on every streaming request. The license
 * check loop updates Postgres on a multi-hour schedule — 5-second staleness
 * here is negligible and keeps hot-path latency near zero.
 */
interface CachedState {
   state: LicenseState;
   expiresAt: number;
}

let _stateCache: CachedState | null = null;
const CACHE_TTL_MS = 5_000;

async function getCachedLicenseState(): Promise<LicenseState> {
   const now = Date.now();
   if (_stateCache && now < _stateCache.expiresAt) {
      return _stateCache.state;
   }
   const state = await getLicenseState();
   _stateCache = { state, expiresAt: now + CACHE_TTL_MS };
   return state;
}

// ── Version-locked path prefixes ──────────────────────────────────────────────

/**
 * All route prefixes that are blocked when the installed version is below the
 * minimum required version signalled by the license manifest.
 *
 * The handoff doc specifies ALL endpoints — not just /api/chat/* — are blocked
 * when the version lock fires. Public endpoints like /api/health, /api/status,
 * /api/sites/config, and /api/keys remain open so users can still reach
 * settings and diagnose the issue.
 */
const LOCKED_PREFIXES: readonly string[] = [
   "/api/chat",
   "/api/media",
   "/api/search",
   "/api/code",
   "/api/models",
   "/api/providers",
   "/api/discovery"
];

// ── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Version-lock middleware. Reads the current license state (cached in
 * Postgres by `license.state.ts`) and blocks requests to any version-locked
 * endpoint when the status is `update_required`.
 *
 * Only active when both `LICENSE_MANIFEST_URL` and `LICENSE_PUBLIC_KEY` are
 * configured. When either is absent the license system is disabled and this
 * middleware is a no-op — no network calls, no overhead.
 *
 * The block returns a structured JSON 426 Upgrade Required with enough context
 * for the UI to show a helpful "please update" screen rather than a generic
 * error.
 *
 * Non-locked routes (/api/health, /api/status, /api/sites/config, /api/keys,
 * /api/license) always pass through so users can access settings and see the
 * license status even when locked out.
 */
export const versionMiddleware: MiddlewareHandler = async (c, next) => {
   const manifestUrl = process.env.LICENSE_MANIFEST_URL;
   const publicKey = process.env.LICENSE_PUBLIC_KEY;

   // License system disabled — fast path
   if (!manifestUrl || !publicKey) {
      await next();
      return;
   }

   const path = c.req.path;
   const isLocked = LOCKED_PREFIXES.some(prefix => path.startsWith(prefix));

   if (!isLocked) {
      await next();
      return;
   }

   const state = await getCachedLicenseState();

   if (state.status !== "update_required") {
      await next();
      return;
   }

   const body: ErrorResponse & {
      installedVersion: string;
      minimumVersion: string;
      updateUrl: string;
   } = {
      error: `Conduit ${state.installedVersion} is below the minimum required version ${state.minimumVersion}. Please update to continue.`,
      code: "version_locked",
      installedVersion: state.installedVersion,
      minimumVersion: state.minimumVersion,
      updateUrl: "https://github.com/lethabokhedama-png/Conduit/releases"
   };

   return c.json(body, 426);
};
