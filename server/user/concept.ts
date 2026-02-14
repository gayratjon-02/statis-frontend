// =============================================
// SERVER — Concept API (user endpoints)
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { AdConcept } from "../../libs/types/concept.type";

const CONCEPT_API = `${API_BASE_URL}/concept`;

/** Helper: get auth headers */
function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("se_access_token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ---- READ ----

/**
 * GET /concept/getConcepts?category=&search=&page=1&limit=20
 * Get paginated concept library (only active concepts).
 */
export async function getConcepts(
    category?: string,
    search?: string,
    page: number = 1,
    limit: number = 50
): Promise<{ list: AdConcept[]; total: number }> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", String(limit));

    const res = await fetch(`${CONCEPT_API}/getConcepts?${params.toString()}`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch concepts" }));
        throw new Error(error.message || `Get concepts failed (${res.status})`);
    }

    return res.json();
}

/**
 * GET /concept/getRecommended
 * Get top 10 most used concepts.
 */
export async function getRecommendedConcepts(): Promise<{ list: AdConcept[] }> {
    const res = await fetch(`${CONCEPT_API}/getRecommended`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch recommended concepts" }));
        throw new Error(error.message || `Get recommended failed (${res.status})`);
    }

    return res.json();
}
