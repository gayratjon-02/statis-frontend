const DEFAULT_TIMEOUT = 20000;

export async function fetchWithTimeout(
    input: RequestInfo | URL,
    init?: RequestInit & { timeout?: number },
): Promise<Response> {
    const timeout = init?.timeout ?? DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(input, {
            ...init,
            signal: controller.signal,
        });
        return response;
    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
            throw new Error("Request timed out. Please check your connection and try again.");
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}
