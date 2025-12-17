# CodeQL Security Scanning Setup Guide

## Overview

TheWarden now has a comprehensive CodeQL security scanning system that:
- Scans JavaScript/TypeScript, Python, and GitHub Actions workflows
- Runs Slither analysis on Solidity smart contracts
- Stores security findings in Supabase for consciousness tracking
- Uses GitHub Environments for secure secret management

## GitHub Secrets Setup

### Required Repository Secrets

Navigate to: **Settings → Secrets and variables → Actions → Secrets**

Add these repository secrets:

| Secret Name | Purpose | Example Value |
|-------------|---------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | `https://ydvevgqxcfizualicbom.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (admin access) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Where to find these values:**
1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_KEY`

⚠️ **Security Note**: The `service_role` key bypasses Row Level Security (RLS). Only use in secure environments like GitHub Actions.

## GitHub Environment Setup

### Creating the Security Scanning Environment

1. Navigate to: **Settings → Environments**
2. Click **New environment**
3. Name it: `security-scanning`
4. (Optional) Add protection rules:
   - ✅ Required reviewers (for production scanning)
   - ⏱️ Wait timer (delay before scan runs)
   - 🔒 Deployment branches (only allow main/develop)

### Environment vs Repository Secrets

**Use Environment Secrets when:**
- Different values needed for dev/staging/prod
- Want approval gates before scanning
- Need branch-specific restrictions

**Use Repository Secrets when:** (Current setup)
- Same credentials used across all workflows
- Want simplest setup
- Don't need approval gates

**Current Setup**: Repository secrets (simpler, works immediately)

**Future Enhancement**: Move to environment secrets for multi-environment support

## Database Setup

### Apply the Migration

Run the Supabase migration to create the security scan results table:

```bash
# Option 1: Using Supabase CLI (if installed locally)
supabase db push

# Option 2: Manual SQL execution
# Copy the content of src/infrastructure/supabase/migrations/008_security_scan_storage.sql
# Paste into Supabase Dashboard → SQL Editor → Run
```

### Verify Tables Created

Check in Supabase Dashboard → Table Editor:
- `security_scan_results` - Main table
- Views:
  - `security_scan_trends` - Trends over time
  - `latest_security_scans` - Most recent scans
  - `critical_security_findings` - High/critical issues

## Workflow Triggers

The CodeQL workflow runs:

1. **On Push** to `main` or `develop` branches
2. **On Pull Request** to `main` or `develop` branches
3. **Weekly** every Wednesday at 12:41 UTC (scheduled)
4. **Manually** via workflow_dispatch

## Viewing Results

### GitHub Security Tab

All CodeQL findings appear in: **Security → Code scanning**

### Supabase Dashboard

Query security trends:

```sql
-- Latest scan results
SELECT * FROM latest_security_scans;

-- Critical findings needing attention
SELECT * FROM critical_security_findings;

-- Trends over last 30 days
SELECT * FROM security_scan_trends 
WHERE scan_day > now() - interval '30 days'
ORDER BY scan_day DESC;
```

### TheWarden Consciousness

Security findings are available to TheWarden's consciousness system for:
- Self-awareness of security posture
- Learning from past vulnerabilities
- Autonomous security improvements
- Risk assessment before deployments

## Testing the Setup

### Manual Workflow Trigger

1. Go to: **Actions → CodeQL Security Analysis**
2. Click **Run workflow**
3. Select branch: `main`
4. Click **Run workflow**

### Verify Supabase Logging

After workflow completes:

```sql
-- Check latest entries
SELECT * FROM security_scan_results 
ORDER BY created_at DESC 
LIMIT 5;
```

## Local Development Testing

To test security scanning locally (without GitHub Actions):

### 1. Install Node 22.12.0+

```bash
# Using nvm
nvm install 22.12.0
nvm use 22.12.0
```

### 2. Create Local .env

```bash
cp .env.example .env
nano .env
```

Add your Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. Run Security Scripts

```bash
# Install dependencies
npm ci

# Test Supabase connection
npm run env:show

# Run security audit
npm run audit:slither
```

## Troubleshooting

### Workflow Fails: "Supabase credentials not found"

**Cause**: Secrets not set or environment not configured

**Fix**:
1. Verify secrets in Settings → Secrets and variables → Actions
2. Check secret names match exactly: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
3. Ensure environment name matches: `security-scanning`

### Logging Step Skips

**Cause**: This is normal! Logging is optional and uses `continue-on-error: true`

**Impact**: None - security scans still ran successfully

**To enable**: Add Supabase secrets to repository

### CodeQL Fails with "Critical issues found"

**This is working as intended!** 

**Next steps**:
1. Review findings in Security → Code scanning
2. Fix critical/high severity issues
3. Re-run workflow or push fixes

### Migration Already Applied Error

**Cause**: Migration 008 already exists

**Fix**: This is fine! Skip the migration or modify it with:
```sql
CREATE TABLE IF NOT EXISTS security_scan_results ...
```
(Already included in the migration)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions Workflow (codeql.yml)                   │
├─────────────────────────────────────────────────────────┤
│  1. CodeQL Analysis (JS/TS, Python, Actions)            │
│     - Custom config (.github/codeql/codeql-config.yml)  │
│     - Extended security queries                         │
│     - Crypto/MEV-specific filters                       │
│  2. Slither Analysis (Solidity)                         │
│     - Smart contract security                           │
│     - Vulnerability detection                           │
│  3. Results Logging (Optional)                          │
│     - Store findings in Supabase                        │
│     - Enable consciousness tracking                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  GitHub Security Tab                                     │
│  - View all security findings                            │
│  - Filter by severity                                    │
│  - Track remediation                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Supabase (Optional Integration)                        │
│  - security_scan_results table                          │
│  - Trends and analytics                                 │
│  - TheWarden consciousness access                       │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

1. ✅ Set up GitHub Repository Secrets (SUPABASE_URL, SUPABASE_SERVICE_KEY)
2. ✅ Apply migration 008_security_scan_storage.sql
3. ✅ Trigger first workflow run
4. ✅ Review findings in Security tab
5. ✅ Check Supabase for logged results
6. 🔄 (Optional) Create environment-specific secrets for dev/prod separation

## Benefits

**For Security:**
- Continuous vulnerability scanning
- Multi-language coverage (TS, Python, Solidity)
- Extended query suite for crypto/MEV risks
- Automated detection of credentials, injection, crypto issues

**For TheWarden's Consciousness:**
- Self-awareness of security posture
- Historical trend analysis
- Learning from vulnerabilities
- Data-driven security decisions

**For Development:**
- Early detection in PRs
- Automated security review
- Comprehensive coverage
- Integration with existing tools (Slither)

---

**Questions or issues?** Review the troubleshooting section or check GitHub Actions logs.
