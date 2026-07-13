import { create } from "zustand";

export interface ProbeResult {
    provider: string;
    valid: boolean;
    capabilities: string[];
    latencyMs: number;
    models?: string[];
    error?: string;
}

interface ProbeState {
    key: string;
    provider: string;
    loading: boolean;
    result: ProbeResult | null;
    error: string | null;
    setKey: (k: string) => void;
    setProvider: (p: string) => void;
    setLoading: (v: boolean) => void;
    setResult: (r: ProbeResult | null) => void;
    setError: (e: string | null) => void;
    reset: () => void;
}

export const useProbeStore = create<ProbeState>(set => ({
    key: "",
    provider: "anthropic",
    loading: false,
    result: null,
    error: null,
    setKey: key => set({ key }),
    setProvider: provider => set({ provider }),
    setLoading: loading => set({ loading }),
    setResult: result => set({ result, error: null }),
    setError: error => set({ error, result: null }),
    reset: () => set({ key: "", result: null, error: null, loading: false })
}));
