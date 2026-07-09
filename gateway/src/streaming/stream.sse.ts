import type { WireEvent } from "./stream.types";

// ── SSE response helpers ───────────────────────────────────────────────────────

/**
 * Serializes a WireEvent to an SSE `data:` line pair.
 * Format: `data: <json>\n\n`
 *
 * JSON serialization errors (which can't happen with our typed events)
 * are caught and replaced with an error event so the stream never stalls.
 */
export function encodeEvent(event: WireEvent): string {
    let json: string;
    try {
        json = JSON.stringify(event);
    } catch {
        json = JSON.stringify({
            type: "error",
            code: "unknown",
            error: "Failed to serialize event",
            retryable: false
        });
    }
    return `data: ${json}\n\n`;
}

/**
 * Encodes a named SSE event (used for keep-alives and control signals).
 * Format: `event: <name>\ndata: <json>\n\n`
 */
export function encodeNamedEvent(name: string, data: unknown): string {
    const json = JSON.stringify(data);
    return `event: ${name}\ndata: ${json}\n\n`;
}

/**
 * SSE keep-alive comment ping. Sent every 15 seconds to prevent proxy
 * timeouts and to let the client detect dropped connections quickly.
 * Format: `: ping\n\n` (comment line — clients ignore it)
 */
export const SSE_PING = ": ping\n\n";

// ── Streaming response factory ─────────────────────────────────────────────────

export interface StreamSSEOptions {
    /**
     * Interval in ms between keep-alive pings.
     * Defaults to 15 000ms. Set to 0 to disable.
     */
    pingIntervalMs?: number;
}

/**
 * Creates a Hono `Response` with the correct SSE headers and a `ReadableStream`
 * body populated by an async generator of `WireEvent`s.
 *
 * The caller provides a generator factory function `getEvents` that receives
 * a `controller` to enqueue additional raw strings (used for keep-alive pings).
 * The generator never throws — all errors must be yielded as typed error events.
 *
 * Keep-alive pings are interleaved using a racing approach: the generator and
 * a repeating ping timer race on every iteration. The ping wins if the upstream
 * is slow, keeping the connection alive for Nginx/Cloudflare proxies that
 * enforce idle timeouts.
 *
 * @param events    Async generator of WireEvents from the cascade engine or
 *                  a provider adapter
 * @param options   Optional ping interval override
 */
export function createSSEResponse(
    events: AsyncGenerator<WireEvent>,
    options: StreamSSEOptions = {}
): Response {
    const pingIntervalMs = options.pingIntervalMs ?? 15_000;

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            const enqueue = (chunk: string): void => {
                controller.enqueue(encoder.encode(chunk));
            };

            let pingTimer: ReturnType<typeof setInterval> | null = null;

            if (pingIntervalMs > 0) {
                pingTimer = setInterval(() => {
                    try {
                        enqueue(SSE_PING);
                    } catch {
                        // Controller may already be closed — ignore
                    }
                }, pingIntervalMs);
            }

            try {
                for await (const event of events) {
                    enqueue(encodeEvent(event));

                    // End the stream after final events — the client will close its
                    // EventSource on receiving these, but closing here prevents resource
                    // leaks if the client doesn't close immediately.
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
                // Generator threw unexpectedly — emit a typed error before closing
                const errorEvent: WireEvent = {
                    type: "error",
                    code: "unknown",
                    error:
                        err instanceof Error
                            ? err.message
                            : "Stream generator failed",
                    retryable: false
                };
                enqueue(encodeEvent(errorEvent));
            } finally {
                if (pingTimer !== null) clearInterval(pingTimer);
                try {
                    controller.close();
                } catch {
                    // Already closed — ignore
                }
            }
        }
    });

    return new Response(stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no" // disable Nginx proxy buffering
        }
    });
}

/**
 * Sends a single SSE error event and closes the stream immediately.
 * Used in route handlers when a request fails before streaming begins
 * (e.g. validation error, no providers configured).
 */
export function sseError(
    code: string,
    message: string,
    retryable = false
): Response {
    async function* single(): AsyncGenerator<WireEvent> {
        yield { type: "error", code, error: message, retryable } as WireEvent;
    }
    return createSSEResponse(single());
}
