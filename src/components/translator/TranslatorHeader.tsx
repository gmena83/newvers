import React from "react";
import Link from "next/link";
import { Music, Compass } from "lucide-react";

const TranslatorHeader: React.FC = () => (
  <header className="flex items-center justify-between px-6 py-4">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ textShadow: "0 0 20px rgba(78,117,255,0.5)" }}>
        <Compass className="w-5 h-5 inline-block mr-2 text-[#4E75FF]" />
        Project Translator
      </h1>
      <p className="text-xs text-muted-foreground mt-0.5">Structured intake for airtight project documentation</p>
    </div>
    <div className="flex items-center gap-3">
      <Link href="/" className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-card/80 transition-colors text-sm">
        <Music className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground font-medium">Symphony Dashboard</span>
      </Link>
    </div>
  </header>
);

export default TranslatorHeader;
