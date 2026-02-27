import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  data: {
    name: string;
    description: string;
    goal: string;
    frontend: string;
    backend: string;
  };
}

const ManifestModal: React.FC<Props> = ({ open, onClose, data }) => {
  const rows = [
    ["Project Name", data.name || "—"],
    ["Description", data.description || "—"],
    ["Goal", data.goal || "—"],
    ["Frontend", data.frontend || "—"],
    ["Backend", data.backend || "—"],
    ["Output Files", "9 Markdown documents"],
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-[#4E75FF]/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#4E75FF]">
            <Shield className="w-5 h-5" /> The Manifest — Final Review
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Review all decisions before confirming. This action generates the final documentation suite.</p>
        <div className="space-y-2 mt-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between items-start py-1.5 border-b border-white/[0.08]">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs text-foreground font-mono text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} className="text-xs">Cancel</Button>
          <Button onClick={() => { toast.success("Documentation suite confirmed and generated!"); onClose(); }}
            className="bg-gradient-to-r from-[#4E75FF] to-[#9F55FF] hover:opacity-90 text-white font-bold text-sm px-6 gap-2">
            <CheckCircle2 className="w-4 h-4" /> CONFIRM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManifestModal;
