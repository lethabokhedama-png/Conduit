import { useEffect, useRef, useCallback, useState } from "react";

type SocketStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseSocketOptions {
    url?: string;
    onMessage?: (data: unknown) => void;
    reconnect?: boolean;
    reconnectDelay?: number;
}

export function useSocket({
    url = `ws://${window.location.host}/ws`,
    onMessage,
    reconnect = true,
    reconnectDelay = 3000
}: UseSocketOptions = {}) {
    const wsRef = useRef<WebSocket | null>(null);
    const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [status, setStatus] = useState<SocketStatus>("disconnected");

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;
            setStatus("connecting");

            ws.onopen = () => setStatus("connected");
            ws.onclose = () => {
                setStatus("disconnected");
                if (reconnect)
                    retryRef.current = setTimeout(connect, reconnectDelay);
            };
            ws.onerror = () => setStatus("error");
            ws.onmessage = e => {
                try {
                    onMessage?.(JSON.parse(e.data as string));
                } catch {
                    onMessage?.(e.data);
                }
            };
        } catch {
            setStatus("error");
        }
    }, [url, onMessage, reconnect, reconnectDelay]);

    const send = useCallback((data: unknown) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (retryRef.current) clearTimeout(retryRef.current);
        wsRef.current?.close();
    }, []);

    useEffect(() => {
        // Only connect if WS URL is explicitly provided
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return { status, send, connect, disconnect };
}
