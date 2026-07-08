import { z } from "zod";
import type { Context } from "hono";
import {
   getSearchAdapter,
   allSearchAdapters,
   configuredSearchAdapters
} from "@providers/search/search.registry";
import type { SearchProviderAdapter } from "@providers/search/search.types";

import { checkRateLimit } from "@db/redis/redis.ratelimit";
import { recordSuccess, recordError } from "@db/redis/redis.usage";

// ── Validation ────────────────────────────────────────────────────────────────

const SearchQuerySchema = z.object({
   query: z.string().min(1).max(500),
   /** Specific provider to use. If omitted, uses the first configured provider. */
   provider: z.string().optional(),
   count: z.number().int().min(1).max(50).optional().default(10),
   country: z.string().length(2).optional(),
   language: z.string().max(10).optional(),
   freshness: z.string().optional(),
   safeSearch: z.boolean().optional().default(true)
});

type SearchQueryInput = z.infer<typeof SearchQuerySchema>;

// ── POST /api/search ──────────────────────────────────────────────────────────

/**
 * Executes a web search using the configured search provider (SerpAPI or
 * Brave Search). If multiple providers are configured, the `provider` field
 * selects which to use; otherwise the first configured provider is chosen.
 *
 * Rate limited to 30 requests/minute per IP.
 */
export async function handleSearch(c: Context): Promise<Response> {
   // ── Rate limit ─────────────────────────────────────────────────────────────
   const ip =
      c.req.header("CF-Connecting-IP") ??
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";

   const rl = await checkRateLimit(ip, "search.query", 30, 60_000);
   if (!rl.allowed) {
      return c.json(
         {
            error: "Too many search requests. Please wait.",
            code: "rate_limited",
            retryAfterMs: rl.retryAfterMs
         },
         429
      );
   }

   // ── Validate ───────────────────────────────────────────────────────────────
   let body: SearchQueryInput;
   try {
      const raw = await c.req.json();
      body = SearchQuerySchema.parse(raw);
   } catch (err) {
      if (err instanceof z.ZodError) {
         return c.json(
            {
               error: "Validation failed",
               code: "validation_error",
               detail: err.issues
            },
            422
         );
      }
      return c.json({ error: "Invalid JSON body", code: "bad_request" }, 400);
   }

   // ── Resolve provider ───────────────────────────────────────────────────────
   // allSearchAdapters() returns BaseProvider[]; we cast to SearchProviderAdapter
   // after confirming category — every search adapter implements search().
   const resolvedBase = body.provider
      ? getSearchAdapter(body.provider)
      : (configuredSearchAdapters()[0] ?? null);

   if (!resolvedBase) {
      const configured = configuredSearchAdapters().map(p => p.id);
      return c.json(
         {
            error: body.provider
               ? `Unknown search provider: "${body.provider}"`
               : "No search provider is configured. Add a SerpAPI or Brave Search key via Settings.",
            code: "unconfigured_provider",
            configuredProviders: configured
         },
         400
      );
   }

   if (!resolvedBase.isConfigured()) {
      return c.json(
         {
            error: `Search provider "${resolvedBase.id}" has no API key configured.`,
            code: "unconfigured_provider"
         },
         400
      );
   }

   // Safe cast — all search adapters satisfy SearchProviderAdapter
   const adapter = resolvedBase as unknown as SearchProviderAdapter;

   // ── Search ─────────────────────────────────────────────────────────────────
   const started = Date.now();
   try {
      const results = await adapter.search(body.query, {
         count: body.count,
         country: body.country,
         language: body.language,
         freshness: body.freshness as "day" | "week" | "month" | undefined,
         safeSearch: body.safeSearch
      });

      const durationMs = Date.now() - started;

      recordSuccess(adapter.id, durationMs).catch(() => {});

      return c.json({
         query: body.query,
         provider: adapter.id,
         results,
         count: results.length,
         durationMs
      });
   } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";

      recordError(adapter.id, "error", message).catch(() => {});

      return c.json({ error: message, code: "search_failed" }, 502);
   }
}

// ── GET /api/search/providers ─────────────────────────────────────────────────

/**
 * Lists all known search providers and whether each is configured.
 */
export async function handleSearchProviders(c: Context): Promise<Response> {
   const providers = allSearchAdapters().map(p => ({
      id: p.id,
      name: p.name,
      configured: p.isConfigured()
   }));

   return c.json({ providers });
}
