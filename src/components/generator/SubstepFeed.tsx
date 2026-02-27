import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerator } from "@/contexts/GeneratorContext";

const SubstepFeed: React.FC = () => {
  const { substepMessages } = useGenerator();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [substepMessages]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full turbo-gradient-bg animate-pulse" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live Feed</span>
      </div>
      <div ref={scrollRef} className="max-h-48 overflow-y-auto conductor-log-bg p-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {substepMessages.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-xs font-mono"
            >
              <span className="text-cyan-400 flex-shrink-0">▸</span>
              <span className="text-foreground/70">{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {substepMessages.length === 0 && (
          <p className="text-xs text-muted-foreground/40 font-mono">Waiting for pipeline events...</p>
        )}
      </div>
    </div>
  );
};

export default SubstepFeed;
