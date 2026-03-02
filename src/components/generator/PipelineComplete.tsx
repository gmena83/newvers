import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Github, Download, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerator } from "@/contexts/GeneratorContext";
import GitHubExportModal from "./GitHubExportModal";
import ViewFilesModal from "./ViewFilesModal";
import JSZip from "jszip";

const PipelineComplete: React.FC = () => {
  const { pipelineState, generatedFiles, researchReport, reviewResult, elapsedTime, resetPipeline } = useGenerator();
  const [showGithub, setShowGithub] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  if (pipelineState !== "complete") return null;

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const downloadZip = useCallback(async () => {
    const zip = new JSZip();

    // Add all generated architecture files
    for (const file of generatedFiles) {
      zip.file(file.filename, file.content);
    }

    // Add research report if available
    if (researchReport) {
      zip.file("RESEARCH_REPORT.md", researchReport);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "architecture-files.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedFiles, researchReport]);

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
          <Button variant="outline" onClick={() => setShowFiles(true)} className="border-white/[0.15] text-foreground/70 text-xs">
            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Files
          </Button>
          <Button onClick={() => setShowGithub(true)} className="turbo-gradient-bg text-white border-0 text-xs">
            <Github className="w-3.5 h-3.5 mr-1.5" /> Export to GitHub
          </Button>
          <Button variant="outline" onClick={downloadZip} className="border-white/[0.15] text-foreground/70 text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download ZIP
          </Button>
          <Button variant="ghost" onClick={resetPipeline} className="text-muted-foreground text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New Project
          </Button>
        </div>
      </motion.div>

      <GitHubExportModal open={showGithub} onClose={() => setShowGithub(false)} />
      <ViewFilesModal open={showFiles} onClose={() => setShowFiles(false)} />
    </>
  );
};

export default PipelineComplete;
