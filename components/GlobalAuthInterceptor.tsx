import React, { useEffect, useRef } from "react";
import { useAuth } from "../libs/hooks/useAuth";
import toast from "react-hot-toast";
import API_BASE_URL from "../libs/config/api.config";

export const GlobalAuthInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    const isIntercepting = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined" || isIntercepting.current) return;
        isIntercepting.current = true;

        const originalFetch = window.fetch;

        window.fetch = (async (...args: any[]) => {
            const [resource] = args;
            const requestUrl = typeof resource === "string" ? resource : (resource instanceof Request ? resource.url : "");

            try {
                const response = await originalFetch(...(args as [any]));

                // Check if this request is to our API and returned a 401
                if (response.status === 401 && requestUrl.startsWith(API_BASE_URL)) {

                    // We need to clone the response to read the body without consuming the original stream
                    const clonedResponse = response.clone();
                    let errorMessage = "Session expired or unauthorized. Please log in again.";

                    try {
                        const errorData = await clonedResponse.json();
                        if (errorData?.message) {
                            errorMessage = errorData.message;
                        }
                    } catch (e) {
                        // Not JSON, ignore
                    }

                    // Avoid duplicate toasts if multiple requests fail at the same time
                    toast.error(errorMessage, { id: "global-unauthorized-toast" });
                    logout();
                }

                return response;
            } catch (error) {
                // Return the error to the original caller
                throw error;
            }
        }) as any;

        // Cleanup on unmount
        return () => {
            window.fetch = originalFetch;
            isIntercepting.current = false;
        };
    }, [logout]);

    return <>{children}</>;
};
