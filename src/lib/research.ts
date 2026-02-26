/* ═══════════════════════════════════════
   PERPLEXITY RESEARCH MODULE
   Fallback: Gemini gemini-3.1-pro-preview
   (deep-research model requires Interactions API,
    so we use the standard pro model instead)
   ═══════════════════════════════════════ */

import { generateText } from "@/lib/gemini";
import { withFallback, FallbackOptions } from "@/lib/api-fallback";

const PERPLEXITY_FALLBACK_MODEL = "gemini-3.1-pro-preview";

interface PerplexityMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface PerplexityResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/** Raw Perplexity API call (no fallback logic) */
async function rawCallPerplexity(
    messages: PerplexityMessage[],
    model = "sonar-deep-research"
): Promise<string> {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey || apiKey === "your_perplexity_api_key_here") {
        throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: 8192,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Perplexity API error: ${res.status} ${errText}`);
    }

    const data: PerplexityResponse = await res.json();
    return data.choices[0]?.message?.content || "";
}

/** Call Perplexity with automatic Gemini fallback */
async function callPerplexity(
    messages: PerplexityMessage[],
    model = "sonar-deep-research",
    onFallback?: FallbackOptions["onFallback"]
): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system")?.content || "";
    const userMsg = messages.find((m) => m.role === "user")?.content || "";

    return withFallback(
        () => rawCallPerplexity(messages, model),
        () => generateText(systemMsg, userMsg, { model: PERPLEXITY_FALLBACK_MODEL, maxTokens: 8192 }),
        {
            provider: "Perplexity",
            fallbackModel: PERPLEXITY_FALLBACK_MODEL,
            onFallback,
        }
    );
}

/* ── Deep Search for Tech Stack & Best Practices ── */
export async function researchTechStack(
    context: string,
    onFallback?: FallbackOptions["onFallback"]
): Promise<string> {
    return callPerplexity(
        [
            {
                role: "system",
                content: `You are a senior software engineering researcher. Search the web for the latest best practices, official documentation, community recommendations, and proven patterns for the tech stack described in the project. Focus on:
1. Official documentation and latest stable versions
2. Community best practices and common architectures
3. Known gotchas and pitfalls
4. Recommended integrations and middleware
5. Performance benchmarks and scalability considerations

Provide detailed, factual findings with sources where possible. Structure your output clearly with headers and bullet points.`,
            },
            {
                role: "user",
                content: `Research the following project's tech stack and find best practices:\n\n${context}`,
            },
        ],
        "sonar-deep-research",
        onFallback
    );
}

/* ── Market Analysis: Commercial vs Custom ── */
export async function researchMarketAnalysis(
    context: string,
    onFallback?: FallbackOptions["onFallback"]
): Promise<string> {
    return callPerplexity(
        [
            {
                role: "system",
                content: `You are a market research analyst specializing in software products. For the given project:
1. Find existing commercial solutions that solve the same or similar problem
2. List the top 3-5 "commercial ready" alternatives currently on the market
3. For each alternative, provide: name, URL, pricing model, key features, pros and cons
4. Analyze the trade-offs between "buy/use existing" vs "build custom"
5. Consider factors like: time-to-market, cost, customization, vendor lock-in, long-term maintenance
6. Provide a clear recommendation with justification

Be thorough and cite real products. Focus on what's actually available in the market right now.`,
            },
            {
                role: "user",
                content: `Perform a market analysis for this project:\n\n${context}`,
            },
        ],
        "sonar-deep-research",
        onFallback
    );
}
