import type { Context } from "hono";
import { getPublicStatus } from "@status/status.aggregator";
import { getAllChatProviderHealth } from "@providers/chat/chat.registry";
import { getAllImageProviderHealth } from "@providers/image/media.registry";
import { getAllSearchProviderHealth } from "@providers/search/search.registry";
import { allChatModels } from "@providers/chat/chat.registry";
import { allImageModels } from "@providers/image/media.registry";

// ── /api/health ───────────────────────────────────────────────────────────────

/**
 * Lightweight liveness probe. Returns 200 if the gateway process is running,
 * regardless of database state. Used by Docker health checks and load
 * balancers that need to know if the process is alive — not whether it's
 * fully operational.
 *
 * For a full status check including Postgres, Redis, and provider health,
 * use GET /api/status.
 */
export async function handleHealth(c: Context): Promise<Response> {
   return c.json({ status: "ok", timestamp: new Date().toISOString() });
}

// ── /api/status ───────────────────────────────────────────────────────────────

/**
 * Public status endpoint. Aggregates the health of all internal services
 * (gateway, Postgres, Redis) and any configured external mirrors.
 *
 * Safe for unauthenticated access — returns no keys, no request logs,
 * no provider details. Provider names are included only in /api/providers/health
 * which is version-locked.
 */
export async function handleStatus(c: Context): Promise<Response> {
   const status = await getPublicStatus();

   // HTTP status reflects the overall health signal
   const httpStatus =
      status.overall === "operational"
         ? 200
         : status.overall === "degraded"
           ? 207 // Multi-Status — some things work
           : 503; // Service Unavailable

   return c.json(status, httpStatus);
}

// ── /api/providers/health ─────────────────────────────────────────────────────

/**
 * Provider health endpoint — version-locked (see middleware.version.ts).
 * Returns a full snapshot of every provider's health including key hints,
 * latency, model counts, and capability lists.
 *
 * Intentionally not aggregated with the public status — provider names
 * tied to keys are not safe for public exposure.
 */
export async function handleProvidersHealth(c: Context): Promise<Response> {
   const [chat, image, search] = await Promise.all([
      getAllChatProviderHealth(),
      getAllImageProviderHealth(),
      getAllSearchProviderHealth()
   ]);

   return c.json({ providers: [...chat, ...image, ...search] });
}

// ── /api/models ───────────────────────────────────────────────────────────────

/**
 * Returns all known models grouped by category — version-locked.
 * Clients use this to populate model selectors in the chat/media interfaces.
 */
export async function handleModels(c: Context): Promise<Response> {
   return c.json({
      chat: allChatModels(),
      image: allImageModels()
   });
}
