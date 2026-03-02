import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerator } from "@/contexts/GeneratorContext";

const PipelineErrorUI: React.FC = () => {
    const { pipelineError, substepMessages, elapsedTime, resetPipeline } = useGenerator();
    const [copied, setCopied] = React.useState(false);

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    // Build a full error log for debugging
    const buildErrorLog = useCallback(() => {
        const lines: string[] = [
            `=== PIPELINE ERROR LOG ===`,
            `Time: ${new Date().toISOString()}`,
            `Elapsed: ${minutes}m ${seconds}s`,
            `Error: ${pipelineError || "Unknown"}`,
            ``,
            `=== PIPELINE ACTIVITY LOG (${substepMessages.length} entries) ===`,
        ];

        for (const entry of substepMessages) {
            const ts = entry.timestamp.toLocaleTimeString();
            const status = entry.status !== "running" ? ` [${entry.status.toUpperCase()}]` : " [INTERRUPTED]";
            lines.push(`[${ts}] ${entry.message}${status}`);
        }

        lines.push(``, `=== END LOG ===`);
        return lines.join("\n");
    }, [pipelineError, substepMessages, minutes, seconds]);

    const copyErrorLog = useCallback(() => {
        navigator.clipboard.writeText(buildErrorLog()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [buildErrorLog]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-6 space-y-5"
        >
            {/* Error Header */}
            <div className="glass-panel p-5 border-red-500/20">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-red-400 mb-1">Pipeline Failed</h3>
                        <p className="text-xs text-muted-foreground break-words">{pipelineError || "An unknown error occurred"}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                            Failed after {minutes}:{seconds.toString().padStart(2, "0")} •{" "}
                            {substepMessages.length} events logged
                        </p>
                    </div>
                </div>
            </div>

            {/* Activity Log — preserved from the failed run */}
            {substepMessages.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            Activity Log
                        </span>
                        <button
                            onClick={copyErrorLog}
                            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/[0.05]"
                            title="Copy full error log"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Log</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto conductor-log-bg p-3 space-y-1.5">
                        {substepMessages.map((entry) => {
                            const statusColor =
                                entry.status === "done"
                                    ? "text-emerald-400"
                                    : entry.status === "failed"
                                        ? "text-red-400"
                                        : entry.status === "conflict"
                                            ? "text-amber-400"
                                            : "text-muted-foreground/40";
                            return (
                                <div key={entry.id} className="flex items-start gap-2 text-xs font-mono">
                                    <span className="text-muted-foreground/40 flex-shrink-0 w-16">
                                        {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                    </span>
                                    <span className="text-foreground/70 flex-1 min-w-0">{entry.message}</span>
                                    <span className={`flex-shrink-0 ${statusColor}`}>
                                        {entry.status === "running" ? "INTERRUPTED" : entry.status.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={resetPipeline}
                    variant="outline"
                    className="text-xs border-white/[0.15] text-foreground/70"
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Back to Form
                </Button>
                <Button
                    onClick={copyErrorLog}
                    variant="outline"
                    className="text-xs border-white/[0.15] text-foreground/70"
                >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy Full Error Log
                </Button>
            </div>
        </motion.div>
    );
};

export default PipelineErrorUI;
