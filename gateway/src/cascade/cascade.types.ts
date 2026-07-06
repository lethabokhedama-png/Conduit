import type { ChatMessage, StreamEvent } from "@providers/provider.types";
import type { CascadeProfile } from "@config/config.schema";

// ── Cascade trigger reasons ───────────────────────────────────────────────────

export type CascadeTrigger =
   | "rate_limited" // provider returned 429
   | "error" // provider returned 5xx or threw
   | "invalid_key" // provider returned 401/403
   | "context_length" // message exceeded model context window
   | "cost_cap" // accumulated cost exceeded profile.cost_cap_usd
   | "token_threshold" // token usage crossed profile.token_threshold fraction
   | "unconfigured"; // model in chain has no key configured

// ── Per-attempt result ────────────────────────────────────────────────────────

export interface CascadeAttempt {
   model: string;
   provider: string;
   startedAt: number;
   endedAt: number;
   trigger?: CascadeTrigger;
   inputTokens: number;
   outputTokens: number;
   costUsd: number;
}

// ── Events emitted by the cascade engine ─────────────────────────────────────

/** Emitted just before the engine switches to the next model in the chain */
export interface CascadeSwitchEvent {
   type: "cascade_switch";
   fromModel: string;
   toModel: string;
   trigger: CascadeTrigger;
   attempt: number;
   /** Tokens collected from the outgoing model before the switch */
   tokensBeforeSwitch: number;
}

/** Emitted when the engine exhausts all models in the chain */
export interface CascadeExhaustedEvent {
   type: "cascade_exhausted";
   attempts: CascadeAttempt[];
   lastError: string;
}

/** Summary emitted at the end of a successful cascade run */
export interface CascadeCompleteEvent {
   type: "cascade_complete";
   attempts: CascadeAttempt[];
   totalCostUsd: number;
   totalTokens: number;
   totalDurationMs: number;
   switchCount: number;
}

export type CascadeEvent =
   | StreamEvent
   | CascadeSwitchEvent
   | CascadeExhaustedEvent
   | CascadeCompleteEvent;

// ── Engine input ──────────────────────────────────────────────────────────────

export interface CascadeRunOptions {
   messages: ChatMessage[];
   profile: CascadeProfile;
   preferredModel: string;
   conversationId?: string;
   /** Accumulated cost from prior turns in the same conversation */
   priorCostUsd?: number;
}
