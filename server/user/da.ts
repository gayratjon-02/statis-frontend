// =============================================
// SERVER — DA (Digital Asset) Templates API
// =============================================

import API_BASE_URL from "../../libs/config/api.config";

const DA_API = `${API_BASE_URL}/da`;

/** Helper: get auth headers (JSON) */
function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("se_access_token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ---- TYPES ----

export interface DAPreset {
    id: string;
    name: string;
    code: string;
    description: string;
    is_default: boolean;
    image_url: string;
    background_type: string;
    floor_type: string;
    mood: string;
    quality: string;
    created_at: string;
    updated_at: string;
}

export interface DAPresetsResponse {
    total: number;
    system_presets: number;
    user_presets: number;
    presets: DAPreset[];
}

// ---- UPLOAD ----

/**
 * POST /da/upload
 * Upload a DA template image to S3 (no analysis).
 * Returns { success, data: { id, name, image_url } }
 */
export async function uploadDAImage(
    file: File,
    name?: string,
): Promise<{ success: boolean; data: { id: string; name: string; image_url: string } }> {
    const token = localStorage.getItem("se_access_token");
    const formData = new FormData();
    formData.append("image", file);
    if (name) formData.append("name", name);

    const res = await fetch(`${DA_API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to upload DA image" }));
        throw new Error(error.message || `Upload failed (${res.status})`);
    }

    return res.json();
}

// ---- READ ----

/**
 * GET /da/presets
 * Get all DA presets (system + user-created).
 */
export async function getDAPresets(): Promise<DAPresetsResponse> {
    const res = await fetch(`${DA_API}/presets`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch DA presets" }));
        throw new Error(error.message || `Get presets failed (${res.status})`);
    }

    return res.json();
}

// ---- DELETE ----

/**
 * POST /da/presets/delete/:id
 * Delete a user-created DA preset.
 */
export async function deleteDAPreset(id: string): Promise<{ message: string }> {
    const res = await fetch(`${DA_API}/presets/delete/${id}`, {
        method: "POST",
        headers: authHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to delete DA preset" }));
        throw new Error(error.message || `Delete failed (${res.status})`);
    }

    return res.json();
}
