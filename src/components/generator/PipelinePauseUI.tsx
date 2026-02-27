import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Play, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGenerator } from "@/contexts/GeneratorContext";

const PipelinePauseUI: React.FC = () => {
  const { pipelineState, editedReport, setEditedReport, resumePipeline } = useGenerator();
  const [isPreview, setIsPreview] = useState(false);

  if (pipelineState !== "paused") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-4 border-l-amber-400 border border-white/[0.08] bg-amber-500/[0.05] rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <h4 className="text-sm font-bold text-amber-400" style={{ textShadow: "0 0 10px rgba(255,171,0,0.4)" }}>
          Pipeline Paused — Review Required
        </h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Review and optionally edit the research report before the architecture phase begins.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setIsPreview(false)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${!isPreview ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Edit3 className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${isPreview ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Eye className="w-3 h-3" /> Preview
        </button>
      </div>

      {isPreview ? (
        <div className="bg-[#0A0A0A] rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-xs text-foreground/70 font-mono whitespace-pre-wrap">{editedReport}</pre>
        </div>
      ) : (
        <Textarea
          className="bg-[#0A0A0A] border-transparent font-mono text-xs min-h-[200px] focus:border-primary focus:shadow-[0_0_12px_hsl(var(--gemini-blue)/0.25)] transition-all duration-300"
          value={editedReport}
          onChange={(e) => setEditedReport(e.target.value)}
        />
      )}

      <Button
        onClick={resumePipeline}
        className="turbo-gradient-bg text-white border-0 shadow-[0_0_15px_hsl(var(--gemini-blue)/0.3)] hover:shadow-[0_0_25px_hsl(var(--gemini-blue)/0.5)] transition-all"
      >
        <Play className="w-4 h-4 mr-2" />
        Resume Pipeline
      </Button>
    </motion.div>
  );
};

export default PipelinePauseUI;
