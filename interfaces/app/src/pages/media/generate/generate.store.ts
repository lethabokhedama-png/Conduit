import { create } from "zustand";

export interface GeneratedImage {
    url: string;
    prompt: string;
    model: string;
    createdAt: number;
}

interface GenerateState {
    prompt: string;
    model: string;
    loading: boolean;
    results: GeneratedImage[];
    error: string | null;
    setPrompt: (p: string) => void;
    setModel: (m: string) => void;
    setLoading: (v: boolean) => void;
    addResult: (r: GeneratedImage) => void;
    setError: (e: string | null) => void;
    clear: () => void;
}

export const useGenerateStore = create<GenerateState>(set => ({
    prompt: "",
    model: "dall-e-3",
    loading: false,
    results: [],
    error: null,
    setPrompt: prompt => set({ prompt }),
    setModel: model => set({ model }),
    setLoading: loading => set({ loading }),
    addResult: r => set(s => ({ results: [r, ...s.results] })),
    setError: error => set({ error }),
    clear: () => set({ results: [], error: null })
}));
