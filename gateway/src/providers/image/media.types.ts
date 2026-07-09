import type {
    ImageModel,
    ImageGenerateOptions,
    ImageResult,
    ProbeResult,
    ProviderCategory
} from "../provider.types";

export interface ImageProviderAdapter {
    readonly id: string;
    readonly name: string;
    readonly category: ProviderCategory;
    isConfigured(): boolean;
    listModels(): ImageModel[];
    generate(
        prompt: string,
        modelId: string,
        options?: ImageGenerateOptions
    ): Promise<ImageResult[]>;
    probe(): Promise<ProbeResult>;
    getHealth(): Promise<import("../provider.types").ProviderHealth>;
}
