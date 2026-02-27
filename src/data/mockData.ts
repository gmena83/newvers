// Agent nodes for the orchestra
export interface AgentNode {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "processing";
  instrument: string;
  color: string;
}

export const agentNodes: AgentNode[] = [
  { id: "openai", name: "OpenAI", role: "Lead Composer", status: "active", instrument: "Piano", color: "#10a37f" },
  { id: "anthropic", name: "Anthropic", role: "Harmony Specialist", status: "active", instrument: "Violin", color: "#d4a574" },
  { id: "perplexity", name: "Perplexity", role: "Research Scout", status: "processing", instrument: "Telescope", color: "#20b2aa" },
  { id: "elevenlabs", name: "ElevenLabs", role: "Voice Virtuoso", status: "active", instrument: "Microphone", color: "#f59e0b" },
  { id: "firebase", name: "Firebase", role: "Infrastructure Bass", status: "active", instrument: "Drums", color: "#ff9100" },
  { id: "supabase", name: "Supabase", role: "Data Architect", status: "idle", instrument: "Database", color: "#3ecf8e" },
  { id: "activepieces", name: "Activepieces", role: "Flow Conductor", status: "active", instrument: "Baton", color: "#6c5ce7" },
];

// Communication Hub mock emails
export interface EmailEntry {
  id: string;
  recipient: string;
  subject: string;
  timestamp: string;
  status: "delivered" | "opened" | "bounced";
  openRate: number;
}

export const mockEmails: EmailEntry[] = [
  { id: "1", recipient: "cto@techstartup.io", subject: "Q4 Product Roadmap — AI Integration Brief", timestamp: "2 min ago", status: "opened", openRate: 78 },
  { id: "2", recipient: "founders@venturelab.co", subject: "Weekly Sprint Summary #47", timestamp: "8 min ago", status: "delivered", openRate: 64 },
  { id: "3", recipient: "team@devops.cloud", subject: "Infrastructure Alert — Scaling Event", timestamp: "15 min ago", status: "opened", openRate: 91 },
  { id: "4", recipient: "investor@seedfund.vc", subject: "Monthly Metrics Dashboard", timestamp: "22 min ago", status: "delivered", openRate: 55 },
  { id: "5", recipient: "support@clientco.com", subject: "Onboarding Sequence — Step 3", timestamp: "31 min ago", status: "bounced", openRate: 0 },
  { id: "6", recipient: "marketing@growthlab.io", subject: "Campaign Performance Report", timestamp: "45 min ago", status: "opened", openRate: 82 },
  { id: "7", recipient: "eng@platform.dev", subject: "API Rate Limit Notification", timestamp: "1 hr ago", status: "delivered", openRate: 71 },
];

// Branded Herald ticker
export interface BrandedLink {
  id: string;
  shortUrl: string;
  destination: string;
  clicks: number;
}

export const mockLinks: BrandedLink[] = [
  { id: "1", shortUrl: "mena.to/launch", destination: "Product Launch Page", clicks: 2847 },
  { id: "2", shortUrl: "mena.to/demo", destination: "Live Demo Booking", clicks: 1523 },
  { id: "3", shortUrl: "mena.to/pitch", destination: "Investor Pitch Deck", clicks: 967 },
  { id: "4", shortUrl: "mena.to/docs", destination: "API Documentation", clicks: 4291 },
  { id: "5", shortUrl: "mena.to/blog", destination: "Tech Blog Post", clicks: 1876 },
  { id: "6", shortUrl: "mena.to/status", destination: "System Status Page", clicks: 3105 },
];

// Overture — Market Research
export interface ResearchEntry {
  id: string;
  source: "perplexity" | "firecrawl";
  title: string;
  snippet: string;
  relevance: number;
  citation: string;
}

export const mockResearch: ResearchEntry[] = [
  { id: "1", source: "perplexity", title: "AI Agent Market Growth 2026", snippet: "The global AI agent market is projected to reach $65B by 2028, with compound annual growth of 43%.", relevance: 96, citation: "McKinsey Digital Report" },
  { id: "2", source: "firecrawl", title: "Competitor Feature Matrix", snippet: "Analysis of 12 competing platforms reveals gaps in orchestration and multi-agent coordination.", relevance: 89, citation: "firecrawl.dev/scan" },
  { id: "3", source: "perplexity", title: "Enterprise Adoption Trends", snippet: "78% of Fortune 500 companies plan to deploy AI agent systems within 18 months.", relevance: 92, citation: "Gartner 2026 Survey" },
  { id: "4", source: "firecrawl", title: "Pricing Benchmark Analysis", snippet: "Average SaaS pricing for AI orchestration tools ranges from $99-$499/mo for startup tiers.", relevance: 85, citation: "firecrawl.dev/pricing-scan" },
];

// Foundation — Infrastructure Health
export interface HealthMetric {
  service: string;
  uptime: number;
  latency: number;
  connections: number;
  status: "healthy" | "degraded" | "down";
}

export const mockHealth: HealthMetric[] = [
  { service: "Firebase Auth", uptime: 99.98, latency: 23, connections: 1247, status: "healthy" },
  { service: "Supabase DB", uptime: 99.95, latency: 12, connections: 892, status: "healthy" },
  { service: "Firebase Storage", uptime: 99.91, latency: 45, connections: 234, status: "healthy" },
  { service: "Supabase Realtime", uptime: 99.87, latency: 8, connections: 567, status: "degraded" },
];

export interface DocumentJob {
  id: string;
  name: string;
  status: "queued" | "processing" | "complete";
  progress: number;
}

export const mockDocuments: DocumentJob[] = [
  { id: "1", name: "Q4_Financial_Report.pdf", status: "complete", progress: 100 },
  { id: "2", name: "Legal_Contract_Draft.pdf", status: "processing", progress: 67 },
  { id: "3", name: "Technical_Spec_v3.pdf", status: "processing", progress: 34 },
  { id: "4", name: "Brand_Guidelines.pdf", status: "queued", progress: 0 },
];

// Crescendo — Dev Operations
export const mockTerminalLogs: string[] = [
  "[jules] ✓ Build #847 passed — 0 errors, 2 warnings",
  "[jules] → Deploying edge function: payment-webhook",
  "[jules] ✓ Migration 024_add_analytics applied successfully",
  "[jules] → Running test suite: 147/147 passed",
  "[jules] ✓ SSL certificate renewed for *.menatech.cloud",
  "[jules] → Optimizing bundle: 2.3MB → 890KB (-61%)",
  "[jules] ✓ CDN cache purged across 14 edge locations",
  "[jules] → Scanning dependencies for vulnerabilities...",
];

export interface WorkflowStep {
  id: string;
  name: string;
  trigger: string;
  status: "active" | "completed" | "waiting";
  steps: number;
  completedSteps: number;
}

export const mockWorkflows: WorkflowStep[] = [
  { id: "1", name: "New User Onboarding", trigger: "User Signup", status: "active", steps: 5, completedSteps: 3 },
  { id: "2", name: "Invoice Generation", trigger: "Monthly Cron", status: "completed", steps: 4, completedSteps: 4 },
  { id: "3", name: "Slack Alert Pipeline", trigger: "Error Threshold", status: "waiting", steps: 3, completedSteps: 0 },
  { id: "4", name: "Data Sync Flow", trigger: "Webhook", status: "active", steps: 6, completedSteps: 4 },
];

// Visual Soul — UI Gallery
export interface UIComponent {
  id: string;
  name: string;
  source: string;
  category: string;
  gradient: string;
}

export const mockUIComponents: UIComponent[] = [
  { id: "1", name: "Hero Section", source: "21st.dev", category: "Layout", gradient: "from-primary/20 to-accent/10" },
  { id: "2", name: "Pricing Table", source: "21st.dev", category: "Commerce", gradient: "from-gemini/20 to-primary/10" },
  { id: "3", name: "Auth Modal", source: "Nano Banana", category: "Auth", gradient: "from-accent/20 to-gemini/10" },
  { id: "4", name: "Dashboard Card", source: "21st.dev", category: "Data", gradient: "from-primary/20 to-gemini/10" },
  { id: "5", name: "Chat Widget", source: "Nano Banana", category: "AI", gradient: "from-gemini/20 to-accent/10" },
  { id: "6", name: "Analytics Chart", source: "21st.dev", category: "Data", gradient: "from-accent/20 to-primary/10" },
];

// Turbo Mode -- Terminal Logs
export const turboTerminalLogs: string[] = [
  "[System] ▸ Symphony execution initiated",
  "[System] ▸ Parsing input for Brand URL and Project Type...",
  "[Perplexity] ▸ Analyzing market fit and competitive landscape...",
  "[Supabase] ▸ Provisioning database schema and RLS policies...",
  "[Perplexity] ▸ Extracting brand DNA from target URL...",
  "[Firecrawl] ▸ Crawling sitemap for design patterns...",
  "[Supabase] ▸ Auth tables configured — email + OAuth providers",
  "[Perplexity] ✓ Market research complete — 96% relevance score",
  "[OpenAI] ▸ Generating product copy and brand voice...",
  "[Anthropic] ▸ Architecting component hierarchy and routing...",
  "[Supabase] ✓ Foundation schema deployed — 4 tables, 12 policies",
  "[OpenAI] ▸ Crafting landing page sections (Hero, Features, CTA)...",
  "[Anthropic] ▸ Defining API contracts and type interfaces...",
  "[ElevenLabs] ▸ Synthesizing brand audio signature...",
  "[Firebase] ▸ Configuring hosting and CDN edge rules...",
  "[OpenAI] ✓ Copy generation complete — 3 variants produced",
  "[Anthropic] ✓ Architecture spec finalized — 14 components",
  "[Activepieces] ▸ Wiring automation flows (onboarding, billing)...",
  "[Jules] ▸ Refactoring auth middleware and rate limiting...",
  "[ElevenLabs] ✓ Audio assets rendered — 2 voice profiles",
  "[Firebase] ✓ Deployment pipeline active — 6 edge locations",
  "[Activepieces] ✓ 3 automation flows configured and tested",
  "[System] ✓ Symphony complete — all movements finalized",
];

// Turbo Mode -- Phases
export interface TurboPhase {
  name: string;
  agents: string[];
  targetCompletion: number;
}

export const turboPhases: TurboPhase[] = [
  { name: "Overture — Research", agents: ["perplexity", "supabase"], targetCompletion: 20 },
  { name: "Visual Soul — Design", agents: ["openai", "anthropic"], targetCompletion: 40 },
  { name: "Foundation — Infrastructure", agents: ["elevenlabs", "firebase"], targetCompletion: 60 },
  { name: "Crescendo — Integration", agents: ["activepieces"], targetCompletion: 80 },
  { name: "Ovation — Complete", agents: [], targetCompletion: 100 },
];
