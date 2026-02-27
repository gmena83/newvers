import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockConflicts } from "@/data/translatorMockData";

const ConflictAlert: React.FC = () => {
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  if (mockConflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(255,171,0,0.4)" }}>
        <AlertTriangle className="w-4 h-4" /> System Diagnostic — Conflict Resolution
      </h3>
      {mockConflicts.map((c) => (
        <div key={c.id} className="rounded-xl border border-white/[0.08] border-l-4 border-l-amber-400 p-4 space-y-2" style={{ background: "rgba(255,171,0,0.05)" }}>
          <p className="text-xs text-amber-300 font-medium">{c.description}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#0A0A0A] rounded-lg p-2">
              <span className="text-muted-foreground">{c.fieldA}:</span>
              <p className="text-foreground font-mono mt-0.5">"{c.valueA}"</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-lg p-2">
              <span className="text-muted-foreground">{c.fieldB}:</span>
              <p className="text-foreground font-mono mt-0.5">"{c.valueB}"</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-amber-400/80 mb-1 block">Resolution (required)</label>
            <Select value={resolutions[c.id] || ""} onValueChange={(v) => setResolutions((prev) => ({ ...prev, [c.id]: v }))}>
              <SelectTrigger className="border-amber-400/30 text-xs bg-[#0A0A0A]"><SelectValue placeholder="Choose resolution..." /></SelectTrigger>
              <SelectContent>
                {c.options.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {resolutions[c.id] && <p className="text-[10px] text-cyan-400">✓ Resolved: {resolutions[c.id]}</p>}
        </div>
      ))}
    </div>
  );
};

export default ConflictAlert;
