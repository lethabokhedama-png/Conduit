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

const MODELS: Model[] = [
    {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        provider: "groq",
        category: "chat",
        capabilities: ["chat", "function_calling", "json_mode", "streaming"],
        contextWindow: 128_000,
        inputCostPer1M: 0.59,
        outputCostPer1M: 0.79,
        maxOutputTokens: 32_768
    },
    {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        provider: "groq",
        category: "chat",
        capabilities: ["chat", "streaming"],
        contextWindow: 128_000,
        inputCostPer1M: 0.05,
        outputCostPer1M: 0.08,
        maxOutputTokens: 8_192
    },
    {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        provider: "groq",
        category: "chat",
        capabilities: ["chat", "function_calling", "streaming"],
        contextWindow: 32_768,
        inputCostPer1M: 0.24,
        outputCostPer1M: 0.24,
        maxOutputTokens: 32_768
    },
    {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        provider: "groq",
        category: "chat",
        capabilities: ["chat", "streaming"],
        contextWindow: 8_192,
        inputCostPer1M: 0.2,
        outputCostPer1M: 0.2,
        maxOutputTokens: 8_192
    }
];

const MODEL_MAP = new Map(MODELS.map(m => [m.id, m]));
const API_BASE = "https://api.groq.com/openai";

// Groq uses the OpenAI-compatible API format — same chunk shape
interface GroqStreamChunk {
    choices: {
        delta: { content?: string | null };
        finish_reason: string | null;
    }[];
    x_groq?: { usage?: { prompt_tokens: number; completion_tokens: number } };
}

export class GroqProvider extends BaseProvider {
    readonly id = "groq";
    readonly name = "Groq";
    readonly category = "chat" as const;

    listModels(): Model[] {
        return MODELS;
    }

    async probe(): Promise<ProbeResult> {
        const started = Date.now();
        if (!this.isConfigured())
            return { status: "unconfigured", latencyMs: 0, modelsAvailable: 0 };

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
                    status: "provider_down" as const,
                    latencyMs,
                    modelsAvailable: 0,
                    error: `HTTP ${response.status}`
                };
            return {
                status: "active",
                latencyMs,
                modelsAvailable: MODELS.length
            };
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
                error: `Unknown Groq model: ${modelId}`,
                retryable: false
            };
            return;
        }

        const formattedMessages = messages.map(m => ({
            role: m.role,
            content: m.content
        }));
        if (options.systemPrompt)
            formattedMessages.unshift({
                role: "system",
                content: options.systemPrompt
            });

        const body = {
            model: modelId,
            messages: formattedMessages,
            max_tokens: options.maxTokens ?? model.maxOutputTokens,
            stream: true,
            ...(options.temperature !== undefined
                ? { temperature: options.temperature }
                : {})
        };

        let response: Response;
        try {
            response = await fetch(`${API_BASE}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.getApiKey()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body),
                signal: this.timeoutSignal(60_000)
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
                let chunk: GroqStreamChunk;
                try {
                    chunk = JSON.parse(data) as GroqStreamChunk;
                } catch {
                    continue;
                }

                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    outputTokens++;
                    yield { type: "token", content, tokens: outputTokens };
                }

                if (chunk.x_groq?.usage) {
                    inputTokens = chunk.x_groq.usage.prompt_tokens;
                    outputTokens = chunk.x_groq.usage.completion_tokens;
                }
            }
        } catch (err) {
            yield {
                type: "error",
                code: "provider_down",
                error:
                    err instanceof Error ? err.message : "Stream read failed",
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
