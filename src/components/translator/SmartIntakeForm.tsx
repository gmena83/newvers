import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import AudioIngestion from "./AudioIngestion";
import TechStackSelector from "./TechStackSelector";
import ConflictAlert from "./ConflictAlert";
import OutputPreview from "./OutputPreview";
import ManifestModal from "./ManifestModal";

interface Props {
  onFieldChange: (fields: Record<string, boolean>) => void;
}

const inputClasses = "font-mono text-xs bg-[#0A0A0A] border-transparent focus:border-[#4E75FF] focus:shadow-[0_0_12px_rgba(78,117,255,0.25)] transition-all duration-300";

const SmartIntakeForm: React.FC<Props> = ({ onFieldChange }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [problem, setProblem] = useState("");
  const [users, setUsers] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [showManifest, setShowManifest] = useState(false);

  React.useEffect(() => {
    onFieldChange({
      mission: !!(name && description && goal),
      techStack: true,
      roadmap: !!(audience && problem),
    });
  }, [name, description, goal, audience, problem, onFieldChange]);

  return (
    <div className="space-y-8 pb-6">
      {/* Project Details */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider turbo-gradient-text">Project Details</h2>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., SaaS Analytics Platform" className={inputClasses} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your project in detail..." className={`${inputClasses} min-h-[80px]`} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Goal</label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Primary objective of this project" className={inputClasses} />
          </div>
        </div>
      </section>

      {/* Audio Ingestion */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider turbo-gradient-text">Audio Ingestion</h2>
        <AudioIngestion />
      </section>

      {/* Guiding Questions */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider turbo-gradient-text">Guiding Questions</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Audience</label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who is this for?" className={inputClasses} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Core Problem</label>
            <Input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="What problem does it solve?" className={inputClasses} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Expected Users</label>
            <Input value={users} onChange={(e) => setUsers(e.target.value)} placeholder="User count / type" className={inputClasses} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Key Differentiator</label>
            <Input value={differentiator} onChange={(e) => setDifferentiator(e.target.value)} placeholder="What makes this unique?" className={inputClasses} />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5">
        <TechStackSelector />
      </section>

      {/* Conflict Resolution */}
      <section>
        <ConflictAlert />
      </section>

      {/* Output Preview */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5">
        <OutputPreview />
      </section>

      {/* Manifest Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={() => setShowManifest(true)} size="lg"
          className="bg-gradient-to-r from-[#4E75FF] to-[#9F55FF] hover:opacity-90 text-white font-bold gap-2 px-8 shadow-[0_0_20px_rgba(78,117,255,0.3)]">
          <Shield className="w-5 h-5" /> Review & Confirm — The Manifest
        </Button>
      </div>

      <ManifestModal open={showManifest} onClose={() => setShowManifest(false)} data={{ name, description, goal, frontend: "React + TypeScript", backend: "Supabase" }} />
    </div>
  );
};

export default SmartIntakeForm;
