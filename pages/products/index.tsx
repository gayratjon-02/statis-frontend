import SubscriptionGuard from "../../libs/auth/SubscriptionGuard";
import { DashboardPage } from "../dashboard";

export default function ProductsPage() {
    return (
        <SubscriptionGuard>
            <DashboardPage initialTab="products" />
        </SubscriptionGuard>
    );
}
