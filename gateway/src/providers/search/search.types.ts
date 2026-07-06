import type {
   SearchOptions,
   SearchResult,
   ProbeResult
} from "../provider.types";
import { BaseProvider } from "../provider.base";

export interface SearchProviderAdapter extends BaseProvider {
   readonly category: "search";
   search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
   probe(): Promise<ProbeResult>;
}
