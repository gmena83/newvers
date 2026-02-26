/* ═══════════════════════════════════════
   ANTHROPIC CLIENT WRAPPER
   Used for: Research Consolidation & Report Writing
   Model: claude-sonnet-4-6
   Fallback: Gemini gemini-3.1-pro-preview
   ═══════════════════════════════════════ */

import { generateText } from "@/lib/gemini";
import { withFallback, FallbackOptions } from "@/lib/api-fallback";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const GEMINI_FALLBACK_MODEL = "gemini-3.1-pro-preview";

interface AnthropicMessage {
    role: "user" | "assistant";
    content: string;
}

interface AnthropicResponse {
    content: Array<{
        type: "text";
        text: string;
    }>;
}

/** Raw Anthropic API call (no fallback logic) */
async function rawAnthropicGenerate(
    systemPrompt: string,
    userPrompt: string,
    opts: { maxTokens?: number; temperature?: number; model?: string } = {}
): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const messages: AnthropicMessage[] = [
        { role: "user", content: userPrompt },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: opts.model || ANTHROPIC_MODEL,
            system: systemPrompt,
            messages,
            max_tokens: opts.maxTokens || 8192,
            temperature: opts.temperature ?? 0.5,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API error: ${res.status} ${errText}`);
    }

    const data: AnthropicResponse = await res.json();
    return data.content[0]?.text || "";
}

export async function anthropicGenerate(
    systemPrompt: string,
    userPrompt: string,
    opts: {
        maxTokens?: number;
        temperature?: number;
        model?: string;
        onFallback?: FallbackOptions["onFallback"];
    } = {}
): Promise<string> {
    const { onFallback, ...apiOpts } = opts;

    return withFallback(
        () => rawAnthropicGenerate(systemPrompt, userPrompt, apiOpts),
        () => generateText(systemPrompt, userPrompt, {
            maxTokens: apiOpts.maxTokens,
            temperature: apiOpts.temperature,
        }),
        {
            provider: "Anthropic",
            fallbackModel: GEMINI_FALLBACK_MODEL,
            onFallback,
        }
    );
}
