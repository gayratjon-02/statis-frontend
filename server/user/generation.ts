// =============================================
// SERVER — Generation API
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { CreateGenerationInput, GenerationResponse } from "../../libs/types/generation.type";

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
