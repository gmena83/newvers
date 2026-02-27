import React, { useState, useEffect } from "react";
import { RefreshCw, Bug, Wrench, CheckCircle, ScanLine } from "lucide-react";

const PHASES = [
  { label: "Scanning", icon: ScanLine, color: "text-primary" },
  { label: "Error Found", icon: Bug, color: "text-destructive" },
  { label: "Fixing", icon: Wrench, color: "text-accent" },
  { label: "Verified", icon: CheckCircle, color: "text-primary" },
] as const;

const logs = [
  "Scanning codebase for type errors...",
  "Found: Missing null check in auth handler",
  "Applying fix: Added optional chaining to user.session",
  "Verification passed — 0 errors remaining",
  "Scanning API response handlers...",
  "Found: Unhandled promise rejection in webhook",
  "Applying fix: Wrapped async call in try/catch",
  "Verification passed — all handlers safe",
];

const OvationPanel: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setPhase((ph) => {
            const next = (ph + 1) % PHASES.length;
            if (next === 0) setLogIndex((l) => (l + 4) % logs.length);
            return next;
          });
          return 0;
        }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const currentPhase = PHASES[phase];
  const Icon = currentPhase.icon;

  return (
    <div className="glass-panel glass-panel-hover p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">The Ovation — Recursive Mastery</h3>
      </div>
      <div className="space-y-3">
        {/* Circular progress */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx={32} cy={32} r={28} fill="none" stroke="hsl(220, 15%, 12%)" strokeWidth={4} />
              <circle
                cx={32} cy={32} r={28}
                fill="none"
                stroke="hsl(217, 90%, 61%)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${28 * 2 * Math.PI}`}
                strokeDashoffset={`${28 * 2 * Math.PI * (1 - progress / 100)}`}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className={`w-5 h-5 ${currentPhase.color}`} />
            </div>
          </div>
          <div>
            <div className={`text-sm font-semibold ${currentPhase.color}`}>{currentPhase.label}</div>
            <div className="text-xs text-muted-foreground">{progress}% complete</div>
            {/* Phase dots */}
            <div className="flex gap-1.5 mt-1.5">
              {PHASES.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === phase ? "bg-primary" : i < phase ? "bg-primary/40" : "bg-secondary"}`} />
              ))}
            </div>
          </div>
        </div>
        {/* Activity log */}
        <div className="space-y-1 text-xs">
          {logs.slice(logIndex, logIndex + 4).map((log, i) => (
            <div key={i} className={`${i <= phase ? "text-muted-foreground" : "text-muted-foreground/30"} leading-relaxed`}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OvationPanel;
