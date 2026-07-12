const BASE = "/api";

export async function api<T>(path: string, opts?: RequestInit): Promise<T> {
    const r = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...opts
    });
    if (!r.ok) {
        const body = await r.text().catch(() => "");
        throw new Error(`${r.status}: ${body}`);
    }
    return r.json() as Promise<T>;
}

export type WireEvent =
    | {
          type: "token";
          content: string;
          model: string;
          tokens: number;
          costUsd: number;
      }
    | { type: "cascade"; from: string; to: string; reason: string; at: number }
    | {
          type: "done";
          totalTokens: number;
          totalCostUsd: number;
          durationMs: number;
      }
    | { type: "error"; error: string; code: string };

export async function* streamChat(
    body: {
        model: string;
        messages: { role: string; content: string }[];
        conversationId?: string;
        cascadeEnabled?: boolean;
        profile?: string;
    },
    signal: AbortSignal
): AsyncGenerator<WireEvent> {
    const resp = await fetch(`${BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal
    });

    if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);

    const reader = resp.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                try {
                    yield JSON.parse(line.slice(6)) as WireEvent;
                } catch {
                    /* skip malformed */
                }
            }
        }
    }
}

// Typed API helpers
export const getModels = () =>
    api<{
        chat: { id: string; name: string; contextWindow?: number }[];
        image: { id: string }[];
    }>("/models");
export const getProviders = () =>
    api<{
        providers: {
            id: string;
            configured: boolean;
            healthy: boolean;
            latencyMs?: number;
        }[];
    }>("/providers/health");
export const getKeys = () =>
    api<{ provider: string; hint: string; savedAt: string }[]>("/keys");
export const saveKey = (provider: string, key: string) =>
    api("/keys", { method: "POST", body: JSON.stringify({ provider, key }) });
export const deleteKey = (provider: string) =>
    api(`/keys/${provider}`, { method: "DELETE" });
export const introspectKey = (provider: string, key: string) =>
    api("/keys/introspect", {
        method: "POST",
        body: JSON.stringify({ provider, key })
    });
export const probeKey = (provider: string, key: string) =>
    api("/discovery/probe", {
        method: "POST",
        body: JSON.stringify({ provider, key })
    });
export const getHistory = (id: string) =>
    api<{ messages: unknown[] }>(`/chat/history/${id}`);
export const getStatus = () =>
    api<{
        overall: string;
        services: { name: string; status: string; latencyMs: number | null }[];
    }>("/status");
export const getHealth = () =>
    api<{ status: string; timestamp: string }>("/health");
export const generateMedia = (body: unknown) =>
    api("/media/generate", { method: "POST", body: JSON.stringify(body) });
export const runSearch = (query: string, provider: string) =>
    api("/search/query", {
        method: "POST",
        body: JSON.stringify({ query, provider })
    });
export const executeCode = (code: string, language: string) =>
    api("/code/execute", {
        method: "POST",
        body: JSON.stringify({ code, language })
    });
