import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Eye } from "lucide-react";
import { useGenerator } from "@/contexts/GeneratorContext";
import MarkdownModal from "./MarkdownModal";

const ResearchReportCard: React.FC = () => {
  const { researchReport } = useGenerator();
  const [showModal, setShowModal] = useState(false);

  if (!researchReport) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-foreground">Research Report Ready</h4>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
        <p className="text-xs text-muted-foreground font-mono line-clamp-3">
          {researchReport.slice(0, 200)}...
        </p>
      </motion.div>
      <MarkdownModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Research Report"
        content={researchReport}
      />
    </>
  );
};

export default ResearchReportCard;
