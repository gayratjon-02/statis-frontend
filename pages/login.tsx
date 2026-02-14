import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/libs/hooks/useAuth";
import { loginRequest, signupRequest } from "@/server/user/login";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, router]);

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const plans = [
        { id: "starter", name: "Starter", price: "$29", period: "/mo", credits: "50", badge: null },
        { id: "pro", name: "Pro", price: "$79", period: "/mo", credits: "250", badge: "POPULAR" },
        { id: "agency", name: "Agency", price: "$199", period: "/mo", credits: "1,000", badge: null },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            let response;

            if (mode === "login") {
                response = await loginRequest({ email, password });
            } else {
                response = await signupRequest({
                    email,
                    password,
                    full_name: name,
                });
            }

            login(response.accessToken, response.member);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth">
            {/* Left Panel — Brand Hero */}
            <div className="auth__hero">
                <div className="auth__hero-bg">
                    <div className="auth__hero-orb auth__hero-orb--1" />
                    <div className="auth__hero-orb auth__hero-orb--2" />
                    <div className="auth__hero-orb auth__hero-orb--3" />
                </div>

                <div className="auth__hero-content">
                    <div className="auth__hero-logo">
                        <div className="auth__hero-logo-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="auth__hero-logo-text">Static Engine</span>
                    </div>

                    <h1 className="auth__hero-title">
                        AI-Powered<br />
                        <span className="auth__hero-title--accent">Facebook Ad</span><br />
                        Image Generator
                    </h1>

                    <p className="auth__hero-desc">
                        Generate professional, scroll-stopping ad creatives in seconds — not days.
                        Select a concept, add your brand, and let AI do the rest.
                    </p>

                    <div className="auth__hero-features">
                        <div className="auth__hero-feature">
                            <div className="auth__hero-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span>6 ad variations per generation</span>
                        </div>
                        <div className="auth__hero-feature">
                            <div className="auth__hero-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span>Multi-ratio export (1:1, 9:16, 16:9)</span>
                        </div>
                        <div className="auth__hero-feature">
                            <div className="auth__hero-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span>AI error fixing &amp; refinement</span>
                        </div>
                        <div className="auth__hero-feature">
                            <div className="auth__hero-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span>Canva template marketplace</span>
                        </div>
                    </div>

                    <div className="auth__hero-social-proof">
                        <div className="auth__hero-avatars">
                            {["A", "M", "J", "S"].map((l, i) => (
                                <div key={i} className="auth__hero-avatar" style={{ zIndex: 4 - i }}>{l}</div>
                            ))}
                        </div>
                        <span className="auth__hero-social-text">
                            Trusted by <strong>2,400+</strong> marketers
                        </span>
                    </div>
                </div>

                <div className="auth__hero-footer">
                    © 2026 Static Engine · All rights reserved
                </div>
            </div>

            {/* Right Panel — Auth Form */}
            <div className="auth__form-panel">
                <div className="auth__form-container">
                    {/* Mode Toggle */}
                    <div className="auth__tabs">
                        <button
                            className={`auth__tab${mode === "login" ? " auth__tab--active" : ""}`}
                            onClick={() => setMode("login")}
                            type="button"
                        >
                            Log In
                        </button>
                        <button
                            className={`auth__tab${mode === "signup" ? " auth__tab--active" : ""}`}
                            onClick={() => setMode("signup")}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>

                    <h2 className="auth__form-title">
                        {mode === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="auth__form-subtitle">
                        {mode === "login"
                            ? "Enter your credentials to access your dashboard"
                            : "Start generating professional ad creatives today"}
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="auth__error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="16" r="1" fill="currentColor" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Social Auth */}
                    <div className="auth__social">
                        <button className="auth__social-btn" type="button">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                        <button className="auth__social-btn" type="button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Continue with Apple
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="auth__divider">
                        <span>or continue with email</span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth__form">
                        {mode === "signup" && (
                            <div className="auth__field">
                                <label className="auth__label">FULL NAME</label>
                                <div className="auth__input-wrap">
                                    <svg className="auth__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M20 21c0-3.87-3.58-7-8-7s-8 3.13-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <input
                                        className="auth__input"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="auth__field">
                            <label className="auth__label">EMAIL ADDRESS</label>
                            <div className="auth__input-wrap">
                                <svg className="auth__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <input
                                    className="auth__input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth__field">
                            <div className="auth__label-row">
                                <label className="auth__label">PASSWORD</label>
                                {mode === "login" && (
                                    <button className="auth__forgot" type="button">Forgot password?</button>
                                )}
                            </div>
                            <div className="auth__input-wrap">
                                <svg className="auth__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="11" width="18" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
                                </svg>
                                <input
                                    className="auth__input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={mode === "signup" ? "Min 8 characters" : "Enter password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                                <button
                                    className="auth__eye"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Plan Selector (Signup only) */}
                        {mode === "signup" && (
                            <div className="auth__plans">
                                <label className="auth__label">SELECT YOUR PLAN</label>
                                <div className="auth__plans-grid">
                                    {plans.map((plan) => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            className={`auth__plan${selectedPlan === plan.id ? " auth__plan--active" : ""}`}
                                            onClick={() => setSelectedPlan(plan.id)}
                                        >
                                            {plan.badge && <span className="auth__plan-badge">{plan.badge}</span>}
                                            <span className="auth__plan-name">{plan.name}</span>
                                            <div className="auth__plan-price">
                                                <span className="auth__plan-amount">{plan.price}</span>
                                                <span className="auth__plan-period">{plan.period}</span>
                                            </div>
                                            <span className="auth__plan-credits">{plan.credits} credits/mo</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className={`auth__submit${isLoading ? " auth__submit--loading" : ""}`}
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="auth__submit-spinner" />
                            ) : mode === "login" ? (
                                "Log In"
                            ) : (
                                <>
                                    Get Started
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom */}
                    <p className="auth__switch">
                        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                        <button
                            className="auth__switch-link"
                            type="button"
                            onClick={() => setMode(mode === "login" ? "signup" : "login")}
                        >
                            {mode === "login" ? "Sign up free" : "Log in"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
