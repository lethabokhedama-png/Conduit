import type {
   ImageModel,
   ImageGenerateOptions,
   ImageResult,
   ProbeResult
} from "../provider.types";
import { BaseProvider } from "../provider.base";

export interface ImageProviderAdapter extends BaseProvider {
   readonly category: "image";
   listModels(): ImageModel[];
   generate(
      prompt: string,
      modelId: string,
      options?: ImageGenerateOptions
   ): Promise<ImageResult[]>;
   probe(): Promise<ProbeResult>;
}
