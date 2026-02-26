"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, FileText, Cpu, HelpCircle, Package, Rocket } from "lucide-react";

interface Project {
    id: string;
    project_name: string;
    status: string;
    created_at: string;
}

const NAV_ITEMS = [
    { id: "details", label: "Mission & Details", icon: FileText },
    { id: "tech", label: "Tech Stack", icon: Cpu },
    { id: "questions", label: "Guiding Questions", icon: HelpCircle },
    { id: "output", label: "Output Generated", icon: Package },
];

interface SidebarProps {
    activeSection: string;
    onSectionClick: (id: string) => void;
    onNewProject: () => void;
    activeProjectId: string | null;
    onProjectSelect: (id: string) => void;
}

export default function Sidebar({
    activeSection,
    onSectionClick,
    onNewProject,
    activeProjectId,
    onProjectSelect,
}: SidebarProps) {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        async function loadProjects() {
            if (!supabase) return;
            try {
                const { data } = await supabase
                    .from("projects")
                    .select("id, project_name, status, created_at")
                    .order("created_at", { ascending: false })
                    .limit(10);
                if (data) setProjects(data);
            } catch {
                // Supabase table may not exist — silently ignore
            }
        }
        loadProjects();
    }, []);

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            complete: { label: "Complete", cls: "badge-complete" },
            generating: { label: "In Progress", cls: "badge-progress" },
            intake_complete: { label: "Ready", cls: "badge-ready" },
            draft: { label: "Draft", cls: "badge-draft" },
        };
        const s = map[status] || map.draft!;
        return <span className={`sidebar-badge ${s.cls}`}>{s.label}</span>;
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-header">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                        <Rocket className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-foreground">Project Translator</div>
                        <div className="text-[10px] text-muted">Structured intake for airtight project documentation</div>
                    </div>
                </div>
            </div>

            {/* New Project */}
            <button onClick={onNewProject} className="sidebar-new-btn">
                <Plus className="h-4 w-4" />
                + New Project
            </button>

            {/* Flight Check */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">FLIGHT CHECK</div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSectionClick(item.id)}
                                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* History */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">HISTORY</div>
                <div className="sidebar-history">
                    {projects.length === 0 && (
                        <p className="text-xs text-muted px-2">No projects yet</p>
                    )}
                    {projects.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onProjectSelect(p.id)}
                            className={`sidebar-history-item ${activeProjectId === p.id ? "active" : ""}`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted shrink-0" />
                                <span className="truncate text-sm">{p.project_name || "Untitled"}</span>
                            </div>
                            {statusBadge(p.status)}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
