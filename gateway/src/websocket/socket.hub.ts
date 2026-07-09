import type { ServerWebSocket } from "bun";
import { runCascade, cascadeIsUsable } from "@cascade/cascade.engine";
import { getChatAdapterForModel } from "@providers/chat/chat.registry";
import { loadConfig } from "@config/config.loader";
import { getLicenseState, type LicenseState } from "@license/license.state";
import type {
    ClientMessage,
    ClientChatMessage,
    GatewayMessage,
    GatewayStreamEvent
} from "./socket.types";
import type { WireEvent } from "@streaming/stream.types";
import type { ChatMessage } from "@providers/provider.types";

// ── License state cache (same pattern as middleware.version.ts) ───────────────

interface CachedState {
    state: LicenseState;
    expiresAt: number;
}

let _licenseCache: CachedState | null = null;
const LICENSE_CACHE_TTL_MS = 5_000;

async function getCachedLicenseState(): Promise<LicenseState> {
    const now = Date.now();
    if (_licenseCache && now < _licenseCache.expiresAt) {
        return _licenseCache.state;
    }
    const state = await getLicenseState();
    _licenseCache = { state, expiresAt: now + LICENSE_CACHE_TTL_MS };
    return state;
}

// ── Per-connection state ───────────────────────────────────────────────────────

/**
 * Tracks all in-flight streams for a single WebSocket connection.
 * Key: client-supplied requestId  Value: AbortController for cancellation.
 */
type ActiveStreams = Map<string, AbortController>;

// Attach per-connection stream map to the websocket object via a WeakMap
// so TypeScript doesn't complain about arbitrary properties on ServerWebSocket.
const connectionStreams = new WeakMap<object, ActiveStreams>();

// ── Send helpers ───────────────────────────────────────────────────────────────

function send(ws: ServerWebSocket<unknown>, msg: GatewayMessage): void {
    try {
        ws.send(JSON.stringify(msg));
    } catch {
        // Connection already closed — ignore
    }
}

function sendStreamEvent(
    ws: ServerWebSocket<unknown>,
    requestId: string,
    event: WireEvent
): void {
    const msg: GatewayStreamEvent = { type: "stream_event", requestId, event };
    send(ws, msg);
}

// ── Connection handler ────────────────────────────────────────────────────────

/**
 * Returns Bun WebSocket event handlers for the gateway's /ws endpoint.
 *
 * Design:
 * - One ActiveStreams map per connection, keyed by client requestId.
 * - Each stream runs in its own async loop; no shared generator state.
 * - Cancel signals the AbortController; the generator loop checks it after
 *   each event and breaks cleanly without throwing to the caller.
 * - Connection close cancels all in-flight streams atomically.
 * - License state is cached for 5s so it's not a Postgres call per message.
 */
export function createSocketHandlers() {
    return {
        open(ws: ServerWebSocket<unknown>) {
            connectionStreams.set(ws, new Map());
            console.log("[ws] Client connected");
        },

        async message(ws: ServerWebSocket<unknown>, raw: string | Buffer) {
            const streams = connectionStreams.get(ws);
            if (!streams) return; // shouldn't happen — open() always sets this

            let msg: ClientMessage;
            try {
                const text =
                    typeof raw === "string" ? raw : raw.toString("utf8");
                msg = JSON.parse(text) as ClientMessage;
            } catch {
                send(ws, {
                    type: "error",
                    code: "bad_message",
                    error: "Message must be a JSON object"
                });
                return;
            }

            switch (msg.type) {
                case "ping":
                    send(ws, {
                        type: "pong",
                        timestamp: new Date().toISOString()
                    });
                    break;

                case "cancel": {
                    const ctrl = streams.get(msg.requestId);
                    if (ctrl) {
                        ctrl.abort();
                        streams.delete(msg.requestId);
                        send(ws, {
                            type: "cancelled",
                            requestId: msg.requestId
                        });
                    }
                    break;
                }

                case "chat":
                    // Fire-and-forget — the async generator loop manages its own lifecycle
                    void handleChatStream(ws, streams, msg);
                    break;

                default:
                    send(ws, {
                        type: "error",
                        code: "unknown_message_type",
                        error: `Unknown message type: "${(msg as { type: string }).type}"`
                    });
            }
        },

        close(ws: ServerWebSocket<unknown>) {
            const streams = connectionStreams.get(ws);
            if (streams) {
                for (const ctrl of streams.values()) ctrl.abort();
                streams.clear();
                connectionStreams.delete(ws);
            }
            console.log("[ws] Client disconnected");
        }
    };
}

// ── Chat stream handler ───────────────────────────────────────────────────────

async function handleChatStream(
    ws: ServerWebSocket<unknown>,
    streams: ActiveStreams,
    req: ClientChatMessage
): Promise<void> {
    const { requestId } = req;

    if (streams.has(requestId)) {
        send(ws, {
            type: "error",
            code: "duplicate_request_id",
            error: `A stream with requestId "${requestId}" is already in progress`
        });
        return;
    }

    // Version lock check — uses 5s in-memory cache, not a live Postgres query
    const licenseState = await getCachedLicenseState();
    if (licenseState.status === "update_required") {
        sendStreamEvent(ws, requestId, {
            type: "error",
            code: "unknown",
            error: `Conduit ${licenseState.installedVersion} requires update to >= ${licenseState.minimumVersion}`,
            retryable: false
        });
        return;
    }

    const ctrl = new AbortController();
    streams.set(requestId, ctrl);

    const config = loadConfig();
    const messages: ChatMessage[] = req.messages;

    const shouldCascade =
        req.cascadeEnabled === true &&
        config.features.cascade &&
        cascadeIsUsable();

    let events: AsyncGenerator<WireEvent>;

    if (shouldCascade) {
        const profileName = req.cascadeProfile ?? "balanced";
        const profile = config.cascade.profiles[profileName];

        if (!profile) {
            sendStreamEvent(ws, requestId, {
                type: "error",
                code: "unknown",
                error: `Unknown cascade profile: "${profileName}"`,
                retryable: false
            });
            streams.delete(requestId);
            return;
        }

        events = runCascade({
            messages,
            profile,
            preferredModel: req.model,
            ...(req.conversationId !== undefined
                ? { conversationId: req.conversationId }
                : {})
        }) as AsyncGenerator<WireEvent>;
    } else {
        const adapter = getChatAdapterForModel(req.model);

        if (!adapter) {
            sendStreamEvent(ws, requestId, {
                type: "error",
                code: "unknown",
                error: `Unknown model: "${req.model}"`,
                retryable: false
            });
            streams.delete(requestId);
            return;
        }

        if (!adapter.isConfigured()) {
            sendStreamEvent(ws, requestId, {
                type: "error",
                code: "unknown",
                error: `Provider for model "${req.model}" has no API key configured`,
                retryable: false
            });
            streams.delete(requestId);
            return;
        }

        events = (
            adapter as unknown as {
                stream(
                    messages: ChatMessage[],
                    modelId: string,
                    options?: {
                        maxTokens?: number;
                        temperature?: number;
                        systemPrompt?: string;
                    }
                ): AsyncGenerator<WireEvent>;
            }
        ).stream(messages, req.model, {
            ...(req.maxTokens !== undefined
                ? { maxTokens: req.maxTokens }
                : {}),
            ...(req.temperature !== undefined
                ? { temperature: req.temperature }
                : {}),
            ...(req.systemPrompt !== undefined
                ? { systemPrompt: req.systemPrompt }
                : {})
        });
    }

    // ── Forward events until done, error, or cancelled ────────────────────────
    try {
        for await (const event of events) {
            if (ctrl.signal.aborted) break;

            sendStreamEvent(ws, requestId, event);

            if (
                event.type === "done" ||
                event.type === "error" ||
                event.type === "cascade_exhausted" ||
                event.type === "cascade_complete"
            ) {
                break;
            }
        }
    } catch (err) {
        if (!ctrl.signal.aborted) {
            sendStreamEvent(ws, requestId, {
                type: "error",
                code: "unknown",
                error: err instanceof Error ? err.message : "Stream failed",
                retryable: false
            });
        }
    } finally {
        streams.delete(requestId);
    }
}
