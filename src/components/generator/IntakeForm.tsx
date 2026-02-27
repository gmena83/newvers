import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AudioLines, Mic, Loader2, CheckCircle2,
  FileText, Upload, Sparkles, Rocket,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerator } from "@/contexts/GeneratorContext";
import { TECH_OPTIONS } from "@/data/generatorTypes";

const inputClasses = "bg-[#0A0A0A] border-transparent font-mono text-xs transition-all duration-300 focus:border-primary focus:shadow-[0_0_12px_hsl(var(--gemini-blue)/0.25)] placeholder:text-muted-foreground/40";
const textareaClasses = `${inputClasses} min-h-[80px]`;
const voidCard = "bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 space-y-4";
const sectionTitle = "text-sm font-bold uppercase tracking-wider turbo-gradient-text";

type AudioState = "idle" | "uploading" | "transcribing" | "done";
type PdfState = "idle" | "uploading" | "done";

const IntakeForm: React.FC = () => {
  const { formData, updateField, startPipeline } = useGenerator();
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [pdfState, setPdfState] = useState<PdfState>("idle");
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const isFormValid = formData.project_name.trim() && formData.description.trim() && formData.goal.trim();

  const handleAudioDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setAudioState("uploading");

    try {
      const fd = new FormData();
      fd.append("file", file);
      setAudioState("transcribing");
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json();
      updateField("audio_transcript", data.transcript || data.text || "");
      setAudioState("done");
      toast.success("Audio transcribed successfully");
    } catch (err) {
      toast.error("Transcription failed: " + (err instanceof Error ? err.message : "Unknown error"));
      setAudioState("idle");
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfState("uploading");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      if (!res.ok) throw new Error("PDF extraction failed");
      const data = await res.json();
      updateField("brandbook_text", data.text || "");
      setPdfState("done");
      toast.success("Brandbook extracted successfully");
    } catch (err) {
      toast.error("PDF extraction failed: " + (err instanceof Error ? err.message : "Unknown error"));
      setPdfState("idle");
    }
  };

  const handleAiSuggest = async () => {
    setAiSuggesting(true);
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("AI suggestion failed");
      const data = await res.json();
      if (data.frontend) updateField("tech_stack_frontend", data.frontend);
      if (data.backend) updateField("tech_stack_backend", data.backend);
      if (data.database) updateField("tech_stack_database", data.database);
      if (data.hosting) updateField("tech_stack_hosting", data.hosting);
      if (data.reasoning) {
        toast.info(data.reasoning, { duration: 8000, description: "AI Reasoning" });
      }
    } catch (err) {
      toast.error("AI suggestion failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setAiSuggesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-6 pb-12 space-y-6"
    >
      {/* Project Basics */}
      <div className={voidCard}>
        <h3 className={sectionTitle}>Project Basics</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project Name *</label>
            <Input className={inputClasses} placeholder="e.g. Antigravity Platform" value={formData.project_name} onChange={(e) => updateField("project_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <Textarea className={textareaClasses} placeholder="Describe your project in detail..." value={formData.description} onChange={(e) => updateField("description", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Goal *</label>
            <Textarea className={textareaClasses} placeholder="What should this architecture achieve?" value={formData.goal} onChange={(e) => updateField("goal", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Audio Ingestion */}
      <div className={voidCard}>
        <h3 className={sectionTitle}>Audio Ingestion</h3>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleAudioDrop}
          className={`border rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
            audioState === "idle" ? "border-white/[0.08] hover:border-primary/40" :
            audioState === "done" ? "border-cyan-400/30 bg-cyan-400/[0.03]" :
            "border-primary/40 bg-primary/[0.05]"
          }`}
          style={audioState === "idle" ? { background: "radial-gradient(ellipse at center, hsl(var(--gemini-blue) / 0.06), transparent 70%)" } : undefined}
        >
          {audioState === "idle" && (
            <div className="flex flex-col items-center gap-2">
              <AudioLines className="w-8 h-8 text-primary/60" style={{ filter: "drop-shadow(0 0 8px hsl(var(--gemini-blue) / 0.4))" }} />
              <p className="text-sm text-muted-foreground">Drag & drop .mp3 / .m4a files</p>
              <p className="text-xs text-muted-foreground/60">Max 10 minutes • Transcribed with Whisper</p>
            </div>
          )}
          {audioState === "uploading" && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-primary">Uploading...</p>
            </div>
          )}
          {audioState === "transcribing" && (
            <div className="flex flex-col items-center gap-2">
              <Mic className="w-8 h-8 text-[#9F55FF] animate-pulse" />
              <p className="text-sm text-[#9F55FF]">Transcribing with Whisper...</p>
              <div className="w-48 h-1.5 bg-white/[0.05] rounded-full overflow-hidden mt-1">
                <div className="h-full turbo-gradient-bg rounded-full animate-pulse" style={{ width: "65%" }} />
              </div>
            </div>
          )}
          {audioState === "done" && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              <p className="text-sm text-cyan-400">Transcription complete</p>
              <button onClick={(e) => { e.stopPropagation(); setAudioState("idle"); }} className="text-xs text-muted-foreground/60 hover:text-foreground mt-1 underline">Upload another</button>
            </div>
          )}
        </div>
        {formData.audio_transcript && (
          <Textarea className={`${textareaClasses} min-h-[60px]`} value={formData.audio_transcript} readOnly placeholder="Transcription will appear here..." />
        )}
      </div>

      {/* PDF Ingestion */}
      <div className={voidCard}>
        <h3 className={sectionTitle}>Brandbook / PDF Upload</h3>
        <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
        <button
          onClick={() => pdfInputRef.current?.click()}
          className="w-full border border-white/[0.08] rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all duration-300"
          style={{ background: "radial-gradient(ellipse at center, hsl(var(--gemini-blue) / 0.04), transparent 70%)" }}
        >
          {pdfState === "idle" && <><FileText className="w-6 h-6 text-[#9F55FF]/60" /><span className="text-sm text-muted-foreground">Upload a brandbook PDF for extraction</span></>}
          {pdfState === "uploading" && <><Loader2 className="w-6 h-6 text-primary animate-spin" /><span className="text-sm text-primary">Extracting text...</span></>}
          {pdfState === "done" && <><CheckCircle2 className="w-6 h-6 text-cyan-400" /><span className="text-sm text-cyan-400">Brandbook extracted</span></>}
        </button>
        {formData.brandbook_text && (
          <Textarea className={`${textareaClasses} min-h-[60px]`} value={formData.brandbook_text} readOnly />
        )}
      </div>

      {/* Strategic Input */}
      <div className={voidCard}>
        <h3 className={sectionTitle}>Strategic Input</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Audience</label>
            <Input className={inputClasses} placeholder="Who are the end users?" value={formData.target_audience} onChange={(e) => updateField("target_audience", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Core Problem</label>
            <Input className={inputClasses} placeholder="What problem does this solve?" value={formData.core_problem} onChange={(e) => updateField("core_problem", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Timeline / Scope</label>
            <Input className={inputClasses} placeholder="MVP in 3 months..." value={formData.timeline_scope} onChange={(e) => updateField("timeline_scope", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Key Differentiator</label>
            <Input className={inputClasses} placeholder="What sets this apart?" value={formData.key_differentiator} onChange={(e) => updateField("key_differentiator", e.target.value)} />
          </div>
        </div>
      </div>

      {/* AI-Powered Tech Stack */}
      <div className={voidCard}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitle}>AI-Powered Tech Stack</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiSuggest}
            disabled={aiSuggesting}
            className="border-primary/30 text-primary hover:bg-primary/10 text-xs gap-1.5"
          >
            {aiSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI Suggest
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(["frontend", "backend", "database", "hosting"] as const).map((key) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block capitalize">{key}</label>
              <select
                className={`${inputClasses} w-full h-10 rounded-md px-3 py-2 text-sm bg-[#0A0A0A] border border-transparent focus:border-primary focus:shadow-[0_0_12px_hsl(var(--gemini-blue)/0.25)] transition-all duration-300 font-mono text-xs`}
                value={formData[`tech_stack_${key}`]}
                onChange={(e) => updateField(`tech_stack_${key}`, e.target.value)}
              >
                <option value="">Select {key}...</option>
                {TECH_OPTIONS[key].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Brand & Security */}
      <div className={voidCard}>
        <h3 className={sectionTitle}>Brand & Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Brand Voice</label>
            <Input className={inputClasses} placeholder="Professional, playful, technical..." value={formData.brand_voice} onChange={(e) => updateField("brand_voice", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Brand Website</label>
            <Input className={inputClasses} placeholder="https://..." value={formData.brand_website} onChange={(e) => updateField("brand_website", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Design Style</label>
            <Input className={inputClasses} placeholder="Minimalist, brutalist, organic..." value={formData.design_style} onChange={(e) => updateField("design_style", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Communication Style</label>
            <Input className={inputClasses} placeholder="Formal, casual, technical..." value={formData.communication_style} onChange={(e) => updateField("communication_style", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Mandatory Integrations</label>
          <Textarea className={textareaClasses} placeholder="Stripe, SendGrid, Auth0..." value={formData.mandatory_integrations} onChange={(e) => updateField("mandatory_integrations", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Data Privacy & Security</label>
          <Textarea className={textareaClasses} placeholder="GDPR, SOC2, HIPAA requirements..." value={formData.data_privacy_security} onChange={(e) => updateField("data_privacy_security", e.target.value)} />
        </div>
      </div>

      {/* Submit */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          onClick={startPipeline}
          disabled={!isFormValid}
          className="w-full h-14 text-base font-bold turbo-gradient-bg text-white shadow-[0_0_20px_hsl(var(--gemini-blue)/0.3)] hover:shadow-[0_0_30px_hsl(var(--gemini-blue)/0.5)] transition-all duration-300 border-0"
        >
          <Rocket className="w-5 h-5 mr-2" />
          Generate Architecture
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default IntakeForm;
