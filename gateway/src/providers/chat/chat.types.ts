import type {
   ChatMessage,
   StreamEvent,
   StreamOptions
} from "../provider.types";
import { BaseProvider } from "../provider.base";

/**
 * Interface every chat provider adapter must satisfy beyond the BaseProvider
 * contract. The `stream` method is the core — it must yield StreamEvents
 * asynchronously and never throw; errors are yielded as StreamErrorEvents.
 */
export interface ChatProviderAdapter extends BaseProvider {
   readonly category: "chat";
   stream(
      messages: ChatMessage[],
      modelId: string,
      options?: StreamOptions
   ): AsyncGenerator<StreamEvent>;
}
