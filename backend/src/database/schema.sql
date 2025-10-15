-- DAWG AI Database Schema
-- PostgreSQL Schema for Cloud Storage & Backend (Module 10)
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Note: Users are managed by Supabase Auth
-- This references auth.users table from Supabase

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,

  -- Constraints
  CONSTRAINT projects_name_not_empty CHECK (char_length(name) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token) WHERE share_token IS NOT NULL;

-- =====================================================
-- PROJECT VERSIONS TABLE
-- =====================================================
-- For undo/redo and version history
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT project_versions_unique UNIQUE(project_id, version_number),
  CONSTRAINT project_versions_number_positive CHECK (version_number > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON project_versions(created_at DESC);

-- =====================================================
-- FILES TABLE
-- =====================================================
-- Track uploaded files (audio samples, exports, etc.)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT files_filename_not_empty CHECK (char_length(filename) > 0),
  CONSTRAINT files_size_positive CHECK (size_bytes > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

-- =====================================================
-- COLLABORATORS TABLE
-- =====================================================
-- For project collaboration
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT collaborators_unique UNIQUE(project_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collaborators_project_id ON collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);

-- =====================================================
-- PROJECT TEMPLATES TABLE
-- =====================================================
-- Predefined project templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  category TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT project_templates_name_not_empty CHECK (char_length(name) > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_official ON project_templates(is_official) WHERE is_official = TRUE;

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
-- Track user activity for analytics
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Projects: Users can only see their own projects or shared projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared projects"
  ON projects FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Files: Users can only access their own files
CREATE POLICY "Users can view their own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(32), 'base64');
  token := replace(token, '/', '_');
  token := replace(token, '+', '-');
  token := replace(token, '=', '');
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to create project version snapshot
CREATE OR REPLACE FUNCTION create_project_version(
  p_project_id UUID,
  p_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM project_versions
  WHERE project_id = p_project_id;

  -- Insert new version
  INSERT INTO project_versions (project_id, version_number, data)
  VALUES (p_project_id, v_version_number, p_data)
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert default project templates
INSERT INTO project_templates (name, description, data, category, is_official)
VALUES
  (
    'Empty Project',
    'Start from scratch with an empty project',
    '{"tracks": [], "tempo": 120, "timeSignature": [4, 4]}',
    'basic',
    TRUE
  ),
  (
    'Hip Hop Beat',
    'Hip hop project with drums, bass, and melody tracks',
    '{"tracks": [{"type": "midi", "name": "Drums"}, {"type": "midi", "name": "Bass"}, {"type": "audio", "name": "Melody"}], "tempo": 85, "timeSignature": [4, 4]}',
    'genre',
    TRUE
  ),
  (
    'EDM Track',
    'Electronic music project with synths and drums',
    '{"tracks": [{"type": "midi", "name": "Kick"}, {"type": "midi", "name": "Bass"}, {"type": "midi", "name": "Lead"}], "tempo": 128, "timeSignature": [4, 4]}',
    'genre',
    TRUE
  ),
  (
    'Vocal Recording',
    'Project optimized for vocal recording and processing',
    '{"tracks": [{"type": "audio", "name": "Lead Vocal"}, {"type": "audio", "name": "Harmony"}, {"type": "audio", "name": "Backing"}], "tempo": 120, "timeSignature": [4, 4]}',
    'recording',
    TRUE
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE projects IS 'Main projects table - stores user DAW projects';
COMMENT ON TABLE project_versions IS 'Version history for projects (undo/redo)';
COMMENT ON TABLE files IS 'Uploaded files (audio samples, exports)';
COMMENT ON TABLE collaborators IS 'Project collaboration permissions';
COMMENT ON TABLE project_templates IS 'Predefined project templates';
COMMENT ON TABLE activity_log IS 'User activity tracking for analytics';

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
