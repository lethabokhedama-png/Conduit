import { BaseProvider } from "../provider.base";
import { readErrorBody } from "../provider.sse";
import type {
   ProbeResult,
   SearchOptions,
   SearchResult
} from "../provider.types";

const API_BASE = "https://api.search.brave.com/res/v1";

interface BraveWebResult {
   title: string;
   url: string;
   description?: string;
   meta_url?: { hostname?: string };
   age?: string;
   thumbnail?: { src?: string };
}

interface BraveSearchResponse {
   web?: { results?: BraveWebResult[] };
   type?: string;
}

export class BraveSearchProvider extends BaseProvider {
   readonly id = "brave";
   readonly name = "Brave Search";
   readonly category = "search" as const;

   listModels() {
      return [];
   }

   async probe(): Promise<ProbeResult> {
      const started = Date.now();
      if (!this.isConfigured())
         return { status: "unconfigured", latencyMs: 0, modelsAvailable: 0 };

      try {
         // Probe with a minimal search query — Brave has no dedicated health endpoint
         const response = await fetch(`${API_BASE}/web/search?q=test&count=1`, {
            headers: {
               "Accept": "application/json",
               "Accept-Encoding": "gzip",
               "X-Subscription-Token": this.getApiKey()
            },
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
               status: "provider_down",
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
      const url = new URL(`${API_BASE}/web/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("count", String(options.count ?? 10));
      if (options.country) url.searchParams.set("country", options.country);
      if (options.language)
         url.searchParams.set("search_lang", options.language);
      if (options.freshness)
         url.searchParams.set("freshness", options.freshness);
      if (options.safeSearch === false)
         url.searchParams.set("safesearch", "off");

      const response = await fetch(url.toString(), {
         headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": this.getApiKey()
         },
         signal: this.timeoutSignal(15_000)
      });

      if (!response.ok) {
         const errorBody = await readErrorBody(response);
         throw new Error(
            `Brave Search error (${response.status}): ${errorBody}`
         );
      }

      const data = (await response.json()) as BraveSearchResponse;
      const results = data.web?.results ?? [];

      return results.map((r, i) => ({
         title: r.title,
         url: r.url,
         snippet: r.description ?? "",
         source: r.meta_url?.hostname,
         publishedAt: r.age,
         imageUrl: r.thumbnail?.src,
         rank: i + 1
      }));
   }
}
