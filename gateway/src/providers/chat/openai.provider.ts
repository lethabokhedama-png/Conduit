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
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "openai",
      category: "chat",
      capabilities: [
         "chat",
         "vision",
         "function_calling",
         "json_mode",
         "streaming"
      ],
      contextWindow: 128_000,
      inputCostPer1M: 5.0,
      outputCostPer1M: 15.0,
      maxOutputTokens: 16_384
   },
   {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "openai",
      category: "chat",
      capabilities: [
         "chat",
         "vision",
         "function_calling",
         "json_mode",
         "streaming"
      ],
      contextWindow: 128_000,
      inputCostPer1M: 0.15,
      outputCostPer1M: 0.6,
      maxOutputTokens: 16_384
   },
   {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "openai",
      category: "chat",
      capabilities: [
         "chat",
         "vision",
         "function_calling",
         "json_mode",
         "streaming"
      ],
      contextWindow: 128_000,
      inputCostPer1M: 10.0,
      outputCostPer1M: 30.0,
      maxOutputTokens: 4_096
   },
   {
      id: "o1",
      name: "o1",
      provider: "openai",
      category: "chat",
      capabilities: ["chat", "streaming"],
      contextWindow: 200_000,
      inputCostPer1M: 15.0,
      outputCostPer1M: 60.0,
      maxOutputTokens: 100_000
   }
];

const MODEL_MAP = new Map(MODELS.map(m => [m.id, m]));
const API_BASE = "https://api.openai.com";

// ── OpenAI stream response shapes ─────────────────────────────────────────────

interface OpenAIStreamChunk {
   id: string;
   object: string;
   choices: {
      index: number;
      delta: { role?: string; content?: string | null };
      finish_reason: string | null;
   }[];
   usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
   };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class OpenAIProvider extends BaseProvider {
   readonly id = "openai";
   readonly name = "OpenAI";
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
            headers: { Authorization: `Bearer ${this.getApiKey()}` },
            signal: this.timeoutSignal(8_000)
         });

         const latencyMs = Date.now() - started;

         if (response.status === 401)
            return {
               status: "invalid_key",
               latencyMs,
               modelsAvailable: 0,
               error: "Invalid API key"
            };
         if (response.status === 429)
            return {
               status: "rate_limited",
               latencyMs,
               modelsAvailable: 0,
               error: "Rate limited"
            };
         if (!response.ok)
            return {
               status: "provider_down",
               latencyMs,
               modelsAvailable: 0,
               error: `HTTP ${response.status}`
            };

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
            error: `Unknown OpenAI model: ${modelId}`,
            retryable: false
         };
         return;
      }

      const formattedMessages = messages.map(m => ({
         role: m.role,
         content: m.content
      }));

      if (options.systemPrompt) {
         formattedMessages.unshift({
            role: "system",
            content: options.systemPrompt
         });
      }

      const body = {
         model: modelId,
         messages: formattedMessages,
         max_completion_tokens: options.maxTokens ?? model.maxOutputTokens,
         stream: true,
         stream_options: { include_usage: true },
         ...(options.temperature !== undefined
            ? { temperature: options.temperature }
            : {})
      };

      let response: Response;
      try {
         response = await fetch(`${API_BASE}/v1/chat/completions`, {
            method: "POST",
            headers: {
               "Authorization": `Bearer ${this.getApiKey()}`,
               "Content-Type": "application/json"
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
      let finishReason: StreamEvent extends { finishReason: infer F }
         ? F
         : "stop" = "stop";

      try {
         for await (const data of parseSSE(response)) {
            if (data === "[DONE]") break;

            let chunk: OpenAIStreamChunk;
            try {
               chunk = JSON.parse(data) as OpenAIStreamChunk;
            } catch {
               continue;
            }

            const content = chunk.choices[0]?.delta?.content;
            if (content) {
               outputTokens++;
               yield { type: "token", content, tokens: outputTokens };
            }

            const reason = chunk.choices[0]?.finish_reason;
            if (reason) finishReason = reason as typeof finishReason;

            if (chunk.usage) {
               inputTokens = chunk.usage.prompt_tokens;
               outputTokens = chunk.usage.completion_tokens;
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
         finishReason
      };
   }
}
