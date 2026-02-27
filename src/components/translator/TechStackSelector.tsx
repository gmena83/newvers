import React, { useState } from "react";
import { Sparkles, Lock, Unlock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const frontendOptions = ["React + TypeScript", "Next.js", "Vue 3", "Svelte", "Angular"];
const backendOptions = ["Supabase", "Firebase", "Node.js + Express", "Django", "Rails", "Serverless (AWS Lambda)"];

const TechStackSelector: React.FC = () => {
  const [frontend, setFrontend] = useState("");
  const [backend, setBackend] = useState("");
  const [locked, setLocked] = useState(false);

  const handleAiSuggest = () => {
    setFrontend("React + TypeScript");
    setBackend("Supabase");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold turbo-gradient-text">Tech Stack Selection</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleAiSuggest} disabled={locked}
            className="text-xs gap-1 border-[#4E75FF]/30 text-[#4E75FF] hover:bg-[#4E75FF]/10">
            <Sparkles className="w-3 h-3" /> AI Suggest
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setLocked(!locked)}
            className={`text-xs gap-1 ${locked ? "text-amber-400" : "text-muted-foreground"}`}>
            {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {locked ? "Locked" : "Lock"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Frontend</label>
          <Select value={frontend} onValueChange={setFrontend} disabled={locked}>
            <SelectTrigger className="font-mono text-xs bg-[#0A0A0A] border-transparent"><SelectValue placeholder="Select framework" /></SelectTrigger>
            <SelectContent>
              {frontendOptions.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Backend</label>
          <Select value={backend} onValueChange={setBackend} disabled={locked}>
            <SelectTrigger className="font-mono text-xs bg-[#0A0A0A] border-transparent"><SelectValue placeholder="Select backend" /></SelectTrigger>
            <SelectContent>
              {backendOptions.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {locked && <p className="text-[10px] text-amber-400/70">⚠ Tech stack is locked. Unlock to make changes.</p>}
    </div>
  );
};

export default TechStackSelector;
