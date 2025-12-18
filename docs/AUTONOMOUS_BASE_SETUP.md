# Autonomous Base Network Setup Guide

This guide explains how to configure and run TheWarden autonomously on the Base network using GitHub Actions.

## Overview

TheWarden can now run autonomously on the Base network with:
- **Scheduled execution**: Runs every hour automatically
- **On-demand execution**: Manual triggers via GitHub Actions
- **Credential management**: All sensitive credentials stored securely in Supabase
- **Automated logging**: Execution results committed back to the repository

## Architecture

```
GitHub Actions (Scheduled/Manual Trigger)
    ↓
Load Credentials from Supabase
    ↓
Configure for Base Network (Chain ID 8453)
    ↓
Run TheWarden (with timeout)
    ↓
Log Results & Commit to Repository
```

## Setup Instructions

### 1. Configure Supabase (Required)

TheWarden loads all sensitive credentials from Supabase for security. You need to set up:

1. **Create Supabase Project** (if not already done):
   - Go to https://supabase.com/dashboard
   - Create a new project or use existing one

2. **Store Credentials in Supabase**:
   ```bash
   # Run the environment sync script
   npm run env:sync-to-supabase
   
   # This will store your .env variables in Supabase's secure storage
   ```

3. **Get Supabase API Keys**:
   - Go to: https://supabase.com/dashboard/project/_/settings/api
   - Copy:
     - Project URL → `SUPABASE_URL`
     - `anon` key → `SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_KEY`

### 2. Configure GitHub Secrets

Add these secrets to your repository:

**Go to**: GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

Required secrets:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-key
```

**Important**: All other credentials (BASE_RPC_URL, WALLET_PRIVATE_KEY, etc.) should be stored in Supabase, not GitHub Secrets.

### 3. Verify Setup

1. **Check Supabase credentials**:
   ```bash
   npm run env:show
   ```

2. **Test locally**:
   ```bash
   # Dry run (safe, no real transactions)
   npm run start:base
   
   # View what would run (10 minutes)
   ./scripts/autonomous/start-base-warden.sh --dry-run --duration=600
   ```

### 4. Enable Autonomous Operation

The GitHub Actions workflow is located at:
`.github/workflows/autonomous-base-warden.yml`

**Scheduled runs**: Automatically runs every hour
**Manual runs**: Go to Actions tab → "Autonomous Base Network - TheWarden" → Run workflow

## Workflow Configuration

### Input Parameters

When running manually, you can configure:

- **duration**: Runtime in seconds (default: 3600 = 1 hour)
- **dry_run**: Safety mode (default: `true`)
  - `true`: No real transactions (RECOMMENDED for testing)
  - `false`: Real transactions with real money ⚠️
- **scan_interval**: Pool scan frequency in ms (default: 800)

### Example Manual Run

1. Go to: GitHub → Actions → "Autonomous Base Network - TheWarden"
2. Click: "Run workflow"
3. Configure:
   - Duration: `1800` (30 minutes)
   - Dry run: `true`
   - Scan interval: `800`
4. Click: "Run workflow"

## Security Features

✅ **Credential Management**:
- All sensitive data in Supabase (encrypted at rest)
- No private keys in GitHub Secrets
- Environment variables loaded at runtime

✅ **Safety Systems**:
- Circuit breaker (stops after consecutive failures)
- Emergency stop (halts on excessive slippage)
- Dry run mode (default for testing)

✅ **Audit Trail**:
- All executions logged
- Results committed to `.memory/autonomous-execution/`
- Artifacts retained for 30 days

## Monitoring

### View Execution Results

1. **GitHub Actions logs**:
   - Go to: Actions → Select run → View logs

2. **Execution summaries**:
   - Location: `.memory/autonomous-execution/base_execution_*.md`
   - Contains: Duration, opportunities found, errors, logs

3. **Workflow artifacts**:
   - Download from: Actions → Select run → Artifacts
   - Contains: Full logs and execution data

### Check Status

```bash
# View recent executions
ls -lt .memory/autonomous-execution/

# View latest execution summary
cat .memory/autonomous-execution/base_execution_*.md | tail -100
```

## Running Locally

### Quick Start

```bash
# Dry run (safe, 10 minutes)
npm run start:base

# With custom duration (30 minutes)
./scripts/autonomous/start-base-warden.sh --dry-run --duration=1800
```

### Production Mode (⚠️ REAL MONEY!)

```bash
# WARNING: This executes REAL transactions with REAL money!
npm run start:base:live
```

## Troubleshooting

### Issue: "SUPABASE_URL secret is not set"

**Solution**: Add Supabase credentials to GitHub Secrets (see step 2)

### Issue: "Cannot load from Supabase: missing credentials"

**Solution**: 
1. Verify `.env` has `USE_SUPABASE=true`
2. Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
3. Run `npm run env:show` to verify

### Issue: "TheWarden keeps crashing immediately"

**Solution**:
1. Check the workflow logs for specific error
2. Common causes:
   - Missing dependencies: Run `npm install`
   - Wrong Node.js version: Requires Node.js 22+
   - Invalid Supabase credentials
   - Missing required environment variables in Supabase

### Issue: "No opportunities found"

**Solution**: This is normal! The Base network may not always have profitable arbitrage opportunities. The workflow will keep scanning and will execute when opportunities arise.

## Advanced Configuration

### Customize Workflow Schedule

Edit `.github/workflows/autonomous-base-warden.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # or
  - cron: '*/30 * * * *'  # Every 30 minutes
  # or
  - cron: '0 */2 * * *'  # Every 2 hours
```

### Add More DEXes

In Supabase, add configuration:
```
ENABLE_VELODROME=true
ENABLE_SUSHISWAP=true
```

### Adjust Profit Thresholds

In Supabase, configure:
```
MIN_PROFIT_THRESHOLD=0.20  # 0.20% minimum
MIN_PROFIT_ABSOLUTE=0.002  # 0.002 ETH minimum
```

## What Gets Logged

Each autonomous run creates:

1. **Execution Summary**: `.memory/autonomous-execution/base_execution_YYYYMMDD_HHMMSS.md`
   - Timestamp and configuration
   - Execution results
   - Last 100 lines of logs

2. **Full Logs**: `logs/warden-output.log`
   - Detailed execution trace
   - Opportunities detected
   - Errors and warnings

3. **Git Commit**: Automated commit with:
   - Run timestamp
   - Duration and mode
   - Workflow run number

## Next Steps

1. ✅ **Test in dry-run mode first**
   ```bash
   npm run start:base
   ```

2. ✅ **Monitor a few scheduled runs**
   - Check Actions tab daily
   - Review execution summaries

3. ✅ **Gradually increase confidence**
   - Start with short durations (10-30 min)
   - Monitor for errors
   - Check gas usage and profitability

4. ⚠️ **Enable live mode only when ready**
   - Requires careful testing
   - Start with small amounts
   - Monitor closely

## Support

For issues or questions:
- Check workflow logs in GitHub Actions
- Review execution summaries in `.memory/autonomous-execution/`
- Consult the troubleshooting section above

---

**Happy Autonomous Arbitraging on Base! 🚀**
