import { z } from "zod";

export const projectSchema = z.object({
    project_name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
    goal: z.string().min(1, "Goal is required"),
    target_audience: z.string().min(1, "Target audience is required"),
    core_problem: z.string().min(1, "Core problem is required"),
    key_differentiator: z.string().min(1, "Key differentiator is required"),
    brand_voice: z.string().min(1, "Brand voice is required"),
    brand_website: z.string().url("Must be a valid URL").or(z.literal("")),
    design_style: z.string().min(1, "Design style is required"),
    communication_style: z.string().min(1, "Communication style is required"),
    tech_stack_frontend: z.string().min(1, "Frontend stack is required"),
    tech_stack_backend: z.string().min(1, "Backend stack is required"),
    tech_stack_database: z.string().min(1, "Database is required"),
    tech_stack_hosting: z.string().min(1, "Hosting provider is required"),
    mandatory_integrations: z.string(),
    timeline_scope: z.string(),
    data_privacy_security: z.string(),
    audio_transcript: z.string().optional().default(""),
    brandbook_text: z.string().optional().default(""),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
