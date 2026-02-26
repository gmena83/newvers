import { ProjectFormData } from "@/lib/schema";

/* ═══════════════════════════════════════
   PIPELINE TYPES
   ═══════════════════════════════════════ */

export type StepStatus = "pending" | "running" | "complete" | "failed" | "skipped" | "stopped";

export interface PipelineStep {
    id: string;
    name: string;
    description: string;
    status: StepStatus;
    progress: number; // 0-100
    startedAt?: number;
    completedAt?: number;
    output?: string;
    error?: string;
    substeps?: string[];
    currentSubstep?: string;
}

export interface PipelineState {
    id: string;
    status: "idle" | "running" | "complete" | "failed" | "stopped";
    steps: PipelineStep[];
    currentStepIndex: number;
    startedAt?: number;
    completedAt?: number;
    report?: string;
    generatedFiles: Record<string, string>;
    reviewScore?: number;
    reviewIteration: number;
    clarifyingQuestions?: string[];
    chatMessages: ChatMessage[];
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface PipelineEvent {
    type: "step_start" | "step_progress" | "step_complete" | "step_failed"
    | "pipeline_complete" | "pipeline_failed" | "pipeline_stopped"
    | "file_generated" | "review_result" | "clarification_needed"
    | "chat_message" | "report_ready" | "substep";
    stepId?: string;
    data: Record<string, unknown>;
    timestamp: number;
}

/* ═══════════════════════════════════════
   STEP DEFINITIONS
   ═══════════════════════════════════════ */

export const PIPELINE_STEPS: Omit<PipelineStep, "status" | "progress">[] = [
    {
        id: "brief",
        name: "Project Brief",
        description: "Analyzing inputs and preparing project understanding",
        substeps: ["Analyzing form data", "Identifying gaps", "Preparing clarifying questions"],
    },
    {
        id: "research",
        name: "Deep Search",
        description: "Researching tech stack, best practices, and official documentation",
        substeps: ["Searching tech stack docs", "Finding best practices", "Community recommendations"],
    },
    {
        id: "market",
        name: "Market Analysis",
        description: "Analyzing commercial alternatives vs custom development",
        substeps: ["Finding similar solutions", "Comparing pros/cons", "Cost analysis"],
    },
    {
        id: "knowledge",
        name: "Knowledge Base",
        description: "Consolidating research into comprehensive report",
        substeps: ["Synthesizing findings", "Building recommendations", "Formatting report"],
    },
    {
        id: "report",
        name: "Report Delivery",
        description: "Generating downloadable report in PDF and Markdown",
        substeps: ["Generating Markdown", "Ready for download"],
    },
    {
        id: "architecture",
        name: "Architecture Generation",
        description: "Creating 13 architecture markdown files sequentially",
        substeps: [
            "GOVERNANCE.md", "MISSION.md", "DATA_MODEL.md", "TECH_STACK.md", "SKILLS.md",
            "USER_FLOWS.md", "UI.md", "ROADMAP.md", "TESTING.md", "AGENTS.md",
            "BRAND_VOICE.md", "CONSTRAINTS.md", "NEXT_STEPS.md",
        ],
    },
    {
        id: "review",
        name: "Architecture Review",
        description: "Senior dev review with consistency analysis",
        substeps: ["Reviewing all files", "Scoring consistency", "Generating recommendations"],
    },
    {
        id: "refinement",
        name: "Refinement Loop",
        description: "Implementing review recommendations until score ≥ 90/100",
        substeps: ["Applying fixes", "Re-reviewing", "Validating improvements"],
    },
];

export function createInitialPipelineState(): PipelineState {
    return {
        id: `pipeline-${Date.now()}`,
        status: "idle",
        steps: PIPELINE_STEPS.map((step) => ({
            ...step,
            status: "pending" as StepStatus,
            progress: 0,
        })),
        currentStepIndex: -1,
        generatedFiles: {},
        reviewScore: undefined,
        reviewIteration: 0,
        chatMessages: [],
    };
}

/* ═══════════════════════════════════════
   FORM CONTEXT BUILDER
   ═══════════════════════════════════════ */

export function buildFormContext(data: ProjectFormData): string {
    return `
PROJECT NAME: ${data.project_name}
DESCRIPTION: ${data.description}
GOAL FOR THE CLIENT: ${data.goal}
TARGET AUDIENCE: ${data.target_audience}
CORE PROBLEM: ${data.core_problem}
KEY DIFFERENTIATOR: ${data.key_differentiator}
BRAND VOICE: ${data.brand_voice}
BRAND WEBSITE: ${data.brand_website}
DESIGN STYLE: ${data.design_style}
COMMUNICATION STYLE: ${data.communication_style}
TECH STACK: Frontend=${data.tech_stack_frontend}, Backend=${data.tech_stack_backend}, Database=${data.tech_stack_database}, Hosting=${data.tech_stack_hosting}
MANDATORY INTEGRATIONS: ${data.mandatory_integrations}
TIMELINE & SCOPE: ${data.timeline_scope}
DATA PRIVACY / SECURITY: ${data.data_privacy_security}
${data.audio_transcript ? `\nTRANSCRIPT FROM MEETING/AUDIO:\n${data.audio_transcript}` : ""}
${data.brandbook_text ? `\nBRANDBOOK EXTRACTED TEXT:\n${data.brandbook_text}` : ""}
`.trim();
}
