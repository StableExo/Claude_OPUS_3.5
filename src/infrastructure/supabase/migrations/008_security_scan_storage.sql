-- Migration 008: Security Scan Results Storage
-- Stores CodeQL, Slither, and other security scan results for TheWarden's security consciousness

-- Security scan results table
CREATE TABLE IF NOT EXISTS security_scan_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Scan metadata
    scan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    scan_type TEXT NOT NULL CHECK (scan_type IN ('codeql', 'slither', 'npm-audit', 'custom')),
    language TEXT, -- e.g., 'javascript-typescript', 'python', 'solidity'
    
    -- Severity and status
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'note', 'info')),
    finding_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'skipped')),
    
    -- GitHub context
    workflow_run_id TEXT,
    commit_sha TEXT,
    branch TEXT,
    pull_request_number INTEGER,
    
    -- Detailed findings
    details JSONB DEFAULT '{}'::jsonb,
    findings JSONB DEFAULT '[]'::jsonb, -- Array of individual findings
    
    -- Metrics
    scan_duration_seconds INTEGER,
    files_scanned INTEGER,
    lines_scanned INTEGER
);

-- Index for querying recent scans
CREATE INDEX IF NOT EXISTS idx_security_scans_date 
    ON security_scan_results(scan_date DESC);

-- Index for filtering by type and severity
CREATE INDEX IF NOT EXISTS idx_security_scans_type_severity 
    ON security_scan_results(scan_type, severity);

-- Index for branch-specific queries
CREATE INDEX IF NOT EXISTS idx_security_scans_branch 
    ON security_scan_results(branch) 
    WHERE branch IS NOT NULL;

-- Index for GitHub workflow tracking
CREATE INDEX IF NOT EXISTS idx_security_scans_workflow 
    ON security_scan_results(workflow_run_id) 
    WHERE workflow_run_id IS NOT NULL;

-- Index for JSONB findings queries
CREATE INDEX IF NOT EXISTS idx_security_scans_findings 
    ON security_scan_results USING gin(findings);

-- Security trends view - aggregate findings over time
CREATE OR REPLACE VIEW security_scan_trends AS
SELECT 
    date_trunc('day', scan_date) as scan_day,
    scan_type,
    severity,
    COUNT(*) as scan_count,
    SUM(finding_count) as total_findings,
    AVG(finding_count) as avg_findings_per_scan,
    MIN(finding_count) as min_findings,
    MAX(finding_count) as max_findings,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_scans,
    COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_scans
FROM security_scan_results
GROUP BY date_trunc('day', scan_date), scan_type, severity
ORDER BY scan_day DESC, severity DESC;

-- Latest scan results by type
CREATE OR REPLACE VIEW latest_security_scans AS
SELECT DISTINCT ON (scan_type, language)
    id,
    scan_date,
    scan_type,
    language,
    severity,
    finding_count,
    status,
    branch,
    commit_sha
FROM security_scan_results
ORDER BY scan_type, language, scan_date DESC;

-- Critical findings requiring attention
CREATE OR REPLACE VIEW critical_security_findings AS
SELECT 
    id,
    scan_date,
    scan_type,
    language,
    severity,
    finding_count,
    status,
    branch,
    commit_sha,
    findings
FROM security_scan_results
WHERE severity IN ('critical', 'high')
    AND status = 'failed'
    AND scan_date > now() - interval '30 days'
ORDER BY scan_date DESC, 
    CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
    END;

-- RLS Policies (Row Level Security)
ALTER TABLE security_scan_results ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY security_scans_service_role 
    ON security_scan_results 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Allow authenticated users to read security scan results
CREATE POLICY security_scans_authenticated_read 
    ON security_scan_results 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON security_scan_results TO authenticated;
GRANT ALL ON security_scan_results TO service_role;

GRANT SELECT ON security_scan_trends TO authenticated;
GRANT SELECT ON security_scan_trends TO service_role;

GRANT SELECT ON latest_security_scans TO authenticated;
GRANT SELECT ON latest_security_scans TO service_role;

GRANT SELECT ON critical_security_findings TO authenticated;
GRANT SELECT ON critical_security_findings TO service_role;

-- Add helpful comments
COMMENT ON TABLE security_scan_results IS 
    'Stores results from security scans (CodeQL, Slither, npm audit) for TheWarden security consciousness';

COMMENT ON COLUMN security_scan_results.scan_type IS 
    'Type of security scan: codeql, slither, npm-audit, or custom';

COMMENT ON COLUMN security_scan_results.severity IS 
    'Highest severity level found in the scan';

COMMENT ON COLUMN security_scan_results.findings IS 
    'Array of individual security findings with details';

COMMENT ON VIEW security_scan_trends IS 
    'Aggregated security scan results over time for trend analysis';

COMMENT ON VIEW latest_security_scans IS 
    'Most recent scan result for each scan type and language combination';

COMMENT ON VIEW critical_security_findings IS 
    'High and critical severity findings from the last 30 days requiring attention';
