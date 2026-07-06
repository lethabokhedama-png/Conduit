import { BaseProvider } from "../provider.base";
import { parseSSE, readErrorBody } from "../provider.sse";
import { estimateCost } from "../provider.types";
import type {
   Model,
   ProbeResult,
   ChatMessage,
   StreamOptions,
   StreamEvent
} from "../provider.types";

// ── Model catalogue ───────────────────────────────────────────────────────────

const MODELS: Model[] = [
   {
      id: "claude-opus-4-7",
      name: "Claude Opus 4.7",
      provider: "anthropic",
      category: "chat",
      capabilities: [
         "chat",
         "vision",
         "function_calling",
         "json_mode",
         "streaming"
      ],
      contextWindow: 200_000,
      inputCostPer1M: 15.0,
      outputCostPer1M: 75.0,
      maxOutputTokens: 8_192
   },
   {
      id: "claude-sonnet-4-6",
      name: "Claude Sonnet 4.6",
      provider: "anthropic",
      category: "chat",
      capabilities: [
         "chat",
         "vision",
         "function_calling",
         "json_mode",
         "streaming"
      ],
      contextWindow: 200_000,
      inputCostPer1M: 3.0,
      outputCostPer1M: 15.0,
      maxOutputTokens: 8_192
   },
   {
      id: "claude-haiku-4-5",
      name: "Claude Haiku 4.5",
      provider: "anthropic",
      category: "chat",
      capabilities: ["chat", "vision", "streaming"],
      contextWindow: 200_000,
      inputCostPer1M: 0.8,
      outputCostPer1M: 4.0,
      maxOutputTokens: 8_192
   }
];

const MODEL_MAP = new Map(MODELS.map(m => [m.id, m]));

const API_BASE = "https://api.anthropic.com";
const API_VERSION = "2023-06-01";

// ── Anthropic response shapes ─────────────────────────────────────────────────

interface AnthropicStreamEvent {
   type: string;
   index?: number;
   delta?: { type: string; text?: string };
   message?: { usage?: { input_tokens: number; output_tokens: number } };
   usage?: { input_tokens: number; output_tokens: number };
   error?: { type: string; message: string };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class AnthropicProvider extends BaseProvider {
   readonly id = "anthropic";
   readonly name = "Anthropic";
   readonly category = "chat" as const;

   listModels(): Model[] {
      return MODELS;
   }

   async probe(): Promise<ProbeResult> {
      const started = Date.now();

      if (!this.isConfigured()) {
         return { status: "unconfigured", latencyMs: 0, modelsAvailable: 0 };
      }

      try {
         const response = await fetch(`${API_BASE}/v1/models`, {
            headers: {
               "x-api-key": this.getApiKey(),
               "anthropic-version": API_VERSION
            },
            signal: this.timeoutSignal(8_000)
         });

         const latencyMs = Date.now() - started;

         if (response.status === 401) {
            return {
               status: "invalid_key",
               latencyMs,
               modelsAvailable: 0,
               error: "Invalid API key"
            };
         }
         if (response.status === 429) {
            return {
               status: "rate_limited",
               latencyMs,
               modelsAvailable: 0,
               error: "Rate limited"
            };
         }
         if (!response.ok) {
            return {
               status: "provider_down",
               latencyMs,
               modelsAvailable: 0,
               error: `HTTP ${response.status}`
            };
         }

         return { status: "active", latencyMs, modelsAvailable: MODELS.length };
      } catch (err) {
         return {
            status: "unreachable",
            latencyMs: Date.now() - started,
            modelsAvailable: 0,
            error: err instanceof Error ? err.message : "Unknown error"
         };
      }
   }

   async *stream(
      messages: ChatMessage[],
      modelId: string,
      options: StreamOptions = {}
   ): AsyncGenerator<StreamEvent> {
      const model = MODEL_MAP.get(modelId);
      if (!model) {
         yield {
            type: "error",
            code: "unknown",
            error: `Unknown Anthropic model: ${modelId}`,
            retryable: false
         };
         return;
      }

      const systemMessages = messages.filter(m => m.role === "system");
      const userMessages = messages.filter(m => m.role !== "system");

      const systemPrompt =
         options.systemPrompt ??
         systemMessages.map(m => m.content).join("\n") ??
         undefined;

      const body = {
         model: modelId,
         max_tokens: options.maxTokens ?? model.maxOutputTokens,
         stream: true,
         ...(systemPrompt ? { system: systemPrompt } : {}),
         messages: userMessages.map(m => ({
            role: m.role,
            content: m.content
         })),
         ...(options.temperature !== undefined
            ? { temperature: options.temperature }
            : {})
      };

      let response: Response;
      try {
         response = await fetch(`${API_BASE}/v1/messages`, {
            method: "POST",
            headers: {
               "x-api-key": this.getApiKey(),
               "anthropic-version": API_VERSION,
               "content-type": "application/json"
            },
            body: JSON.stringify(body),
            signal: this.timeoutSignal(120_000)
         });
      } catch (err) {
         yield {
            type: "error",
            code: "provider_down",
            error: err instanceof Error ? err.message : "Request failed",
            retryable: true
         };
         return;
      }

      if (!response.ok) {
         const errorBody = await readErrorBody(response);
         const code = this.classifyHttpError(response.status, errorBody);
         yield {
            type: "error",
            code,
            error: errorBody,
            retryable: code === "rate_limited" || code === "provider_down"
         };
         return;
      }

      const started = Date.now();
      let outputTokens = 0;
      let inputTokens = 0;

      try {
         for await (const data of parseSSE(response)) {
            if (data === "[DONE]") break;

            let event: AnthropicStreamEvent;
            try {
               event = JSON.parse(data) as AnthropicStreamEvent;
            } catch {
               continue;
            }

            if (event.type === "error") {
               yield {
                  type: "error",
                  code: "unknown",
                  error: event.error?.message ?? "Stream error",
                  retryable: false
               };
               return;
            }

            if (event.type === "content_block_delta" && event.delta?.text) {
               outputTokens++;
               yield {
                  type: "token",
                  content: event.delta.text,
                  tokens: outputTokens
               };
            }

            if (event.type === "message_start" && event.message?.usage) {
               inputTokens = event.message.usage.input_tokens;
            }

            if (event.type === "message_delta" && event.usage) {
               outputTokens = event.usage.output_tokens;
            }
         }
      } catch (err) {
         yield {
            type: "error",
            code: "provider_down",
            error: err instanceof Error ? err.message : "Stream read failed",
            retryable: true
         };
         return;
      }

      yield {
         type: "done",
         totalInputTokens: inputTokens,
         totalOutputTokens: outputTokens,
         totalCostUsd: estimateCost(model, inputTokens, outputTokens),
         durationMs: Date.now() - started,
         model: modelId,
         finishReason: "stop"
      };
   }
}
