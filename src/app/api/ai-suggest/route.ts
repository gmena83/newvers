import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

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

export async function POST(req: NextRequest) {
    try {
        const body: SuggestRequest = await req.json();

        const systemPrompt = `You are a senior software architect. Based on provided project details, recommend the most appropriate tech stack. You MUST return valid JSON matching this exact schema:
{
  "frontend": "<one of: Next.js, React, Vue.js, Angular, Svelte, Astro, Other>",
  "backend": "<one of: Node.js, Python (Django/Flask), Go, Ruby on Rails, Java (Spring), Other>",
  "database": "<one of: PostgreSQL, MySQL, MongoDB, Supabase, Firebase, PlanetScale, Other>",
  "hosting": "<one of: Vercel, Netlify, AWS, Google Cloud, Railway, Render, Other>",
  "reasoning": "<2-3 sentences explaining WHY these choices fit the project>"
}

Pick from the listed options only. Consider the project requirements, target audience scale, integrations needed, and security requirements when making your recommendation.`;

        const userPrompt = `Recommend a tech stack for this project:

PROJECT NAME: ${body.project_name || "Not specified"}
DESCRIPTION: ${body.description || "Not specified"}
GOAL: ${body.goal || "Not specified"}
TARGET AUDIENCE: ${body.target_audience || "Not specified"}
CORE PROBLEM: ${body.core_problem || "Not specified"}
KEY DIFFERENTIATOR: ${body.key_differentiator || "Not specified"}
MANDATORY INTEGRATIONS: ${body.mandatory_integrations || "None specified"}
DATA PRIVACY / SECURITY: ${body.data_privacy_security || "None specified"}`;

        const suggestion = await generateJSON<TechSuggestion>(
            systemPrompt,
            userPrompt,
            { temperature: 0.3 }
        );

        return NextResponse.json(suggestion);
    } catch (err: unknown) {
        console.error("AI Suggest error:", err);
        const message =
            err instanceof Error ? err.message : "AI suggestion failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
