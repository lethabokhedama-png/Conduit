import { z } from "zod";
import type { Context } from "hono";
import { createSSEResponse, sseError } from "@streaming/stream.sse";
import { runCascade, cascadeIsUsable } from "@cascade/cascade.engine";
import { getChatAdapterForModel } from "@providers/chat/chat.registry";
import { loadConfig } from "@config/config.loader";
import { ensureConversation } from "@db/stores/conversation.store";
import { appendMessage } from "@db/stores/message.store";
import { checkRateLimit } from "@db/redis/redis.ratelimit";
import type { ChatMessage } from "@providers/provider.types";
import type { WireEvent } from "@streaming/stream.types";

// ── Validation ────────────────────────────────────────────────────────────────

const MessageSchema = z.object({
   role: z.enum(["user", "assistant", "system"]),
   content: z.string().min(1)
});

const StreamRequestSchema = z.object({
   messages: z.array(MessageSchema).min(1, "At least one message is required"),
   model: z.string().min(1, "Model ID is required"),
   cascadeEnabled: z.boolean().optional().default(false),
   cascadeProfile: z.string().optional().default("balanced"),
   conversationId: z.string().optional(),
   systemPrompt: z.string().optional(),
   maxTokens: z.number().int().positive().optional(),
   temperature: z.number().min(0).max(2).optional()
});

type StreamRequest = z.infer<typeof StreamRequestSchema>;

// ── Handler ───────────────────────────────────────────────────────────────────

/**
 * POST /api/chat/stream
 *
 * The core streaming endpoint. Accepts a conversation history and a target
 * model, then streams the response as SSE events.
 *
 * When `cascadeEnabled: true` and 2+ providers are configured, the request
 * is routed through the cascade engine which automatically falls back through
 * a health-ranked model chain on error, rate-limit, or threshold crossing.
 *
 * Conversation persistence: if `conversationId` is provided, the user message
 * and assistant response are appended to that conversation in Postgres. If
 * omitted, no persistence happens (useful for stateless API consumers).
 *
 * The response body is an SSE stream of WireEvents. The stream closes after
 * a `done`, `error`, or `cascade_exhausted` event.
 */
export async function handleChatStream(c: Context): Promise<Response> {
   // ── Rate limit ─────────────────────────────────────────────────────────────
   const ip =
      c.req.header("CF-Connecting-IP") ??
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";

   const rl = await checkRateLimit(ip, "chat.stream", 60, 60_000);
   if (!rl.allowed) {
      return sseError(
         "rate_limited",
         "Too many requests. Please slow down.",
         true
      );
   }

   // ── Parse & validate ───────────────────────────────────────────────────────
   let req: StreamRequest;
   try {
      const raw = await c.req.json();
      req = StreamRequestSchema.parse(raw);
   } catch (err) {
      if (err instanceof z.ZodError) {
         return sseError(
            "validation_error",
            err.issues
               .map(i => `[${i.path.join(".")}] ${i.message}`)
               .join("; "),
            false
         );
      }
      return sseError("bad_request", "Invalid JSON body", false);
   }

   const config = loadConfig();
   const messages: ChatMessage[] = req.messages;

   // ── Route: cascade or direct ───────────────────────────────────────────────
   let events: AsyncGenerator<WireEvent>;

   const shouldCascade =
      req.cascadeEnabled && config.features.cascade && cascadeIsUsable();

   if (shouldCascade) {
      const profile = config.cascade.profiles[req.cascadeProfile];
      if (!profile) {
         return sseError(
            "unknown",
            `Unknown cascade profile: "${req.cascadeProfile}". Available: ${Object.keys(config.cascade.profiles).join(", ")}`,
            false
         );
      }

      events = runCascade({
         messages,
         profile,
         preferredModel: req.model,
         conversationId: req.conversationId
      }) as AsyncGenerator<WireEvent>;
   } else {
      // Direct single-provider stream
      const adapter = getChatAdapterForModel(req.model);

      if (!adapter) {
         return sseError(
            "unknown",
            `Unknown model: "${req.model}". Use GET /api/models to list available models.`,
            false
         );
      }

      if (!adapter.isConfigured()) {
         return sseError(
            "unknown",
            `Provider for model "${req.model}" has no API key configured. Add one via Settings.`,
            false
         );
      }

      events = (adapter as any).stream(messages, req.model, {
         maxTokens: req.maxTokens,
         temperature: req.temperature,
         systemPrompt: req.systemPrompt
      }) as AsyncGenerator<WireEvent>;
   }

   // ── Persist conversation ───────────────────────────────────────────────────
   // Wrap the event generator to intercept the done event for persistence.
   // This avoids blocking the stream — writes happen concurrently.
   const conversationId = req.conversationId;
   if (conversationId) {
      events = persistingWrapper(events, messages, req.model, conversationId);
   }

   return createSSEResponse(events);
}

// ── Persistence wrapper ───────────────────────────────────────────────────────

/**
 * Wraps an event generator to persist the conversation to Postgres when
 * a `done` event is received. The wrapper is transparent to the SSE
 * response — all events pass through unchanged.
 *
 * Persistence failures are non-fatal: a Postgres write error logs a warning
 * but does not interrupt the stream (the tokens are already sent).
 */
async function* persistingWrapper(
   source: AsyncGenerator<WireEvent>,
   messages: ChatMessage[],
   model: string,
   conversationId: string
): AsyncGenerator<WireEvent> {
   let accumulatedContent = "";
   let finalModel = model;
   let totalInputTokens = 0;
   let totalOutputTokens = 0;
   let totalCostUsd = 0;

   for await (const event of source) {
      if (event.type === "token") {
         accumulatedContent += event.content;
      }

      if (event.type === "done") {
         finalModel = event.model;
         totalInputTokens = event.totalInputTokens;
         totalOutputTokens = event.totalOutputTokens;
         totalCostUsd = event.totalCostUsd;
      }

      yield event;
   }

   // Write to Postgres after the stream completes.
   // Only persist if there's actual assistant content — an error-only stream
   // produces no tokens and shouldn't create orphaned conversation records.
   if (accumulatedContent.length > 0) {
      try {
         await ensureConversation(conversationId);

         // Only append the last user message — the one that triggered this turn.
         // Earlier messages already exist in Postgres from prior turns. Appending
         // all of `messages` on every turn would duplicate the conversation history.
         const lastUserMsg = [...messages]
            .reverse()
            .find(m => m.role === "user");
         if (lastUserMsg) {
            await appendMessage({
               conversationId,
               role: "user",
               content: lastUserMsg.content
            });
         }

         // The model ID may have changed if the cascade engine switched providers.
         // Use the model from the `done` event, not the originally requested model.
         // Provider ID is everything before the first "/" (e.g. "groq/llama3" → "groq").
         const slash = finalModel.indexOf("/");
         const providerId =
            slash === -1 ? finalModel : finalModel.slice(0, slash);

         await appendMessage({
            conversationId,
            role: "assistant",
            content: accumulatedContent,
            model: finalModel,
            provider: providerId,
            tokenCount: totalOutputTokens,
            costUsd: totalCostUsd
         });
      } catch (err) {
         console.warn(
            `[chat:stream] Failed to persist conversation ${conversationId}:`,
            err instanceof Error ? err.message : err
         );
      }
   }
}
