/* ═══════════════════════════════════════
   OPENAI CLIENT WRAPPER
   Used for: Senior Dev Architecture Review & Scoring
   Model: gpt-5.2-2025-12-11
   Fallback: Gemini gemini-3.1-pro-preview
   ═══════════════════════════════════════ */

import { generateText } from "@/lib/gemini";
import { withFallback, FallbackOptions } from "@/lib/api-fallback";

const OPENAI_MODEL = "gpt-5.2-2025-12-11";
const GEMINI_FALLBACK_MODEL = "gemini-3.1-pro-preview";

interface OpenAIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/** Raw OpenAI API call (no fallback logic) */
async function rawOpenaiGenerate(
    systemPrompt: string,
    userPrompt: string,
    opts: { maxTokens?: number; temperature?: number; model?: string } = {}
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    const messages: OpenAIMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: opts.model || OPENAI_MODEL,
            messages,
            max_completion_tokens: opts.maxTokens || 8192,
            temperature: opts.temperature ?? 0.2,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API error: ${res.status} ${errText}`);
    }

    const data: OpenAIResponse = await res.json();
    return data.choices[0]?.message?.content || "";
}

export async function openaiGenerate(
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
        () => rawOpenaiGenerate(systemPrompt, userPrompt, apiOpts),
        () => generateText(systemPrompt, userPrompt, {
            maxTokens: apiOpts.maxTokens,
            temperature: apiOpts.temperature,
        }),
        {
            provider: "OpenAI",
            fallbackModel: GEMINI_FALLBACK_MODEL,
            onFallback,
        }
    );
}
