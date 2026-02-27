import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode, FileText, Map } from "lucide-react";
import { useGenerator } from "@/contexts/GeneratorContext";
import { FILE_CATEGORIES } from "@/data/generatorTypes";
import MarkdownModal from "./MarkdownModal";

const categoryIcons: Record<string, React.ReactNode> = {
  tech: <FileCode className="w-4 h-4" />,
  brand: <FileText className="w-4 h-4" />,
  roadmap: <Map className="w-4 h-4" />,
  other: <FileText className="w-4 h-4" />,
};

const FileChipsGrid: React.FC = () => {
  const { generatedFiles } = useGenerator();
  const [selectedFile, setSelectedFile] = useState<{ filename: string; content: string } | null>(null);

  if (generatedFiles.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold turbo-gradient-text">Generated Files</h4>
          <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {generatedFiles.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <AnimatePresence>
            {generatedFiles.map((file, i) => {
              const cat = FILE_CATEGORIES[file.category] || FILE_CATEGORIES.other;
              return (
                <motion.button
                  key={file.filename}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedFile(file)}
                  className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-left hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_15px_hsl(var(--gemini-blue)/0.15)] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <span className={cat.color}>{categoryIcons[file.category]}</span>
                    <span className="text-xs font-mono text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {file.filename}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">{cat.label}</p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <MarkdownModal
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.filename || ""}
        content={selectedFile?.content || ""}
      />
    </>
  );
};

export default FileChipsGrid;
