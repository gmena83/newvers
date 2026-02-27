import React from "react";
import { Plus, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlightCheckStepper from "./FlightCheckStepper";
import { mockProjectHistory } from "@/data/translatorMockData";

interface Props {
  flightSteps: { label: string; complete: boolean }[];
  onNewProject: () => void;
}

const statusColor: Record<string, string> = {
  complete: "text-cyan-400",
  draft: "text-muted-foreground",
  "in-progress": "text-[#9F55FF]",
};

const TranslatorSidebar: React.FC<Props> = ({ flightSteps, onNewProject }) => (
  <aside className="w-64 shrink-0 p-4 flex flex-col gap-5 h-full overflow-y-auto rounded-xl border border-white/[0.08]"
    style={{ background: "rgba(20,20,20,0.6)", backdropFilter: "blur(20px)" }}>
    <Button onClick={onNewProject} className="w-full text-white font-semibold gap-2 bg-gradient-to-br from-[#4E75FF] to-[#9F55FF] hover:opacity-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
      <Plus className="w-4 h-4" /> New Project
    </Button>

    <FlightCheckStepper steps={flightSteps} />

    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">History</h3>
      <div className="space-y-1.5">
        {mockProjectHistory.map((p) => (
          <button key={p.id} className="w-full text-left p-2 rounded-lg hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#4E75FF] transition-colors" />
              <span className="text-xs text-foreground truncate">{p.name}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 ml-5">
              <Clock className="w-2.5 h-2.5 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground/60">{p.timestamp}</span>
              <span className={`text-[10px] ml-auto capitalize ${statusColor[p.status]}`}>{p.status}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </aside>
);

export default TranslatorSidebar;
