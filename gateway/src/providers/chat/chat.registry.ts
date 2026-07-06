import { AnthropicProvider } from "./anthropic.provider";
import { OpenAIProvider } from "./openai.provider";
import { GoogleProvider } from "./google.provider";
import { GroqProvider } from "./groq.provider";
import { OllamaProvider } from "./ollama.provider";
import { withCache, cacheDelete } from "@db/redis/redis.cache";
import type { ProviderHealth, Model } from "../provider.types";
import type { BaseProvider } from "../provider.base";

// ── Registry ──────────────────────────────────────────────────────────────────

const CHAT_ADAPTERS: BaseProvider[] = [
   new AnthropicProvider(),
   new OpenAIProvider(),
   new GoogleProvider(),
   new GroqProvider(),
   new OllamaProvider()
];

const ADAPTER_MAP = new Map(CHAT_ADAPTERS.map(a => [a.id, a]));

// Pre-built model → provider map for O(1) model lookups on every request
const MODEL_TO_PROVIDER = new Map<string, BaseProvider>();

for (const adapter of CHAT_ADAPTERS) {
   for (const model of adapter.listModels()) {
      MODEL_TO_PROVIDER.set(model.id, adapter);
   }
}

// ── Accessors ─────────────────────────────────────────────────────────────────

export function getChatAdapter(providerId: string): BaseProvider | undefined {
   return ADAPTER_MAP.get(providerId);
}

export function getChatAdapterForModel(
   modelId: string
): BaseProvider | undefined {
   // Direct match
   const direct = MODEL_TO_PROVIDER.get(modelId);
   if (direct) return direct;

   // Prefix match for Ollama (e.g. 'ollama/llama3' → OllamaProvider)
   const prefix = modelId.split("/")[0];
   if (prefix) return ADAPTER_MAP.get(prefix);

   return undefined;
}

export function allChatAdapters(): BaseProvider[] {
   return CHAT_ADAPTERS;
}

export function configuredChatAdapters(): BaseProvider[] {
   return CHAT_ADAPTERS.filter(a => a.isConfigured());
}

export function allChatModels(): Model[] {
   return CHAT_ADAPTERS.flatMap(a => a.listModels());
}

// ── Health ────────────────────────────────────────────────────────────────────

const HEALTH_CACHE_NS = "provider-health";
const HEALTH_CACHE_TTL = 30; // seconds

/**
 * Returns cached health for a provider, falling back to a live probe if the
 * cache is cold. Health probes are expensive (real HTTP calls to external
 * APIs) — we cache for 30 seconds so the runtime dashboard can poll freely
 * without hammering providers.
 */
export async function getChatProviderHealth(
   providerId: string
): Promise<ProviderHealth | null> {
   const adapter = ADAPTER_MAP.get(providerId);
   if (!adapter) return null;

   return withCache<ProviderHealth>(
      HEALTH_CACHE_NS,
      providerId,
      HEALTH_CACHE_TTL,
      () => adapter.getHealth()
   );
}

export async function getAllChatProviderHealth(): Promise<ProviderHealth[]> {
   return Promise.all(CHAT_ADAPTERS.map(a => a.getHealth()));
}

/**
 * Clears the health cache for a provider. Called after a key is saved or
 * deleted so the next health check reflects the new key state.
 */
export async function invalidateChatHealthCache(
   providerId?: string
): Promise<void> {
   if (providerId) {
      await cacheDelete(HEALTH_CACHE_NS, providerId);
   } else {
      await Promise.all(
         CHAT_ADAPTERS.map(a => cacheDelete(HEALTH_CACHE_NS, a.id))
      );
   }
}
