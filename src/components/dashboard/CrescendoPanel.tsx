import React, { useState, useEffect } from "react";
import { mockTerminalLogs, mockWorkflows } from "@/data/mockData";
import { Terminal, Workflow, CheckCircle, Loader2, Clock } from "lucide-react";

const CrescendoPanel: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => (v >= mockTerminalLogs.length ? 4 : v + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const wfIcon = { active: <Loader2 className="w-3 h-3 text-primary animate-spin" />, completed: <CheckCircle className="w-3 h-3 text-primary" />, waiting: <Clock className="w-3 h-3 text-muted-foreground" /> };

  return (
    <div className="glass-panel glass-panel-hover p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">The Crescendo — Dev Ops</h3>
      </div>
      <div className="space-y-3 max-h-[240px] overflow-auto">
        {/* Terminal */}
        <div className="bg-obsidian rounded-lg p-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="ml-2 text-muted-foreground text-[10px]">jules — terminal</span>
          </div>
          {mockTerminalLogs.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`${line.includes("✓") ? "text-primary" : "text-muted-foreground"} leading-relaxed`}>{line}</div>
          ))}
          <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-1" />
        </div>
        {/* Workflows */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Workflow className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Activepieces</span>
          </div>
          {mockWorkflows.map((wf) => (
            <div key={wf.id} className="flex items-center gap-2 p-1.5 text-xs">
              {wfIcon[wf.status]}
              <span className="text-foreground flex-1 truncate">{wf.name}</span>
              <span className="text-muted-foreground">{wf.completedSteps}/{wf.steps}</span>
              <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(wf.completedSteps / wf.steps) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrescendoPanel;
