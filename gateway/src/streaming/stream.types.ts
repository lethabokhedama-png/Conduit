import type {
   StreamTokenEvent,
   StreamDoneEvent,
   StreamErrorEvent
} from "@providers/provider.types";
import type {
   CascadeSwitchEvent,
   CascadeExhaustedEvent,
   CascadeCompleteEvent
} from "@cascade/cascade.types";

// ── Wire events (what the client sees over SSE) ───────────────────────────────

/**
 * The complete set of event types that can appear on the chat SSE stream.
 * Each event is a JSON object serialized as `data: <json>\n\n`.
 *
 * Clients should handle unknown `type` values gracefully — future versions
 * may add new event types while remaining backwards compatible.
 */
export type WireEvent =
   | StreamTokenEvent
   | StreamDoneEvent
   | StreamErrorEvent
   | CascadeSwitchEvent
   | CascadeExhaustedEvent
   | CascadeCompleteEvent;

/**
 * Serialized SSE line pair for a single event.
 * Format: `data: <json>\n\n`
 */
export type SseLine = string;

// ── Stream request body ────────────────────────────────────────────────────────

/**
 * The request body shape for POST /api/chat/stream.
 * Validated at the route layer with Zod before reaching the stream handler.
 */
export interface ChatStreamRequest {
   /** Full conversation history including the latest user message */
   messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
   }>;
   /** Target model ID (e.g. "claude-opus-4-7", "gpt-4o") */
   model: string;
   /** When true, activates the cascade engine if 2+ providers are configured */
   cascadeEnabled?: boolean;
   /** Cascade profile name from conduit.config.toml (defaults to "balanced") */
   cascadeProfile?: string;
   /**
    * Existing conversation ID — pass to persist messages to an existing
    * conversation. Omit to start a new conversation.
    */
   conversationId?: string;
   /** Optional system prompt override */
   systemPrompt?: string;
   maxTokens?: number;
   temperature?: number;
}
