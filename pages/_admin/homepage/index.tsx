import React from "react";
import { useRouter } from "next/router";
import AdminGuard from "../../../libs/auth/AdminGuard";
import { useAdminAuth } from "../../../libs/hooks/useAdminAuth";

function AdminHomepage() {
    const router = useRouter();
    const { session, logout } = useAdminAuth();

    const handleLogout = () => {
        logout();
        router.replace("/_admin/login");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--bg)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "40px 48px",
                    textAlign: "center",
                    maxWidth: 420,
                }}
            >
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
                <h1
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 24,
                        fontWeight: 700,
                        marginBottom: 6,
                    }}
                >
                    Admin Panel
                </h1>
                <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
                    Welcome, <strong style={{ color: "var(--accent)" }}>{session?.admin?.name || "Admin"}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: "var(--dim)" }}>
                        {session?.admin?.email} · {session?.admin?.role}
                    </span>
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                        { label: "📊 Manage Concepts", path: "/_admin/concepts" },
                        { label: "🏷️ Manage Brands", path: "/_admin/brands" },
                    ].map((item) => (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            style={{
                                padding: "12px 20px",
                                background: "var(--bg-hover)",
                                border: "1px solid var(--border)",
                                borderRadius: 10,
                                color: "var(--text)",
                                fontFamily: "var(--font-body)",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "border-color 0.2s",
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: 24,
                        padding: "10px 24px",
                        background: "transparent",
                        border: "1px solid var(--red)",
                        borderRadius: 8,
                        color: "var(--red)",
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.2s",
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

// Wrap with AdminGuard — no access without admin token
export default function ProtectedAdminHomepage() {
    return (
        <AdminGuard>
            <AdminHomepage />
        </AdminGuard>
    );
}
