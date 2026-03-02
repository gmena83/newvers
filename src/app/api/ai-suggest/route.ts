import { NextRequest, NextResponse } from "next/server";
import { generateJSON, generateText } from "@/lib/gemini";

interface SuggestRequest {
    project_name: string;
    description: string;
    goal: string;
    target_audience: string;
    core_problem: string;
    key_differentiator: string;
    mandatory_integrations: string;
    data_privacy_security: string;
}

interface TechSuggestion {
    frontend: string;
    backend: string;
    database: string;
    hosting: string;
    reasoning: string;
}

const VALID_OPTIONS: Record<string, string[]> = {
    frontend: ["Next.js", "React", "Vue.js", "Angular", "Svelte", "Astro", "Other"],
    backend: ["Node.js", "Python (Django/Flask)", "Go", "Ruby on Rails", "Java (Spring)", "Other"],
    database: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase", "PlanetScale", "Other"],
    hosting: ["Vercel", "Netlify", "AWS", "Google Cloud", "Railway", "Render", "Other"],
};

function validateSuggestion(data: unknown): TechSuggestion | null {
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    const required = ["frontend", "backend", "database", "hosting", "reasoning"];
    for (const key of required) {
        if (typeof obj[key] !== "string" || !(obj[key] as string).trim()) return null;
    }
    return obj as unknown as TechSuggestion;
}

export async function POST(req: NextRequest) {
    try {
        const body: SuggestRequest = await req.json();

        const systemPrompt = `You are a senior software architect. Based on provided project details, recommend the most appropriate tech stack. You MUST return valid JSON matching this exact schema:
{
  "frontend": "<one of: ${VALID_OPTIONS.frontend.join(", ")}>",
  "backend": "<one of: ${VALID_OPTIONS.backend.join(", ")}>",
  "database": "<one of: ${VALID_OPTIONS.database.join(", ")}>",
  "hosting": "<one of: ${VALID_OPTIONS.hosting.join(", ")}>",
  "reasoning": "<2-3 sentences explaining WHY these choices fit the project>"
}

Pick from the listed options only. Consider the project requirements, target audience scale, integrations needed, and security requirements when making your recommendation. Return ONLY the JSON object, no other text.`;

        const userPrompt = `Recommend a tech stack for this project:

PROJECT NAME: ${body.project_name || "Not specified"}
DESCRIPTION: ${body.description || "Not specified"}
GOAL: ${body.goal || "Not specified"}
TARGET AUDIENCE: ${body.target_audience || "Not specified"}
CORE PROBLEM: ${body.core_problem || "Not specified"}
KEY DIFFERENTIATOR: ${body.key_differentiator || "Not specified"}
MANDATORY INTEGRATIONS: ${body.mandatory_integrations || "None specified"}
DATA PRIVACY / SECURITY: ${body.data_privacy_security || "None specified"}`;

        // Try generateJSON first
        let suggestion: TechSuggestion | null = null;
        try {
            const result = await generateJSON<TechSuggestion>(
                systemPrompt,
                userPrompt,
                { temperature: 0.3 }
            );
            suggestion = validateSuggestion(result);
        } catch (jsonErr) {
            console.warn("AI Suggest: generateJSON failed, trying raw text parse:", jsonErr);
        }

        // If generateJSON failed, try raw text and manually extract JSON
        if (!suggestion) {
            try {
                const rawText = await generateText(
                    systemPrompt,
                    userPrompt,
                    { temperature: 0.3 }
                );
                // Try to find JSON in the response
                const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    suggestion = validateSuggestion(parsed);
                }
            } catch (fallbackErr) {
                console.error("AI Suggest: Fallback text parse also failed:", fallbackErr);
            }
        }

        if (!suggestion) {
            return NextResponse.json(
                { error: "AI could not generate a valid tech stack recommendation. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(suggestion);
    } catch (err: unknown) {
        console.error("AI Suggest error:", err);
        const message =
            err instanceof Error ? err.message : "AI suggestion failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
