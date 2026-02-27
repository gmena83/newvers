import React, { useState, useRef, useEffect } from "react";
import { mockTerminalEntries } from "@/data/translatorMockData";

const TranslatorTerminal: React.FC = () => {
  const [entries, setEntries] = useState(mockTerminalEntries);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setEntries((prev) => [...prev, `[user] > ${input}`, `[gemini] > Processing: "${input}"...`, `[gemini] > Done. Section updated.`]);
    setInput("");
  };

  const getEntryColor = (entry: string) => {
    if (entry.includes("[user]")) return "text-[#4E75FF]";
    if (entry.includes("[gemini]")) return "text-cyan-400";
    if (entry.includes("⚠")) return "text-amber-400";
    return "text-foreground/40";
  };

  return (
    <div className="flex flex-col h-48 rounded-xl border border-white/[0.08]" style={{ background: "rgba(20,20,20,0.6)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.08]">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#9F55FF]/60" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">COMPOSER'S LOG // v3.0</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5 conductor-log-bg">
        {entries.map((entry, i) => (
          <div key={i} className={`text-xs font-mono ${getEntryColor(entry)}`}>
            {entry}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-white/[0.08] px-3 py-1.5">
        <span className="text-xs font-mono text-cyan-400 mr-2">&gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
      </form>
    </div>
  );
};

export default TranslatorTerminal;
