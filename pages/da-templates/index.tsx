import SubscriptionGuard from "../../libs/auth/SubscriptionGuard";
import { DashboardPage } from "../dashboard";

export default function DATemplatesPage() {
    return (
        <SubscriptionGuard>
            <DashboardPage initialTab="daTemplates" />
        </SubscriptionGuard>
    );
}
