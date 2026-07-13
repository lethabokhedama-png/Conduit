import { create } from "zustand";

interface CodeState {
    language: string;
    code: string;
    output: string | null;
    running: boolean;
    error: string | null;
    setLanguage: (l: string) => void;
    setCode: (c: string) => void;
    setOutput: (o: string | null) => void;
    setRunning: (v: boolean) => void;
    setError: (e: string | null) => void;
}

export const useCodeStore = create<CodeState>(set => ({
    language: "python",
    code: 'print("Hello from Conduit sandbox!")',
    output: null,
    running: false,
    error: null,
    setLanguage: language => set({ language }),
    setCode: code => set({ code }),
    setOutput: output => set({ output, error: null }),
    setRunning: running => set({ running }),
    setError: error => set({ error, output: null })
}));
