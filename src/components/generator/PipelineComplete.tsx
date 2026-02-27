import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Github, Download, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerator } from "@/contexts/GeneratorContext";
import GitHubExportModal from "./GitHubExportModal";

const PipelineComplete: React.FC = () => {
  const { pipelineState, generatedFiles, reviewResult, elapsedTime, resetPipeline } = useGenerator();
  const [showGithub, setShowGithub] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  if (pipelineState !== "complete") return null;

  const downloadZip = () => {
    // Simple multi-file download as individual files via Blob
    generatedFiles.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 text-center space-y-6"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
        </motion.div>

        <div>
          <h3 className="text-2xl font-bold turbo-gradient-text">Architecture Complete</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your software architecture has been composed and reviewed.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-foreground">{generatedFiles.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Files</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-foreground">{reviewResult?.score || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-foreground">{minutes}:{seconds.toString().padStart(2, "0")}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => setShowFiles(!showFiles)} className="border-white/[0.15] text-foreground/70 text-xs">
            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Files
          </Button>
          <Button onClick={() => setShowGithub(true)} className="turbo-gradient-bg text-white border-0 text-xs">
            <Github className="w-3.5 h-3.5 mr-1.5" /> Export to GitHub
          </Button>
          <Button variant="outline" onClick={downloadZip} className="border-white/[0.15] text-foreground/70 text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Files
          </Button>
          <Button variant="ghost" onClick={resetPipeline} className="text-muted-foreground text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New Project
          </Button>
        </div>
      </motion.div>

      <GitHubExportModal open={showGithub} onClose={() => setShowGithub(false)} />
    </>
  );
};

export default PipelineComplete;
