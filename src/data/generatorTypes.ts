export interface GeneratorFormData {
  project_name: string;
  description: string;
  goal: string;
  target_audience: string;
  core_problem: string;
  timeline_scope: string;
  key_differentiator: string;
  tech_stack_frontend: string;
  tech_stack_backend: string;
  tech_stack_database: string;
  tech_stack_hosting: string;
  brand_voice: string;
  brand_website: string;
  design_style: string;
  communication_style: string;
  mandatory_integrations: string;
  data_privacy_security: string;
  audio_transcript: string;
  brandbook_text: string;
  ai_reasoning: string;
}

export const INITIAL_FORM_DATA: GeneratorFormData = {
  project_name: "",
  description: "",
  goal: "",
  target_audience: "",
  core_problem: "",
  timeline_scope: "",
  key_differentiator: "",
  tech_stack_frontend: "",
  tech_stack_backend: "",
  tech_stack_database: "",
  tech_stack_hosting: "",
  brand_voice: "",
  brand_website: "",
  design_style: "",
  communication_style: "",
  mandatory_integrations: "",
  data_privacy_security: "",
  audio_transcript: "",
  brandbook_text: "",
  ai_reasoning: "",
};

export interface PipelineStep {
  label: string;
  description: string;
  icon: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { label: "Input Validation", description: "Verifying project data integrity", icon: "shield-check" },
  { label: "Research & Analysis", description: "Deep-diving into market context", icon: "search" },
  { label: "Brand DNA Extraction", description: "Analyzing brand identity signals", icon: "dna" },
  { label: "Tech Stack Evaluation", description: "Scoring technology combinations", icon: "cpu" },
  { label: "Architecture Design", description: "Composing system blueprints", icon: "layout" },
  { label: "File Generation", description: "Writing architecture documents", icon: "file-code" },
  { label: "Quality Review", description: "Senior developer audit pass", icon: "check-circle" },
  { label: "Finalization", description: "Packaging deliverables", icon: "package" },
];

export interface GeneratedFile {
  filename: string;
  content: string;
  category: "tech" | "brand" | "roadmap" | "other";
}

export interface ReviewResult {
  score: number;
  summary: string;
  attempt: number;
}

export type PipelineState = "idle" | "running" | "paused" | "complete";

export type SSEEvent =
  | { type: "step_start"; data: { stepId: string; stepIndex: number } }
  | { type: "step_complete"; data: { stepId: string } }
  | { type: "substep"; data: { stepId: string; substep: string } }
  | { type: "report_ready"; data: { report: string } }
  | { type: "pipeline_paused"; data: Record<string, never> }
  | { type: "file_generated"; data: { fileName: string; content: string } }
  | { type: "review_result"; data: { score: number; summary: string; attempt: number } }
  | { type: "review_loop_exhausted"; data: Record<string, never> }
  | { type: "governance_violation"; data: { file: string; violation: string; severity: string } }
  | { type: "fallback_activated"; data: { provider: string; reason: string; fallbackModel: string } }
  | { type: "pipeline_complete"; data: Record<string, never> }
  | { type: "pipeline_failed"; data: { error: string } }
  | { type: "stream_end"; data: Record<string, never> };

export const TECH_OPTIONS = {
  frontend: ["React", "Next.js", "Vue.js", "Svelte", "Angular", "Astro"],
  backend: ["Node.js", "Python/FastAPI", "Go", "Rust/Actix", "Java/Spring", "Ruby on Rails"],
  database: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase", "PlanetScale"],
  hosting: ["Vercel", "AWS", "Google Cloud", "Cloudflare", "Railway", "Fly.io"],
};

export const FILE_CATEGORIES: Record<string, { color: string; label: string }> = {
  tech: { color: "text-primary", label: "Technical" },
  brand: { color: "text-[#9F55FF]", label: "Brand" },
  roadmap: { color: "text-cyan-400", label: "Roadmap" },
  other: { color: "text-muted-foreground", label: "Other" },
};

export function categorizeFile(filename: string): GeneratedFile["category"] {
  const lower = filename.toLowerCase();
  if (lower.includes("tech") || lower.includes("adr") || lower.includes("stack") || lower.includes("architecture")) return "tech";
  if (lower.includes("brand") || lower.includes("memory") || lower.includes("voice")) return "brand";
  if (lower.includes("roadmap") || lower.includes("testing") || lower.includes("timeline")) return "roadmap";
  return "other";
}
