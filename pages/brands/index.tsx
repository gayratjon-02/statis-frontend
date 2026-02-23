import SubscriptionGuard from "../../libs/auth/SubscriptionGuard";
import { DashboardPage } from "../dashboard";

export default function BrandsPage() {
    return (
        <SubscriptionGuard>
            <DashboardPage initialTab="brands" />
        </SubscriptionGuard>
    );
}
