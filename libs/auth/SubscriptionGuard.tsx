// =============================================
// GUARD — SubscriptionGuard
// Wraps AuthGuard. Requires an active paid subscription.
// Users without subscription are redirected to /subscribe.
// =============================================

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthGuard from "./AuthGuard";

const PAID_TIERS = ["starter", "pro", "growth"];

function hasPaidSubscription(member: any): boolean {
    return (
        member?.subscription_status === "active" &&
        PAID_TIERS.includes(member?.subscription_tier?.toLowerCase())
    );
}

function SubscriptionCheck({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // After Stripe payment, allow through so dashboard can refresh data
        const isCheckoutReturn =
            router.query.checkout === "success" ||
            router.query.checkout === "cancelled";

        if (isCheckoutReturn) {
            setReady(true);
            return;
        }

        // Fast check against stored member data
        try {
            const stored = localStorage.getItem("se_member");
            if (stored) {
                const member = JSON.parse(stored);
                if (!hasPaidSubscription(member)) {
                    router.replace("/subscribe");
                    return;
                }
            }
        } catch {
            // Corrupt data — let through, dashboard will re-verify
        }

        setReady(true);
    }, [router.query]);

    if (!ready) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg)",
                }}
            >
                <div
                    style={{
                        width: 28,
                        height: 28,
                        border: "2px solid var(--border)",
                        borderTopColor: "var(--accent)",
                        borderRadius: "50%",
                        animation: "admin-spin 0.6s linear infinite",
                    }}
                />
            </div>
        );
    }

    return <>{children}</>;
}

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <SubscriptionCheck>{children}</SubscriptionCheck>
        </AuthGuard>
    );
}
