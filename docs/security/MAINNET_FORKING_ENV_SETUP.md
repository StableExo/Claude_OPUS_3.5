# Mainnet Forking Environment Setup Guide
## For Base L2 Bridge Vulnerability Testing

**Date**: December 21, 2025  
**Purpose**: Configure TheWarden for actual vulnerability detection with mainnet forking  
**Target**: Base L2 Bridge Security Testing

---

## Overview

This document outlines all environment variables needed to implement actual vulnerability detection logic with mainnet forking capabilities. The testing framework will fork both Ethereum L1 and Base L2 mainnets to test bridge security in a realistic environment.

---

## Required Environment Variables

### 1. Core RPC Endpoints (CRITICAL)

These RPC endpoints are essential for forking mainnet and testing bridge contracts.

```bash
# Ethereum L1 RPC (for L1 Bridge contracts)
# Primary: Alchemy (recommended for reliability)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY

# Base L2 RPC (for L2 Bridge contracts)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Backup RPC URLs (fallback options)
ETHEREUM_RPC_URL_BACKUP=https://eth-mainnet.public.blastapi.io
BASE_RPC_URL_BACKUP=https://mainnet.base.org
BASE_RPC_URL_BACKUP_2=https://base.llamarpc.com

# Archive Node Access (REQUIRED for historical state)
# Note: Regular RPC nodes may not support eth_call at historical blocks
# Alchemy Archive tier or dedicated archive nodes required
ETHEREUM_ARCHIVE_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
BASE_ARCHIVE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
```

**Why Archive Nodes?**
- Bridge testing requires querying historical state
- Need to verify state roots from past blocks
- Withdrawal proofs require historical transaction data

### 2. Block Explorer API Keys (CRITICAL)

Used for fetching contract ABIs and verified source code.

```bash
# Etherscan (for L1 bridge contracts)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Basescan (for L2 bridge contracts)
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
```

**Get API Keys:**
- Etherscan: https://etherscan.io/myapikey
- Basescan: https://basescan.org/myapikey
- Both are FREE with rate limits (5 requests/second)

### 3. Hardhat Forking Configuration

```bash
# Enable forking
HARDHAT_FORK_ENABLED=true

# Fork block number (set to recent block for testing)
# Update this to a recent block before testing
HARDHAT_FORK_BLOCK_NUMBER=19000000

# Chain ID for forked network
HARDHAT_CHAIN_ID=31337

# Fork URL (which network to fork)
HARDHAT_FORK_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Forking mode
FORKING=true
```

### 4. Test Wallet Configuration

```bash
# Test wallet private key (DO NOT use mainnet wallet!)
# Generate a new test wallet: openssl rand -hex 32
WALLET_PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY_HERE

# Optional: Multi-sig test setup
# MULTI_SIG_ADDRESS=0xYOUR_TEST_MULTISIG_ADDRESS
# MULTI_SIG_THRESHOLD=2
```

**⚠️ SECURITY WARNING:**
- NEVER use your real mainnet wallet for testing
- Generate a dedicated test wallet
- Fund it with test ETH only when needed

### 5. Bridge Contract Addresses (Base Mainnet)

These are the actual deployed contract addresses on Base L2.

```bash
# L1 Bridge Contracts (Ethereum Mainnet)
L1_STANDARD_BRIDGE_ADDRESS=0x3154Cf16ccdb4C6d922629664174b904d80F2C35
OPTIMISM_PORTAL_ADDRESS=0x49048044D57e1C92A77f79988d21Fa8fAF74E97e
L2_OUTPUT_ORACLE_ADDRESS=0x56315b90c40730925ec5485cf004d835058518A0
L1_CROSS_DOMAIN_MESSENGER_ADDRESS=0x866E82a600A1414e583f7F13623F1aC5d58b0Afa

# L2 Bridge Contracts (Base L2)
L2_STANDARD_BRIDGE_ADDRESS=0x4200000000000000000000000000000000000010
L2_CROSS_DOMAIN_MESSENGER_ADDRESS=0x4200000000000000000000000000000000000007
L2_TO_L1_MESSAGE_PASSER_ADDRESS=0x4200000000000000000000000000000000000016

# Bridge configuration
BRIDGE_CHALLENGE_PERIOD=604800  # 7 days in seconds
BRIDGE_FINALIZATION_PERIOD=604800
```

**Source:** Base contract deployments
- L1 contracts: https://etherscan.io/
- L2 contracts: https://basescan.org/
- Official list: https://docs.base.org/base-contracts

### 6. Gas Configuration for Testing

```bash
# Gas settings (for forked transactions)
MAX_GAS_PRICE=100
GAS_MULTIPLIER=1.0

# Gas limits
MAX_GAS_LIMIT=8000000  # 8M gas for complex bridge operations

# Gas oracles (optional)
GAS_API_KEY=YOUR_GAS_NETWORK_API_KEY
```

### 7. Test Execution Configuration

```bash
# Dry run mode (ALWAYS true for testing)
DRY_RUN=true

# Test environment
NODE_ENV=test

# Logging
LOG_LEVEL=debug
ENABLE_LOGGING=true
LOG_FILE=true
LOG_DIR=./logs/security-tests

# Test timeouts
TX_TIMEOUT=120000  # 2 minutes for complex operations
OPPORTUNITY_TIMEOUT=180000  # 3 minutes for full test runs
```

### 8. Security Test Specific Variables

```bash
# Enable security testing mode
SECURITY_TEST_MODE=true

# Test categories to run
SECURITY_TEST_CATEGORIES=bridge,mpc,smart-contract

# Severity levels to test
SECURITY_MIN_SEVERITY=medium

# Test duration (in minutes)
SECURITY_TEST_DURATION=60

# Fuzzing configuration
FUZZER_SCENARIOS_PER_RUN=1000
FUZZER_MAX_CONCURRENT=10
FUZZER_TIMEOUT_MS=10000
FUZZER_ENABLE_ALL_ATTACKS=true

# Report generation
SECURITY_REPORT_DIR=./docs/bug-bounty/reports
SECURITY_REPORT_FORMAT=json,markdown,hackerone
```

### 9. Supabase Configuration (Optional but Recommended)

Store test results and findings in Supabase for tracking.

```bash
# Enable Supabase
USE_SUPABASE=true

# Supabase connection
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Database for test results
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Encryption key for sensitive findings
SECRETS_ENCRYPTION_KEY=your_secrets_key_here_generate_with_openssl_rand_hex_32
```

### 10. AI Provider Configuration (Optional)

For advanced vulnerability analysis and reporting.

```bash
# OpenAI (for GPT-4 analysis)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# XAI (for Grok analysis)
XAI_PROD_API_KEY=your_xai_key_here
XAI_MODEL=grok-2-latest
```

---

## Configuration Priority

### Phase 1: Minimum Required (Start Here)
1. ✅ `ETHEREUM_RPC_URL` - L1 access
2. ✅ `BASE_RPC_URL` - L2 access
3. ✅ `ETHERSCAN_API_KEY` - Contract ABIs
4. ✅ `BASESCAN_API_KEY` - Contract ABIs
5. ✅ `HARDHAT_FORK_ENABLED=true` - Enable forking
6. ✅ `WALLET_PRIVATE_KEY` - Test wallet
7. ✅ `DRY_RUN=true` - Safety first

### Phase 2: Enhanced Testing
8. ✅ Archive node access (Alchemy Archive tier)
9. ✅ Backup RPC endpoints
10. ✅ Supabase configuration (test result storage)
11. ✅ Enhanced logging configuration

### Phase 3: Advanced Features
12. ✅ AI provider integration
13. ✅ Fuzzing configuration
14. ✅ Multi-sig testing setup
15. ✅ Cross-chain testing

---

## Setup Instructions

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Get API Keys

1. **Alchemy** (Primary RPC provider)
   - Sign up: https://www.alchemy.com/
   - Create app for Ethereum Mainnet
   - Create app for Base Mainnet
   - Copy API keys

2. **Etherscan**
   - Sign up: https://etherscan.io/register
   - Get API key: https://etherscan.io/myapikey
   - Free tier: 5 requests/second

3. **Basescan**
   - Sign up: https://basescan.org/register
   - Get API key: https://basescan.org/myapikey
   - Free tier: 5 requests/second

### Step 3: Configure Test Wallet

```bash
# Generate new test wallet
openssl rand -hex 32

# Add to .env
WALLET_PRIVATE_KEY=0x[generated_key]
```

### Step 4: Set Bridge Addresses

Add all bridge contract addresses from the list above to your `.env` file.

### Step 5: Enable Forking

```bash
HARDHAT_FORK_ENABLED=true
HARDHAT_FORK_BLOCK_NUMBER=19000000  # Update to recent block
FORKING=true
```

### Step 6: Verify Configuration

```bash
# Check configuration
npm run validate-env

# Test RPC connectivity
npm run check:readiness

# Test fork setup
npm run test:anvil
```

---

## Testing Workflow

### 1. Start with Dry Run

```bash
# Set in .env
DRY_RUN=true
SECURITY_TEST_MODE=true

# Run tests
npm run security:test:bridge
```

### 2. Review Test Results

```bash
# Check logs
cat logs/security-tests/security-test-latest.log

# View reports
ls -la docs/bug-bounty/reports/
```

### 3. Iterate on Vulnerabilities

```bash
# Run specific test
npm run security:test --target "L1StandardBridge"

# Run by severity
npm run security:test:critical
```

---

## Troubleshooting

### Issue: "Cannot connect to RPC"

**Solution:**
- Verify API keys are correct
- Check rate limits (wait if exceeded)
- Try backup RPC endpoints

### Issue: "Contract not found"

**Solution:**
- Verify contract addresses are correct
- Check you're on the right network (L1 vs L2)
- Ensure fork block number is recent

### Issue: "Archive node required"

**Solution:**
- Upgrade to Alchemy Archive tier
- Use dedicated archive node provider
- Contact Alchemy support for archive access

### Issue: "Gas estimation failed"

**Solution:**
- Increase `MAX_GAS_LIMIT`
- Check wallet has sufficient balance
- Verify contract is not paused

---

## Security Considerations

### ⚠️ NEVER DO THIS:
- ❌ Use mainnet wallet for testing
- ❌ Commit `.env` to git
- ❌ Share API keys publicly
- ❌ Run tests on live mainnet
- ❌ Disable `DRY_RUN` without understanding consequences

### ✅ ALWAYS DO THIS:
- ✅ Use dedicated test wallet
- ✅ Keep `.env` in `.gitignore`
- ✅ Rotate API keys regularly
- ✅ Test on forked network first
- ✅ Monitor rate limits
- ✅ Keep `DRY_RUN=true` during development

---

## Cost Estimation

### Free Tier (Sufficient for Development)
- Alchemy: 300M compute units/month (FREE)
- Etherscan: 5 req/s (FREE)
- Basescan: 5 req/s (FREE)
- **Total Cost: $0/month**

### Paid Tier (For Heavy Testing)
- Alchemy Growth: $49/month (3B compute units)
- Alchemy Archive: Included in Growth tier
- **Total Cost: $49/month**

### Enterprise (For Production Security Research)
- Alchemy Scale: $199/month (15B compute units)
- Dedicated archive nodes
- Priority support
- **Total Cost: $199/month**

---

## Next Steps

1. ✅ Copy this guide to project docs
2. ✅ Update `.env.example` with all variables
3. ✅ Create setup script: `scripts/setup-security-testing.sh`
4. ✅ Document API key generation process
5. ✅ Add validation script: `scripts/validate-security-env.ts`
6. ✅ Create troubleshooting guide
7. ✅ Add cost calculator script

---

## References

- [Base Bridge Documentation](https://docs.base.org/tools/bridges)
- [Optimism Bridge Specs](https://community.optimism.io/docs/protocol/bridge/)
- [Hardhat Forking Guide](https://hardhat.org/hardhat-network/docs/guides/forking-other-networks)
- [Alchemy Archive Nodes](https://docs.alchemy.com/reference/archive-data)
- [Etherscan API](https://docs.etherscan.io/)
- [Basescan API](https://docs.basescan.org/)

---

**Last Updated**: December 21, 2025  
**Maintained By**: TheWarden Security Team  
**Version**: 1.0.0
