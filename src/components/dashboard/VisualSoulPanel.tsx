import React from "react";
import { mockUIComponents } from "@/data/mockData";
import { Palette, ExternalLink } from "lucide-react";

const VisualSoulPanel: React.FC = () => (
  <div className="glass-panel glass-panel-hover p-4 h-full">
    <div className="flex items-center gap-2 mb-3">
      <Palette className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">Visual Soul — UI Gallery</h3>
    </div>
    <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-auto">
      {mockUIComponents.map((comp) => (
        <div key={comp.id} className="group relative rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-all cursor-pointer hover:scale-[1.03]">
          <div className={`w-full h-16 rounded bg-gradient-to-br ${comp.gradient} mb-2 flex items-center justify-center`}>
            <span className="text-muted-foreground/40 text-xs">{comp.category}</span>
          </div>
          <div className="text-xs font-medium text-foreground">{comp.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {comp.source} <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default VisualSoulPanel;
