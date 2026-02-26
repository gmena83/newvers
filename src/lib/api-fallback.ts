/* ═══════════════════════════════════════
   API FALLBACK UTILITY
   Retry once → fallback to Gemini
   ═══════════════════════════════════════ */

export interface FallbackOptions {
    /** Name of the primary provider (for logging/events) */
    provider: string;
    /** Gemini model used as fallback */
    fallbackModel: string;
    /** Called when falling back — lets the pipeline emit SSE events */
    onFallback?: (provider: string, error: Error, fallbackModel: string) => void;
}

/**
 * Calls `primaryFn`. On failure, retries once. If retry also fails,
 * invokes `onFallback` callback and calls `fallbackFn`.
 * If `fallbackFn` also fails, throws a descriptive error for the UI.
 */
export async function withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    opts: FallbackOptions
): Promise<T> {
    // First attempt
    try {
        return await primaryFn();
    } catch (firstError) {
        // Retry once
        try {
            return await primaryFn();
        } catch (retryError) {
            const error = retryError instanceof Error ? retryError : new Error(String(retryError));
            console.warn(
                `[Fallback] ${opts.provider} failed after retry: ${error.message}. ` +
                `Falling back to Gemini (${opts.fallbackModel}).`
            );

            // Notify the pipeline
            opts.onFallback?.(opts.provider, error, opts.fallbackModel);

            // Try Gemini fallback
            try {
                return await fallbackFn();
            } catch (fallbackError) {
                const fbErr = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
                throw new Error(
                    `All AI providers failed.\n` +
                    `• ${opts.provider}: ${error.message}\n` +
                    `• Gemini (${opts.fallbackModel}): ${fbErr.message}\n\n` +
                    `Please check your API keys and quotas in .env.local.`
                );
            }
        }
    }
}
