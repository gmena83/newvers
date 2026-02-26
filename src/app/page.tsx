"use client";

import { useState, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import IntakeForm from "@/components/IntakeForm";
import OutputGrid from "@/components/OutputGrid";
import ComposerLog from "@/components/ComposerLog";
import PipelineProgress from "@/components/PipelineProgress";
import MarkdownModal from "@/components/MarkdownModal";
import { ProjectFormData } from "@/lib/schema";
import { PIPELINE_STEPS } from "@/lib/pipeline";
import { Rocket } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface LogEntry {
  prefix: string;
  message: string;
  color?: string;
}

interface StepState {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "complete" | "failed" | "stopped" | "skipped";
  substep?: string;
  output?: string;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("details");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [projectName, setProjectName] = useState("");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ name: string; content: string } | null>(null);

  // Pipeline state
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<StepState[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [reviewScore, setReviewScore] = useState<number | null>(null);
  const [reviewIteration, setReviewIteration] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);
  const [bestIteration, setBestIteration] = useState(0);
  const [pipelineStartedAt, setPipelineStartedAt] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Pause/Resume state
  const [pipelinePaused, setPipelinePaused] = useState(false);
  const [resumeContext, setResumeContext] = useState<Record<string, string> | null>(null);
  const [currentFormData, setCurrentFormData] = useState<ProjectFormData | null>(null);

  // Review loop exhaustion state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviewLoopExhausted, setReviewLoopExhausted] = useState<any | null>(null);

  const addLog = useCallback((prefix: string, message: string, color?: string) => {
    setLogEntries((prev) => [...prev, { prefix, message, color }]);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNewProject = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveProjectId(null);
    setGeneratedFiles({});
    setLogEntries([]);
    setProjectName("");
    setPipelineRunning(false);
    setPipelinePaused(false);
    setPipelineSteps([]);
    setReport(null);
    setReviewScore(null);
    setReviewIteration(0);
    setPipelineStartedAt(null);
    setActiveSection("details");
    setGenerating(false);
    setResumeContext(null);
    setCurrentFormData(null);
    setReviewLoopExhausted(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectSelect = async (id: string) => {
    setActiveProjectId(id);
    setActiveSection("output");
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setProjectName(data.project_name || "");
        setGeneratedFiles(data.generated_files || {});
        setTimeout(() => scrollToSection("output"), 100);
      }
    } catch {
      // Supabase may not be configured
    }
  };

  /* ═══════════════════════════════════════
     SSE STREAM RUNNER (shared by start & resume)
     ═══════════════════════════════════════ */

  const runSSEStream = async (
    body: Record<string, unknown>,
    isResume = false
  ) => {
    setGenerating(true);
    setPipelineRunning(true);
    setPipelinePaused(false);

    if (!isResume) {
      setPipelineStartedAt(Date.now());
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let streamEndedGracefully = false;

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Pipeline failed to start");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const event = JSON.parse(jsonStr);

            // Track graceful stream end (pause or complete)
            if (event.type === "stream_end" || event.type === "pipeline_paused") {
              streamEndedGracefully = true;
            }

            handlePipelineEvent(event);
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        addLog("system", "Pipeline stopped by user", "#f59e0b");
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.status === "running"
              ? { ...s, status: "stopped" }
              : s.status === "pending"
                ? { ...s, status: "stopped" }
                : s
          )
        );
      } else if (!streamEndedGracefully) {
        // Only show error if the stream didn't end gracefully (e.g. from a pause)
        const message = err instanceof Error ? err.message : "Pipeline failed";
        addLog("system", `Error: ${message}`, "#ef4444");
      }
    } finally {
      setPipelineRunning(false);
      setGenerating(false);
      abortControllerRef.current = null;
    }
  };

  /* ═══════════════════════════════════════
     PIPELINE START (Steps 1-5, then pause)
     ═══════════════════════════════════════ */

  const handleSubmitSuccess = async (formData: ProjectFormData) => {
    setProjectName(formData.project_name);
    setCurrentFormData(formData);
    setGeneratedFiles({});
    setReport(null);
    setReviewScore(null);
    setReviewIteration(0);
    setActiveSection("pipeline");

    // Initialize pipeline steps
    const initialSteps: StepState[] = PIPELINE_STEPS.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      status: "pending" as const,
    }));
    setPipelineSteps(initialSteps);

    addLog("system", "Pipeline started. Beginning research & analysis…", "#94a3b8");

    await runSSEStream({ formData });
  };

  /* ═══════════════════════════════════════
     PIPELINE RESUME (Steps 6-8, after report review)
     ═══════════════════════════════════════ */

  const handleResumePipeline = async () => {
    if (!currentFormData || !resumeContext) return;

    addLog("system", "Resuming pipeline — Architecture generation phase…", "#22d3ee");

    await runSSEStream({
      formData: currentFormData,
      resumeFrom: "architecture",
      resumeContext: {
        ...resumeContext,
        // Use the (potentially edited) report's knowledge base
        knowledgeBase: resumeContext.knowledgeBase || "",
      },
    }, true);
  };

  /* ═══════════════════════════════════════
     REPORT EDITING
     ═══════════════════════════════════════ */

  const handleReportEdit = (newContent: string) => {
    setReport(newContent);
    // Also update the knowledge base in resumeContext so the architecture
    // generation uses the edited report content
    if (resumeContext) {
      setResumeContext({ ...resumeContext, knowledgeBase: newContent });
    }
  };

  /* ── Handle SSE Events ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePipelineEvent = (event: any) => {
    switch (event.type) {
      case "step_start":
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, status: "running" }
              : s
          )
        );
        addLog("pipeline", `Starting: ${event.stepId}`, "#22d3ee");
        break;

      case "substep":
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, substep: event.substep }
              : s
          )
        );
        addLog("step", event.substep || event.stepId, "#94a3b8");
        break;

      case "step_complete":
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, status: "complete", output: event.output, substep: undefined }
              : s
          )
        );
        if (!event.alreadyDone) {
          addLog("pipeline", `Completed: ${event.stepId} ✓`, "#22c55e");
        }
        break;

      case "step_failed":
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, status: "failed", output: event.error }
              : s
          )
        );
        addLog("system", `Failed: ${event.stepId} — ${event.error}`, "#ef4444");
        break;

      case "file_generated":
        setGeneratedFiles((prev) => ({
          ...prev,
          [event.fileName]: event.content,
        }));
        addLog(
          "gemini",
          `${event.isRefinement ? "Refined" : "Generated"} ${event.fileName} ✓`,
          event.isRefinement ? "#f59e0b" : "#22c55e"
        );
        break;

      case "report_ready":
        setReport(event.report);
        addLog("system", "Research report ready for review", "#22d3ee");
        break;

      case "pipeline_paused":
        setPipelinePaused(true);
        setResumeContext(event.resumeContext || null);
        addLog("system", "⏸ Pipeline paused — Review the report, edit if needed, then resume.", "#f59e0b");
        break;

      case "review_result":
        setReviewScore(event.score);
        setReviewIteration(event.iteration);
        addLog(
          "review",
          `Architecture score: ${event.score}/100 (iteration ${event.iteration})`,
          event.score >= 90 ? "#22c55e" : "#f59e0b"
        );
        break;

      case "pipeline_complete":
        addLog("system", `Pipeline complete! Best score: ${event.finalScore}/100 (iteration ${event.bestIteration || 1})`, "#22c55e");
        if (event.generatedFiles) {
          setGeneratedFiles(event.generatedFiles);
        }
        if (event.reviewHistory) {
          setReviewHistory(event.reviewHistory);
        }
        if (event.bestIteration) {
          setBestIteration(event.bestIteration);
        }
        break;

      case "pipeline_failed":
        addLog("system", `Pipeline failed: ${event.error}`, "#ef4444");
        break;

      case "pipeline_stopped":
        addLog("system", "Pipeline stopped by user", "#f59e0b");
        break;

      case "review_loop_exhausted":
        setReviewLoopExhausted(event);
        if (event.generatedFiles) {
          setGeneratedFiles(event.generatedFiles);
        }
        if (event.reviewHistory) {
          setReviewHistory(event.reviewHistory);
        }
        if (event.bestIteration) {
          setBestIteration(event.bestIteration);
        }
        addLog(
          "system",
          `⚠ Review loop exhausted after ${event.totalIterations} iterations. Best score: ${event.bestScore}/100 (iteration ${event.bestIteration}). Choose to proceed or retry.`,
          "#f59e0b"
        );
        break;
    }
  };

  /* ── Stop Pipeline ── */
  const handleStopPipeline = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  /* ── Download Report ── */
  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `${projectName || "project"}-research-report.md`);
  };

  /* ── Download ZIP ── */
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const name = projectName || "project";

    // 1. Architecture files
    const arch = zip.folder("architecture")!;
    for (const [fileName, content] of Object.entries(generatedFiles)) {
      arch.file(fileName, content);
    }

    // 2. Research report
    if (report) {
      zip.folder("report")!.file("research-report.md", report);
    }

    // 3. Review iterations
    if (reviewHistory.length > 0) {
      const reviewsFolder = zip.folder("reviews")!;
      for (const entry of reviewHistory) {
        const label = entry.isBest ? " ★ BEST" : entry.score >= 90 ? " ✓ PASS" : " ✗ FAIL";
        const md = `# Architecture Review — Iteration ${entry.iteration}${label}\n\n**Score:** ${entry.score}/100\n\n## Summary\n\n${entry.summary || "N/A"}\n\n## Full Review\n\n\`\`\`json\n${JSON.stringify(entry.review, null, 2)}\n\`\`\`\n`;
        reviewsFolder.file(`review-iteration-${entry.iteration}.md`, md);
      }
    }

    // 4. Process log
    const logText = logEntries
      .map((e) => `[${e.prefix}] ${e.message}`)
      .join("\n");
    zip.file("process-log.md", `# Pipeline Process Log\n\nGenerated: ${new Date().toISOString()}\nProject: ${name}\nBest Score: ${reviewHistory.find((r: { isBest: boolean }) => r.isBest)?.score || "N/A"}/100 (Iteration ${bestIteration})\nTotal Iterations: ${reviewHistory.length}\n\n---\n\n\`\`\`\n${logText}\n\`\`\`\n`);

    // 5. NEXT_STEPS.md
    const fileList = Object.keys(generatedFiles).map((f) => `   - ${f}`).join("\n");
    const nextSteps = [
      `# Next Steps — Loading into Antigravity IDE`,
      ``,
      `## 1. Load Architecture Files`,
      ``,
      `1. Open **Antigravity IDE** and create a new workspace`,
      `2. Drag and drop the \`architecture/\` folder into the workspace file tree`,
      `3. The IDE will auto-detect the following files:`,
      fileList,
      ``,
      `## 2. Review the Research Report`,
      ``,
      `Open \`report/research-report.md\` for the full market analysis, tech research, and build-vs-buy recommendation that informed the architecture.`,
      ``,
      `## 3. Start the Build`,
      ``,
      `Use the following prompt in the Antigravity IDE composer to begin:`,
      ``,
      "```",
      `You are the Lead Development Agent for the "${name}" project.`,
      ``,
      `Read ALL architecture files in order: MISSION.md > DATA_MODEL.md > TECH_STACK.md > SKILLS.md > USER_FLOWS.md > UI.md > ROADMAP.md > TESTING.md > AGENTS.md > BRAND_VOICE.md > CONSTRAINTS.md.`,
      ``,
      `Begin executing Phase 1 of ROADMAP.md. Follow these strict rules:`,
      `- Only use technologies listed in TECH_STACK.md`,
      `- Apply domain expertise standards from SKILLS.md`,
      `- Write tests before code as mandated by TESTING.md`,
      `- Respect all guardrails in CONSTRAINTS.md`,
      `- Match the brand voice defined in BRAND_VOICE.md for all user-facing copy`,
      ``,
      `Start by setting up the project infrastructure and database schema as defined in DATA_MODEL.md.`,
      "```",
      ``,
      `## 4. Review Scores`,
      ``,
      `Check the \`reviews/\` folder for the architecture quality scores from the senior review loop. The best-scoring iteration (★) was used for the final output.`,
    ].join("\n");
    zip.file("NEXT_STEPS.md", nextSteps);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${name}-antigravity-package.zip`);
  };

  /* ── Accept Best Score (when review loop exhausted) ── */
  const handleAcceptBestScore = () => {
    if (!reviewLoopExhausted) return;
    addLog("system", `Proceeding with best score: ${reviewLoopExhausted.bestScore}/100 (iteration ${reviewLoopExhausted.bestIteration})`, "#22c55e");
    setReviewLoopExhausted(null);
    setPipelineRunning(false);
    setGenerating(false);
    // Abort stream if still open
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  /* ── Retry Review Loop (when review loop exhausted) ── */
  const handleRetryLoop = async () => {
    if (!currentFormData || !resumeContext) return;
    setReviewLoopExhausted(null);
    addLog("system", "Retrying review loop — another round of evaluation & refinement…", "#22d3ee");
    // Abort old stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Fire a new pipeline request resuming from architecture step
    // The generated files are already in state from the exhausted event
    await runSSEStream({
      formData: currentFormData,
      resumeFrom: "architecture",
      resumeContext: {
        ...resumeContext,
        knowledgeBase: resumeContext.knowledgeBase || "",
      },
    }, true);
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onNewProject={handleNewProject}
        activeProjectId={activeProjectId}
        onProjectSelect={handleProjectSelect}
      />

      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {projectName || "New Project"}
            </span>
          </div>
          <div className="text-xs text-muted">
            {pipelinePaused
              ? "⏸ Paused — Review Report"
              : pipelineRunning
                ? "Pipeline Running…"
                : generating
                  ? "Generating…"
                  : activeProjectId
                    ? "Ready"
                    : "Draft"}
          </div>
        </div>

        {/* Intake Form */}
        <IntakeForm onSubmitSuccess={handleSubmitSuccess} />

        {/* Pipeline Progress */}
        <PipelineProgress
          isRunning={pipelineRunning}
          isPaused={pipelinePaused}
          steps={pipelineSteps}
          report={report}
          generatedFiles={generatedFiles}
          reviewScore={reviewScore}
          reviewIteration={reviewIteration}
          onStop={handleStopPipeline}
          onDownloadReport={handleDownloadReport}
          onEditReport={handleReportEdit}
          onResumePipeline={handleResumePipeline}
          onPreviewFile={(name, content) => setPreviewModal({ name, content })}
          startedAt={pipelineStartedAt}
          onDownloadZip={handleDownloadZip}
          reviewLoopExhausted={reviewLoopExhausted}
          onAcceptBestScore={handleAcceptBestScore}
          onRetryLoop={handleRetryLoop}
        />

        {/* Output Grid */}
        <OutputGrid
          files={generatedFiles}
          projectName={projectName}
          onPreview={(name, content) => setPreviewModal({ name, content })}
        />

        {/* Composer Log */}
        {logEntries.length > 0 && <ComposerLog entries={logEntries} />}
      </main>

      {/* Markdown Preview Modal */}
      {previewModal && (
        <MarkdownModal
          title={previewModal.name}
          content={previewModal.content}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
}
