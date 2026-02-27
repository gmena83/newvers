import React from "react";
import { motion } from "framer-motion";
import { useGenerator } from "@/contexts/GeneratorContext";

const ReviewScoreCard: React.FC = () => {
  const { reviewResult } = useGenerator();
  if (!reviewResult) return null;

  const { score, summary, attempt } = reviewResult;
  const scoreColor = score >= 90 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-red-400";
  const strokeColor = score >= 90 ? "#34d399" : score >= 70 ? "#fbbf24" : "#f87171";
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-5 flex items-center gap-5"
    >
      {/* Score circle */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <motion.circle
            cx="48" cy="48" r="42" fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold font-mono ${scoreColor}`}>{score}</span>
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-foreground">Senior Developer Review</h4>
        <p className="text-xs text-muted-foreground mt-1">{summary}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">Attempt {attempt}/3</p>
      </div>
    </motion.div>
  );
};

export default ReviewScoreCard;
