import { BaseProvider } from "../provider.base";
import { estimateCost } from "../provider.types";
import type {
   Model,
   ProbeResult,
   ChatMessage,
   StreamOptions,
   StreamEvent
} from "../provider.types";

// Ollama is local — no API key, no cost. Models are discovered dynamically
// from the running instance rather than hardcoded.

interface OllamaModel {
   name: string;
   details?: { parameter_size?: string; family?: string };
}

interface OllamaListResponse {
   models: OllamaModel[];
}

interface OllamaStreamChunk {
   message?: { content?: string };
   done?: boolean;
   done_reason?: string;
   prompt_eval_count?: number;
   eval_count?: number;
   error?: string;
}

export class OllamaProvider extends BaseProvider {
   readonly id = "ollama";
   readonly name = "Ollama";
   readonly category = "chat" as const;

   private get baseUrl(): string {
      return (process.env.OLLAMA_URL ?? "http://localhost:11434").replace(
         /\/$/,
         ""
      );
   }

   /**
    * Ollama doesn't use an API key — it's local. Always returns true so the
    * cascade engine treats it as a valid fallback candidate. Reachability is
    * checked via probe().
    */
   isConfigured(): boolean {
      return true;
   }

   /**
    * Fetches the current model list from the running Ollama instance.
    * Returns an empty array if Ollama is unreachable — not an error.
    */
   async fetchAvailableModels(): Promise<OllamaModel[]> {
      try {
         const response = await fetch(`${this.baseUrl}/api/tags`, {
            signal: this.timeoutSignal(5_000)
         });
         if (!response.ok) return [];
         const data = (await response.json()) as OllamaListResponse;
         return data.models ?? [];
      } catch {
         return [];
      }
   }

   /**
    * Returns a static model list because Ollama models vary per installation.
    * The real list is fetched dynamically in fetchAvailableModels().
    */
   listModels(): Model[] {
      // Static fallback entries — the actual available models depend on what
      // the user has pulled locally. The registry supplements this at runtime.
      return [
         {
            id: "ollama/llama3",
            name: "Llama 3 (local)",
            provider: "ollama",
            category: "chat",
            capabilities: ["chat", "streaming"],
            contextWindow: 8_192,
            inputCostPer1M: 0,
            outputCostPer1M: 0,
            maxOutputTokens: 4_096
         },
         {
            id: "ollama/mistral",
            name: "Mistral (local)",
            provider: "ollama",
            category: "chat",
            capabilities: ["chat", "streaming"],
            contextWindow: 32_768,
            inputCostPer1M: 0,
            outputCostPer1M: 0,
            maxOutputTokens: 4_096
         },
         {
            id: "ollama/phi3",
            name: "Phi-3 (local)",
            provider: "ollama",
            category: "chat",
            capabilities: ["chat", "streaming"],
            contextWindow: 4_096,
            inputCostPer1M: 0,
            outputCostPer1M: 0,
            maxOutputTokens: 4_096
         }
      ];
   }

   async probe(): Promise<ProbeResult> {
      const started = Date.now();
      try {
         const models = await this.fetchAvailableModels();
         const latencyMs = Date.now() - started;
         return { status: "active", latencyMs, modelsAvailable: models.length };
      } catch {
         return {
            status: "unreachable",
            latencyMs: Date.now() - started,
            modelsAvailable: 0,
            error: `Ollama not reachable at ${this.baseUrl}`
         };
      }
   }

   async *stream(
      messages: ChatMessage[],
      modelId: string,
      options: StreamOptions = {}
   ): AsyncGenerator<StreamEvent> {
      // Strip the 'ollama/' prefix if present — Ollama API uses bare model names
      const ollamaModel = modelId.replace(/^ollama\//, "");

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
         model: ollamaModel,
         messages: formattedMessages,
         stream: true,
         options: {
            num_predict: options.maxTokens ?? 4_096,
            ...(options.temperature !== undefined
               ? { temperature: options.temperature }
               : {})
         }
      };

      let response: Response;
      try {
         response = await fetch(`${this.baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: this.timeoutSignal(300_000) // local models can be slow
         });
      } catch (err) {
         yield {
            type: "error",
            code: "provider_down",
            error: `Ollama unreachable at ${this.baseUrl}: ${err instanceof Error ? err.message : "Unknown"}`,
            retryable: true
         };
         return;
      }

      if (!response.ok) {
         const body = await response
            .text()
            .catch(() => `HTTP ${response.status}`);
         yield {
            type: "error",
            code: "provider_down",
            error: body,
            retryable: true
         };
         return;
      }

      const started = Date.now();
      let outputTokens = 0;
      let inputTokens = 0;

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
         while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
               const trimmed = line.trim();
               if (!trimmed) continue;

               let chunk: OllamaStreamChunk;
               try {
                  chunk = JSON.parse(trimmed) as OllamaStreamChunk;
               } catch {
                  continue;
               }

               if (chunk.error) {
                  yield {
                     type: "error",
                     code: "unknown",
                     error: chunk.error,
                     retryable: false
                  };
                  return;
               }

               const content = chunk.message?.content;
               if (content) {
                  outputTokens++;
                  yield { type: "token", content, tokens: outputTokens };
               }

               if (chunk.done) {
                  inputTokens = chunk.prompt_eval_count ?? 0;
                  outputTokens = chunk.eval_count ?? outputTokens;
               }
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
      } finally {
         reader.releaseLock();
      }

      yield {
         type: "done",
         totalInputTokens: inputTokens,
         totalOutputTokens: outputTokens,
         totalCostUsd: 0, // local — no cost
         durationMs: Date.now() - started,
         model: modelId,
         finishReason: "stop"
      };
   }
}
