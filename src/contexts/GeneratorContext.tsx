"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
    GeneratorFormData,
    INITIAL_FORM_DATA,
    PipelineState,
    GeneratedFile,
    ReviewResult,
    categorizeFile,
} from "@/data/generatorTypes";

interface SubstepEntry {
    id: number;
    message: string;
    timestamp: Date;
}

interface GeneratorContextType {
    formData: GeneratorFormData;
    updateField: (key: keyof GeneratorFormData, value: string) => void;
    pipelineState: PipelineState;
    activeStep: number;
    substepMessages: SubstepEntry[];
    researchReport: string;
    editedReport: string;
    setEditedReport: (v: string) => void;
    generatedFiles: GeneratedFile[];
    reviewResult: ReviewResult | null;
    reviewLoopExhausted: boolean;
    startPipeline: () => void;
    resumePipeline: () => void;
    resetPipeline: () => void;
    elapsedTime: number;
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
    const [elapsedTime, setElapsedTime] = useState(0);
    const substepIdRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const updateField = useCallback((key: keyof GeneratorFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleSSEEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
        switch (eventType) {
            case "step_start":
                // Backend sends stepIndex (0-based)
                setActiveStep(typeof data.stepIndex === "number" ? data.stepIndex : 0);
                break;

            case "substep":
                substepIdRef.current++;
                setSubstepMessages((prev) => [
                    ...prev,
                    {
                        id: substepIdRef.current,
                        message: (data.substep as string) || (data.message as string) || "",
                        timestamp: new Date(),
                    },
                ]);
                break;

            case "step_complete":
                // Backend marks a step as complete
                break;

            case "report_ready":
                setResearchReport((data.report as string) || "");
                setEditedReport((data.report as string) || "");
                break;

            case "pipeline_paused":
                setPipelineState("paused");
                break;

            case "file_generated": {
                const filename = (data.fileName as string) || (data.filename as string) || "";
                const content = (data.content as string) || "";
                setGeneratedFiles((prev) => [
                    ...prev,
                    { filename, content, category: categorizeFile(filename) },
                ]);
                break;
            }

            case "review_result":
                setReviewResult({
                    score: (data.score as number) || 0,
                    summary: (data.summary as string) || "",
                    attempt: (data.attempt as number) || (data.iteration as number) || 1,
                });
                break;

            case "review_loop_exhausted":
                setReviewLoopExhausted(true);
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
                break;

            case "pipeline_failed":
                setPipelineState("idle");
                toast.error("Pipeline failed: " + ((data.error as string) || "Unknown error"));
                break;

            case "stream_end":
                // Final cleanup event from backend
                break;

            default:
                console.log("Unhandled SSE event:", eventType, data);
        }
    }, []);

    const connectSSE = useCallback(
        async (body: Record<string, unknown>) => {
            try {
                const response = await fetch("/api/pipeline", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error(`Pipeline request failed: ${response.status}`);
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
                        toast.error("Pipeline connection lost: " + err.message);
                        stopTimer();
                    },
                );
            } catch (err) {
                toast.error("Failed to start pipeline: " + (err instanceof Error ? err.message : "Unknown error"));
                setPipelineState("idle");
                stopTimer();
            }
        },
        [handleSSEEvent, stopTimer],
    );

    const startPipeline = useCallback(() => {
        setPipelineState("running");
        setActiveStep(0);
        setSubstepMessages([]);
        setResearchReport("");
        setEditedReport("");
        setGeneratedFiles([]);
        setReviewResult(null);
        setReviewLoopExhausted(false);
        setElapsedTime(0);
        substepIdRef.current = 0;
        startTimer();
        // Backend expects { formData: {...} }
        connectSSE({ formData: { ...formData } });
    }, [formData, connectSSE, startTimer]);

    const resumePipeline = useCallback(() => {
        setPipelineState("running");
        startTimer();
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

    const resetPipeline = useCallback(() => {
        setPipelineState("idle");
        setActiveStep(0);
        setSubstepMessages([]);
        setResearchReport("");
        setEditedReport("");
        setGeneratedFiles([]);
        setReviewResult(null);
        setReviewLoopExhausted(false);
        setElapsedTime(0);
        stopTimer();
    }, [stopTimer]);

    return (
        <GeneratorContext.Provider
            value={{
                formData,
                updateField,
                pipelineState,
                activeStep,
                substepMessages,
                researchReport,
                editedReport,
                setEditedReport,
                generatedFiles,
                reviewResult,
                reviewLoopExhausted,
                startPipeline,
                resumePipeline,
                resetPipeline,
                elapsedTime,
            }}
        >
            {children}
        </GeneratorContext.Provider>
    );
};
