// =============================================
// SERVER — Admin GET APIs (all admin-accessible GET endpoints)
// =============================================
//
// Modules covered:
//   1. Member   — getMember, getUsage
//   2. Brand    — getBrands (paginated), getBrandById
//   3. Product  — getProducts by brand (paginated), getProductById
//   4. Concept  — getConcepts (filtered, paginated), getRecommended
//   5. Generation — getStatus, getResults
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { Member } from "../../libs/types/member.type";
import type { Brand } from "../../libs/types/brand.type";
import type { Product } from "../../libs/types/product.type";
import type { AdConcept } from "../../libs/types/concept.type";
import type { GeneratedAd, GenerationStatus } from "../../libs/types/generation.type";

// ── Shared Helpers ──────────────────────────────────────────

/** Auth headers with Bearer token from localStorage */
function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("se_access_token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

/** Generic GET request with error handling */
async function getRequest<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `GET ${url} failed (${res.status})`);
    }

    return res.json();
}

// =============================================
// 1. MEMBER
// =============================================

const MEMBER_API = `${API_BASE_URL}/member`;

/**
 * GET /member/getMember
 * Returns the authenticated member's profile.
 */
export async function getMember(): Promise<Member> {
    return getRequest<Member>(`${MEMBER_API}/getMember`);
}

/**
 * GET /member/getUsage
 * Returns credit and subscription usage for the authenticated member.
 */
export interface UsageResponse {
    credits_used: number;
    credits_limit: number;
    addon_credits_remaining: number;
    subscription_tier: string;
    subscription_status: string;
    billing_cycle_start: string | null;
    billing_cycle_end: string | null;
}

export async function getUsage(): Promise<UsageResponse> {
    return getRequest<UsageResponse>(`${MEMBER_API}/getUsage`);
}

// =============================================
// 2. BRAND
// =============================================

const BRAND_API = `${API_BASE_URL}/brand`;

/**
 * GET /brand/getBrands?page=1&limit=10
 * Returns paginated list of brands for the authenticated user.
 */
export interface BrandsResponse {
    list: Brand[];
    total: number;
}

export async function getBrands(
    page: number = 1,
    limit: number = 10,
): Promise<BrandsResponse> {
    return getRequest<BrandsResponse>(
        `${BRAND_API}/getBrands?page=${page}&limit=${limit}`,
    );
}

/**
 * GET /brand/getBrandById/:id
 * Returns a single brand by its ID.
 */
export async function getBrandById(id: string): Promise<Brand> {
    return getRequest<Brand>(`${BRAND_API}/getBrandById/${id}`);
}

// =============================================
// 3. PRODUCT
// =============================================

const PRODUCT_API = `${API_BASE_URL}/product`;

/**
 * GET /product/getProducts/:brandId?page=1&limit=10
 * Returns paginated products for a specific brand.
 */
export interface ProductsResponse {
    list: Product[];
    total: number;
}

export async function getProducts(
    brandId: string,
    page: number = 1,
    limit: number = 10,
): Promise<ProductsResponse> {
    return getRequest<ProductsResponse>(
        `${PRODUCT_API}/getProducts/${brandId}?page=${page}&limit=${limit}`,
    );
}

/**
 * GET /product/getProductById/:id
 * Returns a single product by its ID.
 */
export async function getProductById(id: string): Promise<Product> {
    return getRequest<Product>(`${PRODUCT_API}/getProductById/${id}`);
}

// =============================================
// 4. CONCEPT
// =============================================

const CONCEPT_API = `${API_BASE_URL}/concept`;

/**
 * GET /concept/getConcepts?category=...&search=...&page=1&limit=20
 * Returns filtered, paginated concept library.
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

// =============================================
// 5. GENERATION
// =============================================

const GENERATION_API = `${API_BASE_URL}/generation`;

/**
 * GET /generation/getStatus/:jobId
 * Returns current generation job status.
 */
export interface GenerationStatusResponse {
    job_id: string;
    status: GenerationStatus;
    progress: number;
    total: number;
    completed_ads: string[];
}

export async function getGenerationStatus(
    jobId: string,
): Promise<GenerationStatusResponse> {
    return getRequest<GenerationStatusResponse>(
        `${GENERATION_API}/getStatus/${jobId}`,
    );
}

/**
 * GET /generation/getResults/:jobId
 * Returns the generated ads for a completed job.
 */
export interface GenerationResultsResponse {
    job_id: string;
    status: GenerationStatus;
    ads: GeneratedAd[];
}

export async function getGenerationResults(
    jobId: string,
): Promise<GenerationResultsResponse> {
    return getRequest<GenerationResultsResponse>(
        `${GENERATION_API}/getResults/${jobId}`,
    );
}
