// =============================================
// SERVER — Generation API
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type {
    CreateGenerationInput,
    GenerationResponse,
    GetGenerationsQuery,
    LibraryCounts,
    AdLibraryItem
} from "../../libs/types/generation.type";

const GENERATION_API = `${API_BASE_URL}/generation`;

/** Helper: get auth headers */
function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("se_access_token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

/**
 * POST /generation/createGeneration
 * Start a new ad generation job.
 * Returns { job_id, status, message }
 */
export async function createGeneration(input: CreateGenerationInput): Promise<GenerationResponse> {
    const res = await fetch(`${GENERATION_API}/createGeneration`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Generation failed" }));
        throw new Error(error.message || `Generation failed (${res.status})`);
    }

    return res.json();
}

/**
 * GET /generation/getRecent
 * Fetch the authenticated user's recent generations.
 */
export async function getRecentGenerationsRequest(limit = 6): Promise<any[]> {
    const res = await fetch(`${GENERATION_API}/getRecent?limit=${limit}`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch recent generations");
    }

    return res.json();
}

/**
 * GET /generation/list
 * Fetch filtered ads for the library.
 */
export async function getLibraryAdsRequest(query: GetGenerationsQuery): Promise<{ list: AdLibraryItem[], total: number }> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.brand_id) params.append("brand_id", query.brand_id);
    if (query.product_id) params.append("product_id", query.product_id);
    if (query.concept_id) params.append("concept_id", query.concept_id);
    if (query.sort_by) params.append("sort_by", query.sort_by);

    const res = await fetch(`${GENERATION_API}/list?${params.toString()}`, {
        headers: authHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch library ads");
    return res.json();
}

/**
 * GET /generation/counts
 * Fetch counts for sidebar (brands, products).
 */
export async function getLibraryCountsRequest(): Promise<LibraryCounts> {
    const res = await fetch(`${GENERATION_API}/counts`, {
        headers: authHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch library counts");
    return res.json();
}
