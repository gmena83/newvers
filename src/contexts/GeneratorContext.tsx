"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
    GeneratorFormData,
    INITIAL_FORM_DATA,
    PipelineState,
    GeneratedFile,
    ReviewResult,
    ReviewHistoryEntry,
    categorizeFile,
} from "@/data/generatorTypes";

export type SubstepStatus = "running" | "done" | "conflict" | "failed";

export interface SubstepEntry {
    id: number;
    message: string;
    timestamp: Date;
    status: SubstepStatus;
    fileName?: string; // Track which file this substep is for
}

interface PipelineProgress {
    current: number;
    total: number;
}

interface GeneratorContextType {
    formData: GeneratorFormData;
    updateField: (key: keyof GeneratorFormData, value: string) => void;
    pipelineState: PipelineState;
    pipelineError: string | null;
    activeStep: number;
    substepMessages: SubstepEntry[];
    researchReport: string;
    editedReport: string;
    setEditedReport: (v: string) => void;
    generatedFiles: GeneratedFile[];
    updateGeneratedFile: (filename: string, content: string) => void;
    reviewResult: ReviewResult | null;
    reviewLoopExhausted: boolean;
    reviewHistory: ReviewHistoryEntry[];
    bestReview: { score: number; iteration: number } | null;
    startPipeline: () => void;
    resumePipeline: () => void;
    retryRefinement: () => void;
    proceedWithBest: () => void;
    resetPipeline: () => void;
    elapsedTime: number;
    pipelineProgress: PipelineProgress;
    retrying: boolean;
}

const GeneratorContext = createContext<GeneratorContextType | null>(null);

export const useGenerator = () => {
    const ctx = useContext(GeneratorContext);
    if (!ctx) throw new Error("useGenerator must be used within GeneratorProvider");
    return ctx;
};

/**
 * Parse SSE stream from the backend.
 * Backend sends: data: {"type":"step_start","stepId":"brief","stepIndex":0,...}\n\n
 * (No "event:" lines — the event type is embedded in the JSON payload.)
 */
function parseSSEStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onEvent: (eventType: string, data: Record<string, unknown>) => void,
    onDone: () => void,
    onError: (err: Error) => void,
) {
    const decoder = new TextDecoder();
    let buffer = "";

    const processLines = () => {
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
                const raw = trimmed.slice(5).trim();
                if (!raw) continue;
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed.type) {
                        onEvent(parsed.type, parsed);
                    }
                } catch {
                    console.warn("Failed to parse SSE data:", raw);
                }
            }
            // Ignore empty lines and any other lines (comments, etc.)
        }
    };

    const pump = (): void => {
        reader
            .read()
            .then(({ done, value }) => {
                if (done) {
                    // Process any remaining buffer
                    if (buffer.trim()) {
                        buffer += "\n";
                        processLines();
                    }
                    onDone();
                    return;
                }
                buffer += decoder.decode(value, { stream: true });
                processLines();
                pump();
            })
            .catch(onError);
    };

    pump();
}

export const GeneratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<GeneratorFormData>(INITIAL_FORM_DATA);
    const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
    const [activeStep, setActiveStep] = useState(0);
    const [substepMessages, setSubstepMessages] = useState<SubstepEntry[]>([]);
    const [researchReport, setResearchReport] = useState("");
    const [editedReport, setEditedReport] = useState("");
    const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
    const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
    const [reviewLoopExhausted, setReviewLoopExhausted] = useState(false);
    const [reviewHistory, setReviewHistory] = useState<ReviewHistoryEntry[]>([]);
    const [bestReview, setBestReview] = useState<{ score: number; iteration: number } | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress>({ current: 0, total: 0 });
    const [retrying, setRetrying] = useState(false);
    const [pipelineError, setPipelineError] = useState<string | null>(null);
    const substepIdRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedElapsedRef = useRef<number>(0);

    const updateField = useCallback((key: keyof GeneratorFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Issue 1: Timer that can pause and resume without resetting
    const startTimer = useCallback((resumeFromElapsed?: number) => {
        if (resumeFromElapsed !== undefined) {
            pausedElapsedRef.current = resumeFromElapsed;
        }
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setElapsedTime(pausedElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
    }, []);

    const pauseTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            // Accumulate elapsed time so far
            pausedElapsedRef.current = pausedElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
        }
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Issue 3: Helper to update a substep's status by matching filename
    const updateSubstepStatus = useCallback((fileName: string, status: SubstepStatus) => {
        setSubstepMessages((prev) => {
            // Find the LAST entry matching this fileName that is still "running"
            const idx = [...prev].reverse().findIndex(
                (e) => e.fileName === fileName && e.status === "running"
            );
            if (idx === -1) return prev;
            const realIdx = prev.length - 1 - idx;
            const updated = [...prev];
            updated[realIdx] = { ...updated[realIdx], status };
            return updated;
        });
    }, []);

    const handleSSEEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
        switch (eventType) {
            case "step_start":
                // Backend sends stepIndex (0-based)
                setActiveStep(typeof data.stepIndex === "number" ? data.stepIndex : 0);
                break;

            case "substep": {
                const nextId = Date.now() * 1000 + (substepIdRef.current++ % 1000);
                const substepMsg = (data.substep as string) || (data.message as string) || "";
                // Extract filename from substep messages like "Generating BRAND_VOICE.md with Gemini"
                const fileMatch = substepMsg.match(/(?:Generating|Improving)\s+(\S+\.md)/i);
                setSubstepMessages((prev) => [
                    ...prev,
                    {
                        id: nextId,
                        message: substepMsg,
                        timestamp: new Date(),
                        status: "running" as SubstepStatus,
                        fileName: fileMatch ? fileMatch[1] : undefined,
                    },
                ]);
                // Issue 7: Track progress from fileIndex/totalFiles
                if (typeof data.fileIndex === "number" && typeof data.totalFiles === "number") {
                    setPipelineProgress({ current: data.fileIndex as number, total: data.totalFiles as number });
                }
                break;
            }

            case "step_complete":
                // Issue 2: Handle alreadyDone steps from resume to keep sidebar in sync
                if (data.alreadyDone && typeof data.stepIndex === "number") {
                    setActiveStep((prev) => Math.max(prev, (data.stepIndex as number) + 1));
                }
                // Mark all still-running substeps as done (stops spinners)
                setSubstepMessages((prev) =>
                    prev.map((entry) =>
                        entry.status === "running" ? { ...entry, status: "done" as SubstepStatus } : entry
                    )
                );
                break;

            case "report_ready":
                setResearchReport((data.report as string) || "");
                setEditedReport((data.report as string) || "");
                break;

            case "pipeline_paused":
                setPipelineState("paused");
                // Issue 1: Pause the timer, don't stop/reset
                pauseTimer();
                break;

            case "file_generated": {
                const filename = (data.fileName as string) || (data.filename as string) || "";
                const content = (data.content as string) || "";
                const violations = data.violations as Array<unknown> | undefined;
                const hasViolations = violations && violations.length > 0;

                setGeneratedFiles((prev) => {
                    // Update existing file or add new one
                    const existingIdx = prev.findIndex((f) => f.filename === filename);
                    if (existingIdx >= 0) {
                        const updated = [...prev];
                        updated[existingIdx] = { filename, content, category: categorizeFile(filename) };
                        return updated;
                    }
                    return [...prev, { filename, content, category: categorizeFile(filename) }];
                });

                // Issue 3: Update substep status for this file
                updateSubstepStatus(filename, hasViolations ? "conflict" : "done");

                // Issue 7: Update progress
                if (typeof data.fileIndex === "number" && typeof data.totalFiles === "number") {
                    setPipelineProgress({ current: data.fileIndex as number, total: data.totalFiles as number });
                }
                break;
            }

            case "review_result":
                setReviewResult({
                    score: (data.score as number) || 0,
                    summary: (data.summary as string) || "",
                    attempt: (data.attempt as number) || (data.iteration as number) || 1,
                });
                // Issue 5: Append to review history
                setReviewHistory((prev) => [
                    ...prev,
                    {
                        iteration: (data.iteration as number) || (data.attempt as number) || 1,
                        score: (data.score as number) || 0,
                        summary: (data.summary as string) || "",
                        isBest: false,
                    },
                ]);
                break;

            case "review_loop_exhausted":
                setReviewLoopExhausted(true);
                setRetrying(false);
                // Issue 5: Store best score data from backend
                if (typeof data.bestScore === "number" && typeof data.bestIteration === "number") {
                    setBestReview({
                        score: data.bestScore as number,
                        iteration: data.bestIteration as number,
                    });
                }
                // Update review history with isBest flags
                if (Array.isArray(data.reviewHistory)) {
                    setReviewHistory(
                        (data.reviewHistory as ReviewHistoryEntry[]).map((entry) => ({
                            ...entry,
                            isBest: entry.iteration === (data.bestIteration as number),
                        }))
                    );
                }
                break;

            case "governance_violation":
                toast.warning(
                    `Governance violation in ${data.file || data.fileName}: ${data.violation || data.message}`,
                    { duration: 6000 }
                );
                break;

            case "fallback_activated":
                toast.info(
                    `Fallback: ${data.provider} → ${data.fallbackModel} (${data.reason})`,
                    { duration: 5000 }
                );
                break;

            case "pipeline_complete":
                setPipelineState("complete");
                setRetrying(false);
                // Stop any lingering spinners
                setSubstepMessages((prev) =>
                    prev.map((entry) =>
                        entry.status === "running" ? { ...entry, status: "done" as SubstepStatus } : entry
                    )
                );
                break;

            case "pipeline_failed": {
                const errorMsg = (data.error as string) || "Unknown error";
                setPipelineState("failed");
                setPipelineError(errorMsg);
                setRetrying(false);
                stopTimer();
                toast.error("Pipeline failed: " + errorMsg, { duration: 8000 });
                // Mark all running entries as failed
                setSubstepMessages((prev) =>
                    prev.map((entry) =>
                        entry.status === "running" ? { ...entry, status: "failed" as SubstepStatus } : entry
                    )
                );
                break;
            }

            case "stream_end":
                // Final cleanup event from backend
                break;

            default:
                console.log("Unhandled SSE event:", eventType, data);
        }
    }, [pauseTimer, updateSubstepStatus]);

    const connectSSE = useCallback(
        async (body: Record<string, unknown>) => {
            try {
                const response = await fetch("/api/pipeline", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => `HTTP ${response.status}`);
                    throw new Error(`Pipeline request failed (${response.status}): ${errorText}`);
                }

                if (!response.body) {
                    throw new Error("No response body for SSE stream");
                }

                const reader = response.body.getReader();
                parseSSEStream(
                    reader,
                    handleSSEEvent,
                    () => stopTimer(),
                    (err) => {
                        const errorMsg = "Pipeline connection lost: " + err.message;
                        setPipelineState("failed");
                        setPipelineError(errorMsg);
                        toast.error(errorMsg, { duration: 8000 });
                        stopTimer();
                        // Mark all running entries as failed
                        setSubstepMessages((prev) =>
                            prev.map((entry) =>
                                entry.status === "running" ? { ...entry, status: "failed" as SubstepStatus } : entry
                            )
                        );
                    },
                );
            } catch (err) {
                const errorMsg = "Failed to start pipeline: " + (err instanceof Error ? err.message : "Unknown error");
                setPipelineState("failed");
                setPipelineError(errorMsg);
                toast.error(errorMsg, { duration: 8000 });
                stopTimer();
            }
        },
        [handleSSEEvent, stopTimer],
    );

    const startPipeline = useCallback(() => {
        setPipelineState("running");
        setPipelineError(null);
        setActiveStep(0);
        setSubstepMessages([]);
        setResearchReport("");
        setEditedReport("");
        setGeneratedFiles([]);
        setReviewResult(null);
        setReviewLoopExhausted(false);
        setReviewHistory([]);
        setBestReview(null);
        setElapsedTime(0);
        setPipelineProgress({ current: 0, total: 0 });
        setRetrying(false);
        substepIdRef.current = 0;
        pausedElapsedRef.current = 0;
        startTimer(0);
        // Backend expects { formData: {...} }
        connectSSE({ formData: { ...formData } });
    }, [formData, connectSSE, startTimer]);

    // Issue 1: Resume from pause — continues timer from where it was paused
    const resumePipeline = useCallback(() => {
        setPipelineState("running");
        startTimer(pausedElapsedRef.current);
        // Backend expects { formData, resumeFrom, resumeContext }
        connectSSE({
            formData: { ...formData },
            resumeFrom: "architecture",
            resumeContext: {
                report: editedReport,
                generatedFiles: generatedFiles.reduce(
                    (acc, f) => ({ ...acc, [f.filename]: f.content }),
                    {} as Record<string, string>
                ),
            },
        });
    }, [formData, editedReport, generatedFiles, connectSSE, startTimer]);

    // Issue 6: Retry refinement — runs only ONE extra review/refine loop
    const retryRefinement = useCallback(() => {
        setRetrying(true);
        setReviewLoopExhausted(false);
        setPipelineState("running");
        startTimer(pausedElapsedRef.current);
        toast.success("Retry initiated — running one additional review cycle", { duration: 3000 });
        connectSSE({
            formData: { ...formData },
            resumeFrom: "architecture",
            resumeContext: {
                report: editedReport,
                generatedFiles: generatedFiles.reduce(
                    (acc, f) => ({ ...acc, [f.filename]: f.content }),
                    {} as Record<string, string>
                ),
                singleRetry: true, // Issue 6: Only one loop
            },
        });
    }, [formData, editedReport, generatedFiles, connectSSE, startTimer]);

    // Issue 5: Proceed with the best-scoring attempt
    const proceedWithBest = useCallback(() => {
        setReviewLoopExhausted(false);
        setPipelineState("complete");
        stopTimer();
        toast.success(
            bestReview
                ? `Proceeding with best attempt #${bestReview.iteration} (${bestReview.score}/100)`
                : "Proceeding with current files",
            { duration: 4000 }
        );
    }, [bestReview, stopTimer]);

    const resetPipeline = useCallback(() => {
        setPipelineState("idle");
        setPipelineError(null);
        setActiveStep(0);
        setSubstepMessages([]);
        setResearchReport("");
        setEditedReport("");
        setGeneratedFiles([]);
        setReviewResult(null);
        setReviewLoopExhausted(false);
        setReviewHistory([]);
        setBestReview(null);
        setElapsedTime(0);
        setPipelineProgress({ current: 0, total: 0 });
        setRetrying(false);
        pausedElapsedRef.current = 0;
        stopTimer();
    }, [stopTimer]);

    const updateGeneratedFile = useCallback((filename: string, content: string) => {
        setGeneratedFiles((prev) =>
            prev.map((f) => (f.filename === filename ? { ...f, content } : f))
        );
    }, []);

    return (
        <GeneratorContext.Provider
            value={{
                formData,
                updateField,
                pipelineState,
                pipelineError,
                activeStep,
                substepMessages,
                researchReport,
                editedReport,
                setEditedReport,
                generatedFiles,
                updateGeneratedFile,
                reviewResult,
                reviewLoopExhausted,
                reviewHistory,
                bestReview,
                startPipeline,
                resumePipeline,
                retryRefinement,
                proceedWithBest,
                resetPipeline,
                elapsedTime,
                pipelineProgress,
                retrying,
            }}
        >
            {children}
        </GeneratorContext.Provider>
    );
};
