import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { turboTerminalLogs, turboPhases } from "@/data/mockData";

type AgentStatus = "idle" | "working" | "complete";

interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  color: string;
}

interface TurboState {
  agents: AgentState[];
  completion: number;
  currentPhase: string;
  terminalLogs: string[];
  prompt: string;
  isRunning: boolean;
}

interface SymphonyContextType {
  mode: "ORCHESTRA" | "TURBO";
  setMode: (mode: "ORCHESTRA" | "TURBO") => void;
  turboState: TurboState;
  submitPrompt: (text: string) => void;
}

const initialAgents: AgentState[] = [
  { id: "perplexity", name: "Perplexity", status: "idle", color: "#20b2aa" },
  { id: "supabase", name: "Supabase", status: "idle", color: "#3ecf8e" },
  { id: "openai", name: "OpenAI", status: "idle", color: "#10a37f" },
  { id: "anthropic", name: "Anthropic", status: "idle", color: "#d4a574" },
  { id: "elevenlabs", name: "ElevenLabs", status: "idle", color: "#f59e0b" },
  { id: "firebase", name: "Firebase", status: "idle", color: "#ff9100" },
  { id: "activepieces", name: "Activepieces", status: "idle", color: "#6c5ce7" },
];

const SymphonyContext = createContext<SymphonyContextType | null>(null);

export const useSymphony = () => {
  const ctx = useContext(SymphonyContext);
  if (!ctx) throw new Error("useSymphony must be used within SymphonyProvider");
  return ctx;
};

export const SymphonyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<"ORCHESTRA" | "TURBO">("ORCHESTRA");
  const [turboState, setTurboState] = useState<TurboState>({
    agents: initialAgents.map(a => ({ ...a })),
    completion: 0,
    currentPhase: "",
    terminalLogs: [],
    prompt: "",
    isRunning: false,
  });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const logIndexRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const setAgentStatus = useCallback((ids: string[], status: AgentStatus) => {
    setTurboState(prev => ({
      ...prev,
      agents: prev.agents.map(a => ids.includes(a.id) ? { ...a, status } : a),
    }));
  }, []);

  const feedLog = useCallback(() => {
    if (logIndexRef.current < turboTerminalLogs.length) {
      const entry = turboTerminalLogs[logIndexRef.current];
      setTurboState(prev => ({ ...prev, terminalLogs: [...prev.terminalLogs, entry] }));
      logIndexRef.current++;
    }
  }, []);

  const submitPrompt = useCallback((text: string) => {
    clearTimers();
    logIndexRef.current = 0;

    setTurboState({
      agents: initialAgents.map(a => ({ ...a, status: "idle" as AgentStatus })),
      completion: 0,
      currentPhase: "Initializing...",
      terminalLogs: [],
      prompt: text,
      isRunning: true,
    });

    // Feed logs every 800ms
    const logInterval = setInterval(() => {
      if (logIndexRef.current < turboTerminalLogs.length) {
        feedLog();
      } else {
        clearInterval(logInterval);
      }
    }, 800);
    timersRef.current.push(logInterval);

    // Phase 1 (500ms): Perplexity + Supabase working
    const t1 = setTimeout(() => {
      setAgentStatus(["perplexity", "supabase"], "working");
      setTurboState(prev => ({ ...prev, completion: 10, currentPhase: turboPhases[0].name }));
    }, 500);

    // Phase 2 (3s): Perplexity done, OpenAI + Anthropic start
    const t2 = setTimeout(() => {
      setAgentStatus(["perplexity"], "complete");
      setAgentStatus(["openai", "anthropic"], "working");
      setTurboState(prev => ({ ...prev, completion: 30, currentPhase: turboPhases[1].name }));
    }, 3000);

    // Phase 3 (5s): Supabase done, ElevenLabs + Firebase start
    const t3 = setTimeout(() => {
      setAgentStatus(["supabase"], "complete");
      setAgentStatus(["elevenlabs", "firebase"], "working");
      setTurboState(prev => ({ ...prev, completion: 55, currentPhase: turboPhases[2].name }));
    }, 5000);

    // Phase 4 (7s): OpenAI + Anthropic done, Activepieces starts
    const t4 = setTimeout(() => {
      setAgentStatus(["openai", "anthropic"], "complete");
      setAgentStatus(["activepieces"], "working");
      setTurboState(prev => ({ ...prev, completion: 80, currentPhase: turboPhases[3].name }));
    }, 7000);

    // Phase 5 (9s): All complete
    const t5 = setTimeout(() => {
      setAgentStatus(["elevenlabs", "firebase", "activepieces"], "complete");
      setTurboState(prev => ({
        ...prev,
        completion: 100,
        currentPhase: turboPhases[4].name,
        isRunning: false,
      }));
    }, 9000);

    timersRef.current.push(t1, t2, t3, t4, t5);
  }, [clearTimers, setAgentStatus, feedLog]);

  return (
    <SymphonyContext.Provider value={{ mode, setMode, turboState, submitPrompt }}>
      {children}
    </SymphonyContext.Provider>
  );
};
