// =============================================
// SERVER — Billing API (Stripe checkout, portal, plans)
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import { fetchWithTimeout } from "../../libs/config/fetchWithTimeout";

const BILLING_API = `${API_BASE_URL}/billing`;

function getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("se_access_token") : null;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/**
 * POST /billing/create-checkout
 * Create a Stripe Checkout Session and return the checkout URL.
 */
export async function createCheckoutRequest(
    tier: string,
    billing_interval: "monthly" | "annual"
): Promise<{ checkout_url: string }> {
    const res = await fetchWithTimeout(`${BILLING_API}/create-checkout`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ tier, billing_interval }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Checkout failed" }));
        throw new Error(error.message || `Checkout failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /billing/portal
 * Create a Stripe Customer Portal session and return the portal URL.
 */
export async function createPortalRequest(): Promise<{ portal_url: string }> {
    const res = await fetchWithTimeout(`${BILLING_API}/portal`, {
        method: "POST",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Portal failed" }));
        throw new Error(error.message || `Portal failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /billing/purchase-addon
 * Create a Stripe Checkout for additional credits.
 */
export async function purchaseAddonRequest(
    addon_key: string
): Promise<{ checkout_url: string }> {
    const res = await fetchWithTimeout(`${BILLING_API}/purchase-addon`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ addon_key }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Addon purchase failed" }));
        throw new Error(error.message || `Addon purchase failed (${res.status})`);
    }

    return res.json();
}

/**
 * GET /billing/plans
 * Fetch all available subscription plans.
 */
export async function getPlansRequest(): Promise<any[]> {
    const res = await fetchWithTimeout(`${BILLING_API}/plans`, {
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to fetch plans");

    return res.json();
}

/**
 * POST /billing/verify-checkout
 * Verify checkout from Stripe directly and activate subscription.
 * Fallback for when webhooks are delayed or unavailable.
 */
export async function verifyCheckoutRequest(): Promise<{
    verified: boolean;
    subscription_tier?: string;
    subscription_status?: string;
    credits_limit?: number;
}> {
    const res = await fetchWithTimeout(`${BILLING_API}/verify-checkout`, {
        method: "POST",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Verify failed" }));
        throw new Error(error.message || `Verify failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /billing/create-canva-checkout/:adId
 * Create a Stripe Checkout Session for a Canva Template.
 */
export async function createCanvaCheckoutRequest(
    adId: string
): Promise<{ checkout_url: string }> {
    const res = await fetchWithTimeout(`${BILLING_API}/create-canva-checkout/${adId}`, {
        method: "POST",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Canva checkout failed" }));
        throw new Error(error.message || `Canva checkout failed (${res.status})`);
    }

    return res.json();
}

const CANVA_API = `${API_BASE_URL}/canva`;

export interface CanvaOrder {
    _id: string;
    generated_ad_id: string;
    status: "pending" | "in_progress" | "fulfilled";
    canva_link: string | null;
    price_paid_cents: number;
    created_at: string;
    fulfilled_at: string | null;
    generated_ads: { ad_name: string | null; image_url_1x1: string | null } | null;
}

export async function getMyCanvaOrders(): Promise<CanvaOrder[]> {
    const res = await fetchWithTimeout(`${CANVA_API}/orders`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to load orders" }));
        throw new Error(error.message || `Failed to load orders (${res.status})`);
    }

    return res.json();
}
