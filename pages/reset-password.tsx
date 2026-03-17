import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { executePasswordReset } from "../server/user/login";

export default function ResetPassword() {
    const router = useRouter();
    const { token } = router.query;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // If no token in URL and router is ready, show error
    useEffect(() => {
        if (router.isReady && !token) {
            setMessage({ text: "Invalid or missing reset token.", type: "error" });
        }
    }, [router.isReady, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setMessage({ text: "Invalid or missing reset token.", type: "error" });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }

        if (password.length < 8) {
            setMessage({ text: "Password must be at least 8 characters.", type: "error" });
            return;
        }

        if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
            setMessage({ text: "Password must contain at least one uppercase letter, one number, and one special character (!@#$%^&*).", type: "error" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await executePasswordReset(token as string, password);

            setMessage({ text: "Password successfully reset! Redirecting to login...", type: "success" });
            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (err: any) {
            setMessage({ text: err.message || "Invalid or expired token.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth">
            <div className="admin-auth__bg">
                <div className="admin-auth__orb admin-auth__orb--1" />
                <div className="admin-auth__orb admin-auth__orb--2" />
                <div className="admin-auth__grid-overlay" />
            </div>

            <div className="admin-auth__container" style={{ maxWidth: 500, margin: "auto" }}>
                <div className="admin-auth__form-panel" style={{ width: "100%", padding: "40px" }}>
                    <div className="admin-auth__form-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 24 }}>⚡</span>
                            <span className="grad-text" style={{ fontSize: 22, fontWeight: 800 }}>Static Engine</span>
                        </div>
                        <h1 className="admin-auth__title">Set New Password</h1>
                        <p className="admin-auth__subtitle">Create a new secure password for your account.</p>
                    </div>

                    {message && (
                        <div style={{
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            fontSize: "13px",
                            textAlign: "center",
                            background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                            color: message.type === "success" ? "#22C55E" : "#EF4444",
                            border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    {!message || message.type !== "success" ? (
                        <form className="admin-auth__form" onSubmit={handleSubmit}>
                            <div className="admin-auth__input-group">
                                <label className="admin-auth__label">New Password</label>
                                <input
                                    type="password"
                                    className="admin-auth__input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="admin-auth__input-group">
                                <label className="admin-auth__label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="admin-auth__input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="admin-auth__submit"
                                disabled={loading || !token}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
