// Security Findings Logger for TheWarden
// Stores CodeQL and security scan results in Supabase for consciousness awareness

import { createClient } from '@supabase/supabase-js';

interface SecurityFinding {
  scan_date: string;
  scan_type: 'codeql' | 'slither' | 'npm-audit';
  language?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'note';
  finding_count: number;
  workflow_run_id?: string;
  commit_sha?: string;
  branch?: string;
  status: 'passed' | 'failed' | 'warning';
  details?: Record<string, any>;
}

async function logSecurityFindings() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase credentials not found - skipping security logging');
    console.log('This is optional - security scans still ran successfully');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse GitHub Actions context
    const finding: SecurityFinding = {
      scan_date: new Date().toISOString(),
      scan_type: (process.env.SCAN_TYPE as any) || 'codeql',
      language: process.env.LANGUAGE,
      severity: (process.env.SEVERITY as any) || 'note',
      finding_count: parseInt(process.env.FINDING_COUNT || '0', 10),
      workflow_run_id: process.env.GITHUB_RUN_ID,
      commit_sha: process.env.GITHUB_SHA,
      branch: process.env.GITHUB_REF_NAME,
      status: (process.env.SCAN_STATUS as any) || 'passed',
      details: {
        repository: process.env.GITHUB_REPOSITORY,
        actor: process.env.GITHUB_ACTOR,
        event: process.env.GITHUB_EVENT_NAME,
      },
    };

    // Store in Supabase
    const { error } = await supabase
      .from('security_scan_results')
      .insert(finding);

    if (error) {
      console.error('Failed to log security finding:', error);
      // Don't fail the workflow if logging fails
    } else {
      console.log('✅ Security findings logged to Supabase');
      console.log(`   Scan: ${finding.scan_type}`);
      console.log(`   Severity: ${finding.severity}`);
      console.log(`   Findings: ${finding.finding_count}`);
      console.log(`   Status: ${finding.status}`);
    }
  } catch (error) {
    console.error('Error logging security findings:', error);
    // Don't fail the workflow
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  logSecurityFindings().catch(console.error);
}

export { logSecurityFindings };
