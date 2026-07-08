import { z } from "zod";
import type { Context } from "hono";
import { saveKey, deleteKey } from "@db/stores/key.store";
import { invalidateChatHealthCache } from "@providers/chat/chat.registry";
import { invalidateImageHealthCache } from "@providers/image/media.registry";
import { invalidateSearchHealthCache } from "@providers/search/search.registry";
import type { ProviderCategory } from "@db/stores/key.store";

// ── Validation ────────────────────────────────────────────────────────────────

export const SaveKeySchema = z.object({
   provider: z
      .string()
      .min(1)
      .max(64)
      .regex(
         /^[a-z0-9-]+$/,
         "Provider ID must be lowercase alphanumeric with hyphens"
      ),
   key: z.string().min(8, "Key must be at least 8 characters"),
   category: z.enum(["chat", "image", "search", "code"]).default("chat"),
   label: z.string().max(120).optional()
});

export type SaveKeyInput = z.infer<typeof SaveKeySchema>;

// ── Handler ───────────────────────────────────────────────────────────────────

/**
 * Saves or updates a provider API key. Upserts into Postgres and immediately
 * updates the in-memory key cache and invalidates the health score cache for
 * the provider so the next health check reflects the new key.
 *
 * Returns the stored key metadata — never the raw key value.
 */
export async function handleSaveKey(c: Context): Promise<Response> {
   let body: SaveKeyInput;
   try {
      const raw = await c.req.json();
      body = SaveKeySchema.parse(raw);
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

   const stored = await saveKey(
      body.provider,
      body.key,
      body.category as ProviderCategory,
      body.label
   );

   // Invalidate health cache for this provider so the next probe reflects the
   // new key — avoids stale "unconfigured" status in the dashboard.
   await invalidateAllHealthCaches(body.provider);

   return c.json(
      {
         id: stored.id,
         provider: stored.provider,
         category: stored.category,
         label: stored.label,
         createdAt: stored.createdAt,
         updatedAt: stored.updatedAt
      },
      201
   );
}

/**
 * Deletes a provider key. Removes from Postgres, evicts from the in-memory
 * cache, and invalidates health scores.
 */
export async function handleDeleteKey(c: Context): Promise<Response> {
   const provider = c.req.param("provider");
   if (!provider) {
      return c.json(
         { error: "Missing provider parameter", code: "bad_request" },
         400
      );
   }

   await deleteKey(provider);
   await invalidateAllHealthCaches(provider);

   return c.body(null, 204);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function invalidateAllHealthCaches(provider: string): Promise<void> {
   await Promise.all([
      invalidateChatHealthCache(provider),
      invalidateImageHealthCache(provider),
      invalidateSearchHealthCache(provider)
   ]);
}
