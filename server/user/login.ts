// =============================================
// SERVER — User Auth API (login + signup)
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { AuthResponse, GoogleLoginInput, LoginInput, SignupInput } from "../../libs/types/member.type";

const MEMBER_API = `${API_BASE_URL}/member`;

/**
 * POST /member/login
 * Authenticate an existing user with email + password.
 */
export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
    const res = await fetch(`${MEMBER_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || `Login failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /member/signup
 * Register a new user account.
 */
export async function signupRequest(input: SignupInput): Promise<AuthResponse> {
    const res = await fetch(`${MEMBER_API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Signup failed" }));
        const fieldMsg = error.fieldErrors ? Object.values(error.fieldErrors).join('. ') : '';
        throw new Error(fieldMsg || error.message || `Signup failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /member/accept-tos
 * Accepts the Terms of Service.
 */
export async function acceptTosRequest(input: { tos_accepted: boolean; tos_version: string }): Promise<any> {
    const token = localStorage.getItem("se_access_token");

    const res = await fetch(`${MEMBER_API}/accept-tos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to accept Terms of Service" }));
        throw new Error(error.message || `ToS acceptance failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /member/google-auth
 * Authenticate with Google ID token.
 */
export async function googleLoginRequest(input: GoogleLoginInput): Promise<AuthResponse> {
    const res = await fetch(`${MEMBER_API}/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Google login failed" }));
        throw new Error(error.message || `Google login failed (${res.status})`);
    }

    return res.json();
}

/**
 * GET /member/getMember
 * Fetch the authenticated user's profile using the stored access token.
 */
export async function getMemberRequest(): Promise<AuthResponse["member"]> {
    const token = localStorage.getItem("se_access_token");

    const res = await fetch(`${MEMBER_API}/getMember`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch member");
    }

    return res.json();
}

/**
 * GET /member/getUsage
 * Fetch the authenticated user's credit & subscription usage.
 */
export async function getUsageRequest() {
    const token = localStorage.getItem("se_access_token");

    const res = await fetch(`${MEMBER_API}/getUsage`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch usage");
    }

    return res.json();
}

const BRAND_API = `${API_BASE_URL}/brand`;

/**
 * GET /brand/getBrands
 * Fetch the authenticated user's brands.
 */
export async function getBrandsRequest(page = 1, limit = 50) {
    const token = localStorage.getItem("se_access_token");

    const res = await fetch(`${BRAND_API}/getBrands?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch brands");
    }

    return res.json();
}

/**
 * GET /member/getActivity
 * Fetch the authenticated user's recent activity.
 */
export async function getActivityRequest(limit = 5): Promise<any[]> {
    const token = localStorage.getItem("se_access_token");

    const res = await fetch(`${MEMBER_API}/getActivity?limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch activity");
    }

    return res.json();
}

/**
 * POST /member/updateMember
 * Update the authenticated user's profile.
 */
export async function updateMemberRequest(input: { full_name?: string }): Promise<any> {
    const token = localStorage.getItem("se_access_token");
    const res = await fetch(`${MEMBER_API}/updateMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Update failed" }));
        throw new Error(error.message || `Update failed (${res.status})`);
    }
    return res.json();
}

/**
 * POST /member/forgetPassword
 * Change the authenticated user's password.
 */
export async function changePasswordRequest(input: { old_password: string; new_password: string }): Promise<any> {
    const token = localStorage.getItem("se_access_token");
    const res = await fetch(`${MEMBER_API}/forgetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Password change failed" }));
        throw new Error(error.message || `Password change failed (${res.status})`);
    }
    return res.json();
}

/**
 * POST /member/forgot-password-flow
 * Request a password reset link to be sent to the user's email.
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${MEMBER_API}/forgot-password-flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to request password reset" }));
        throw new Error(error.message || `Failed to request password reset (${res.status})`);
    }

    return res.json();
}

/**
 * POST /member/reset-password-flow
 * Execute the password reset using the token sent to the user's email.
 */
export async function executePasswordReset(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${MEMBER_API}/reset-password-flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to reset password" }));
        const fieldMsg = error.fieldErrors ? Object.values(error.fieldErrors).join('. ') : '';
        throw new Error(fieldMsg || error.message || `Failed to reset password (${res.status})`);
    }

    return res.json();
}
