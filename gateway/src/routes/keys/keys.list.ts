import type { Context } from "hono";
import { listKeys, getKeyHint } from "@db/stores/key.store";
import { probeKey } from "@discovery/discovery.probe";
import { z } from "zod";

// ── List handler ──────────────────────────────────────────────────────────────

/**
 * Returns all saved provider keys as metadata — never raw key values.
 * Each entry includes a masked hint so the UI can show something useful
 * without revealing the full secret.
 */
export async function handleListKeys(c: Context): Promise<Response> {
   const keys = await listKeys();

   return c.json(
      keys.map(k => ({
         id: k.id,
         provider: k.provider,
         category: k.category,
         label: k.label,
         keyHint: getKeyHint(k.provider),
         createdAt: k.createdAt,
         updatedAt: k.updatedAt
      }))
   );
}

// ── Introspect handler ────────────────────────────────────────────────────────

const IntrospectSchema = z.object({
   key: z.string().min(8, "Key must be at least 8 characters")
});

/**
 * Probes a raw key against all known providers without saving it.
 * Used by the tester interface's key discovery flow.
 *
 * The key is never persisted — it's held only in memory for the duration
 * of the probe (via the temporary override mechanism in key.store.ts).
 */
export async function handleIntrospectKey(c: Context): Promise<Response> {
   let body: z.infer<typeof IntrospectSchema>;
   try {
      const raw = await c.req.json();
      body = IntrospectSchema.parse(raw);
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
