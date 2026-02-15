// =============================================
// TYPES — Admin (mirrors backend admin types & DTOs)
// =============================================

import { AdminRole } from "../enums/admin.enum";
import type { ConceptCategory } from "./concept.type";

// ── Admin User ──────────────────────────────────────────────

/** Admin user returned from API (no password_hash) */
export interface AdminUser {
    _id: string;
    email: string;
    name: string;
    role: AdminRole;
    created_at: string;
}

/** Admin login/signup response */
export interface AdminAuthResponse {
    accessToken: string;
    admin: AdminUser;
}

// ── Admin Auth DTOs ─────────────────────────────────────────

/** POST /member/adminSignup */
export interface AdminSignupInput {
    email: string;
    password: string;
    name: string;
    role: AdminRole;
}

/** POST /member/adminLogin */
export interface AdminLoginInput {
    email: string;
    password: string;
}

// ── Admin Concept DTOs ──────────────────────────────────────

/** POST /concept/createConceptByAdmin */
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

/** POST /concept/updateConceptByAdmin/:id */
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

// ── Admin GET Response Types ────────────────────────────────

/** GET /concept/getConcepts response */
export interface ConceptsResponse {
    list: import("./concept.type").AdConcept[];
    total: number;
}

/** GET /concept/getConcepts query params */
export interface GetConceptsParams {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}
