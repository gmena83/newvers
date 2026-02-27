import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerator } from "@/contexts/GeneratorContext";

const ReviewLoopDecision: React.FC = () => {
  const { reviewLoopExhausted, reviewResult, resumePipeline } = useGenerator();
  if (!reviewLoopExhausted || !reviewResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-3"
    >
      <h4 className="text-sm font-semibold text-amber-400">Review Loop Exhausted</h4>
      <p className="text-xs text-muted-foreground">
        After 3 attempts, the best score achieved is {reviewResult.score}/100. You can proceed or retry.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" className="text-xs border-white/[0.15] text-foreground/70">
          <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
          Proceed ({reviewResult.score}/100)
        </Button>
        <Button onClick={resumePipeline} className="text-xs turbo-gradient-bg text-white border-0">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry Refinement
        </Button>
      </div>
    </motion.div>
  );
};

export default ReviewLoopDecision;
