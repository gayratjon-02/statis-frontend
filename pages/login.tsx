import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { loginRequest, signupRequest } from "../server/user/login";

export default function UserAuth() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "signup">("login");

    // If already logged in, redirect to dashboard
    useEffect(() => {
        const token = localStorage.getItem("se_access_token");
        if (token) {
            router.replace("/dashboard");
        }
    }, [router]);

    // ── Login state ──
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // ── Signup state ──
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await loginRequest({ email: loginEmail, password: loginPassword });
            localStorage.setItem("se_access_token", res.accessToken);
            localStorage.setItem("se_user", JSON.stringify(res.member));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupPassword !== signupConfirm) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await signupRequest({
                email: signupEmail,
                password: signupPassword,
                full_name: signupName,
            });
            localStorage.setItem("se_access_token", res.accessToken);
            localStorage.setItem("se_user", JSON.stringify(res.member));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth">
            {/* Background decoration */}
            <div className="admin-auth__bg">
                <div className="admin-auth__orb admin-auth__orb--1" />
                <div className="admin-auth__orb admin-auth__orb--2" />
                <div className="admin-auth__grid-overlay" />
            </div>

            <div className="admin-auth__container">
                {/* Left — branding panel */}
                <div className="admin-auth__brand-panel">
                    <div className="admin-auth__brand-content">
                        <div className="admin-auth__logo">
                            <span className="admin-auth__logo-icon">⚡</span>
                            <span className="admin-auth__logo-text grad-text">Static Engine</span>
                        </div>
                        <div className="admin-auth__brand-tag">AI Ad Generator</div>
                        <p className="admin-auth__brand-desc">
                            Generate high-quality static ads in seconds. Upload your brand, pick a concept, and let AI do the rest.
                        </p>

                        <div className="admin-auth__features">
                            {[
                                { icon: "🎨", title: "6 Variations Per Click", desc: "Every generation gives you 6 unique ad images" },
                                { icon: "⚡", title: "60-Second Generation", desc: "From concept to finished ads in under a minute" },
                                { icon: "📐", title: "Multi-Ratio Export", desc: "1:1, 9:16, and 16:9 formats included" },
                            ].map((feature, i) => (
                                <div key={i} className="admin-auth__feature">
                                    <span className="admin-auth__feature-icon">{feature.icon}</span>
                                    <div>
                                        <div className="admin-auth__feature-title">{feature.title}</div>
                                        <div className="admin-auth__feature-desc">{feature.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — auth form */}
                <div className="admin-auth__form-panel">
                    <div className="admin-auth__form-wrapper">
                        {/* Tab Switch */}
                        <div className="admin-auth__tabs">
                            <button
                                className={`admin-auth__tab ${mode === "login" ? "admin-auth__tab--active" : ""}`}
                                onClick={() => { setMode("login"); setError(""); }}
                            >
                                Sign In
                            </button>
                            <button
                                className={`admin-auth__tab ${mode === "signup" ? "admin-auth__tab--active" : ""}`}
                                onClick={() => { setMode("signup"); setError(""); }}
                            >
                                Create Account
                            </button>
                        </div>

                        <h1 className="admin-auth__title">
                            {mode === "login" ? "Welcome back" : "Start your free trial"}
                        </h1>
                        <p className="admin-auth__subtitle">
                            {mode === "login"
                                ? "Enter your credentials to access your dashboard"
                                : "Create an account and start generating ads today"}
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="admin-auth__error">
                                <span className="admin-auth__error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* ── Login Form ── */}
                        {mode === "login" ? (
                            <form onSubmit={handleLogin} className="admin-auth__form">
                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Email</label>
                                    <input
                                        className="admin-auth__input"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Password</label>
                                    <div className="admin-auth__input-group">
                                        <input
                                            className="admin-auth__input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="admin-auth__toggle-pw"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="admin-auth__submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="admin-auth__spinner" /> Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* ── Signup Form ── */
                            <form onSubmit={handleSignup} className="admin-auth__form">
                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Full Name</label>
                                    <input
                                        className="admin-auth__input"
                                        type="text"
                                        placeholder="John Doe"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Email</label>
                                    <input
                                        className="admin-auth__input"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Password</label>
                                    <div className="admin-auth__input-group">
                                        <input
                                            className="admin-auth__input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 6 characters"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="admin-auth__toggle-pw"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Confirm Password</label>
                                    <input
                                        className="admin-auth__input"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        value={signupConfirm}
                                        onChange={(e) => setSignupConfirm(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button type="submit" className="admin-auth__submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="admin-auth__spinner" /> Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="admin-auth__footer">
                            {mode === "login" ? (
                                <span>
                                    Don&apos;t have an account?{" "}
                                    <button className="admin-auth__link" onClick={() => { setMode("signup"); setError(""); }}>
                                        Create one
                                    </button>
                                </span>
                            ) : (
                                <span>
                                    Already have an account?{" "}
                                    <button className="admin-auth__link" onClick={() => { setMode("login"); setError(""); }}>
                                        Sign in
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
