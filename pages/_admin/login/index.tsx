import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../../../libs/hooks/useAdminAuth";
import { adminPath } from "../../../libs/utils/adminPath";
import { adminLogin, adminSignup, adminGoogleAuth } from "../../../server/admin/adminPostApis";
import { AdminRole } from "../../../libs/enums/admin.enum";
import { useGoogleLogin } from "@react-oauth/google";

export default function AdminAuth() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAdminAuth();
    const [mode, setMode] = useState<"login" | "signup">("login");

    // If already logged in, redirect to admin homepage
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(adminPath("/_admin/homepage"));
        }
    }, [isLoading, isAuthenticated, router]);

    // ── Login state ──
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // ── Signup state ──
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");
    const [signupRole, setSignupRole] = useState<AdminRole>(AdminRole.CONTENT_ADMIN);
    const [signupInviteToken, setSignupInviteToken] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Google two-step flow state ──
    const [pendingGoogleToken, setPendingGoogleToken] = useState("");
    const [googleInviteToken, setGoogleInviteToken] = useState("");
    const [googleEmail, setGoogleEmail] = useState("");
    const [showInvitePrompt, setShowInvitePrompt] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await adminLogin({ email: loginEmail, password: loginPassword });
            localStorage.setItem("se_admin_token", res.accessToken);
            localStorage.setItem("se_admin_user", JSON.stringify(res.admin));
            router.push(adminPath("/_admin/homepage"));
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
            const res = await adminSignup({
                email: signupEmail,
                password: signupPassword,
                name: signupName,
                role: signupRole,
                inviteToken: signupInviteToken || undefined,
            });
            localStorage.setItem("se_admin_token", res.accessToken);
            localStorage.setItem("se_admin_user", JSON.stringify(res.admin));
            router.push(adminPath("/_admin/homepage"));
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (access_token: string) => {
        setError("");
        setLoading(true);
        try {
            const res = await adminGoogleAuth({ access_token });

            if (res.needs_invite) {
                // Step 1: Admin doesn't exist → ask for invite token
                setPendingGoogleToken(access_token);
                setGoogleEmail(res.google_email || "");
                setShowInvitePrompt(true);
                setLoading(false);
                return;
            }

            // Existing admin → auto-login
            localStorage.setItem("se_admin_token", res.accessToken);
            localStorage.setItem("se_admin_user", JSON.stringify(res.admin));
            router.push(adminPath("/_admin/homepage"));
        } catch (err: any) {
            setError(err.message || "Google authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!googleInviteToken.trim()) {
            setError("Please enter an invite token");
            return;
        }
        setError("");
        setLoading(true);
        try {
            // Step 2: Re-send Google token with invite token
            const res = await adminGoogleAuth({
                access_token: pendingGoogleToken,
                inviteToken: googleInviteToken.trim(),
            });
            localStorage.setItem("se_admin_token", res.accessToken);
            localStorage.setItem("se_admin_user", JSON.stringify(res.admin));
            router.push(adminPath("/_admin/homepage"));
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => handleGoogleSuccess(tokenResponse.access_token),
        onError: () => setError("Google authentication failed"),
    });

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
                        <div className="admin-auth__brand-tag">Admin Panel</div>
                        <p className="admin-auth__brand-desc">
                            Manage concepts, monitor usage, and control the ad generation platform.
                        </p>

                        <div className="admin-auth__features">
                            {[
                                { icon: "📊", title: "Concept Library", desc: "Create and manage ad concepts" },
                                { icon: "👥", title: "User Management", desc: "Monitor member activity & credits" },
                                { icon: "🎨", title: "Content Control", desc: "Upload images, update templates" },
                                { icon: "🔒", title: "Role-Based Access", desc: "Super Admin & Content Admin roles" },
                            ].map((f, i) => (
                                <div key={i} className="admin-auth__feature">
                                    <span className="admin-auth__feature-icon">{f.icon}</span>
                                    <div>
                                        <div className="admin-auth__feature-title">{f.title}</div>
                                        <div className="admin-auth__feature-desc">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — form panel */}
                <div className="admin-auth__form-panel">
                    <div className="admin-auth__form-wrapper">
                        {/* Tab switcher */}
                        <div className="admin-auth__tabs">
                            <button
                                className={`admin-auth__tab ${mode === "login" ? "admin-auth__tab--active" : ""}`}
                                onClick={() => setMode("login")}
                            >
                                Login
                            </button>
                            <button
                                className={`admin-auth__tab ${mode === "signup" ? "admin-auth__tab--active" : ""}`}
                                onClick={() => setMode("signup")}
                            >
                                Sign Up
                            </button>
                        </div>

                        <h2 className="admin-auth__title">
                            {showInvitePrompt ? "Invite Token Required" : mode === "login" ? "Welcome back" : "Create admin account"}
                        </h2>
                        <p className="admin-auth__subtitle">
                            {showInvitePrompt
                                ? `${googleEmail} is not registered as an admin`
                                : mode === "login"
                                ? "Sign in to your admin account to continue"
                                : "Register a new administrator for the platform"}
                        </p>

                        {error && (
                            <div
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    color: "#EF4444",
                                    fontSize: 13,
                                    marginBottom: 8,
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* ─── INVITE TOKEN PROMPT (Google 2-step) ─── */}
                        {showInvitePrompt && (
                            <form className="admin-auth__form" onSubmit={handleInviteSubmit}>
                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Invite Token</label>
                                    <input
                                        type="text"
                                        className="admin-auth__input"
                                        placeholder="Enter your admin invite token"
                                        value={googleInviteToken}
                                        onChange={(e) => setGoogleInviteToken(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                    <span style={{ fontSize: 11, color: "var(--dim)", marginTop: 4, display: "block" }}>
                                        Ask an existing Super Admin to generate an invite token for you.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="admin-auth__submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="admin-auth__spinner" />
                                    ) : (
                                        "Register as Admin"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowInvitePrompt(false);
                                        setPendingGoogleToken("");
                                        setGoogleInviteToken("");
                                        setGoogleEmail("");
                                        setError("");
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 16px",
                                        borderRadius: 10,
                                        border: "1.5px solid var(--border)",
                                        background: "transparent",
                                        color: "var(--dim)",
                                        fontSize: 14,
                                        cursor: "pointer",
                                        marginTop: 8,
                                    }}
                                >
                                    ← Back to login
                                </button>
                            </form>
                        )}

                        {/* ─── LOGIN FORM ─── */}
                        {mode === "login" && !showInvitePrompt && (
                            <form className="admin-auth__form" onSubmit={handleLogin}>
                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Email</label>
                                    <input
                                        type="email"
                                        className="admin-auth__input"
                                        placeholder="admin@staticengine.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Password</label>
                                    <div className="admin-auth__input-wrap">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="admin-auth__input"
                                            placeholder="Enter your password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="admin-auth__eye"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="admin-auth__submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="admin-auth__spinner" />
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>

                                {/* Divider */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                                    <span style={{ fontSize: 12, color: "var(--dim)" }}>or</span>
                                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                                </div>

                                {/* Google Sign In */}
                                <button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    disabled={loading}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: 10,
                                        border: "1.5px solid var(--border)",
                                        background: "transparent",
                                        color: "var(--text)",
                                        fontSize: 15,
                                        fontWeight: 500,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 10,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                                        <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                    </svg>
                                    Sign in with Google
                                </button>
                            </form>
                        )}

                        {/* ─── SIGNUP FORM ─── */}
                        {mode === "signup" && !showInvitePrompt && (
                            <form className="admin-auth__form" onSubmit={handleSignup}>
                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Full Name</label>
                                    <input
                                        type="text"
                                        className="admin-auth__input"
                                        placeholder="John Doe"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Email</label>
                                    <input
                                        type="email"
                                        className="admin-auth__input"
                                        placeholder="admin@staticengine.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Role</label>
                                    <div className="admin-auth__role-group">
                                        <button
                                            type="button"
                                            className={`admin-auth__role-btn ${signupRole === AdminRole.SUPER_ADMIN ? "admin-auth__role-btn--active" : ""}`}
                                            onClick={() => setSignupRole(AdminRole.SUPER_ADMIN)}
                                        >
                                            <span className="admin-auth__role-icon">🛡️</span>
                                            Super Admin
                                        </button>
                                        <button
                                            type="button"
                                            className={`admin-auth__role-btn ${signupRole === AdminRole.CONTENT_ADMIN ? "admin-auth__role-btn--active" : ""}`}
                                            onClick={() => setSignupRole(AdminRole.CONTENT_ADMIN)}
                                        >
                                            <span className="admin-auth__role-icon">✏️</span>
                                            Content Admin
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Invite Token <span style={{ fontSize: 11, color: "var(--dim)", fontWeight: 400 }}>(not required for first admin)</span></label>
                                    <input
                                        type="text"
                                        className="admin-auth__input"
                                        placeholder="Leave empty if you are the first admin"
                                        value={signupInviteToken}
                                        onChange={(e) => setSignupInviteToken(e.target.value)}
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="admin-auth__input"
                                        placeholder="Min 6 characters"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        minLength={6}
                                        required
                                    />
                                </div>

                                <div className="admin-auth__field">
                                    <label className="admin-auth__label">Confirm Password</label>
                                    <div className="admin-auth__input-wrap">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="admin-auth__input"
                                            placeholder="Re-enter password"
                                            value={signupConfirm}
                                            onChange={(e) => setSignupConfirm(e.target.value)}
                                            minLength={6}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="admin-auth__eye"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="admin-auth__submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="admin-auth__spinner" />
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>

                                {/* Divider */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                                    <span style={{ fontSize: 12, color: "var(--dim)" }}>or</span>
                                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                                </div>

                                {/* Google Sign Up */}
                                <button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    disabled={loading}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: 10,
                                        border: "1.5px solid var(--border)",
                                        background: "transparent",
                                        color: "var(--text)",
                                        fontSize: 15,
                                        fontWeight: 500,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 10,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                                        <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                    </svg>
                                    Sign up with Google
                                </button>
                            </form>
                        )}

                        <div className="admin-auth__footer">
                            <span className="admin-auth__footer-lock">🔒</span>
                            Secured admin access only
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
