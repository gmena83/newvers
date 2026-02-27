import React from "react";
import { mockHealth, mockDocuments } from "@/data/mockData";
import { Database, FileText, CheckCircle, Loader2, Clock } from "lucide-react";

const docStatusIcon = {
  complete: <CheckCircle className="w-3 h-3 text-primary" />,
  processing: <Loader2 className="w-3 h-3 text-accent animate-spin" />,
  queued: <Clock className="w-3 h-3 text-muted-foreground" />,
};

const FoundationPanel: React.FC = () => (
  <div className="glass-panel glass-panel-hover p-4 h-full">
    <div className="flex items-center gap-2 mb-3">
      <Database className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">The Foundation — Infrastructure</h3>
    </div>
    <div className="space-y-2 max-h-[240px] overflow-auto">
      {/* Health metrics */}
      {mockHealth.map((metric) => (
        <div key={metric.service} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 text-xs">
          <div className={`w-2 h-2 rounded-full ${metric.status === "healthy" ? "bg-primary" : "bg-accent"}`} />
          <span className="text-foreground font-medium flex-1">{metric.service}</span>
          <span className="text-muted-foreground">{metric.uptime}%</span>
          <span className="text-muted-foreground">{metric.latency}ms</span>
        </div>
      ))}
      {/* Document queue */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-1 mb-2">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">PDF.co Queue</span>
        </div>
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center gap-2 p-1.5 text-xs">
            {docStatusIcon[doc.status]}
            <span className="text-foreground truncate flex-1">{doc.name}</span>
            {doc.status === "processing" && (
              <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${doc.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FoundationPanel;
