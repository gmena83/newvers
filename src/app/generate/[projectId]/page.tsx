"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FILE_ORDER } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, AlertCircle, Sparkles } from "lucide-react";

interface GenerationState {
    currentIndex: number;
    completedFiles: Record<string, string>;
    error: string | null;
    done: boolean;
}

export default function GeneratePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;

    const [state, setState] = useState<GenerationState>({
        currentIndex: 0,
        completedFiles: {},
        error: null,
        done: false,
    });

    const generate = useCallback(async () => {
        const previousFiles: Record<string, string> = {};

        for (let i = 0; i < FILE_ORDER.length; i++) {
            setState((prev) => ({ ...prev, currentIndex: i, error: null }));

            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId,
                        fileIndex: i,
                        previousFiles,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Failed to generate ${FILE_ORDER[i].name}`);
                }

                previousFiles[data.fileName] = data.content;

                setState((prev) => ({
                    ...prev,
                    completedFiles: { ...prev.completedFiles, [data.fileName]: data.content },
                }));
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Generation failed";
                setState((prev) => ({ ...prev, error: message }));
                return;
            }
        }

        setState((prev) => ({ ...prev, done: true }));

        // Redirect to dashboard after a brief pause
        setTimeout(() => {
            router.push(`/dashboard/${projectId}`);
        }, 2000);
    }, [projectId, router]);

    useEffect(() => {
        generate();
    }, [generate]);

    const progress = ((Object.keys(state.completedFiles).length) / FILE_ORDER.length) * 100;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/8 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-lg"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse-glow">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        {state.done
                            ? "Architecture Complete!"
                            : state.error
                                ? "Generation Paused"
                                : "Generating Architecture"}
                    </h1>
                    <p className="mt-2 text-sm text-muted">
                        {state.done
                            ? "All 10 files generated. Redirecting to dashboard…"
                            : state.error
                                ? "An error occurred during generation."
                                : `File ${state.currentIndex + 1} of ${FILE_ORDER.length}`}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 overflow-hidden rounded-full bg-surface/60 h-2">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* File List */}
                <div className="glass-card p-5">
                    <div className="grid gap-2">
                        <AnimatePresence>
                            {FILE_ORDER.map((file, i) => {
                                const isComplete = !!state.completedFiles[file.name];
                                const isCurrent = i === state.currentIndex && !state.done && !state.error;
                                const isPending = i > state.currentIndex;
                                const isError = i === state.currentIndex && !!state.error;

                                return (
                                    <motion.div
                                        key={file.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors ${isCurrent
                                                ? "bg-primary/10 border border-primary/20"
                                                : isComplete
                                                    ? "bg-success/5"
                                                    : isError
                                                        ? "bg-danger/10 border border-danger/20"
                                                        : "opacity-40"
                                            }`}
                                    >
                                        {/* Status Icon */}
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            {isComplete ? (
                                                <Check className="h-4 w-4 text-success" />
                                            ) : isCurrent ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            ) : isError ? (
                                                <AlertCircle className="h-4 w-4 text-danger" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-muted/30" />
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-mono font-medium ${isComplete ? "text-success" : isPending ? "text-muted/50" : "text-foreground"
                                                    }`}
                                            >
                                                {file.name}
                                            </p>
                                            {isCurrent && (
                                                <p className="mt-0.5 text-xs text-muted">
                                                    {file.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Index */}
                                        <span className="text-xs font-mono text-muted/50">
                                            {i + 1}/{FILE_ORDER.length}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Error State */}
                {state.error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                    >
                        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger mb-4">
                            {state.error}
                        </div>
                        <button
                            onClick={() => {
                                setState((prev) => ({ ...prev, error: null }));
                                generate();
                            }}
                            className="btn-primary w-full"
                        >
                            Retry from {FILE_ORDER[state.currentIndex]?.name}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
