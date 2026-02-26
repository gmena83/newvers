"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    Circle,
    XCircle,
    Loader2,
    StopCircle,
    Download,
    ChevronDown,
    ChevronUp,
    FileText,
    Clock,
    BarChart3,
    Sparkles,
    Play,
    Pencil,
    Save,
    X,
    Archive,
    RefreshCw,
} from "lucide-react";

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */

interface StepState {
    id: string;
    name: string;
    description: string;
    status: "pending" | "running" | "complete" | "failed" | "stopped" | "skipped";
    substep?: string;
    output?: string;
}

interface PipelineProgressProps {
    isRunning: boolean;
    isPaused: boolean;
    steps: StepState[];
    report: string | null;
    generatedFiles: Record<string, string>;
    reviewScore: number | null;
    reviewIteration: number;
    onStop: () => void;
    onDownloadReport: () => void;
    onEditReport: (newContent: string) => void;
    onResumePipeline: () => void;
    onPreviewFile: (name: string, content: string) => void;
    startedAt: number | null;
    onDownloadZip?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewLoopExhausted?: any | null;
    onAcceptBestScore?: () => void;
    onRetryLoop?: () => void;
}

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */

export default function PipelineProgress({
    isRunning,
    isPaused,
    steps,
    report,
    generatedFiles,
    reviewScore,
    reviewIteration,
    onStop,
    onDownloadReport,
    onEditReport,
    onResumePipeline,
    onPreviewFile,
    startedAt,
    onDownloadZip,
    reviewLoopExhausted,
    onAcceptBestScore,
    onRetryLoop,
}: PipelineProgressProps) {
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");

    // Timer
    useEffect(() => {
        if ((!isRunning && !isPaused) || !startedAt) return;
        if (isPaused) return; // freeze timer when paused
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning, isPaused, startedAt]);

    // Auto-scroll to current step
    useEffect(() => {
        if (scrollRef.current) {
            const runningStep = scrollRef.current.querySelector("[data-running='true']");
            if (runningStep) {
                runningStep.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [steps]);

    const completedSteps = steps.filter((s) => s.status === "complete").length;
    const progressPercent = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
    const currentStep = steps.find((s) => s.status === "running");
    const isComplete = steps.every((s) => s.status === "complete" || s.status === "skipped");
    const isFailed = steps.some((s) => s.status === "failed");
    const isStopped = steps.some((s) => s.status === "stopped");

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const estimatedTotal = completedSteps > 0
        ? Math.round((elapsed / completedSteps) * steps.length)
        : 0;
    const remainingTime = Math.max(0, estimatedTotal - elapsed);

    const getStepIcon = (status: StepState["status"]) => {
        switch (status) {
            case "complete":
                return <CheckCircle className="h-5 w-5 text-success" />;
            case "running":
                return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
            case "failed":
                return <XCircle className="h-5 w-5 text-danger" />;
            case "stopped":
                return <StopCircle className="h-5 w-5 text-warning" />;
            default:
                return <Circle className="h-5 w-5 text-muted/40" />;
        }
    };

    const handleStartEditing = () => {
        setEditContent(report || "");
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        onEditReport(editContent);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent("");
    };

    if (steps.length === 0) return null;

    return (
        <section className="pipeline-section animate-fade-in" id="section-pipeline">
            {/* ── Header Bar ── */}
            <div className="pipeline-header">
                <div className="flex items-center gap-3">
                    <div className="pipeline-icon-container">
                        {isRunning ? (
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : isPaused ? (
                            <BarChart3 className="h-5 w-5 text-warning animate-pulse" />
                        ) : isComplete ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                        ) : isFailed ? (
                            <XCircle className="h-5 w-5 text-danger" />
                        ) : (
                            <BarChart3 className="h-5 w-5 text-warning" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {isPaused
                                ? "⏸ Report Ready — Review Required"
                                : isComplete
                                    ? "Pipeline Complete"
                                    : isFailed
                                        ? "Pipeline Failed"
                                        : isStopped
                                            ? "Pipeline Stopped"
                                            : "Architecture Pipeline"}
                        </h2>
                        <p className="text-xs text-muted">
                            {isPaused
                                ? "Review the report, edit if needed, then resume to generate architecture"
                                : currentStep
                                    ? `Step ${steps.indexOf(currentStep) + 1}/${steps.length}: ${currentStep.name}`
                                    : isComplete
                                        ? `All ${steps.length} steps completed`
                                        : "Waiting to start…"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    {(isRunning || elapsed > 0) && (
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatTime(elapsed)}</span>
                            {isRunning && remainingTime > 0 && (
                                <span className="text-muted/60">
                                    (ETA: ~{formatTime(remainingTime)})
                                </span>
                            )}
                        </div>
                    )}

                    {/* Score Badge */}
                    {reviewScore !== null && (
                        <div className={`pipeline-score ${reviewScore >= 90 ? "score-pass" : "score-fail"}`}>
                            <Sparkles className="h-3.5 w-3.5" />
                            {reviewScore}/100
                            {reviewIteration > 1 && (
                                <span className="text-xs opacity-70">(iter {reviewIteration})</span>
                            )}
                        </div>
                    )}

                    {/* Stop Button */}
                    {isRunning && (
                        <button onClick={onStop} className="btn-stop">
                            <StopCircle className="h-4 w-4" /> Stop
                        </button>
                    )}
                </div>
            </div>

            {/* ── Progress Bar ── */}
            <div className="pipeline-progress-bar">
                <motion.div
                    className={`pipeline-progress-fill ${isPaused ? "paused" : ""}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <span className="pipeline-progress-label">
                    {isPaused ? `${progressPercent}% — Paused` : `${progressPercent}%`}
                </span>
            </div>

            {/* ── Step List ── */}
            <div ref={scrollRef} className="pipeline-steps">
                <AnimatePresence>
                    {steps.map((step, idx) => (
                        <motion.div
                            key={step.id}
                            data-running={step.status === "running"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            className={`pipeline-step ${step.status}`}
                        >
                            <button
                                className="pipeline-step-header"
                                onClick={() =>
                                    setExpandedStep(expandedStep === step.id ? null : step.id)
                                }
                            >
                                <div className="flex items-center gap-3">
                                    {getStepIcon(step.status)}
                                    <div className="text-left">
                                        <span className="text-sm font-medium text-foreground">
                                            {step.name}
                                        </span>
                                        {step.status === "running" && step.substep && (
                                            <span className="block text-xs text-primary animate-pulse">
                                                {step.substep}
                                            </span>
                                        )}
                                        {step.status === "pending" && (
                                            <span className="block text-xs text-muted/50">
                                                {step.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {step.output && (
                                    expandedStep === step.id ? (
                                        <ChevronUp className="h-4 w-4 text-muted" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted" />
                                    )
                                )}
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedStep === step.id && step.output && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="pipeline-step-content"
                                    >
                                        <pre className="text-xs text-muted whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                                            {step.output.substring(0, 1000)}
                                            {step.output.length > 1000 && "…"}
                                        </pre>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════
               REPORT REVIEW PANEL (shown when paused or report ready)
               ══════════════════════════════════════ */}
            {report && (isPaused || isComplete) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pipeline-report-panel"
                >
                    {/* Report Header */}
                    <div className="pipeline-report-header">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-secondary" />
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {isPaused ? "Research Report — Review Required" : "Research Report"}
                                </p>
                                <p className="text-xs text-muted">
                                    {isPaused
                                        ? "Review and edit the report before generating architecture files"
                                        : "Download in Markdown format"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Inline Editor */}
                    {isEditing ? (
                        <div className="pipeline-editor">
                            <div className="pipeline-editor-toolbar">
                                <span className="text-xs font-medium text-muted">Editing Report (Markdown)</span>
                                <div className="flex gap-2">
                                    <button onClick={handleCancelEdit} className="btn-editor-cancel">
                                        <X className="h-3.5 w-3.5" /> Cancel
                                    </button>
                                    <button onClick={handleSaveEdit} className="btn-editor-save">
                                        <Save className="h-3.5 w-3.5" /> Save Changes
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="pipeline-editor-textarea"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                spellCheck={false}
                            />
                        </div>
                    ) : (
                        /* Report Preview (collapsed) */
                        <div className="pipeline-report-preview">
                            <pre className="text-xs text-muted whitespace-pre-wrap leading-relaxed">
                                {report.substring(0, 500)}
                                {report.length > 500 && "…"}
                            </pre>
                        </div>
                    )}

                    {/* ── 3 CTA Buttons ── */}
                    {!isEditing && (
                        <div className="pipeline-report-actions">
                            <button onClick={onDownloadReport} className="btn-report-action btn-download">
                                <Download className="h-4 w-4" />
                                Download Report
                            </button>
                            <button onClick={handleStartEditing} className="btn-report-action btn-edit">
                                <Pencil className="h-4 w-4" />
                                Edit Report
                            </button>
                            {isPaused && (
                                <button onClick={onResumePipeline} className="btn-report-action btn-resume">
                                    <Play className="h-4 w-4" />
                                    Resume Pipeline
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── Generated Files Grid ── */}
            {Object.keys(generatedFiles).length > 0 && (
                <div className="pipeline-files">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                        Generated Architecture Files ({Object.keys(generatedFiles).length}/12)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {Object.entries(generatedFiles).map(([name, content]) => (
                            <motion.button
                                key={name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pipeline-file-chip"
                                onClick={() => onPreviewFile(name, content)}
                            >
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-mono truncate">{name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Review Loop Exhausted — User Choice ── */}
            {reviewLoopExhausted && onAcceptBestScore && onRetryLoop && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-lg border-2 border-warning/40 bg-warning/5"
                >
                    <div className="flex items-start gap-3 mb-3">
                        <BarChart3 className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Review Loop Complete — Best Score: {reviewLoopExhausted.bestScore}/100
                            </p>
                            <p className="text-xs text-muted mt-1">
                                After {reviewLoopExhausted.totalIterations} iterations, no version reached 90/100.
                                The best result was iteration {reviewLoopExhausted.bestIteration} with a score of {reviewLoopExhausted.bestScore}/100.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onAcceptBestScore}
                            className="btn-report-action btn-download flex-1 flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Proceed with Best Score
                        </button>
                        <button
                            onClick={onRetryLoop}
                            className="btn-report-action btn-resume flex-1 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Another Loop
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── Download Project ZIP (show on complete) ── */}
            {isComplete && onDownloadZip && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                >
                    <button
                        onClick={onDownloadZip}
                        className="btn-report-action btn-resume w-full flex items-center justify-center gap-2 py-3"
                    >
                        <Archive className="h-5 w-5" />
                        <span className="font-semibold">Download Project ZIP</span>
                    </button>
                    <p className="text-xs text-muted text-center mt-2">
                        Includes architecture files, research report, review history, process log, and IDE instructions
                    </p>
                </motion.div>
            )}
        </section>
    );
}
