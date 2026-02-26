import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabase } from "@/lib/supabase";
import { FILE_ORDER } from "@/lib/constants";
import { buildPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
    try {
        const { projectId, fileIndex, previousFiles } = await req.json();

        if (typeof projectId !== "string" || typeof fileIndex !== "number") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        if (fileIndex < 0 || fileIndex >= FILE_ORDER.length) {
            return NextResponse.json({ error: "Invalid file index" }, { status: 400 });
        }

        const supabase = getSupabase();

        // Load project data
        const { data: project, error: fetchErr } = await supabase
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .single();

        if (fetchErr || !project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Build prompt with dependency chain
        const { system, user } = buildPrompt(fileIndex, project, previousFiles || {});

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            temperature: 0.4,
            max_tokens: 4096,
        });

        const content = response.choices[0]?.message?.content || "";
        const fileName = FILE_ORDER[fileIndex]!.name;

        // Store in Supabase
        const currentFiles = project.generated_files || {};
        currentFiles[fileName] = content;

        await supabase
            .from("projects")
            .update({
                generated_files: currentFiles,
                status: fileIndex === FILE_ORDER.length - 1 ? "complete" : "generating",
                updated_at: new Date().toISOString(),
            })
            .eq("id", projectId);

        return NextResponse.json({
            fileName,
            content,
            fileIndex,
            total: FILE_ORDER.length,
        });
    } catch (err: unknown) {
        console.error("Generation error:", err);
        const message = err instanceof Error ? err.message : "Generation failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
