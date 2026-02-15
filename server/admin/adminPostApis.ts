// =============================================
// SERVER — Admin POST APIs (admin-only endpoints)
// =============================================
//
// Admin-only POST endpoints (RolesGuard or admin auth):
//   1. Auth      — adminSignup, adminLogin
//   2. Concept   — uploadImage, createConcept, updateConcept, deleteConcept
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { AdConcept, ConceptCategory } from "../../libs/types/concept.type";

// ── Types ───────────────────────────────────────────────────

/** Admin roles matching backend AdminRole enum */
export type AdminRole = "SUPER_ADMIN" | "CONTENT_ADMIN";

/** Admin user returned from API (no password_hash) */
export interface AdminUser {
    _id: string;
    email: string;
    name: string;
    role: AdminRole;
    created_at: string;
}

/** Admin auth response */
export interface AdminAuthResponse {
    accessToken: string;
    admin: AdminUser;
}

/** Input for admin signup */
export interface AdminSignupInput {
    email: string;
    password: string;
    name: string;
    role: AdminRole;
}

/** Input for admin login */
export interface AdminLoginInput {
    email: string;
    password: string;
}

/** Input for creating a concept */
export interface CreateConceptInput {
    category: ConceptCategory;
    name: string;
    image_url: string;
    tags: string[];
    description: string;
    source_url?: string;
    is_active?: boolean;
    display_order?: number;
}

/** Input for updating a concept (all fields optional) */
export interface UpdateConceptInput {
    category?: ConceptCategory;
    name?: string;
    image_url?: string;
    tags?: string[];
    description?: string;
    source_url?: string;
    is_active?: boolean;
    display_order?: number;
}

// ── Shared Helpers ──────────────────────────────────────────

/** Auth headers with admin Bearer token */
function adminHeaders(): Record<string, string> {
    const token = localStorage.getItem("se_admin_token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

/** Generic POST request (JSON body) with error handling */
async function postRequest<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `POST ${url} failed (${res.status})`);
    }

    return res.json();
}

// =============================================
// 1. AUTH — Admin signup & login
// =============================================

const MEMBER_API = `${API_BASE_URL}/member`;

/**
 * POST /member/adminSignup
 * Register a new admin account.
 */
export async function adminSignup(input: AdminSignupInput): Promise<AdminAuthResponse> {
    return postRequest<AdminAuthResponse>(`${MEMBER_API}/adminSignup`, input);
}

/**
 * POST /member/adminLogin
 * Authenticate as admin, returns accessToken + admin profile.
 */
export async function adminLogin(input: AdminLoginInput): Promise<AdminAuthResponse> {
    return postRequest<AdminAuthResponse>(`${MEMBER_API}/adminLogin`, input);
}

// =============================================
// 2. CONCEPT — Admin concept library management
// =============================================

const CONCEPT_API = `${API_BASE_URL}/concept`;

/**
 * POST /concept/uploadImage
 * Upload a concept preview image (PNG, JPG, JPEG, WEBP). Max 10MB.
 * Requires: SUPER_ADMIN or CONTENT_ADMIN role.
 * Returns { image_url: string }.
 */
export async function uploadConceptImage(file: File): Promise<{ image_url: string }> {
    const token = localStorage.getItem("se_admin_token");
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${CONCEPT_API}/uploadImage`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to upload image" }));
        throw new Error(error.message || `Upload failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /concept/createConceptByAdmin
 * Create a new ad concept in the library.
 * Requires: SUPER_ADMIN or CONTENT_ADMIN role.
 */
export async function createConcept(input: CreateConceptInput): Promise<AdConcept> {
    return postRequest<AdConcept>(`${CONCEPT_API}/createConceptByAdmin`, input);
}

/**
 * POST /concept/updateConceptByAdmin/:id
 * Update an existing concept.
 * Requires: SUPER_ADMIN or CONTENT_ADMIN role.
 */
export async function updateConcept(id: string, input: UpdateConceptInput): Promise<AdConcept> {
    return postRequest<AdConcept>(`${CONCEPT_API}/updateConceptByAdmin/${id}`, input);
}

/**
 * POST /concept/deleteConceptByAdmin/:id
 * Delete a concept from the library.
 * Requires: SUPER_ADMIN only.
 */
export async function deleteConcept(id: string): Promise<{ message: string }> {
    return postRequest<{ message: string }>(`${CONCEPT_API}/deleteConceptByAdmin/${id}`, {});
}
