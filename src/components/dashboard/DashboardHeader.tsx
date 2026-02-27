import React from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Music, Rocket, FileText, Cpu } from "lucide-react";
import { useSymphony } from "@/contexts/SymphonyContext";

const DashboardHeader: React.FC = () => {
  const { mode, setMode } = useSymphony();
  const isTurbo = mode === "TURBO";

  return (
    <header className={`flex items-center justify-between px-6 py-4 transition-all duration-800 ${isTurbo ? "turbo-glass" : ""}`}>
      <div>
        {isTurbo ? (
          <>
            <h1 className="text-2xl font-bold turbo-gradient-text tracking-tight">
              🤖 AI Maestro Mode
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">The system conducts. You observe.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground glow-text tracking-tight">
              🎼 AI Symphony Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Orchestrating intelligence, one movement at a time</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/generator" className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-card/80 transition-colors text-sm">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground font-medium">Architecture Generator</span>
        </Link>
        <Link href="/translator" className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-card/80 transition-colors text-sm">
          <FileText className="w-4 h-4 text-translator" />
          <span className="text-muted-foreground font-medium">Project Translator</span>
        </Link>
        <div className={`flex items-center gap-2 px-3 py-2 ${isTurbo ? "turbo-glass" : "glass-panel"}`}>
          <Music className={`w-4 h-4 transition-colors ${!isTurbo ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs font-medium ${!isTurbo ? "text-primary" : "text-muted-foreground"}`}>Conductor</span>
          <Switch checked={isTurbo} onCheckedChange={(v) => setMode(v ? "TURBO" : "ORCHESTRA")} />
          <Rocket className={`w-4 h-4 transition-colors ${isTurbo ? "text-[#9F55FF]" : "text-muted-foreground"}`} />
          <span className={`text-xs font-medium ${isTurbo ? "turbo-gradient-text" : "text-muted-foreground"}`}>AI Maestro</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
