import SubscriptionGuard from "../../libs/auth/SubscriptionGuard";
import { DashboardPage } from "../dashboard";

export default function AccountPage() {
    return (
        <SubscriptionGuard>
            <DashboardPage initialTab="account" />
        </SubscriptionGuard>
    );
}
