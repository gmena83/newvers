import React, { useState } from "react";
import { Eye, Download, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockMarkdownFiles } from "@/data/translatorMockData";
import { toast } from "sonner";

const fileIconColor: Record<string, string> = {
  tech_stack: "text-[#4E75FF]",
  adr: "text-[#4E75FF]",
  brand_voice: "text-[#9F55FF]",
  memory: "text-[#9F55FF]",
  roadmap: "text-cyan-400",
  testing: "text-cyan-400",
};

const OutputPreview: React.FC = () => {
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const files = Object.entries(mockMarkdownFiles);

  const handleCopy = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${name} copied to clipboard`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold turbo-gradient-text">Output — Antigravity Symphony</h3>
        <Button size="sm" variant="outline"
          className="text-xs gap-1 border-white/[0.15] bg-transparent text-foreground/70 hover:border-[#4E75FF]/50 hover:shadow-[0_0_10px_rgba(78,117,255,0.2)]"
          onClick={() => toast.success("ZIP download simulated")}>
          <Download className="w-3 h-3" /> Download ZIP
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">Files are read-only. Use the Terminal to request changes.</p>

      <div className="grid grid-cols-3 gap-2">
        {files.map(([key, file]) => (
          <div key={key}
            className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 space-y-2 hover:-translate-y-0.5 hover:border-[#4E75FF]/40 hover:shadow-[0_0_15px_rgba(78,117,255,0.15)] transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-1.5">
              <FileText className={`w-3.5 h-3.5 ${fileIconColor[key] || "text-foreground/60"}`} />
              <span className="text-xs font-mono text-foreground truncate">{file.title}</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-[#4E75FF]" onClick={() => setPreviewFile(key)}>
                <Eye className="w-3 h-3 mr-1" /> Preview
              </Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-[#4E75FF]" onClick={() => handleCopy(file.content, file.title)}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-[#4E75FF]/20">
          <DialogHeader>
            <DialogTitle className="font-mono text-[#4E75FF]">{previewFile && mockMarkdownFiles[previewFile]?.title}</DialogTitle>
          </DialogHeader>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed p-4 bg-[#0A0A0A] rounded-lg">
            {previewFile && mockMarkdownFiles[previewFile]?.content}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutputPreview;
