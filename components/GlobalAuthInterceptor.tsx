import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../libs/hooks/useAuth";
import toast from "react-hot-toast";
import API_BASE_URL from "../libs/config/api.config";

export const GlobalAuthInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const { logout } = useAuth();
    const isIntercepting = useRef(false);
    const pathnameRef = useRef(router.pathname);

    useEffect(() => {
        pathnameRef.current = router.pathname;
    }, [router.pathname]);

    useEffect(() => {
        if (typeof window === "undefined" || isIntercepting.current) return;
        isIntercepting.current = true;

        const originalFetch = window.fetch;

        window.fetch = (async (...args: Parameters<typeof fetch>) => {
            const [resource] = args;
            const requestUrl = typeof resource === "string" ? resource : (resource instanceof Request ? resource.url : "");

            try {
                const response = await originalFetch(...args);

                if (response.status === 401 && requestUrl.startsWith(API_BASE_URL ?? "")) {
                    // Skip interceptor on admin pages — admin has its own auth flow
                    if (pathnameRef.current.startsWith("/_admin")) {
                        return response;
                    }

                    const clonedResponse = response.clone();
                    let errorMessage = "Session expired or unauthorized. Please log in again.";

                    try {
                        const errorData = await clonedResponse.json();
                        if (errorData?.message) {
                            errorMessage = errorData.message;
                        }
                    } catch {
                        // Not JSON, ignore
                    }

                    toast.error(errorMessage, { id: "global-unauthorized-toast" });
                    logout();
                }

                return response;
            } catch (error) {
                throw error;
            }
        }) as typeof fetch;

        return () => {
            window.fetch = originalFetch;
            isIntercepting.current = false;
        };
    }, [logout]);

    return <>{children}</>;
};
