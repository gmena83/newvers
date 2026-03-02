import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerator } from "@/contexts/GeneratorContext";

const ReviewLoopDecision: React.FC = () => {
  const {
    reviewLoopExhausted,
    bestReview,
    reviewHistory,
    retryRefinement,
    proceedWithBest,
    retrying,
  } = useGenerator();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!reviewLoopExhausted || !bestReview) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-3"
    >
      <h4 className="text-sm font-semibold text-amber-400">Review Loop Exhausted</h4>
      <p className="text-xs text-muted-foreground">
        After {reviewHistory.length} attempts, the best score achieved is{" "}
        <span className="text-foreground font-semibold">{bestReview.score}/100</span> (attempt #{bestReview.iteration}).
        You can proceed with the best result or retry for one more cycle.
      </p>

      <div className="flex gap-3 items-center">
        {/* Proceed button with dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <Button
            onClick={proceedWithBest}
            variant="outline"
            className="text-xs border-white/[0.15] text-foreground/70 flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Proceed (Best: {bestReview.score}/100)
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          {/* Dropdown showing attempt evaluations */}
          <AnimatePresence>
            {showDropdown && reviewHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-1 z-50 w-64 bg-card border border-white/[0.12] rounded-lg shadow-xl overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Attempt History
                  </span>
                </div>
                {reviewHistory.map((entry) => {
                  const scoreColor =
                    entry.score >= 90
                      ? "text-emerald-400"
                      : entry.score >= 70
                        ? "text-amber-400"
                        : "text-red-400";
                  return (
                    <div
                      key={entry.iteration}
                      className={`px-3 py-2 flex items-center justify-between border-b border-white/[0.04] last:border-0 ${entry.isBest ? "bg-amber-400/[0.05]" : ""
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">#{entry.iteration}</span>
                        {entry.isBest && (
                          <span className="text-[9px] font-mono bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded">
                            BEST
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-mono font-semibold ${scoreColor}`}>
                        {entry.score}/100
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Retry button with loading feedback */}
        <Button
          onClick={retryRefinement}
          disabled={retrying}
          className="text-xs turbo-gradient-bg text-white border-0"
        >
          {retrying ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Retrying…
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry Refinement
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ReviewLoopDecision;
