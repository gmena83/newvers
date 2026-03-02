import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, Check } from "lucide-react";
import { useGenerator, SubstepStatus } from "@/contexts/GeneratorContext";

const statusConfig: Record<SubstepStatus, { label: string; color: string } | null> = {
  running: null, // Shows spinner instead
  done: { label: "Done", color: "text-emerald-400" },
  conflict: { label: "Conflict", color: "text-amber-400" },
  failed: { label: "Failed", color: "text-red-400" },
};

const SubstepFeed: React.FC = () => {
  const { substepMessages, pipelineProgress, pipelineState } = useGenerator();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [substepMessages]);

  // Issue 7: Copy log to clipboard
  const copyLog = useCallback(() => {
    const logText = substepMessages
      .map((e) => {
        const ts = e.timestamp.toLocaleTimeString();
        const status = e.status !== "running" ? ` [${e.status.toUpperCase()}]` : "";
        return `[${ts}] ${e.message}${status}`;
      })
      .join("\n");
    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [substepMessages]);

  // Issue 7: Calculate progress percentage
  const progressPercent =
    pipelineProgress.total > 0
      ? Math.min(100, Math.round((pipelineProgress.current / pipelineProgress.total) * 100))
      : 0;
  const showProgress = pipelineProgress.total > 0 && pipelineState === "running";

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Header with copy button */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full turbo-gradient-bg animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live Feed</span>
        </div>
        {substepMessages.length > 0 && (
          <button
            onClick={copyLog}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/[0.05]"
            title="Copy log to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Issue 7: Progress bar */}
      {showProgress && (
        <div className="px-4 py-1.5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono text-muted-foreground">
              File {pipelineProgress.current}/{pipelineProgress.total}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">{progressPercent}%</span>
          </div>
          <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full turbo-gradient-bg"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Log entries */}
      <div ref={scrollRef} className="max-h-48 overflow-y-auto conductor-log-bg p-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {substepMessages.map((entry) => {
            const statusCfg = statusConfig[entry.status];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-xs font-mono"
              >
                <span className="text-cyan-400 flex-shrink-0">▸</span>
                <span className="text-foreground/70 flex-1 min-w-0">{entry.message}</span>
                {/* Issue 3: Status indicators */}
                <span className="flex-shrink-0 flex items-center gap-1">
                  {entry.status === "running" ? (
                    <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  ) : statusCfg ? (
                    <span className={`text-xs font-mono ${statusCfg.color}`}>{statusCfg.label}</span>
                  ) : null}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {substepMessages.length === 0 && (
          <p className="text-xs text-muted-foreground/40 font-mono">Waiting for pipeline events...</p>
        )}
      </div>
    </div>
  );
};

export default SubstepFeed;
