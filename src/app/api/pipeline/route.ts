import { NextRequest } from "next/server";
import { generateText } from "@/lib/gemini";
import { anthropicGenerate } from "@/lib/anthropic";
import { openaiGenerate } from "@/lib/openai";
import { buildFormContext } from "@/lib/pipeline";
import { researchTechStack, researchMarketAnalysis } from "@/lib/research";
import { buildPrompt } from "@/lib/prompts";
import { FILE_ORDER } from "@/lib/constants";

/* ═══════════════════════════════════════
   SSE PIPELINE ORCHESTRATOR
   ═══════════════════════════════════════
   
   Model Assignments (with Gemini fallbacks):
   ┌─────────────────────────────┬────────────────────────────┬─────────────────────────────────┐
   │ Step                        │ Primary                    │ Fallback (retry once → Gemini)  │
   ├─────────────────────────────┼────────────────────────────┼─────────────────────────────────┤
   │ 1. Project Brief            │ Gemini 3.1 Pro Preview     │ (already Gemini)                │
   │ 2. Deep Search              │ Perplexity sonar-deep      │ Gemini deep-research-pro        │
   │ 3. Market Analysis          │ Perplexity sonar-deep      │ Gemini deep-research-pro        │
   │ 4. Knowledge Base           │ Claude Sonnet 4-6          │ Gemini 3.1 Pro Preview          │
   │ 5. Report Delivery          │ Claude Sonnet 4-6          │ Gemini 3.1 Pro Preview          │
   │   ── PAUSE ── User reviews report, can edit, then resumes                                  │
   │ 6. Architecture Generation  │ Gemini 3.1 Pro Preview     │ (already Gemini)                │
   │ 7. Senior Dev Review        │ GPT-5.2                    │ Gemini 3.1 Pro Preview          │
   │ 8. Refinement               │ Gemini 3.1 Pro Preview     │ (already Gemini)                │
   └─────────────────────────────┴────────────────────────────┴─────────────────────────────────┘
   ═══════════════════════════════════════ */

export const dynamic = "force-dynamic";

function sendEvent(
    controller: ReadableStreamDefaultController,
    event: string,
    data: Record<string, unknown>
) {
    const payload = JSON.stringify({ type: event, ...data, timestamp: Date.now() });
    controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`));
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const formData = body.formData;
    const resumeFrom: string | undefined = body.resumeFrom;
    const resumeContext: {
        brief?: string;
        research?: string;
        market?: string;
        knowledgeBase?: string;
        report?: string;
    } = body.resumeContext || {};

    if (!formData) {
        return new Response(JSON.stringify({ error: "Missing form data" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const context = buildFormContext(formData);
    let cancelled = false;

    const stream = new ReadableStream({
        async start(controller) {
            const generatedFiles: Record<string, string> = {};

            // If resuming, use the provided context
            let brief = resumeContext.brief || "";
            let research = resumeContext.research || "";
            let market = resumeContext.market || "";
            let knowledgeBase = resumeContext.knowledgeBase || "";

            function emit(event: string, data: Record<string, unknown>) {
                if (!cancelled) sendEvent(controller, event, data);
            }

            /** Shared fallback callback — emits SSE event when a provider fails */
            const onFallback = (provider: string, error: Error, fallbackModel: string) => {
                emit("fallback_activated", {
                    provider,
                    reason: error.message,
                    fallbackModel,
                });
            };

            try {
                /* ══════════════════════════════════════════════════════
                   PHASE 1: RESEARCH (Steps 1-5) — skipped if resuming
                   ══════════════════════════════════════════════════════ */
                if (resumeFrom !== "architecture") {

                    /* ── STEP 1: PROJECT BRIEF — Gemini ── */
                    emit("step_start", { stepId: "brief", stepIndex: 0 });
                    emit("substep", { stepId: "brief", substep: "Analyzing form data with Gemini" });

                    const briefPrompt = `You are a senior project analyst. Analyze the following project intake form and produce a clear, comprehensive project brief. Identify any gaps, ambiguities, or missing information.

Structure your output as:
1. **Project Summary** — A 2-3 paragraph understanding of the project
2. **Key Requirements** — Bullet list of critical requirements identified
3. **Technical Implications** — What the tech choices mean for architecture
4. **Potential Risks** — Any risks or challenges identified
5. **Missing Information** — Questions that should be clarified (if any)`;

                    brief = await generateText(briefPrompt, context);
                    if (cancelled) { controller.close(); return; }
                    emit("step_complete", { stepId: "brief", output: brief });

                    /* ── STEP 2: DEEP SEARCH — Perplexity ── */
                    emit("step_start", { stepId: "research", stepIndex: 1 });
                    emit("substep", { stepId: "research", substep: "Searching with Perplexity" });

                    research = await researchTechStack(context, onFallback);
                    if (cancelled) { controller.close(); return; }
                    emit("step_complete", { stepId: "research", output: research });

                    /* ── STEP 3: MARKET ANALYSIS — Perplexity ── */
                    emit("step_start", { stepId: "market", stepIndex: 2 });
                    emit("substep", { stepId: "market", substep: "Analyzing market with Perplexity" });

                    market = await researchMarketAnalysis(context, onFallback);
                    if (cancelled) { controller.close(); return; }
                    emit("step_complete", { stepId: "market", output: market });

                    /* ── STEP 4: KNOWLEDGE BASE — Claude ── */
                    emit("step_start", { stepId: "knowledge", stepIndex: 3 });
                    emit("substep", { stepId: "knowledge", substep: "Consolidating research with Claude" });

                    const knowledgePrompt = `You are a senior technical writer. Consolidate the following research into a comprehensive project knowledge base report.

Structure the report as:
1. **Executive Summary**
2. **Project Overview** — Goals and requirements
3. **Technical Research Findings** — Best practices, patterns, documentation
4. **Market Analysis** — Commercial alternatives comparison
5. **Build vs Buy Recommendation** — Detailed analysis with pros/cons table
6. **Recommended Architecture** — Based on all research
7. **Implementation Considerations** — Key decisions and trade-offs
8. **Risk Assessment** — Technical and business risks
9. **Appendix** — Sources and references`;

                    knowledgeBase = await anthropicGenerate(
                        knowledgePrompt,
                        `PROJECT CONTEXT:\n${context}\n\nPROJECT BRIEF:\n${brief}\n\nTECHNICAL RESEARCH:\n${research}\n\nMARKET ANALYSIS:\n${market}`,
                        { maxTokens: 16384, onFallback }
                    );
                    if (cancelled) { controller.close(); return; }
                    emit("step_complete", { stepId: "knowledge", output: knowledgeBase });

                    /* ── STEP 5: REPORT DELIVERY — Claude ── */
                    emit("step_start", { stepId: "report", stepIndex: 4 });
                    emit("substep", { stepId: "report", substep: "Drafting final report with Claude" });

                    const formattedReport = await anthropicGenerate(
                        `You are a professional report writer. Format the knowledge base into a polished, client-ready research report with clear headers, bullet lists, tables, and an executive summary. Use Markdown formatting.`,
                        `Format this into a client-ready research report for "${formData.project_name}":\n\n${knowledgeBase}\n\nGeneration date: ${new Date().toLocaleDateString()}. Credit: "Generated by Antigravity Symphony".`,
                        { maxTokens: 16384, onFallback }
                    );
                    if (cancelled) { controller.close(); return; }

                    emit("report_ready", { report: formattedReport });
                    emit("step_complete", { stepId: "report", output: "Report ready for review" });

                    /* ══════════════════════════════════════════════
                       ── PAUSE ── Wait for user to review report
                       ══════════════════════════════════════════════ */
                    emit("pipeline_paused", {
                        message: "Report ready. Review, edit if needed, then resume.",
                        resumeContext: {
                            brief,
                            research,
                            market,
                            knowledgeBase,
                        },
                    });

                    // Send explicit end-of-stream signal and allow time to flush
                    emit("stream_end", { reason: "paused" });
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    controller.close();
                    return;

                } else {
                    /* ── Resuming: mark steps 1-5 as already complete ── */
                    for (let i = 0; i < 5; i++) {
                        const stepIds = ["brief", "research", "market", "knowledge", "report"];
                        emit("step_complete", {
                            stepId: stepIds[i],
                            stepIndex: i,
                            output: "Completed in previous phase",
                            alreadyDone: true,
                        });
                    }
                    // Use provided knowledge base for architecture context
                    knowledgeBase = resumeContext.knowledgeBase || "";
                }

                /* ══════════════════════════════════════════════════════
                   PHASE 2: ARCHITECTURE (Steps 6-8)
                   ══════════════════════════════════════════════════════ */

                /* ── STEP 6: ARCHITECTURE GENERATION — Gemini ── */
                emit("step_start", { stepId: "architecture", stepIndex: 5 });

                for (let i = 0; i < FILE_ORDER.length; i++) {
                    if (cancelled) { controller.close(); return; }

                    const file = FILE_ORDER[i]!;
                    emit("substep", {
                        stepId: "architecture",
                        substep: `Generating ${file.name} with Gemini`,
                        fileIndex: i,
                        totalFiles: FILE_ORDER.length,
                    });

                    const { system, user } = buildPrompt(i, formData, generatedFiles);
                    const enhancedSystem = `${system}\n\nIMPORTANT CONTEXT FROM RESEARCH:\n${knowledgeBase.substring(0, 3000)}`;

                    const content = await generateText(enhancedSystem, user, { maxTokens: 8192 });
                    generatedFiles[file.name] = content;

                    emit("file_generated", {
                        stepId: "architecture",
                        fileName: file.name,
                        content,
                        fileIndex: i,
                        totalFiles: FILE_ORDER.length,
                    });
                }

                emit("step_complete", {
                    stepId: "architecture",
                    output: `Generated ${FILE_ORDER.length} architecture files`,
                });
                if (cancelled) { controller.close(); return; }

                /* ── STEP 7 & 8: SENIOR REVIEW + REFINEMENT — GPT-5.2 + Gemini ── */
                let reviewScore = 0;
                let reviewIteration = 0;
                const maxIterations = 3;

                // Track best-scoring iteration
                let bestScore = 0;
                let bestIteration = 0;
                let bestFiles: Record<string, string> = { ...generatedFiles };
                const reviewHistory: Array<{
                    iteration: number;
                    score: number;
                    summary: string;
                    review: unknown;
                    isBest: boolean;
                }> = [];

                // Store previous review feedback to differentiate subsequent reviews
                let previousReviewFeedback = "";

                while (reviewScore < 90 && reviewIteration < maxIterations) {
                    reviewIteration++;
                    if (cancelled) { controller.close(); return; }

                    const currentStepId = reviewIteration === 1 ? "review" : "refinement";
                    const currentStepIndex = reviewIteration === 1 ? 6 : 7;

                    emit("step_start", { stepId: currentStepId, stepIndex: currentStepIndex });
                    emit("substep", {
                        stepId: currentStepId,
                        substep: reviewIteration === 1
                            ? "Senior review with GPT-5.2"
                            : `Re-review iteration ${reviewIteration} (post-refinement)`,
                    });

                    // Build the review prompt — include prior feedback for iterations 2+
                    let reviewPrompt = `You are a senior development architect performing review iteration ${reviewIteration} of ${maxIterations} on 13 architecture markdown files. Evaluate each file individually on clarity, completeness, and best practices. Evaluate cross-file consistency. Score the overall package 0-100.

IMPORTANT: Be thorough and discriminating. A score of 90+ means production-ready quality. Score honestly — do not default to a fixed score. Each iteration should reflect the ACTUAL quality of the content you are reviewing right now.

GOVERNANCE VALIDATION (MANDATORY — violations MUST reduce the score significantly):
You MUST check for the following kill-switch violations. Any violation found should reduce the overall score by at least 10 points per violation:

1. **UI Library Compliance**: If TECH_STACK.md mandates a CSS solution (e.g., Tailwind CSS), does UI.md reference shadcn/ui, Radix UI, or any unauthorized component library? If yes, flag as KILL-SWITCH VIOLATION.
2. **3D Physics Compliance**: If any file references 3D physics, does it use @react-three/rapier? Any reference to @react-three/cannon is a KILL-SWITCH VIOLATION.
3. **Auth Storage Compliance**: Do any files suggest storing auth tokens in localStorage or frontend memory? Only secure HTTP-only cookies are allowed. Violation = KILL-SWITCH VIOLATION.
4. **Database Test Parity**: Does TESTING.md suggest using SQLite when DATA_MODEL.md or TECH_STACK.md specifies PostgreSQL with pgvector? Violation = KILL-SWITCH VIOLATION.
5. **Priority Hierarchy**: Does GOVERNANCE.md exist and correctly establish TECH_STACK.md as Level 1 authority? Do lower-level files contradict higher-level files?

Respond with valid JSON:
{
  "overallScore": <number 0-100>,
  "summary": "<overall assessment — what changed since last review, or initial assessment>",
  "killSwitchViolations": ["<description of each kill-switch violation found, or empty array if none>"],
  "fileReviews": [
    {
      "fileName": "<file name>",
      "score": <number 0-100>,
      "issues": ["<issue>"],
      "recommendations": ["<specific, actionable recommendation>"]
    }
  ],
  "consistencyIssues": ["<cross-file issue>"],
  "topPriorityFixes": ["<most critical fix>"]
}

Focus on: GOVERNANCE.md hierarchy compliance, consistency between MISSION.md and all other files, data model alignment, tech stack references, SKILLS.md alignment with AGENTS.md, NEXT_STEPS.md accuracy, kill-switch rule enforcement, and no contradictions.`;

                    if (previousReviewFeedback && reviewIteration > 1) {
                        reviewPrompt += `\n\nPREVIOUS REVIEW FEEDBACK (iteration ${reviewIteration - 1}):\n${previousReviewFeedback}\n\nEvaluate whether the above issues were addressed. If they were fixed, the score should improve. If not, the score should NOT improve. Do NOT give the same score as before unless the quality is genuinely unchanged.`;
                    }

                    const allFilesContent = Object.entries(generatedFiles)
                        .map(([name, content]) => `### ${name}\n\n${content}`)
                        .join("\n\n---\n\n");

                    const reviewText = await openaiGenerate(
                        reviewPrompt,
                        `Review these architecture files (iteration ${reviewIteration}):\n\n${allFilesContent}`,
                        { maxTokens: 8192, temperature: 0.3 + (reviewIteration * 0.1), onFallback }
                    );

                    let review: {
                        overallScore: number;
                        summary: string;
                        fileReviews?: Array<{
                            fileName: string;
                            score?: number;
                            issues?: string[];
                            recommendations: string[];
                        }>;
                        topPriorityFixes?: string[];
                        consistencyIssues?: string[];
                    };
                    try {
                        const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
                        review = jsonMatch ? JSON.parse(jsonMatch[0]) : { overallScore: 85, summary: reviewText };
                    } catch {
                        review = { overallScore: 85, summary: reviewText };
                    }

                    reviewScore = review.overallScore;

                    // Build feedback string for next iteration
                    const issuesSummary = (review.topPriorityFixes || []).join("; ");
                    const consistencySummary = (review.consistencyIssues || []).join("; ");
                    const fileIssues = (review.fileReviews || [])
                        .filter(fr => (fr.issues?.length || 0) > 0)
                        .map(fr => `${fr.fileName}: ${(fr.issues || []).join(", ")}`)
                        .join("\n");
                    previousReviewFeedback = `Score: ${reviewScore}/100\nSummary: ${review.summary}\nTop Fixes: ${issuesSummary || "None"}\nConsistency Issues: ${consistencySummary || "None"}\nFile Issues:\n${fileIssues || "None"}`;

                    // Snapshot best-scoring iteration
                    if (reviewScore > bestScore) {
                        bestScore = reviewScore;
                        bestIteration = reviewIteration;
                        bestFiles = { ...generatedFiles };
                    }

                    // Record review history
                    reviewHistory.push({
                        iteration: reviewIteration,
                        score: reviewScore,
                        summary: review.summary,
                        review,
                        isBest: false, // will be updated after loop
                    });

                    emit("review_result", {
                        stepId: currentStepId,
                        score: reviewScore,
                        iteration: reviewIteration,
                        review,
                    });
                    emit("step_complete", {
                        stepId: currentStepId,
                        output: `Score: ${reviewScore}/100 (iteration ${reviewIteration})`,
                    });

                    /* ── REFINEMENT if needed ── */
                    if (reviewScore < 90 && reviewIteration < maxIterations) {
                        if (cancelled) { controller.close(); return; }

                        emit("step_start", { stepId: "refinement", stepIndex: 7 });
                        emit("substep", { stepId: "refinement", substep: `Refining with Gemini (fixing ${(review.topPriorityFixes || []).length} priority issues)` });

                        const filesToFix = review.fileReviews
                            ?.filter((fr) => fr.recommendations.length > 0)
                            ?.slice(0, 5) || [];

                        await Promise.all(
                            filesToFix.map(async (fileReview) => {
                                if (cancelled) return;

                                emit("substep", {
                                    stepId: "refinement",
                                    substep: `Improving ${fileReview.fileName} (score: ${fileReview.score || "N/A"}/100)`,
                                });

                                const improved = await generateText(
                                    `You are improving an architecture document based on reviewer feedback. Apply ALL the improvements listed below. Make SUBSTANTIAL changes — do not just rephrase. Add missing content, fix structural issues, and ensure cross-file consistency.

SPECIFIC ISSUES TO FIX IN THIS FILE:
${(fileReview.issues || []).map(i => `- ${i}`).join("\n")}

RECOMMENDATIONS:
${fileReview.recommendations.map(r => `- ${r}`).join("\n")}

TOP PRIORITY FIXES (apply if relevant to this file):
${(review.topPriorityFixes || []).map(f => `- ${f}`).join("\n")}

CONSISTENCY ISSUES (apply if relevant to this file):
${(review.consistencyIssues || []).map(c => `- ${c}`).join("\n")}

Return ONLY the complete improved markdown. Do not include explanations or commentary.`,
                                    `Improve this file:\n\n${generatedFiles[fileReview.fileName]}`,
                                    { maxTokens: 8192 }
                                );

                                if (cancelled) return;

                                generatedFiles[fileReview.fileName] = improved;

                                emit("file_generated", {
                                    stepId: "refinement",
                                    fileName: fileReview.fileName,
                                    content: improved,
                                    isRefinement: true,
                                });
                            })
                        );

                        if (cancelled) {
                            controller.close();
                            return;
                        }

                        emit("step_complete", {
                            stepId: "refinement",
                            output: `Refined ${filesToFix.length} files, re-reviewing…`,
                        });
                    }
                }

                // Mark the best iteration in reviewHistory
                for (const entry of reviewHistory) {
                    entry.isBest = entry.iteration === bestIteration;
                }

                // Use best-scoring files as final output
                const finalFiles = bestScore >= reviewScore ? bestFiles : generatedFiles;

                /* ── If no iteration reached 90, ask user what to do ── */
                if (bestScore < 90) {
                    emit("review_loop_exhausted", {
                        bestScore,
                        bestIteration,
                        totalIterations: reviewIteration,
                        reviewHistory,
                        generatedFiles: finalFiles,
                    });
                    // Stream stays open — client will either:
                    // 1. Accept the best score (handled client-side, closes stream)
                    // 2. Request another loop (sends a new request)
                } else {
                    /* ── Pipeline Complete ── */
                    emit("pipeline_complete", {
                        generatedFiles: finalFiles,
                        finalScore: bestScore,
                        bestIteration,
                        totalIterations: reviewIteration,
                        reviewHistory,
                    });
                }

            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Pipeline failed";
                emit("pipeline_failed", { error: message });
            } finally {
                controller.close();
            }
        },

        cancel() {
            cancelled = true;
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
