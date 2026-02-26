-- Run this in the Supabase SQL Editor to set up the projects table

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL UNIQUE,
  description TEXT,
  goal TEXT,
  target_audience TEXT,
  core_problem TEXT,
  key_differentiator TEXT,
  brand_voice TEXT,
  brand_website TEXT,
  design_style TEXT,
  communication_style TEXT,
  tech_stack_frontend TEXT,
  tech_stack_backend TEXT,
  tech_stack_database TEXT,
  tech_stack_hosting TEXT,
  mandatory_integrations TEXT,
  timeline_scope TEXT,
  data_privacy_security TEXT,
  audio_transcript TEXT,
  brandbook_text TEXT,
  generated_files JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow inserts and selects for anonymous users (adjust for production)
CREATE POLICY "Allow public read" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON projects
  FOR UPDATE USING (true);
