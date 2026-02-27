export interface ProjectHistory {
  id: string;
  name: string;
  timestamp: string;
  status: "draft" | "complete" | "in-progress";
}

export const mockProjectHistory: ProjectHistory[] = [
  { id: "1", name: "SaaS Analytics Platform", timestamp: "2 days ago", status: "complete" },
  { id: "2", name: "E-Commerce Rebrand v3", timestamp: "5 days ago", status: "complete" },
  { id: "3", name: "Mobile Fitness Tracker", timestamp: "1 week ago", status: "draft" },
  { id: "4", name: "AI Chatbot Integration", timestamp: "2 weeks ago", status: "complete" },
  { id: "5", name: "Internal Dashboard MVP", timestamp: "3 weeks ago", status: "in-progress" },
];

export interface ConflictScenario {
  id: string;
  fieldA: string;
  valueA: string;
  fieldB: string;
  valueB: string;
  description: string;
  options: string[];
}

export const mockConflicts: ConflictScenario[] = [
  {
    id: "conflict-1",
    fieldA: "Audio Transcript",
    valueA: "Native mobile app with push notifications",
    fieldB: "Platform Selection",
    valueB: "Web Application Only",
    description: "Audio mentions 'mobile app' but form specifies 'Web Only'",
    options: ["Web Application Only", "Native Mobile App", "Progressive Web App (PWA)", "Both Web + Mobile"],
  },
  {
    id: "conflict-2",
    fieldA: "Description",
    valueA: "Simple landing page with contact form",
    fieldB: "Tech Stack",
    valueB: "Microservices with Kubernetes",
    description: "Project scope suggests simple site but tech stack is enterprise-grade",
    options: ["Simplify to static site", "Keep microservices architecture", "Use serverless functions"],
  },
];

export const mockTerminalEntries: string[] = [
  "[system] > Initializing Project Translator v2.1...",
  "[system] > Loading AI models: Gemini Pro, Whisper...",
  "[gemini] > Analyzing project description...",
  "[gemini] > Identified 4 core features, 2 integrations",
  "[whisper] > Audio transcription complete (3:42 duration)",
  "[gemini] > Cross-referencing audio with form inputs...",
  "[system] ⚠ Conflict detected: Platform mismatch (see Resolution panel)",
  "[gemini] > Generating MISSION.md draft...",
  "[gemini] > Generating TECH_STACK.md draft...",
  "[gemini] > Generating AGENTS.md — 7 agent roles identified",
  "[system] > All 9 documents generated successfully",
  "[system] > Ready for review. Type 'refine <section>' to iterate.",
];

export const mockMarkdownFiles: Record<string, { title: string; content: string }> = {
  "project.md": {
    title: "project.md",
    content: `# Project: SaaS Analytics Platform\n\n## Overview\nA real-time analytics dashboard for SaaS metrics.\n\n## Goals\n- Track MRR, churn, and LTV\n- Real-time event streaming\n- Custom report builder\n\n## Timeline\nMVP: 8 weeks | Full Launch: 14 weeks`,
  },
  "AGENTS.md": {
    title: "AGENTS.md",
    content: `# Agent Roles\n\n| Agent | Role | Responsibility |\n|-------|------|---------------|\n| Architect | Lead | System design, tech decisions |\n| Frontend | Builder | UI components, state management |\n| Backend | Builder | API, database, auth |\n| QA | Validator | Testing, edge cases |\n| DevOps | Infra | CI/CD, monitoring |`,
  },
  "MISSION.md": {
    title: "MISSION.md",
    content: `# Mission Statement\n\n**Core Problem:** SaaS founders lack real-time visibility into key metrics.\n\n**Solution:** A purpose-built analytics platform that aggregates Stripe, Auth, and product events into a single dashboard.\n\n**Success Criteria:**\n- Sub-second data refresh\n- Zero-config Stripe integration\n- Mobile-responsive charts`,
  },
  "TECH_STACK.md": {
    title: "TECH_STACK.md",
    content: `# Technology Stack\n\n## Frontend\n- React 18 + TypeScript\n- Tailwind CSS + shadcn/ui\n- Recharts for data visualization\n\n## Backend\n- Supabase (PostgreSQL + Auth + Realtime)\n- Edge Functions (Deno)\n\n## Infrastructure\n- Vercel (Frontend hosting)\n- Supabase Cloud (Backend)`,
  },
  "BRAND_VOICE.md": {
    title: "BRAND_VOICE.md",
    content: `# Brand Voice Guide\n\n**Tone:** Professional, precise, empowering\n**Vocabulary:** Data-driven, actionable, clear\n**Avoid:** Jargon overload, passive voice, vague promises\n\n## Examples\n✅ "Your MRR grew 12% this month"\n❌ "Metrics are looking generally positive"`,
  },
  "MEMORY.md": {
    title: "MEMORY.md",
    content: `# Project Memory\n\n## Key Decisions\n1. Chose Supabase over Firebase for better SQL support\n2. Rejected GraphQL — REST is sufficient for MVP\n3. Mobile-first responsive, not native app\n\n## Constraints\n- Budget: $500/mo infrastructure\n- Team: 2 developers\n- Timeline: 8-week MVP`,
  },
  "ROADMAP.md": {
    title: "ROADMAP.md",
    content: `# Development Roadmap\n\n## Phase 1: Foundation (Weeks 1-3)\n- [ ] Auth system\n- [ ] Database schema\n- [ ] Basic dashboard layout\n\n## Phase 2: Core Features (Weeks 4-6)\n- [ ] Stripe integration\n- [ ] Real-time charts\n- [ ] Event tracking\n\n## Phase 3: Polish (Weeks 7-8)\n- [ ] Custom reports\n- [ ] Email alerts\n- [ ] Performance optimization`,
  },
  "ADR.md": {
    title: "ADR.md",
    content: `# Architecture Decision Records\n\n## ADR-001: Database Choice\n**Decision:** Supabase PostgreSQL\n**Rationale:** SQL queries for analytics, built-in auth, realtime subscriptions\n**Alternatives Considered:** Firebase, PlanetScale\n\n## ADR-002: State Management\n**Decision:** TanStack Query + Zustand\n**Rationale:** Server state separated from client state`,
  },
  "TESTING.md": {
    title: "TESTING.md",
    content: `# Testing Strategy\n\n## Unit Tests\n- Vitest for component and utility testing\n- 80% coverage target for business logic\n\n## Integration Tests\n- API endpoint testing with supertest\n- Database migration testing\n\n## E2E Tests\n- Playwright for critical user flows\n- Smoke tests on every deploy`,
  },
};
