import React from "react";
import { mockResearch } from "@/data/mockData";
import { Search, Globe, Star } from "lucide-react";

const OverturePanel: React.FC = () => (
  <div className="glass-panel glass-panel-hover p-4 h-full">
    <div className="flex items-center gap-2 mb-3">
      <Search className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">Overture — Market Research</h3>
      <span className="ml-auto flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-xs text-muted-foreground">Live</span>
      </span>
    </div>
    <div className="space-y-2 overflow-auto max-h-[240px]">
      {mockResearch.map((entry) => (
        <div key={entry.id} className="p-2 rounded-lg bg-secondary/30 text-xs">
          <div className="flex items-center gap-2 mb-1">
            {entry.source === "perplexity" ? <Search className="w-3 h-3 text-accent" /> : <Globe className="w-3 h-3 text-primary" />}
            <span className="text-foreground font-medium">{entry.title}</span>
            <span className="ml-auto flex items-center gap-1 text-accent">
              <Star className="w-3 h-3" fill="currentColor" />
              {entry.relevance}%
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{entry.snippet}</p>
          <span className="text-muted-foreground/60 mt-1 block">{entry.citation}</span>
        </div>
      ))}
    </div>
  </div>
);

export default OverturePanel;
