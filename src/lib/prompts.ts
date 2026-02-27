/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProjectData {
    project_name: string;
    description: string;
    goal: string;
    target_audience: string;
    core_problem: string;
    key_differentiator: string;
    brand_voice: string;
    brand_website: string;
    design_style: string;
    communication_style: string;
    tech_stack_frontend: string;
    tech_stack_backend: string;
    tech_stack_database: string;
    tech_stack_hosting: string;
    mandatory_integrations: string;
    timeline_scope: string;
    data_privacy_security: string;
    audio_transcript: string;
    brandbook_text: string;
}

function formContext(data: ProjectData): string {
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

export function buildPrompt(
    fileIndex: number,
    data: ProjectData,
    previousFiles: Record<string, string>
): { system: string; user: string } {
    const prompts: Array<{ system: string; user: string }> = [
        // 0 — GOVERNANCE.md
        {
            system: `You are the Agent_Architect — the supreme authority on project governance. Generate a GOVERNANCE.md file that establishes the "Source of Truth" hierarchy for resolving all contradictions between architecture files. This document MUST be loaded FIRST by any AI agent before reading any other file. Output must be clean Markdown.

Structure the file exactly as follows:

## 1. Priority Hierarchy (The Decision Matrix)

Define 5 priority levels:
- Level 1: TECH_STACK.md — Absolute technical authority. If a technology is not whitelisted here, it is forbidden.
- Level 2: MISSION.md — Security and Core Product guardrails. Defines what the MVP does and does NOT do.
- Level 3: SKILLS.md — Implementation standards and deterministic logic rules.
- Level 4: DATA_MODEL.md — Schema and data structure. The single source of truth for all entities.
- Level 5: All others (UI.md, USER_FLOWS.md, BRAND_VOICE.md, etc.) — Design and flow suggestions, subject to override by higher levels.

State the conflict resolution rule: "When instructions between two files conflict, the file at the higher priority level wins."

## 2. Mandatory Kill-Switch Rules

These are HARD STOPS — the agent must halt and ask for clarification if any of these are violated:
- **UI Libraries**: If TECH_STACK.md mandates a CSS solution (e.g., Pure Tailwind CSS), any reference to shadcn/ui or Radix UI in UI.md must be IGNORED.
- **3D Physics**: Only @react-three/rapier is allowed. Any reference to @react-three/cannon is a violation.
- **Auth Storage**: Tokens must NEVER be stored in localStorage or frontend memory. Only secure, HTTP-only cookies are permitted per MISSION.md security requirements.
- **Database Testing**: If the project requires pgvector or PostgreSQL-specific features, tests MUST use PostgreSQL. SQLite is disqualified as a test database.

## 3. Fallback Logic for Unclear Conflicts

- Prioritize the most restrictive rule (if one file allows a library and another forbids it, it is forbidden).
- Prioritize Deterministic over Generative (if a flow suggests the LLM decides a mechanic, override with Backend Rules Engine logic from SKILLS.md).
- Technical Capability Check (if a feature like RAG requires pgvector, any environment that doesn't support it is disqualified).

## 4. IDE File Hierarchy

Show the recommended folder structure for loading files into the IDE:
\`\`\`
.
├── 01_GOVERNANCE/
│   ├── GOVERNANCE.md      <-- [LOAD FIRST: Source of Truth]
│   ├── TECH_STACK.md      <-- [TOP PRIORITY: Technical Whitelist]
│   ├── MISSION.md         <-- [Security & Scope Guardrails]
│   ├── SKILLS.md          <-- [Logic & Quality Standards]
│   └── CONSTRAINTS.md     <-- [Hard Restrictions]
├── 02_DATA_SCHEMA/
│   └── DATA_MODEL.md      <-- [Database Truth]
├── 03_IMPLEMENTATION/
│   ├── USER_FLOWS.md      <-- [Business Logic]
│   ├── UI.md              <-- [Visual Layer - Subject to Tech Stack]
│   ├── AGENTS.md          <-- [Workflow Protocols]
│   └── BRAND_VOICE.md     <-- [Communication Style]
└── 04_OPERATIONS/
    ├── TESTING.md         <-- [Validation Logic]
    ├── ROADMAP.md         <-- [Execution Sequence]
    └── NEXT_STEPS.md      <-- [Build Kickoff]
\`\`\`

## 5. Stack Audit Verification Protocol

Before every git commit or code generation task, agents MUST run these checks:
1. "Does this code use any library not in TECH_STACK.md?"
2. "Does this authentication flow use localStorage?"
3. "Is this 3D component using rapier (not cannon)?"
4. "Does the test environment match the production database engine?"

If ANY check fails, the commit must be blocked and the violation reported.

Tailor the governance specifically to the project's tech stack and requirements. Do NOT add generic boilerplate.`,
            user: `Generate GOVERNANCE.md for this project:\n\n${formContext(data)}`,
        },
        // 1 — MISSION.md
        {
            system: `You are a world-class software architect. Generate a MISSION.md file for a software project. This file defines the strict boundaries of the MVP. If a feature is not explicitly supported by this document, agents must reject it. The output must be in clean Markdown format.

Structure:
- **Core Problem**: A one-sentence declaration of the exact pain point being solved.
- **Target Audience**: Who is using this? (Dictates complexity and accessibility requirements).
- **Primary Goal (Definition of Done)**: The single metric of success for this specific build.
- **Out of Scope (Anti-Goals)**: Explicitly list what the MVP will NOT do to prevent feature creep.

Be extremely specific and grounded in the provided client data. Do not hallucinate features.`,
            user: `Generate MISSION.md based on this client data:\n\n${formContext(data)}`,
        },
        // 2 — DATA_MODEL.md
        {
            system: `You are a world-class database architect. Generate a DATA_MODEL.md file. Agents must reference this file before writing any backend logic or UI data binding. If a variable isn't here, it doesn't exist. Output must be clean Markdown.

Structure:
- **Database Type**: Relational (SQL) or Document (NoSQL).
- **Entities/Tables**: List every required table.
- **Schema Definition**: For each entity: Field Name (exact casing), Data Type, Constraints (PK, FK, Nullable, Unique).
- **Relationships**: Explicitly state 1:1, 1:Many, or Many:Many connections.

Be consistent with the mission and form data. Use the tech stack DB choice from form data.`,
            user: `Generate DATA_MODEL.md.\n\nCLIENT DATA:\n${formContext(data)}\n\nMISSION.md (already generated):\n${previousFiles["MISSION.md"] || "N/A"}`,
        },
        // 3 — TECH_STACK.md
        {
            system: `You are a world-class DevOps architect. Generate a TECH_STACK.md file. This file prevents agents from importing random libraries or using deprecated syntaxes. Output in clean Markdown.

Structure:
- **Core Stack**: Exact language and framework versions.
- **Approved Libraries**: A whitelist of acceptable third-party packages. Rule: If it's not on the whitelist, agents cannot install it without throwing an error.
- **Authentication**: The specific auth provider and method.
- **Hosting/Deployment**: Target environment to ensure build compatibility.

Use the client's stated tech preferences. Add sensible library recommendations that align with the chosen stack.`,
            user: `Generate TECH_STACK.md.\n\nCLIENT DATA:\n${formContext(data)}\n\nDATA_MODEL.md:\n${previousFiles["DATA_MODEL.md"] || "N/A"}`,
        },
        // 4 — SKILLS.md
        {
            system: `You are the Lead Architect. Based on the client's MISSION.md and the selected TECH_STACK.md, generate a SKILLS.md file. Do NOT list basic programming competencies. This file must define the highly specialized, domain-specific execution standards and algorithmic proficiencies the AI agents must strictly adhere to during development.

Structure the file exactly as follows:

1. Domain Expertise Requirements

Identify any industry-specific knowledge required (e.g., HIPAA compliance, fintech security standards, e-commerce conversion optimization).

State exactly how this knowledge must be applied to the code.

2. Technical Focus Areas

Based on the TECH_STACK.md, define the advanced patterns required (e.g., 'Do not use standard React state for this; prioritize advanced server-side data mutation using Next.js Server Actions').

3. Security & Architecture Proficiencies

List the exact security paradigms the agents must prioritize (e.g., Supabase RLS policies, zero-trust architecture, input sanitization against SQL injection).

4. UX/Accessibility Standards

Define the strict usability frameworks required by the target audience (e.g., 'Mobile-first localized touch targets,' 'Screen-reader optimized DOM structure').

Output ONLY valid Markdown. Be concise, highly technical, and strictly aligned with the core problem.`,
            user: `Generate SKILLS.md.\n\nCLIENT DATA:\n${formContext(data)}\n\nMISSION.md:\n${previousFiles["MISSION.md"] || "N/A"}\n\nTECH_STACK.md:\n${previousFiles["TECH_STACK.md"] || "N/A"}`,
        },
        // 5 — USER_FLOWS.md
        {
            system: `You are a UX architect. Generate USER_FLOWS.md. This dictates how the user moves through the app and connects the UI to the Data Model. Output in clean Markdown.

Structure:
- **Entry Points**: Where does the flow begin?
- **Step-by-Step State Changes**: Detail the exact sequence for each major flow.
- **Error Handling Paths**: What the system does when a flow fails.

Reference the data model entities and the mission to ensure consistency.`,
            user: `Generate USER_FLOWS.md.\n\nDATA_MODEL.md:\n${previousFiles["DATA_MODEL.md"] || "N/A"}\n\nMISSION.md:\n${previousFiles["MISSION.md"] || "N/A"}`,
        },
        // 6 — UI.md
        {
            system: `You are a senior UI/UX designer. Generate UI.md. This file is strictly for presentation logic — it does NOT contain database queries or business logic. Output in clean Markdown.

Structure:
- **Design System / Component Library**: Specify the component framework.
- **Color Palette**: Exact hex codes for Primary, Secondary, Accent, Background, Error, and Success states.
- **Typography**: Font families, sizes (H1-H6, body), and weights.
- **Layout Rules**: Mobile-first directives, grid/flexbox standards, padding/margin scales.

CRITICAL GOVERNANCE RULE: The component library you specify MUST be consistent with TECH_STACK.md. If TECH_STACK.md mandates Pure Tailwind CSS, do NOT reference shadcn/ui, Radix UI, or any other component library. Use only what is whitelisted in the tech stack.

Align with the client's design style preference and brand voice.`,
            user: `Generate UI.md.\n\nCLIENT DATA:\n${formContext(data)}\n\nUSER_FLOWS.md:\n${previousFiles["USER_FLOWS.md"] || "N/A"}\n\nTECH_STACK.md (for component library compliance):\n${previousFiles["TECH_STACK.md"] || "N/A"}`,
        },
        // 7 — ROADMAP.md
        {
            system: `You are a technical project manager. Generate ROADMAP.md. This prevents agents from trying to build the roof before the foundation. It forces sequential execution. Output in clean Markdown.

Structure:
- **Phase 1: Infrastructure & Schema**: Setup DB, configure repo, establish basic routing.
- **Phase 2: Authentication**: Login, registration, session management.
- **Phase 3: Core CRUD Operations**: The primary logic.
- **Phase 4: UI/UX Polish**: Applying UI.md rules and BRAND_VOICE.md copy.
- **Execution Rule**: Agents must complete and pass tests for Phase N before reading instructions for Phase N+1.

Reference ALL prior files to create a coherent plan.`,
            user: `Generate ROADMAP.md.\n\nMISSION.md:\n${previousFiles["MISSION.md"] || "N/A"}\n\nDATA_MODEL.md:\n${previousFiles["DATA_MODEL.md"] || "N/A"}\n\nTECH_STACK.md:\n${previousFiles["TECH_STACK.md"] || "N/A"}\n\nUSER_FLOWS.md:\n${previousFiles["USER_FLOWS.md"] || "N/A"}\n\nUI.md:\n${previousFiles["UI.md"] || "N/A"}`,
        },
        // 8 — TESTING.md
        {
            system: `You are a QA engineering lead. Generate TESTING.md. This is the safety net against LLM hallucinations where the agent claims code works but it doesn't compile. Output in clean Markdown.

Structure:
- **TDD Mandate**: Agents must write the test script before the component logic.
- **Unit Tests**: What logic must be isolated and tested.
- **Integration Tests**: Specific flows that must be tested end-to-end.
- **Testing Frameworks**: Specify exact tools (Jest, Cypress, Playwright, etc.).

CRITICAL GOVERNANCE RULE: The test database environment MUST match the production database engine specified in DATA_MODEL.md and TECH_STACK.md. If the project uses PostgreSQL with extensions like pgvector, the test environment MUST use PostgreSQL — NOT SQLite or any other substitute. This is a non-negotiable kill-switch rule from GOVERNANCE.md.

Reference the data model and user flows to identify what needs testing.`,
            user: `Generate TESTING.md.\n\nDATA_MODEL.md:\n${previousFiles["DATA_MODEL.md"] || "N/A"}\n\nUSER_FLOWS.md:\n${previousFiles["USER_FLOWS.md"] || "N/A"}\n\nTECH_STACK.md (for database engine compliance):\n${previousFiles["TECH_STACK.md"] || "N/A"}`,
        },
        // 9 — AGENTS.md
        {
            system: `You are an AI systems architect. Generate AGENTS.md for the Antigravity IDE agent workforce. Output in clean Markdown.

Structure:
- **Agent Roster**: Name and primary function for each agent (e.g., DB_Architect, Frontend_Dev, QA_Engineer).
- **Read/Write Permissions**: Which files each agent can read vs. modify.
- **Handoff Protocols**: How agents communicate (e.g., pings, pass/fail logs).

IMPORTANT: Include an "Agent_Architect" agent whose sole role is governance enforcement. This agent has READ access to ALL files and WRITE access to NONE. Before any other agent commits code, Agent_Architect must validate it against the GOVERNANCE.md hierarchy and kill-switch rules.

DYNAMISM: Analyze the project description and tech stack. If the project requires specialized knowledge (e.g., 3D graphics, crypto, data science), create a specialized agent role for it (e.g., "Physics_Specialist", "SmartContract_Auditor", "DataScience_Lead").

Reference the tech stack and roadmap to define appropriate agent roles.`,
            user: `Generate AGENTS.md.\n\nPROJECT DESCRIPTION:\n${data.description}\n\nTECH_STACK.md:\n${previousFiles["TECH_STACK.md"] || "N/A"}\n\nSKILLS.md:\n${previousFiles["SKILLS.md"] || "N/A"}\n\nROADMAP.md:\n${previousFiles["ROADMAP.md"] || "N/A"}`,
        },
        // 10 — BRAND_VOICE.md
        {
            system: `You are a brand strategist and copywriter. Generate BRAND_VOICE.md. This ensures all generated copy — from landing pages to error toasts — sounds like the client's brand. Output in clean Markdown.

Structure:
- **Tone Descriptors**: e.g., "Professional but warm," "Highly technical and concise."
- **Vocabulary**: Words to use and words to avoid.
- **System Messages**: Instructions for writing error messages, success states, and microcopy.

Use the brandbook text (if available) and form data to capture the authentic brand voice.`,
            user: `Generate BRAND_VOICE.md.\n\nCLIENT DATA:\n${formContext(data)}\n\n${data.brandbook_text ? `BRANDBOOK EXTRACTED TEXT:\n${data.brandbook_text}` : "No brandbook was provided."}`,
        },
        // 11 — CONSTRAINTS.md
        {
            system: `You are a senior engineering lead. Generate CONSTRAINTS.md. This is the strict "Do Not" list, critical for controlling LLM behavior. Output in clean Markdown.

Structure:
- **No Synthetic Data in UI**: Real data or empty states only. No "John Doe" or lorem ipsum.
- **No Unapproved APIs**: Do not hallucinate API endpoints; use only what is defined.
- **Code Style Limits**: e.g., maximum file length, naming conventions.
- **Performance Budgets**: e.g., image optimization, no synchronous blocking scripts.

MANDATORY KILL-SWITCH CONSTRAINTS — You MUST include all of the following as explicit, non-negotiable rules:
1. **No Unauthorized UI Libraries**: If TECH_STACK.md specifies a CSS solution, agents must NOT use shadcn/ui, Radix UI, or any component library not whitelisted in TECH_STACK.md.
2. **Auth Token Storage**: Authentication tokens must NEVER be stored in localStorage or frontend memory. Only secure, HTTP-only cookies are permitted.
3. **3D Physics Engine**: If the project uses 3D, only @react-three/rapier is allowed. @react-three/cannon is strictly forbidden.
4. **Database Parity**: The test database must match the production database engine. If using PostgreSQL with pgvector, SQLite is disqualified as a test database.

Add security constraints from the client's privacy/security needs and align with the tech stack.`,
            user: `Generate CONSTRAINTS.md.\n\nCLIENT DATA (Security Needs):\n${data.data_privacy_security}\n\nTECH_STACK.md:\n${previousFiles["TECH_STACK.md"] || "N/A"}\n\nGOVERNANCE.md:\n${previousFiles["GOVERNANCE.md"] || "N/A"}`,
        },
        // 12 — NEXT_STEPS.md
        {
            system: `You are a senior project onboarding specialist. Generate a NEXT_STEPS.md file that serves as the "Getting Started" guide for loading this project into the Antigravity IDE and beginning the build process.

Structure:
1. **Load Governance First** — Instruct the agent to load GOVERNANCE.md BEFORE any other file. This establishes the Source of Truth hierarchy and kill-switch rules that govern all subsequent file reading.

2. **Load Architecture Files** — Step-by-step instructions to load all architecture files into the IDE workspace in the correct reading order, organized by the governance folder structure:
   - 01_GOVERNANCE/: GOVERNANCE.md → TECH_STACK.md → MISSION.md → SKILLS.md → CONSTRAINTS.md
   - 02_DATA_SCHEMA/: DATA_MODEL.md
   - 03_IMPLEMENTATION/: USER_FLOWS.md → UI.md → AGENTS.md → BRAND_VOICE.md
   - 04_OPERATIONS/: TESTING.md → ROADMAP.md → NEXT_STEPS.md

3. **Review the Research Report** — Instructions to review the research report that informed the architecture decisions.

4. **Start the Build** — A ready-to-paste prompt for the IDE composer that instructs agents to read all files in sequence and begin Phase 1 of the ROADMAP. The prompt MUST enforce:
   - Load GOVERNANCE.md first and acknowledge the priority hierarchy
   - Only use TECH_STACK.md technologies (Level 1 authority)
   - Apply SKILLS.md standards (Level 3 authority)
   - Write tests per TESTING.md using the correct database engine
   - Respect CONSTRAINTS.md guardrails and kill-switch rules
   - Match BRAND_VOICE.md for copy

5. **Stack Audit Protocol** — Include the verification checklist that must run before every commit:
   - "Does this code use any library not in TECH_STACK.md?"
   - "Does this authentication flow use localStorage?"
   - "Is this 3D component using rapier (not cannon)?"
   - "Does the test environment match the production database engine?"

6. **Review Scores** — Instructions pointing the user to review iteration scores.

Reference the actual file names and reading order from the project. Be concise and actionable.`,
            user: `Generate NEXT_STEPS.md.\n\nPROJECT NAME: ${data.project_name}\n\nGOVERNANCE.md:\n${previousFiles["GOVERNANCE.md"] || "N/A"}\n\nROADMAP.md:\n${previousFiles["ROADMAP.md"] || "N/A"}\n\nTECH_STACK.md:\n${previousFiles["TECH_STACK.md"] || "N/A"}\n\nAGENTS.md:\n${previousFiles["AGENTS.md"] || "N/A"}\n\nAll architecture files generated:\n${Object.keys(previousFiles).join(", ")}`,
        },
    ];

    return prompts[fileIndex];
}
