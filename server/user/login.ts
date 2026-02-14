// =============================================
// SERVER — User Auth API (login + signup)
// =============================================

import API_BASE_URL from "../../libs/config/api.config";
import type { AuthResponse, LoginInput, SignupInput } from "../../libs/types/member.type";

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
        throw new Error(error.message || `Signup failed (${res.status})`);
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
