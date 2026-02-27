import React from "react";
import { Check, Circle } from "lucide-react";

interface Step {
  label: string;
  complete: boolean;
}

interface Props {
  steps: Step[];
}

const FlightCheckStepper: React.FC<Props> = ({ steps }) => (
  <div className="space-y-1">
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Flight Check</h3>
    {steps.map((step, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step.complete
                ? "bg-gradient-to-br from-[#4E75FF] to-[#9F55FF] shadow-[0_0_10px_rgba(78,117,255,0.4)]"
                : "border border-white/[0.15] opacity-30"
            }`}
          >
            {step.complete ? (
              <Check className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Circle className="w-3 h-3 text-muted-foreground/40" />
            )}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-0.5 h-5 ${step.complete ? "bg-cyan-400/50" : "bg-white/[0.08]"}`} />
          )}
        </div>
        <span className={`text-xs ${step.complete ? "text-cyan-400 font-medium" : "text-muted-foreground opacity-50"}`}>
          {step.label}
        </span>
      </div>
    ))}
  </div>
);

export default FlightCheckStepper;
