"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FILE_ORDER } from "@/lib/constants";
import FileCard from "@/components/FileCard";
import MarkdownModal from "@/components/MarkdownModal";
import ExportActions from "@/components/ExportActions";
import { motion } from "framer-motion";
import { Layers, Loader2 } from "lucide-react";

interface Project {
    id: string;
    project_name: string;
    generated_files: Record<string, string>;
}

export default function DashboardPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState<{
        name: string;
        content: string;
    } | null>(null);

    useEffect(() => {
        async function load() {
            if (!supabase) {
                console.error("Supabase is not configured");
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from("projects")
                .select("id, project_name, generated_files")
                .eq("id", projectId)
                .single();

            if (error) {
                console.error("Failed to load project:", error);
            } else {
                setProject(data);
            }
            setLoading(false);
        }
        load();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center pt-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-screen items-center justify-center pt-16">
                <p className="text-muted">Project not found.</p>
            </div>
        );
    }

    const files = project.generated_files || {};

    return (
        <div className="relative min-h-screen pt-24 pb-16">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/3 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[120px]" />
                <div className="absolute bottom-20 right-0 h-[300px] w-[300px] rounded-full bg-accent/6 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-4 py-1.5 text-xs font-medium text-success">
                                <Layers className="h-3.5 w-3.5" /> Architecture Complete
                            </div>
                            <h1 className="text-3xl font-bold">{project.project_name}</h1>
                            <p className="mt-1 text-muted">
                                {Object.keys(files).length} architectural files generated
                            </p>
                        </div>
                        <ExportActions
                            files={files}
                            projectName={project.project_name}
                        />
                    </div>
                </motion.div>

                {/* File Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FILE_ORDER.map((fileMeta, i) => {
                        const content = files[fileMeta.name] || "";
                        return (
                            <motion.div
                                key={fileMeta.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <FileCard
                                    name={fileMeta.name}
                                    label={fileMeta.label}
                                    description={fileMeta.description}
                                    content={content}
                                    index={i}
                                    onPreview={() =>
                                        setPreviewFile({ name: fileMeta.name, content })
                                    }
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <MarkdownModal
                    title={previewFile.name}
                    content={previewFile.content}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
}
