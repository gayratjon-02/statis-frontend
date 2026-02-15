// =============================================
// SERVER — Admin GET APIs (admin-only endpoints)
// =============================================
//
// Admin manages the Concept library (CRUD with RolesGuard).
// These GET endpoints support the admin concept management panel.
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { AdConcept } from "../../libs/types/concept.type";

// ── Shared Helpers ──────────────────────────────────────────

/** Auth headers with admin Bearer token */
function adminHeaders(): Record<string, string> {
    const token = localStorage.getItem("se_admin_token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

/** Generic GET request with error handling */
async function getRequest<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        method: "GET",
        headers: adminHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `GET ${url} failed (${res.status})`);
    }

    return res.json();
}

// =============================================
// CONCEPT — Admin concept library management
// =============================================

const CONCEPT_API = `${API_BASE_URL}/concept`;

/**
 * GET /concept/getConcepts?category=...&search=...&page=1&limit=20
 * Returns filtered, paginated concept library for admin management.
 */
export interface ConceptsResponse {
    list: AdConcept[];
    total: number;
}

export interface GetConceptsParams {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export async function getConcepts(
    params: GetConceptsParams = {},
): Promise<ConceptsResponse> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));

    return getRequest<ConceptsResponse>(
        `${CONCEPT_API}/getConcepts?${query.toString()}`,
    );
}

/**
 * GET /concept/getRecommended
 * Returns top 10 concepts sorted by usage_count.
 */
export async function getRecommendedConcepts(): Promise<AdConcept[]> {
    return getRequest<AdConcept[]>(`${CONCEPT_API}/getRecommended`);
}
