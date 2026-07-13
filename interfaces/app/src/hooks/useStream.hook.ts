import { useRef, useCallback } from "react";
import { streamChat } from "@/lib/api.lib";
import type { WireEvent } from "@/lib/api.lib";

interface UseStreamOptions {
    onToken: (
        content: string,
        model: string,
        tokens: number,
        cost: number
    ) => void;
    onCascade: (from: string, to: string, reason: string, at: number) => void;
    onDone: (
        totalTokens: number,
        totalCost: number,
        durationMs: number
    ) => void;
    onError: (msg: string) => void;
}

export function useStream(opts: UseStreamOptions) {
    const abortRef = useRef<AbortController | null>(null);

    const start = useCallback(
        async (body: Parameters<typeof streamChat>[0]) => {
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;

            try {
                for await (const evt of streamChat(body, ctrl.signal)) {
                    const e = evt as WireEvent;
                    if (e.type === "token")
                        opts.onToken(e.content, e.model, e.tokens, e.costUsd);
                    if (e.type === "cascade")
                        opts.onCascade(e.from, e.to, e.reason, e.at);
                    if (e.type === "done")
                        opts.onDone(
                            e.totalTokens,
                            e.totalCostUsd,
                            e.durationMs
                        );
                    if (e.type === "error") opts.onError(e.error);
                }
            } catch (err) {
                if ((err as Error).name !== "AbortError")
                    opts.onError(String(err));
            }
        },
        [opts]
    );

    const cancel = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);

    return { start, cancel };
}
