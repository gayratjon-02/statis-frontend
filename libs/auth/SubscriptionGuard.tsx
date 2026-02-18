// =============================================
// GUARD — SubscriptionGuard
// Wraps AuthGuard. Requires an active paid subscription.
// Users without subscription are redirected to /subscribe.
// After Stripe checkout, re-fetches member data from backend.
// =============================================

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthGuard from "./AuthGuard";
import { getMemberRequest } from "../../server/user/login";

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
        const checkSubscription = async () => {
            // After Stripe payment, re-fetch member data from backend
            const isCheckoutReturn =
                router.query.checkout === "success" ||
                router.query.checkout === "cancelled";

            if (isCheckoutReturn) {
                try {
                    // Backend'dan eng so'nggi member data olish
                    const member = await getMemberRequest();
                    localStorage.setItem("se_member", JSON.stringify(member));

                    if (hasPaidSubscription(member)) {
                        setReady(true);
                        return;
                    }

                    // Webhook hali yetib kelmagan bo'lishi mumkin — 3s kutib retry
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    const retryMember = await getMemberRequest();
                    localStorage.setItem("se_member", JSON.stringify(retryMember));

                    if (hasPaidSubscription(retryMember)) {
                        setReady(true);
                    } else {
                        // Hali ham subscription yo'q — subscribe sahifasiga qaytarish
                        router.replace("/subscribe");
                    }
                } catch {
                    // API xato — let through, dashboard will handle
                    setReady(true);
                }
                return;
            }

            // Normal check — localStorage'dagi member data
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
        };

        checkSubscription();
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
                    flexDirection: "column",
                    gap: 12,
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
                {router.query.checkout === "success" && (
                    <div style={{ color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-body)" }}>
                        Verifying your subscription...
                    </div>
                )}
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
