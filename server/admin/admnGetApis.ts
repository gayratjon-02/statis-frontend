// =============================================
// SERVER — Admin GET APIs (admin-only endpoints)
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { AdConcept, ConceptCategoryItem } from "../../libs/types/concept.type";
import type { ConceptsResponse, GetConceptsParams } from "../../libs/types/admin.type";

export type { ConceptsResponse, GetConceptsParams };

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
// CATEGORIES
// =============================================

const CONCEPT_API = `${API_BASE_URL}/concept`;

/**
 * GET /concept/getCategories
 * Returns all concept categories ordered by display_order.
 */
export async function getCategories(): Promise<{ list: ConceptCategoryItem[] }> {
    return getRequest<{ list: ConceptCategoryItem[] }>(`${CONCEPT_API}/getCategories`);
}

// =============================================
// CONCEPTS
// =============================================

/**
 * GET /concept/getConcepts?category_id=...&search=...&tags=...&page=1&limit=20
 * Returns filtered, paginated concept library for admin management.
 */
export async function getConcepts(
    params: GetConceptsParams = {},
): Promise<ConceptsResponse> {
    const query = new URLSearchParams();
    if (params.category_id) query.set("category_id", params.category_id);
    if (params.search) query.set("search", params.search);
    if (params.tags) query.set("tags", params.tags);
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));
    // Admin sees all concepts including inactive ones
    query.set("include_inactive", "true");

    return getRequest<ConceptsResponse>(
        `${CONCEPT_API}/getConcepts?${query.toString()}`,
    );
}

/**
 * GET /concept/getRecommended
 * Returns top 10 concepts sorted by usage_count.
 */
export async function getRecommendedConcepts(): Promise<{ list: AdConcept[] }> {
    return getRequest<{ list: AdConcept[] }>(`${CONCEPT_API}/getRecommended`);
}
