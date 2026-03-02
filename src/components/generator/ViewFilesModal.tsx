import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { useGenerator } from "@/contexts/GeneratorContext";

interface ViewFilesModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewFilesModal: React.FC<ViewFilesModalProps> = ({ open, onClose }) => {
    const { generatedFiles, updateGeneratedFile } = useGenerator();
    const [expandedFile, setExpandedFile] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({});

    const toggleExpand = (filename: string) => {
        setExpandedFile((prev) => (prev === filename ? null : filename));
        // Seed edit buffer if not already set
        if (!editValues[filename]) {
            const file = generatedFiles.find((f) => f.filename === filename);
            if (file) {
                setEditValues((prev) => ({ ...prev, [filename]: file.content }));
            }
        }
    };

    const handleSave = (filename: string) => {
        const newContent = editValues[filename];
        if (newContent !== undefined) {
            updateGeneratedFile(filename, newContent);
            toast.success(`${filename} saved`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] bg-card border-white/[0.08] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 turbo-gradient-text">
                        <FileText className="w-5 h-5" /> Generated Files ({generatedFiles.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {generatedFiles.map((file) => {
                        const isExpanded = expandedFile === file.filename;
                        const editValue = editValues[file.filename] ?? file.content;
                        const hasChanges = editValues[file.filename] !== undefined && editValues[file.filename] !== file.content;

                        return (
                            <div
                                key={file.filename}
                                className="border border-white/[0.06] rounded-lg overflow-hidden"
                            >
                                {/* File header — clickable */}
                                <button
                                    onClick={() => toggleExpand(file.filename)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-primary/60" />
                                        <span className="text-xs font-mono text-foreground/80">{file.filename}</span>
                                        <span className="text-[10px] text-muted-foreground/40 font-mono">
                                            {file.category}
                                        </span>
                                    </div>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                                    </motion.div>
                                </button>

                                {/* Expanded content — editable */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="relative">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) =>
                                                        setEditValues((prev) => ({ ...prev, [file.filename]: e.target.value }))
                                                    }
                                                    className="w-full min-h-[250px] max-h-[400px] bg-[#0A0A0A] text-foreground/80 font-mono text-xs p-4 border-t border-white/[0.06] resize-y focus:outline-none focus:ring-1 focus:ring-primary/30"
                                                    spellCheck={false}
                                                />
                                                {hasChanges && (
                                                    <button
                                                        onClick={() => handleSave(file.filename)}
                                                        className="absolute top-2 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/20 text-primary text-[10px] font-mono hover:bg-primary/30 transition-colors"
                                                    >
                                                        <Save className="w-3 h-3" /> Save
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {generatedFiles.length === 0 && (
                        <p className="text-xs text-muted-foreground/40 text-center py-8">
                            No files generated yet.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewFilesModal;
