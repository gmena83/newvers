import React from "react";
import { motion } from "framer-motion";
import StepProgress from "./StepProgress";
import SubstepFeed from "./SubstepFeed";
import ResearchReportCard from "./ResearchReportCard";
import PipelinePauseUI from "./PipelinePauseUI";
import FileChipsGrid from "./FileChipsGrid";
import ReviewScoreCard from "./ReviewScoreCard";
import ReviewLoopDecision from "./ReviewLoopDecision";
import PipelineComplete from "./PipelineComplete";
import { useGenerator } from "@/contexts/GeneratorContext";

const PipelineDashboard: React.FC = () => {
  const { pipelineState, elapsedTime } = useGenerator();
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex gap-6 px-6 pb-6 min-h-0"
    >
      {/* Sidebar - Step Progress */}
      <div className="w-56 flex-shrink-0 glass-panel p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Pipeline</span>
          {pipelineState === "running" && (
            <span className="text-[10px] font-mono text-primary">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          )}
        </div>
        <StepProgress />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto">
        <SubstepFeed />
        <ResearchReportCard />
        <PipelinePauseUI />
        <FileChipsGrid />
        <ReviewScoreCard />
        <ReviewLoopDecision />
        <PipelineComplete />
      </div>
    </motion.div>
  );
};

export default PipelineDashboard;
