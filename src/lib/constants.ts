export interface GeneratedFile {
    name: string;
    label: string;
    description: string;
    folder: string;
    dependsOn: string[];
}

export const FILE_ORDER: GeneratedFile[] = [
    {
        name: "GOVERNANCE.md",
        label: "Governance",
        description: "Priority hierarchy, kill-switch rules, and verification protocol",
        folder: "01_GOVERNANCE",
        dependsOn: [],
    },
    {
        name: "MISSION.md",
        label: "Mission",
        description: "Defines the strict boundaries of the MVP",
        folder: "01_GOVERNANCE",
        dependsOn: ["GOVERNANCE.md"],
    },
    {
        name: "DATA_MODEL.md",
        label: "Data Model",
        description: "The single source of truth for all data structures",
        folder: "02_DATA_SCHEMA",
        dependsOn: ["MISSION.md"],
    },
    {
        name: "TECH_STACK.md",
        label: "Tech Stack",
        description: "Approved tools and frameworks",
        folder: "01_GOVERNANCE",
        dependsOn: ["DATA_MODEL.md"],
    },
    {
        name: "SKILLS.md",
        label: "Skills",
        description: "Specialized domain expertise and execution standards for AI agents",
        folder: "01_GOVERNANCE",
        dependsOn: ["MISSION.md", "TECH_STACK.md"],
    },
    {
        name: "USER_FLOWS.md",
        label: "User Flows",
        description: "How users move through the application",
        folder: "03_IMPLEMENTATION",
        dependsOn: ["DATA_MODEL.md", "MISSION.md"],
    },
    {
        name: "UI.md",
        label: "UI",
        description: "Visual rules and design system",
        folder: "03_IMPLEMENTATION",
        dependsOn: ["USER_FLOWS.md"],
    },
    {
        name: "ROADMAP.md",
        label: "Roadmap",
        description: "Sequential execution phases",
        folder: "04_OPERATIONS",
        dependsOn: ["MISSION.md", "DATA_MODEL.md", "TECH_STACK.md", "USER_FLOWS.md", "UI.md"],
    },
    {
        name: "TESTING.md",
        label: "Testing",
        description: "Quality assurance rules and frameworks",
        folder: "04_OPERATIONS",
        dependsOn: ["DATA_MODEL.md", "USER_FLOWS.md"],
    },
    {
        name: "AGENTS.md",
        label: "Agents",
        description: "LLM workforce roles and boundaries",
        folder: "03_IMPLEMENTATION",
        dependsOn: ["TECH_STACK.md", "SKILLS.md", "ROADMAP.md"],
    },
    {
        name: "BRAND_VOICE.md",
        label: "Brand Voice",
        description: "Tone, vocabulary, and communication style",
        folder: "03_IMPLEMENTATION",
        dependsOn: [],
    },
    {
        name: "CONSTRAINTS.md",
        label: "Constraints",
        description: "Guardrails and strict restrictions",
        folder: "01_GOVERNANCE",
        dependsOn: ["TECH_STACK.md"],
    },
    {
        name: "NEXT_STEPS.md",
        label: "Next Steps",
        description: "IDE loading instructions and build kickoff prompt",
        folder: "04_OPERATIONS",
        dependsOn: ["ROADMAP.md", "TECH_STACK.md", "AGENTS.md"],
    },
];

// Define dependency groups for parallel processing
export const PARALLEL_GROUPS = [
    // Batch 1: Governance & Mission (Sequential foundation)
    ["GOVERNANCE.md"],
    ["MISSION.md"],

    // Batch 2: Data Model (Crucial dependency for many)
    ["DATA_MODEL.md"],

    // Batch 3: Tech Stack (Depends on Data Model)
    ["TECH_STACK.md"],

    // Batch 4: Parallelizable Core Logic
    ["SKILLS.md", "USER_FLOWS.md", "CONSTRAINTS.md"],

    // Batch 5: Implementation Details
    ["UI.md", "AGENTS.md", "TESTING.md", "BRAND_VOICE.md"],

    // Batch 6: Operations & Roadmap
    ["ROADMAP.md"],

    // Batch 7: Final Instructions
    ["NEXT_STEPS.md"]
];

export const BRAND_VOICE_OPTIONS = [
    "Professional & Warm",
    "Highly Technical & Concise",
    "Playful & Energetic",
    "Authoritative & Trustworthy",
    "Casual & Friendly",
    "Luxury & Premium",
    "Custom",
];

export const DESIGN_STYLE_OPTIONS = [
    "Modern Minimalist",
    "Glassmorphism",
    "Neubrutalism",
    "Corporate Clean",
    "Gradient-Heavy / Vibrant",
    "Dark Mode Engineering",
    "Soft / Organic",
    "Custom",
];

export const COMMUNICATION_STYLE_OPTIONS = [
    "Formal",
    "Semi-Formal",
    "Conversational",
    "Technical",
    "Custom",
];

export const TECH_OPTIONS = {
    frontend: ["Next.js", "React", "Vue.js", "Angular", "Svelte", "Astro", "Other"],
    backend: ["Node.js", "Python (Django/Flask)", "Go", "Ruby on Rails", "Java (Spring)", "Other"],
    database: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase", "PlanetScale", "Other"],
    hosting: ["Vercel", "Netlify", "AWS", "Google Cloud", "Railway", "Render", "Other"],
};
