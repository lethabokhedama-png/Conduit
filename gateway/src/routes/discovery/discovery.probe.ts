import { z } from "zod";
import type { Context } from "hono";
import { probeKey } from "@discovery/discovery.probe";
import { checkRateLimit } from "@db/redis/redis.ratelimit";

// ── Validation ────────────────────────────────────────────────────────────────

const ProbeSchema = z.object({
   key: z.string().min(8, "Key must be at least 8 characters to probe")
});

// ── Handler ───────────────────────────────────────────────────────────────────

/**
 * POST /api/discovery/probe
 *
 * Probes a raw API key against every known provider simultaneously.
 * Returns a DiscoveryResult describing which providers accepted the key
 * and what capabilities they expose.
 *
 * Rate limited to 10 probes per minute per IP to prevent brute-forcing.
 * The key is never persisted — it exists only in memory for the probe duration.
 */
export async function handleDiscoveryProbe(c: Context): Promise<Response> {
   // Rate limit by IP — probing is an expensive operation (real HTTP calls)
   const ip =
      c.req.header("CF-Connecting-IP") ??
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";

   const rl = await checkRateLimit(ip, "discovery.probe", 10, 60_000);
   if (!rl.allowed) {
      return c.json(
         {
            error: "Too many probe requests. Please wait before trying again.",
            code: "rate_limited",
            retryAfterMs: rl.retryAfterMs
         },
         429
      );
   }

   let body: z.infer<typeof ProbeSchema>;
   try {
      const raw = await c.req.json();
      body = ProbeSchema.parse(raw);
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

   const result = await probeKey(body.key);

   return c.json(result);
}
