import React, { useState } from "react";
import { AudioLines, Mic, Loader2, CheckCircle2 } from "lucide-react";

const AudioIngestion: React.FC = () => {
  const [state, setState] = useState<"idle" | "uploading" | "transcribing" | "done">("idle");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("uploading");
    setTimeout(() => setState("transcribing"), 800);
    setTimeout(() => setState("done"), 3500);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => { if (state === "idle") { setState("uploading"); setTimeout(() => setState("transcribing"), 800); setTimeout(() => setState("done"), 3500); } }}
      className={`border rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
        state === "idle" ? "border-white/[0.08] hover:border-[#4E75FF]/40" :
        state === "done" ? "border-cyan-400/30 bg-cyan-400/[0.03]" :
        "border-[#4E75FF]/40 bg-[#4E75FF]/[0.05]"
      }`}
      style={state === "idle" ? { background: "radial-gradient(ellipse at center, rgba(78,117,255,0.06), transparent 70%)" } : undefined}
    >
      {state === "idle" && (
        <div className="flex flex-col items-center gap-2">
          <AudioLines className="w-8 h-8 text-[#4E75FF]/60" style={{ filter: "drop-shadow(0 0 8px rgba(78,117,255,0.4))" }} />
          <p className="text-sm text-muted-foreground">Drag & drop .mp3 / .m4a files</p>
          <p className="text-xs text-muted-foreground/60">Max 10 minutes • Click to browse</p>
        </div>
      )}
      {state === "uploading" && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-[#4E75FF] animate-spin" />
          <p className="text-sm text-[#4E75FF]">Uploading...</p>
        </div>
      )}
      {state === "transcribing" && (
        <div className="flex flex-col items-center gap-2">
          <Mic className="w-8 h-8 text-[#9F55FF] animate-pulse" />
          <p className="text-sm text-[#9F55FF]">Transcribing with Whisper...</p>
          <div className="w-48 h-1.5 bg-white/[0.05] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-[#4E75FF] to-[#9F55FF] rounded-full animate-pulse" style={{ width: "65%" }} />
          </div>
        </div>
      )}
      {state === "done" && (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-cyan-400" />
          <p className="text-sm text-cyan-400">Transcription complete</p>
          <p className="text-xs text-muted-foreground">3:42 of audio processed</p>
          <button onClick={(e) => { e.stopPropagation(); setState("idle"); }} className="text-xs text-muted-foreground/60 hover:text-foreground mt-1 underline">
            Upload another
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioIngestion;
