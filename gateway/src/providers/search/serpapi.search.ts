import { BaseProvider } from "../provider.base";
import { readErrorBody } from "../provider.sse";
import type {
    ProbeResult,
    SearchOptions,
    SearchResult
} from "../provider.types";

const API_BASE = "https://serpapi.com";

interface SerpApiOrganicResult {
    title: string;
    link: string;
    snippet?: string;
    source?: string;
    date?: string;
    thumbnail?: string;
    position: number;
}

interface SerpApiResponse {
    organic_results?: SerpApiOrganicResult[];
    error?: string;
}

export class SerpApiProvider extends BaseProvider {
    readonly id = "serpapi";
    readonly name = "SerpAPI";
    readonly category = "search" as const;

    listModels() {
        return [];
    }

    async probe(): Promise<ProbeResult> {
        const started = Date.now();
        if (!this.isConfigured())
            return { status: "unconfigured", latencyMs: 0, modelsAvailable: 0 };

        try {
            const url = new URL(`${API_BASE}/account.json`);
            url.searchParams.set("api_key", this.getApiKey());

            const response = await fetch(url.toString(), {
                signal: this.timeoutSignal(8_000)
            });
            const latencyMs = Date.now() - started;

            if (response.status === 401 || response.status === 403)
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
            return { status: "active", latencyMs, modelsAvailable: 0 };
        } catch (err) {
            return {
                status: "unreachable",
                latencyMs: Date.now() - started,
                modelsAvailable: 0,
                error: err instanceof Error ? err.message : "Unknown error"
            };
        }
    }

    async search(
        query: string,
        options: SearchOptions = {}
    ): Promise<SearchResult[]> {
        const url = new URL(`${API_BASE}/search.json`);
        url.searchParams.set("q", query);
        url.searchParams.set("api_key", this.getApiKey());
        url.searchParams.set("num", String(options.count ?? 10));
        if (options.country) url.searchParams.set("gl", options.country);
        if (options.language) url.searchParams.set("hl", options.language);
        if (options.safeSearch === false) url.searchParams.set("safe", "off");

        const response = await fetch(url.toString(), {
            signal: this.timeoutSignal(15_000)
        });

        if (!response.ok) {
            const errorBody = await readErrorBody(response);
            throw new Error(`SerpAPI error (${response.status}): ${errorBody}`);
        }

        const data = (await response.json()) as SerpApiResponse;

        if (data.error) throw new Error(`SerpAPI: ${data.error}`);

        return (data.organic_results ?? []).map(r => ({
            title: r.title,
            url: r.link,
            snippet: r.snippet ?? "",
            rank: r.position,
            ...(r.source !== undefined ? { source: r.source } : {}),
            ...(r.date !== undefined ? { publishedAt: r.date } : {}),
            ...(r.thumbnail !== undefined ? { imageUrl: r.thumbnail } : {})
        }));
    }
}
