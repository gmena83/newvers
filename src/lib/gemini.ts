import { GoogleGenerativeAI } from "@google/generative-ai";

/* ═══════════════════════════════════════
   GEMINI CLIENT WRAPPER
   Used for: AI Suggest, Project Brief, Architecture Generation
   Model: gemini-3.1-pro-preview (reasoning)
   Also: deep-research-pro-preview-12-2025 (research)
   ═══════════════════════════════════════ */

const DEFAULT_MODEL = "gemini-3.1-pro-preview";
export const GEMINI_RESEARCH_MODEL = "deep-research-pro-preview-12-2025";

function getClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured in .env.local");
    return new GoogleGenerativeAI(key);
}

interface GenerateOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export async function generateText(
    systemPrompt: string,
    userPrompt: string,
    opts: GenerateOptions = {}
): Promise<string> {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: opts.model || DEFAULT_MODEL,
        systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
            maxOutputTokens: opts.maxTokens ?? 4096,
            temperature: opts.temperature ?? 0.7,
        },
    });

    return result.response.text();
}

export async function generateJSON<T = Record<string, unknown>>(
    systemPrompt: string,
    userPrompt: string,
    opts: GenerateOptions = {}
): Promise<T> {
    const text = await generateText(
        systemPrompt + "\n\nYou MUST respond with valid JSON only. No markdown fences.",
        userPrompt,
        { ...opts, temperature: opts.temperature ?? 0.3 }
    );

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    return JSON.parse(cleaned) as T;
}
