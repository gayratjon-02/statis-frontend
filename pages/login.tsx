import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { loginRequest, signupRequest } from "../server/user/login";
import { createCheckoutRequest } from "../server/user/billing";
import { useAuth } from "../libs/hooks/useAuth";

export default function UserAuth() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "signup">("login");

    const { isAuthenticated } = useAuth();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated === true) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, router]);

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
    const [loadingStep, setLoadingStep] = useState<"account" | "payment">("account");
    const [error, setError] = useState("");

    // ── Plan selection ──
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const planInfo: Record<string, { label: string; price: string; credits: string; badge?: string }> = {
        starter: { label: "Starter", price: "$39/mo", credits: "250 credits" },
        pro: { label: "Pro", price: "$99/mo", credits: "750 credits", badge: "POPULAR" },
        growth: { label: "Growth", price: "$199/mo", credits: "2,000 credits" },
    };

    const handlePlanSelect = (tier: string) => {
        setSelectedPlan(tier);
        setMode("signup");
        setError("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setLoadingStep("account");
        try {
            const res = await loginRequest({ email: loginEmail, password: loginPassword });
            localStorage.setItem("se_access_token", res.accessToken);
            localStorage.setItem("se_member", JSON.stringify(res.member));

            // Subscription yo'q bo'lsa → plan tanlash sahifasiga
            if (res.needs_subscription) {
                router.push("/subscribe");
            } else {
                router.push("/dashboard");
            }
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
        setLoadingStep("account");
        try {
            const res = await signupRequest({
                email: signupEmail,
                password: signupPassword,
                full_name: signupName,
            });
            localStorage.setItem("se_access_token", res.accessToken);
            localStorage.setItem("se_member", JSON.stringify(res.member));

            // Agar plan tanlangan bo'lsa → to'g'ridan-to'g'ri Stripe checkout
            if (selectedPlan && planInfo[selectedPlan]) {
                setLoadingStep("payment");
                try {
                    const { checkout_url } = await createCheckoutRequest(selectedPlan, "monthly");
                    window.location.href = checkout_url;
                } catch (checkoutErr: any) {
                    setError(checkoutErr.message || "Payment setup failed. You can subscribe from the Billing page.");
                    setLoading(false);
                    setTimeout(() => router.push("/subscribe"), 2500);
                }
            } else {
                // Plan tanlanmagan → subscribe sahifasiga
                router.push("/subscribe");
            }
        } catch (err: any) {
            setError(err.message || "Signup failed");
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

                        {/* Plan selection */}
                        <div style={{ marginTop: 28 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
                                {selectedPlan && planInfo[selectedPlan] ? "Selected Plan" : "Choose a Plan"}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {(Object.entries(planInfo) as [string, { label: string; price: string; credits: string; badge?: string }][]).map(([tier, info]) => {
                                    const isActive = selectedPlan === tier;
                                    return (
                                        <div
                                            key={tier}
                                            onClick={() => handlePlanSelect(tier)}
                                            style={{
                                                padding: "13px 16px",
                                                borderRadius: 12,
                                                border: `1px solid ${isActive ? "rgba(62,207,207,0.5)" : "rgba(255,255,255,0.07)"}`,
                                                background: isActive ? "rgba(62,207,207,0.08)" : "rgba(255,255,255,0.03)",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                transition: "border-color 0.15s, background 0.15s",
                                                position: "relative",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 18, height: 18, borderRadius: "50%",
                                                    border: `2px solid ${isActive ? "#3ECFCF" : "rgba(255,255,255,0.2)"}`,
                                                    background: isActive ? "#3ECFCF" : "transparent",
                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                                }}>
                                                    {isActive && <span style={{ color: "#0a0a0f", fontSize: 10, fontWeight: 800 }}>✓</span>}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "#3ECFCF" : "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                                                        {info.label}
                                                        {info.badge && (
                                                            <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(62,207,207,0.15)", color: "#3ECFCF", padding: "2px 7px", borderRadius: 20, letterSpacing: 0.5 }}>
                                                                {info.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{info.credits}/mo</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#3ECFCF" : "var(--muted)" }}>
                                                {info.price}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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

                        {/* Selected plan banner */}
                        {selectedPlan && planInfo[selectedPlan] && mode === "signup" && (
                            <div style={{
                                background: "linear-gradient(135deg, rgba(62,207,207,0.12), rgba(120,80,255,0.12))",
                                border: "1px solid rgba(62,207,207,0.25)",
                                borderRadius: 12,
                                padding: "14px 18px",
                                marginBottom: 20,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}>
                                <span style={{ fontSize: 22 }}>🎯</span>
                                <div>
                                    <div style={{ color: "#3ECFCF", fontWeight: 700, fontSize: 14 }}>
                                        {planInfo[selectedPlan].label} Plan Selected
                                    </div>
                                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                                        {planInfo[selectedPlan].price} · {planInfo[selectedPlan].credits}/month
                                    </div>
                                </div>
                            </div>
                        )}

                        <h1 className="admin-auth__title">
                            {mode === "login" ? "Welcome back" : "Get started"}
                        </h1>
                        <p className="admin-auth__subtitle">
                            {mode === "login"
                                ? "Enter your credentials to access your dashboard"
                                : selectedPlan
                                    ? "Create your account and proceed to payment"
                                    : "Create your account — you can choose a plan on the left"}
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
                                            <span className="admin-auth__spinner" />
                                            {loadingStep === "payment"
                                                ? "Redirecting to payment..."
                                                : "Creating account..."}
                                        </>
                                    ) : (
                                        selectedPlan && planInfo[selectedPlan]
                                            ? `Create Account & Pay`
                                            : "Create Account"
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
