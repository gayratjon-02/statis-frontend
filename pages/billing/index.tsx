import SubscriptionGuard from "../../libs/auth/SubscriptionGuard";
import { DashboardPage } from "../dashboard";

export default function BillingPage() {
    return (
        <SubscriptionGuard>
            <DashboardPage initialTab="billing" />
        </SubscriptionGuard>
    );
}
