import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: "40px 20px",
                    background: "var(--bg, #0f172a)",
                    color: "var(--text, #f1f5f9)",
                    fontFamily: "var(--font-body, sans-serif)",
                    textAlign: "center",
                }}>
                    <div style={{
                        background: "var(--bg-card, #1e293b)",
                        border: "1px solid var(--border, #334155)",
                        borderRadius: "16px",
                        padding: "48px 40px",
                        maxWidth: "480px",
                        width: "100%",
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>!</div>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                            Something went wrong
                        </h2>
                        <p style={{ fontSize: "14px", color: "var(--muted, #94a3b8)", marginBottom: "24px", lineHeight: 1.5 }}>
                            An unexpected error occurred. Please try again.
                        </p>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre style={{
                                background: "var(--bg-input, #0f172a)",
                                border: "1px solid var(--border, #334155)",
                                borderRadius: "8px",
                                padding: "12px",
                                fontSize: "12px",
                                color: "#ef4444",
                                textAlign: "left",
                                overflow: "auto",
                                maxHeight: "120px",
                                marginBottom: "24px",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            }}>
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            style={{
                                background: "var(--accent, #3ECFCF)",
                                color: "#0f172a",
                                border: "none",
                                borderRadius: "10px",
                                padding: "12px 32px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
