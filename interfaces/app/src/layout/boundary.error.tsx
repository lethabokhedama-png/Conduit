import { Component, type ReactNode, type ErrorInfo } from "react";
import { C } from "@/lib/tokens";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}
interface State {
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info);
    }

    render() {
        if (this.state.error) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        gap: 14,
                        padding: "40px",
                        fontFamily: C.sans
                    }}
                >
                    <div style={{ fontSize: 13, color: C.red }}>
                        Something went wrong
                    </div>
                    <pre
                        style={{
                            fontSize: 10,
                            color: C.dim,
                            fontFamily: C.mono,
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            padding: "10px 14px",
                            maxWidth: 480,
                            overflowX: "auto",
                            whiteSpace: "pre-wrap"
                        }}
                    >
                        {this.state.error.message}
                    </pre>
                    <button
                        onClick={() => this.setState({ error: null })}
                        style={{
                            padding: "7px 14px",
                            background: C.surface2,
                            border: `1px solid ${C.border2}`,
                            borderRadius: 6,
                            color: C.sub,
                            fontSize: 12,
                            cursor: "pointer"
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
