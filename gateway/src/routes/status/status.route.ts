import { Hono } from "hono";
import {
   handleHealth,
   handleStatus,
   handleProvidersHealth,
   handleModels
} from "./status.health";

/**
 * Status and health routes.
 *
 * Public (no version lock):
 *   GET /api/health            → liveness probe (always 200 if process is up)
 *   GET /api/status            → aggregated public status (no key data)
 *
 * Version-locked (registered on the main app, not here):
 *   GET /api/models            → all known models grouped by category
 *   GET /api/providers/health  → per-provider health with key hints
 *
 * The version-locked routes are exported as handlers and mounted directly
 * on the root app in server.ts so the version middleware applies correctly.
 */
const statusRoute = new Hono();

statusRoute.get("/health", handleHealth);
statusRoute.get("/status", handleStatus);

export { statusRoute, handleProvidersHealth, handleModels };
