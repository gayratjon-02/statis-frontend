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
    const result = (
        member?.subscription_status === "active" &&
        PAID_TIERS.includes(member?.subscription_tier?.toLowerCase())
    );
    console.log("[SubscriptionGuard] hasPaidSubscription check:", {
        tier: member?.subscription_tier,
        status: member?.subscription_status,
        result,
    });
    return result;
}

function SubscriptionCheck({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            console.log("\n━━━ SubscriptionGuard CHECK ━━━");
            console.log("  router.query:", JSON.stringify(router.query));

            // After Stripe payment, re-fetch member data from backend
            const isCheckoutReturn =
                router.query.checkout === "success" ||
                router.query.checkout === "cancelled";

            if (isCheckoutReturn) {
                console.log("  🔄 Checkout return detected:", router.query.checkout);

                try {
                    // Backend'dan eng so'nggi member data olish
                    console.log("  📡 Fetching member from backend (attempt 1)...");
                    const member = await getMemberRequest();
                    console.log("  📋 Member data (attempt 1):", JSON.stringify({
                        subscription_tier: member?.subscription_tier,
                        subscription_status: member?.subscription_status,
                        credits_limit: member?.credits_limit,
                    }));
                    localStorage.setItem("se_member", JSON.stringify(member));

                    if (hasPaidSubscription(member)) {
                        console.log("  ✅ Has paid subscription → allowing through");
                        setReady(true);
                        return;
                    }

                    // Webhook hali yetib kelmagan bo'lishi mumkin — 3s kutib retry
                    console.log("  ⏳ No paid subscription yet, waiting 3s for webhook...");
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    console.log("  📡 Fetching member from backend (attempt 2)...");
                    const retryMember = await getMemberRequest();
                    console.log("  📋 Member data (attempt 2):", JSON.stringify({
                        subscription_tier: retryMember?.subscription_tier,
                        subscription_status: retryMember?.subscription_status,
                        credits_limit: retryMember?.credits_limit,
                    }));
                    localStorage.setItem("se_member", JSON.stringify(retryMember));

                    if (hasPaidSubscription(retryMember)) {
                        console.log("  ✅ Has paid subscription after retry → allowing through");
                        setReady(true);
                    } else {
                        // Hali ham subscription yo'q — 5s yana kutib ko'raylik
                        console.log("  ⏳ Still no subscription, waiting another 5s...");
                        await new Promise((resolve) => setTimeout(resolve, 5000));

                        console.log("  📡 Fetching member from backend (attempt 3)...");
                        const finalMember = await getMemberRequest();
                        console.log("  📋 Member data (attempt 3):", JSON.stringify({
                            subscription_tier: finalMember?.subscription_tier,
                            subscription_status: finalMember?.subscription_status,
                            credits_limit: finalMember?.credits_limit,
                        }));
                        localStorage.setItem("se_member", JSON.stringify(finalMember));

                        if (hasPaidSubscription(finalMember)) {
                            console.log("  ✅ Has paid subscription after final retry → allowing through");
                            setReady(true);
                        } else {
                            console.log("  ❌ Still no subscription after 8s → redirecting to /subscribe");
                            router.replace("/subscribe");
                        }
                    }
                } catch (err) {
                    console.error("  ❌ API error:", err);
                    // API xato — let through, dashboard will handle
                    setReady(true);
                }
                return;
            }

            // Normal check — localStorage'dagi member data
            console.log("  📦 Normal check (no checkout return)");
            try {
                const stored = localStorage.getItem("se_member");
                if (stored) {
                    const member = JSON.parse(stored);
                    console.log("  📋 Stored member:", JSON.stringify({
                        subscription_tier: member?.subscription_tier,
                        subscription_status: member?.subscription_status,
                    }));
                    if (!hasPaidSubscription(member)) {
                        console.log("  ❌ No paid subscription → redirecting to /subscribe");
                        router.replace("/subscribe");
                        return;
                    }
                } else {
                    console.log("  ⚠️ No se_member in localStorage");
                }
            } catch (err) {
                console.error("  ⚠️ Error parsing localStorage:", err);
            }

            console.log("  ✅ Check passed → allowing through");
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
