import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mockEmails, type EmailEntry } from "@/data/mockData";
import { Mail, Eye, AlertTriangle, Check } from "lucide-react";

const statusConfig = {
  delivered: { icon: Check, label: "Delivered", color: "text-primary" },
  opened: { icon: Eye, label: "Opened", color: "text-accent" },
  bounced: { icon: AlertTriangle, label: "Bounced", color: "text-destructive" },
};

const CommunicationHub: React.FC = () => {
  const [emails, setEmails] = useState(mockEmails);
  const [isPaused, setIsPaused] = useState(false);

  // Simulate new emails arriving
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setEmails((prev) => {
        const shifted = [...prev.slice(1), { ...prev[0], id: Date.now().toString(), timestamp: "just now" }];
        return shifted;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="glass-panel p-4 h-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Communication Hub</h3>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">via Resend</span>
        </span>
      </div>
      <div className="space-y-2 overflow-hidden max-h-[280px]">
        {emails.map((email, i) => {
          const { icon: Icon, label, color } = statusConfig[email.status];
          return (
            <motion.div
              key={email.id + i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="text-foreground truncate font-medium">{email.subject}</div>
                <div className="text-muted-foreground truncate">{email.recipient}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`flex items-center gap-1 ${color}`}>
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </span>
                <span className="text-muted-foreground">{email.timestamp}</span>
              </div>
              {email.status !== "bounced" && (
                <div className="w-10 h-5 shrink-0">
                  {/* Mini sparkline */}
                  <svg viewBox="0 0 40 20" className="w-full h-full">
                    <polyline
                      points={`0,${18 - email.openRate * 0.16} 10,${14 - email.openRate * 0.1} 20,${16 - email.openRate * 0.14} 30,${10 - email.openRate * 0.08} 40,${18 - email.openRate * 0.17}`}
                      fill="none"
                      stroke="hsl(217, 90%, 61%)"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunicationHub;
