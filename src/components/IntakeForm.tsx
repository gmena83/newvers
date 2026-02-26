"use client";

import { useState, FormEvent, DragEvent } from "react";
import { ProjectFormData, projectSchema } from "@/lib/schema";
import {
    BRAND_VOICE_OPTIONS,
    DESIGN_STYLE_OPTIONS,
    COMMUNICATION_STYLE_OPTIONS,
    TECH_OPTIONS,
} from "@/lib/constants";
import {
    Upload,
    Mic,
    FileText,
    Loader2,
    Check,
    AlertCircle,
    Sparkles,
    Lock,
} from "lucide-react";

interface IntakeFormProps {
    onSubmitSuccess: (formData: ProjectFormData) => void;
}

export default function IntakeForm({ onSubmitSuccess }: IntakeFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [audioProcessing, setAudioProcessing] = useState(false);
    const [pdfProcessing, setPdfProcessing] = useState(false);
    const [audioDragOver, setAudioDragOver] = useState(false);
    const [aiSuggesting, setAiSuggesting] = useState(false);
    const [aiReasoning, setAiReasoning] = useState<string | null>(null);
    const [techLocked, setTechLocked] = useState(false);

    const [form, setForm] = useState<ProjectFormData>({
        project_name: "",
        description: "",
        goal: "",
        target_audience: "",
        core_problem: "",
        key_differentiator: "",
        brand_voice: "",
        brand_website: "",
        design_style: "",
        communication_style: "",
        tech_stack_frontend: "",
        tech_stack_backend: "",
        tech_stack_database: "",
        tech_stack_hosting: "",
        mandatory_integrations: "",
        timeline_scope: "",
        data_privacy_security: "",
        audio_transcript: "",
        brandbook_text: "",
    });

    const updateField = (field: keyof ProjectFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    /* ── AI Suggest Tech Stack ── */
    const handleAiSuggest = async () => {
        if (techLocked) return;
        setAiSuggesting(true);
        setAiReasoning(null);
        setErrors((prev) => {
            const next = { ...prev };
            delete next.aiSuggest;
            return next;
        });

        try {
            const res = await fetch("/api/ai-suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_name: form.project_name,
                    description: form.description,
                    goal: form.goal,
                    target_audience: form.target_audience,
                    core_problem: form.core_problem,
                    key_differentiator: form.key_differentiator,
                    mandatory_integrations: form.mandatory_integrations,
                    data_privacy_security: form.data_privacy_security,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "AI suggestion failed");

            // Populate tech stack fields with AI recommendations
            updateField("tech_stack_frontend", data.frontend || "");
            updateField("tech_stack_backend", data.backend || "");
            updateField("tech_stack_database", data.database || "");
            updateField("tech_stack_hosting", data.hosting || "");
            setAiReasoning(data.reasoning || null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "AI suggestion failed";
            setErrors((prev) => ({ ...prev, aiSuggest: message }));
        } finally {
            setAiSuggesting(false);
        }
    };

    /* ── Audio Processing ── */
    const processAudio = async () => {
        if (!audioFile) return;
        setAudioProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", audioFile);
            const res = await fetch("/api/transcribe", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Transcription failed");
            updateField("audio_transcript", data.transcript);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Audio processing failed";
            setErrors((prev) => ({ ...prev, audio: message }));
        } finally {
            setAudioProcessing(false);
        }
    };

    /* ── PDF Processing ── */
    const processPdf = async () => {
        if (!pdfFile) return;
        setPdfProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", pdfFile);
            const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "PDF extraction failed");
            updateField("brandbook_text", data.text);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "PDF processing failed";
            setErrors((prev) => ({ ...prev, pdf: message }));
        } finally {
            setPdfProcessing(false);
        }
    };

    const handleAudioDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setAudioDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("audio/")) {
            setAudioFile(file);
        }
    };

    /* ── Form Submit — NO Supabase required ── */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = projectSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setSubmitting(true);
        try {
            // Pass validated form data directly to parent — no Supabase needed
            onSubmitSuccess(result.data as ProjectFormData);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to start generation";
            setErrors({ submit: message });
            setSubmitting(false);
        }
    };

    const renderField = (
        field: keyof ProjectFormData,
        label: string,
        opts?: { placeholder?: string; textarea?: boolean; type?: string }
    ) => (
        <div>
            <label className="form-label">{label}</label>
            {opts?.textarea ? (
                <textarea
                    className="input-field min-h-[80px] resize-y"
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    placeholder={opts?.placeholder}
                />
            ) : (
                <input
                    type={opts?.type || "text"}
                    className="input-field"
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    placeholder={opts?.placeholder}
                />
            )}
            {errors[field] && (
                <p className="mt-1 flex items-center gap-1 text-xs text-danger">
                    <AlertCircle className="h-3 w-3" /> {errors[field]}
                </p>
            )}
        </div>
    );

    const renderSelect = (
        field: keyof ProjectFormData,
        label: string,
        options: string[]
    ) => (
        <div>
            <label className="form-label">{label}</label>
            <select
                className="input-field"
                value={form[field]}
                onChange={(e) => updateField(field, e.target.value)}
                aria-label={label}
                disabled={techLocked}
            >
                <option value="">Select {label.toLowerCase()}…</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            {errors[field] && (
                <p className="mt-1 flex items-center gap-1 text-xs text-danger">
                    <AlertCircle className="h-3 w-3" /> {errors[field]}
                </p>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="workspace-form">
            {/* ── PROJECT DETAILS ── */}
            <section className="content-section" id="section-details">
                <h2 className="section-title">PROJECT DETAILS</h2>
                <div className="grid gap-4">
                    {renderField("project_name", "Project Name", { placeholder: "e.g., SaaS Analytics Platform" })}
                    {renderField("description", "Description", { textarea: true, placeholder: "Describe your project in detail..." })}
                    {renderField("goal", "Goal", { textarea: true, placeholder: "Primary objective of this project" })}
                </div>
            </section>

            {/* ── AUDIO INGESTION ── */}
            <section className="content-section" id="section-audio">
                <h2 className="section-title text-secondary">AUDIO INGESTION</h2>

                {form.audio_transcript ? (
                    <div className="flex items-center gap-2 text-sm text-success">
                        <Check className="h-4 w-4" /> Audio transcribed successfully
                        <button
                            type="button"
                            className="btn-ghost text-xs"
                            onClick={() => updateField("audio_transcript", "")}
                        >
                            Clear
                        </button>
                    </div>
                ) : (
                    <div
                        className={`audio-drop-zone ${audioDragOver ? "drag-over" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                        onDragLeave={() => setAudioDragOver(false)}
                        onDrop={handleAudioDrop}
                    >
                        <Mic className="h-8 w-8 text-muted mx-auto" />
                        <p className="text-sm text-muted mt-2">
                            {audioFile ? audioFile.name : "Drag & drop .mp3 / .m4a files"}
                        </p>
                        <p className="text-xs text-muted mt-1">Max 10 min/file • Click to browse</p>
                        <input
                            type="file"
                            accept="audio/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        />
                        {audioFile && !form.audio_transcript && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); processAudio(); }}
                                disabled={audioProcessing}
                                className="btn-primary text-sm py-2 px-4 mt-3"
                            >
                                {audioProcessing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Transcribing…</>
                                ) : (
                                    "Transcribe"
                                )}
                            </button>
                        )}
                    </div>
                )}
                {errors.audio && <p className="mt-1 text-xs text-danger">{errors.audio}</p>}
            </section>

            {/* ── GUIDING QUESTIONS ── */}
            <section className="content-section" id="section-questions">
                <h2 className="section-title">GUIDING QUESTIONS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {renderField("target_audience", "Target Audience", { placeholder: "Who is this for?" })}
                    {renderField("core_problem", "Core Problem", { placeholder: "What problem does it solve?" })}
                    {renderField("timeline_scope", "Expected Uses", { placeholder: "User count / type" })}
                    {renderField("key_differentiator", "Key Differentiator", { placeholder: "What makes this unique?" })}
                </div>
            </section>

            {/* ── TECH STACK SELECTION ── */}
            <section className="content-section" id="section-tech">
                <div className="section-header-row">
                    <h2 className="section-title text-secondary">Tech Stack Selection</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className={`btn-ai-suggest ${aiSuggesting ? "suggesting" : ""}`}
                            onClick={handleAiSuggest}
                            disabled={aiSuggesting || techLocked}
                        >
                            {aiSuggesting ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</>
                            ) : (
                                <><Sparkles className="h-3.5 w-3.5" /> AI Suggest</>
                            )}
                        </button>
                        <button
                            type="button"
                            className={`btn-ghost text-xs ${techLocked ? "text-warning" : ""}`}
                            onClick={() => setTechLocked(!techLocked)}
                        >
                            <Lock className="h-3.5 w-3.5" /> {techLocked ? "Unlock" : "Lock"}
                        </button>
                    </div>
                </div>

                {/* AI Reasoning Toast */}
                {aiReasoning && (
                    <div className="ai-reasoning-toast animate-fade-in">
                        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-primary mb-1">AI Recommendation</p>
                            <p className="text-xs text-muted leading-relaxed">{aiReasoning}</p>
                        </div>
                        <button
                            type="button"
                            className="text-muted hover:text-foreground text-xs shrink-0"
                            onClick={() => setAiReasoning(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {errors.aiSuggest && (
                    <p className="mb-3 flex items-center gap-1 text-xs text-danger">
                        <AlertCircle className="h-3 w-3" /> {errors.aiSuggest}
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {renderSelect("tech_stack_frontend", "Frontend", TECH_OPTIONS.frontend)}
                    {renderSelect("tech_stack_backend", "Backend", TECH_OPTIONS.backend)}
                    {renderSelect("tech_stack_database", "Database", TECH_OPTIONS.database)}
                    {renderSelect("tech_stack_hosting", "Hosting", TECH_OPTIONS.hosting)}
                </div>
            </section>

            {/* ── BRAND & DESIGN ── */}
            <section className="content-section" id="section-brand">
                <h2 className="section-title">BRAND & DESIGN</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {renderSelect("brand_voice", "Brand Voice", BRAND_VOICE_OPTIONS)}
                    {renderSelect("design_style", "Design Style", DESIGN_STYLE_OPTIONS)}
                    {renderSelect("communication_style", "Communication Style", COMMUNICATION_STYLE_OPTIONS)}
                    {renderField("brand_website", "Brand Website", { type: "url", placeholder: "https://example.com" })}
                </div>
            </section>

            {/* ── SCOPE & SECURITY ── */}
            <section className="content-section" id="section-scope">
                <h2 className="section-title">SCOPE & SECURITY</h2>
                <div className="grid gap-4">
                    {renderField("mandatory_integrations", "Mandatory Integrations", { textarea: true, placeholder: "Stripe, Twilio, SendGrid…" })}
                    {renderField("data_privacy_security", "Data Privacy / Security Needs", { textarea: true, placeholder: "GDPR, SOC2, HIPAA…" })}
                </div>
            </section>

            {/* ── BRANDBOOK PDF ── */}
            <section className="content-section" id="section-pdf">
                <h2 className="section-title text-secondary">BRANDBOOK UPLOAD</h2>
                <div className="flex items-center gap-3">
                    <label className="btn-secondary cursor-pointer text-sm py-2 px-4">
                        <Upload className="h-4 w-4" />
                        {pdfFile ? pdfFile.name : "Choose PDF File"}
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        />
                    </label>
                    {pdfFile && !form.brandbook_text && (
                        <button
                            type="button"
                            onClick={processPdf}
                            disabled={pdfProcessing}
                            className="btn-primary text-sm py-2 px-4"
                        >
                            {pdfProcessing ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</>
                            ) : (
                                "Extract Text"
                            )}
                        </button>
                    )}
                    {form.brandbook_text && (
                        <span className="flex items-center gap-1 text-sm text-success">
                            <Check className="h-4 w-4" /> Extracted
                        </span>
                    )}
                </div>
                {errors.pdf && <p className="mt-1 text-xs text-danger">{errors.pdf}</p>}
            </section>

            {/* ── SUBMIT ── */}
            {errors.submit && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    <AlertCircle className="mb-1 inline h-4 w-4" /> {errors.submit}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-sm"
            >
                {submitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Starting Pipeline…</>
                ) : (
                    <>Generate Architecture <span className="opacity-70">(10 files)</span></>
                )}
            </button>
        </form>
    );
}
