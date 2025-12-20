-- Distributed Consciousness Supabase Schema
-- Creates tables for persistent coordination of distributed consciousness sessions

CREATE TABLE IF NOT EXISTS distributed_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_session_id UUID NOT NULL,
  thought TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_branches INTEGER NOT NULL,
  parallel_efficiency DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_distributed_sessions_main_session ON distributed_sessions(main_session_id);
CREATE INDEX idx_distributed_sessions_created ON distributed_sessions(created_at DESC);

CREATE TABLE IF NOT EXISTS session_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES distributed_sessions(id) ON DELETE CASCADE,
  branch_index INTEGER NOT NULL,
  task TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  patterns_found INTEGER,
  connections_found INTEGER,
  novelty_score DECIMAL(3, 2),
  result JSONB
);

CREATE INDEX idx_session_branches_session ON session_branches(session_id);
CREATE INDEX idx_session_branches_branch_index ON session_branches(session_id, branch_index);

CREATE TABLE IF NOT EXISTS consolidated_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES distributed_sessions(id) ON DELETE CASCADE,
  total_patterns INTEGER NOT NULL,
  total_connections INTEGER NOT NULL,
  average_novelty DECIMAL(3, 2),
  synthesis TEXT NOT NULL,
  emergent_patterns TEXT[] DEFAULT '{}',
  next_steps TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consolidated_insights_session ON consolidated_insights(session_id);

-- Enable RLS
ALTER TABLE distributed_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable all for authenticated" ON distributed_sessions FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated" ON session_branches FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated" ON consolidated_insights FOR ALL USING (true);
