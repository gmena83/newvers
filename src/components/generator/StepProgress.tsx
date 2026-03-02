import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useGenerator } from "@/contexts/GeneratorContext";
import { PIPELINE_STEPS } from "@/data/generatorTypes";

const StepProgress: React.FC = () => {
  const { activeStep, pipelineState } = useGenerator();

  return (
    <div className="space-y-1">
      {PIPELINE_STEPS.map((step, i) => {
        const isActive = i === activeStep && (pipelineState === "running" || pipelineState === "paused");
        const isComplete = i < activeStep || pipelineState === "complete";
        const isPending = i > activeStep && pipelineState !== "complete";

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-3 py-2.5 px-3 rounded-lg transition-all duration-300 ${isActive ? "bg-white/[0.03]" : ""
              } ${isPending ? "opacity-30" : ""}`}
          >
            {/* Step indicator */}
            <div className="relative flex-shrink-0 mt-0.5">
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              ) : isActive ? (
                <div className="w-5 h-5 rounded-full turbo-gradient-bg animate-pulse-glow flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-white/20 bg-white/[0.03]" />
              )}
              {/* Connector line */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className={`absolute left-2.5 top-6 w-px h-5 ${isComplete ? "bg-cyan-400/30" : "bg-white/10"}`} />
              )}
            </div>

            {/* Step content */}
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${isActive ? "turbo-gradient-text" : isComplete ? "text-foreground/70" : "text-muted-foreground"}`}>
                {step.label}
              </p>
              {isActive && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-muted-foreground mt-0.5 font-mono"
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StepProgress;
