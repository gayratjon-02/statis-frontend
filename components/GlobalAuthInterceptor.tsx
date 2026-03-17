import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../libs/hooks/useAuth";
import toast from "react-hot-toast";
import API_BASE_URL from "../libs/config/api.config";

const TOKEN_KEY = "se_access_token";
const REFRESH_ENDPOINT = `${API_BASE_URL}/member/refresh`;

function getTokenExpiry(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

export const GlobalAuthInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const { logout } = useAuth();
    const isIntercepting = useRef(false);
    const pathnameRef = useRef(router.pathname);
    const isRefreshing = useRef(false);
    const refreshTimer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        pathnameRef.current = router.pathname;
    }, [router.pathname]);

    useEffect(() => {
        scheduleRefresh();
        return () => {
            if (refreshTimer.current) clearTimeout(refreshTimer.current);
        };
    }, []);

    function scheduleRefresh() {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;

        const expiry = getTokenExpiry(token);
        if (!expiry) return;

        const msUntilExpiry = expiry - Date.now();
        const refreshAt = msUntilExpiry - 5 * 60 * 1000;

        if (refreshTimer.current) clearTimeout(refreshTimer.current);

        if (refreshAt <= 0) {
            doRefresh();
        } else {
            refreshTimer.current = setTimeout(doRefresh, refreshAt);
        }
    }

    async function doRefresh() {
        if (isRefreshing.current) return;
        isRefreshing.current = true;

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            isRefreshing.current = false;
            return;
        }

        try {
            const res = await fetch(REFRESH_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem(TOKEN_KEY, data.accessToken);
                scheduleRefresh();
            }
        } catch {
            // Silent fail — next request will trigger 401 if expired
        } finally {
            isRefreshing.current = false;
        }
    }

    useEffect(() => {
        if (typeof window === "undefined" || isIntercepting.current) return;
        isIntercepting.current = true;

        const originalFetch = window.fetch;

        window.fetch = (async (...args: Parameters<typeof fetch>) => {
            const [resource] = args;
            const requestUrl = typeof resource === "string" ? resource : (resource instanceof Request ? resource.url : "");

            const response = await originalFetch(...args);

            if (response.status === 401 && requestUrl.startsWith(API_BASE_URL ?? "")) {
                if (pathnameRef.current.startsWith("/_admin")) {
                    return response;
                }

                if (requestUrl.includes("/member/refresh")) {
                    toast.error("Session expired. Please log in again.", { id: "global-unauthorized-toast" });
                    logout();
                    return response;
                }

                const refreshed = await doRefresh();
                if (localStorage.getItem(TOKEN_KEY)) {
                    const [retryResource, retryInit] = args;
                    const newToken = localStorage.getItem(TOKEN_KEY);
                    const retryOptions = { ...(retryInit || {}) } as RequestInit;
                    retryOptions.headers = {
                        ...(retryOptions.headers || {}),
                        Authorization: `Bearer ${newToken}`,
                    };
                    return originalFetch(retryResource, retryOptions);
                }

                toast.error("Session expired. Please log in again.", { id: "global-unauthorized-toast" });
                logout();
            }

            return response;
        }) as typeof fetch;

        return () => {
            window.fetch = originalFetch;
            isIntercepting.current = false;
        };
    }, [logout]);

    return <>{children}</>;
};
