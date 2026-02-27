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
    | "chat_message" | "report_ready" | "substep" | "governance_violation";
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
${data.ai_reasoning ? `\nAI SUGGESTED TECH STACK REASONING:\n${data.ai_reasoning}` : ""}
`.trim();
}

/* ═══════════════════════════════════════
   GOVERNANCE VALIDATOR
   ═══════════════════════════════════════ */

export interface GovernanceViolation {
    rule: string;
    file: string;
    violation: string;
    severity: "warning" | "error";
}

export function validateGovernance(
    fileName: string,
    content: string,
    techStackContext?: string
): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];

    // 1. Auth Storage Check (Kill-Switch)
    if (/localStorage|sessionStorage|cookies\.set\s*\(\s*['"]token['"]/.test(content)) {
        if (!/HTTP-only|HttpOnly/i.test(content)) {
            violations.push({
                rule: "Auth Token Storage",
                file: fileName,
                violation: "Detected potential unsafe storage of auth tokens (localStorage/sessionStorage) without HttpOnly cookie enforcement.",
                severity: "error"
            });
        }
    }

    // 2. 3D Physics Check (Kill-Switch)
    if (content.includes("@react-three/cannon")) {
        violations.push({
            rule: "3D Physics Engine",
            file: fileName,
            violation: "Found usage of @react-three/cannon. Only @react-three/rapier is allowed per GOVERNANCE.md.",
            severity: "error"
        });
    }

    // 3. UI Library Compliance (Context-aware)
    if (techStackContext && techStackContext.includes("Tailwind CSS")) {
        if (content.includes("shadcn/ui") || content.includes("@radix-ui")) {
             // Only flag if not explicitly whitelisted in the provided tech stack context
             // This is a heuristic; a perfect check needs the full TECH_STACK.md parsed
             if (!techStackContext.includes("shadcn") && !techStackContext.includes("radix")) {
                 violations.push({
                    rule: "UI Library Compliance",
                    file: fileName,
                    violation: "Detected shadcn/ui or Radix UI usage when Tailwind CSS is the mandated framework.",
                    severity: "error"
                 });
             }
        }
    }

    // 4. Database Parity (Testing vs Production)
    if (fileName === "TESTING.md") {
        if (content.includes("SQLite") && techStackContext && techStackContext.includes("PostgreSQL")) {
            violations.push({
                rule: "Database Parity",
                file: fileName,
                violation: "TESTING.md suggests SQLite but production uses PostgreSQL. Test environment must match production.",
                severity: "error"
            });
        }
    }

    return violations;
}
