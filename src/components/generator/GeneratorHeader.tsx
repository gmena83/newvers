import React from "react";
import Link from "next/link";
import { Music, Cpu, Loader2 } from "lucide-react";
import { useGenerator } from "@/contexts/GeneratorContext";

const GeneratorHeader: React.FC = () => {
  const { pipelineState } = useGenerator();
  const isRunning = pipelineState === "running";

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Cpu className="w-6 h-6 text-primary" />
          {isRunning && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full turbo-gradient-bg animate-pulse" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold turbo-gradient-text tracking-tight">
            Architecture Generator
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRunning ? "Pipeline active — composing architecture..." : "AI-driven software architecture composer"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isRunning && (
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5">
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-mono">Processing</span>
          </div>
        )}
        <Link
          href="/"
          className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-card/80 transition-colors text-sm"
        >
          <Music className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground font-medium">Dashboard</span>
        </Link>
      </div>
    </header>
  );
};

export default GeneratorHeader;
