import dynamic from "next/dynamic";
import SubscriptionGuard from "../../libs/auth/SubscriptionGuard";

const DashboardPage = dynamic(() => import("../dashboard").then(mod => mod.DashboardPage), {
    loading: () => <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--muted)" }}>Loading...</div>,
});

export default function BillingPage() {
    return (
        <SubscriptionGuard>
            <DashboardPage initialTab="billing" />
        </SubscriptionGuard>
    );
}
