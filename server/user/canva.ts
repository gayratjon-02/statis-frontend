import API_BASE_URL from "../../libs/config/api.config";

const CANVA_API = `${API_BASE_URL}/canva`;

function getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("se_access_token") : null;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export interface EditInCanvaResponse {
    canva_edit_url: string;
    canva_view_url: string;
    canva_design_id: string;
}

export interface NeedsAuthResponse {
    needs_auth: true;
    auth_url: string;
}

export async function getCanvaAuthUrl(): Promise<{ authUrl: string }> {
    const res = await fetch(`${CANVA_API}/auth`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to get auth URL" }));
        throw new Error(error.message || `Auth URL failed (${res.status})`);
    }

    return res.json();
}

export async function getCanvaConnectionStatus(): Promise<{ connected: boolean }> {
    const res = await fetch(`${CANVA_API}/connection-status`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) return { connected: false };

    return res.json();
}

export async function disconnectCanva(): Promise<{ success: boolean }> {
    const res = await fetch(`${CANVA_API}/disconnect`, {
        method: "POST",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to disconnect" }));
        throw new Error(error.message || `Disconnect failed (${res.status})`);
    }

    return res.json();
}

export async function editInCanva(
    generatedAdId: string
): Promise<EditInCanvaResponse | NeedsAuthResponse> {
    const res = await fetch(`${CANVA_API}/edit/${generatedAdId}`, {
        method: "POST",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to open in Canva" }));
        throw new Error(error.message || `Edit in Canva failed (${res.status})`);
    }

    return res.json();
}
