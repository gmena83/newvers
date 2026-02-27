import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface MarkdownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const MarkdownModal: React.FC<MarkdownModalProps> = ({ open, onClose, title, content }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title.endsWith(".md") ? title : `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="turbo-gradient-text font-mono text-sm">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] bg-[#0A0A0A] rounded-lg p-4">
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{content}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkdownModal;
