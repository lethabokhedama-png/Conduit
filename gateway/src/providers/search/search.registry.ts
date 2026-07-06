import { SerpApiProvider } from "./serpapi.search";
import { BraveSearchProvider } from "./brave.search";
import { withCache, cacheDelete } from "@db/redis/redis.cache";
import type { ProviderHealth } from "../provider.types";
import type { BaseProvider } from "../provider.base";

const SEARCH_ADAPTERS: BaseProvider[] = [
   new SerpApiProvider(),
   new BraveSearchProvider()
];

const ADAPTER_MAP = new Map(SEARCH_ADAPTERS.map(a => [a.id, a]));
const HEALTH_CACHE_NS = "search-provider-health";
const HEALTH_CACHE_TTL = 30;

export function getSearchAdapter(providerId: string): BaseProvider | undefined {
   return ADAPTER_MAP.get(providerId);
}

export function allSearchAdapters(): BaseProvider[] {
   return SEARCH_ADAPTERS;
}

export function configuredSearchAdapters(): BaseProvider[] {
   return SEARCH_ADAPTERS.filter(a => a.isConfigured());
}

export async function getSearchProviderHealth(
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

export async function getAllSearchProviderHealth(): Promise<ProviderHealth[]> {
   return Promise.all(SEARCH_ADAPTERS.map(a => a.getHealth()));
}

export async function invalidateSearchHealthCache(
   providerId?: string
): Promise<void> {
   if (providerId) {
      await cacheDelete(HEALTH_CACHE_NS, providerId);
   } else {
      await Promise.all(
         SEARCH_ADAPTERS.map(a => cacheDelete(HEALTH_CACHE_NS, a.id))
      );
   }
}
