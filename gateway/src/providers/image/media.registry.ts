import { OpenAIImagesProvider } from "./openai.image";
import { StabilityProvider } from "./stability.image";
import { withCache, cacheDelete } from "@db/redis/redis.cache";
import type { ProviderHealth, ImageModel } from "../provider.types";
import type { ImageProviderAdapter } from "./media.types";

// Internal type that includes listImageModels for the registry
interface ImageAdapterInternal extends ImageProviderAdapter {
    listImageModels(): ImageModel[];
}

const IMAGE_ADAPTERS: ImageProviderAdapter[] = [
    new OpenAIImagesProvider(),
    new StabilityProvider()
];

const ADAPTER_MAP = new Map<string, ImageProviderAdapter>(
    IMAGE_ADAPTERS.map(a => [a.id, a])
);
const HEALTH_CACHE_NS = "image-provider-health";
const HEALTH_CACHE_TTL = 30;

export function allImageModels(): ImageModel[] {
    return IMAGE_ADAPTERS.flatMap(a =>
        (a as unknown as ImageAdapterInternal).listImageModels()
    );
}

export function getImageAdapter(
    providerId: string
): ImageProviderAdapter | undefined {
    return ADAPTER_MAP.get(providerId);
}

export function allImageAdapters(): ImageProviderAdapter[] {
    return IMAGE_ADAPTERS;
}

export function configuredImageAdapters(): ImageProviderAdapter[] {
    return IMAGE_ADAPTERS.filter(a => a.isConfigured());
}

export async function getImageProviderHealth(
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

export async function getAllImageProviderHealth(): Promise<ProviderHealth[]> {
    return Promise.all(IMAGE_ADAPTERS.map(a => a.getHealth()));
}

export async function invalidateImageHealthCache(
    providerId?: string
): Promise<void> {
    if (providerId) {
        await cacheDelete(HEALTH_CACHE_NS, providerId);
    } else {
        await Promise.all(
            IMAGE_ADAPTERS.map(a => cacheDelete(HEALTH_CACHE_NS, a.id))
        );
    }
}
