import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Check, Loader2 } from "lucide-react";
import { useSymphony } from "@/contexts/SymphonyContext";

/* ─── Omni-Field ─── */
const OmniField: React.FC = () => {
  const { submitPrompt, turboState } = useSymphony();
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barW = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const h = v * canvas.height * 0.9;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h);
        gradient.addColorStop(0, "#4E75FF");
        gradient.addColorStop(1, "#9F55FF");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - h, barW - 1, h);
        x += barW;
      }
    };
    draw();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsRecording(true);
      drawWaveform();
    } catch {
      console.log("Microphone access denied, using mock waveform");
      setIsRecording(true);
      // Mock waveform
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const mockDraw = () => {
            if (!isRecording) return;
            animFrameRef.current = requestAnimationFrame(mockDraw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 40; i++) {
              const h = Math.random() * canvas.height * 0.7;
              const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h);
              gradient.addColorStop(0, "#4E75FF");
              gradient.addColorStop(1, "#9F55FF");
              ctx.fillStyle = gradient;
              ctx.fillRect(i * 8, canvas.height - h, 6, h);
            }
          };
          mockDraw();
        }
      }
    }
  }, [drawWaveform, isRecording]);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    setIsRecording(false);
    setIsTranscribing(true);

    // Mock transcription
    setTimeout(() => {
      setText("Build a SaaS landing page for https://acme.io — B2B project management tool with auth, dashboard, and Stripe billing.");
      setIsTranscribing(false);
    }, 2000);
  }, []);

  const handleSubmit = () => {
    if (!text.trim() || turboState.isRunning) return;
    submitPrompt(text.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative p-[2px] rounded-2xl omni-field-border">
        <div className="bg-[hsl(240,20%,3%)] rounded-2xl p-6 space-y-4">
          <h2 className="turbo-gradient-text text-xl font-bold text-center">The Omni-Field</h2>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Describe your project... or hold to speak"
            className="w-full h-28 bg-transparent border border-[hsl(var(--turbo-border))] rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground font-mono resize-none focus:outline-none focus:border-[#4E75FF] transition-colors"
            disabled={turboState.isRunning}
          />

          {/* Waveform canvas */}
          <AnimatePresence>
            {(isRecording || isTranscribing) && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 80, opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                {isTranscribing ? (
                  <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-mono">Transcribing...</span>
                  </div>
                ) : (
                  <canvas ref={canvasRef} width={500} height={80} className="w-full h-20 rounded-lg" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={turboState.isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--turbo-border))] text-muted-foreground hover:text-foreground hover:border-[#9F55FF] transition-all text-sm disabled:opacity-30"
            >
              <Mic className={`w-4 h-4 ${isRecording ? "text-red-500 animate-pulse" : ""}`} />
              Hold to Speak
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || turboState.isRunning}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl turbo-gradient-bg text-white font-semibold text-sm disabled:opacity-30 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              Execute Symphony
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Agent Status Grid ─── */
const AgentStatusGrid: React.FC = () => {
  const { turboState } = useSymphony();

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {turboState.agents.map(agent => (
        <div key={agent.id} className="flex flex-col items-center gap-1.5">
          <div
            className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              agent.status === "idle"
                ? "opacity-30 border-muted-foreground/30"
                : agent.status === "working"
                ? "opacity-100 border-transparent"
                : "opacity-100 border-green-500"
            }`}
            style={agent.status === "working" ? { boxShadow: `0 0 20px ${agent.color}40` } : {}}
          >
            {agent.status === "working" && (
              <div className="absolute inset-[-3px] rounded-full border-2 border-transparent border-t-[#4E75FF] border-r-[#9F55FF] animate-spin" />
            )}
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: agent.color }}
            />
            {agent.status === "complete" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
          <span className={`text-[10px] font-mono transition-colors ${
            agent.status === "idle" ? "text-muted-foreground/40" : "text-muted-foreground"
          }`}>
            {agent.name}
          </span>
          {agent.status === "working" && (
            <span className="text-[9px] text-[#9F55FF] font-mono animate-pulse">Thinking...</span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Completion Ring ─── */
const CompletionRing: React.FC = () => {
  const { turboState } = useSymphony();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (turboState.completion / 100) * circumference;

  return (
    <div className="flex flex-col items-center mt-8">
      <svg width="140" height="140" className="-rotate-90">
        <defs>
          <linearGradient id="turbo-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4E75FF" />
            <stop offset="100%" stopColor="#9F55FF" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(220 15% 12%)" strokeWidth="6" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke="url(#turbo-ring-grad)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute mt-10 flex flex-col items-center">
        <span className="text-2xl font-bold turbo-gradient-text">{turboState.completion}%</span>
        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{turboState.currentPhase}</span>
      </div>
    </div>
  );
};

/* ─── Conductor's Log ─── */
const ConductorsLog: React.FC = () => {
  const { turboState } = useSymphony();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turboState.terminalLogs]);

  const getLogColor = (entry: string) => {
    if (entry.includes("[Perplexity]") || entry.includes("[Firecrawl]")) return "#20b2aa";
    if (entry.includes("[OpenAI]")) return "#10a37f";
    if (entry.includes("[Anthropic]")) return "#d4a574";
    if (entry.includes("[Jules]") || entry.includes("[Activepieces]")) return "#6c5ce7";
    if (entry.includes("[ElevenLabs]")) return "#f59e0b";
    if (entry.includes("[Firebase]") || entry.includes("[Supabase]")) return "#3ecf8e";
    return "#888";
  };

  return (
    <div className="w-full mt-8">
      <div className="turbo-glass rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-[hsl(var(--turbo-border))] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <span className="w-2 h-2 rounded-full bg-green-500/60" />
          <span className="text-[10px] text-muted-foreground font-mono ml-2">conductor.log</span>
        </div>
        <div
          ref={scrollRef}
          className="conductor-log-bg p-4 h-48 overflow-y-auto font-mono text-xs space-y-1"
        >
          {turboState.terminalLogs.length === 0 && (
            <div className="text-muted-foreground/40 italic">Awaiting prompt submission...</div>
          )}
          {turboState.terminalLogs.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: getLogColor(entry) }}
            >
              <span className="text-muted-foreground/50 mr-2">
                {new Date(Date.now() - (turboState.terminalLogs.length - i) * 800).toLocaleTimeString("en-US", { hour12: false })}
              </span>
              {entry}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Overlay ─── */
const TurboOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="px-4 sm:px-6 pb-8 flex flex-col items-center min-h-[70vh]"
  >
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full max-w-3xl"
    >
      <OmniField />
      <AgentStatusGrid />
      <div className="relative flex justify-center">
        <CompletionRing />
      </div>
      <ConductorsLog />
    </motion.div>
  </motion.div>
);

export default TurboOverlay;
