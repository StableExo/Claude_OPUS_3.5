# Supabase Environment Setup for Mainnet Forking

**Date**: December 21, 2025  
**Purpose**: Configure environment variables in Supabase for Base L2 Bridge security testing with mainnet forking  
**Note**: All credentials should be stored in Supabase, not in .env files

---

## Overview

TheWarden stores all credentials securely in Supabase. This document outlines which environment variables need to be configured in Supabase to enable mainnet forking for security testing of Base L2 Bridge contracts.

---

## Required Environment Variables in Supabase

### 1. Core Configuration (Must Set in Supabase)

#### Supabase Access (Local .env only)
```bash
# These go in local .env file ONLY
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # For admin operations
SECRETS_ENCRYPTION_KEY=your-32-byte-hex-key  # For decrypting secrets
```

#### Blockchain RPC Endpoints (Store as SECRETS in Supabase)

**Critical for Mainnet Forking:**

```bash
# Ethereum L1 RPC (for L1 Bridge contracts)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_API_KEY=YOUR_API_KEY

# Base L2 RPC (for L2 Bridge contracts)  
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Archive node access (REQUIRED for historical queries)
ETHEREUM_ARCHIVE_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
BASE_ARCHIVE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Backup RPC URLs (optional but recommended)
ETHEREUM_RPC_URL_BACKUP=https://eth-mainnet.public.blastapi.io
BASE_RPC_URL_BACKUP=https://mainnet.base.org
BASE_RPC_URL_BACKUP_2=https://base.llamarpc.com
```

#### Block Explorer API Keys (Store as SECRETS in Supabase)

```bash
# Etherscan - for fetching L1 contract ABIs
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Basescan - for fetching L2 contract ABIs
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Optional: Other explorers
POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_API_KEY
ARBISCAN_API_KEY=YOUR_ARBISCAN_API_KEY
OPTIMISTIC_ETHERSCAN_API_KEY=YOUR_OPTIMISTIC_ETHERSCAN_API_KEY
```

#### Hardhat Forking Configuration (Store as CONFIG in Supabase)

```bash
# Enable forking
HARDHAT_FORK_ENABLED=true

# Fork block number (update regularly to recent block)
HARDHAT_FORK_BLOCK_NUMBER=19000000

# Chain ID for forked network
HARDHAT_CHAIN_ID=31337

# Fork URL (which network to fork)
HARDHAT_FORK_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Forking mode flag
FORKING=true
```

#### Test Wallet (Store as SECRET in Supabase)

```bash
# Test wallet private key (NEVER use real mainnet wallet!)
WALLET_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

# WARNING: Generate a dedicated test wallet
# Command: openssl rand -hex 32
```

#### Security Testing Configuration (Store as CONFIG in Supabase)

```bash
# Always run in dry-run mode for security testing
DRY_RUN=true

# Enable security testing mode
SECURITY_TESTING_ENABLED=true

# Target network for testing
TEST_NETWORK=hardhat-fork

# Gas configuration for forked network
HARDHAT_GAS_LIMIT=30000000
HARDHAT_GAS_PRICE=1000000000

# Node environment
NODE_ENV=test
```

---

## How to Set Variables in Supabase

### Method 1: Using SupabaseEnvStorage API (Recommended)

```typescript
import { SupabaseEnvStorage } from './src/services/SupabaseEnvStorage';

const storage = new SupabaseEnvStorage();

// Store a secret (encrypted)
await storage.setSecret(
  'ALCHEMY_API_KEY',
  'your-api-key-here',
  process.env.SECRETS_ENCRYPTION_KEY!,
  {
    category: 'blockchain',
    description: 'Alchemy API key for Ethereum and Base RPC access'
  }
);

// Store a configuration (plaintext)
await storage.setConfig(
  'HARDHAT_FORK_ENABLED',
  'true',
  {
    category: 'testing',
    description: 'Enable Hardhat mainnet forking'
  }
);
```

### Method 2: Using Supabase Dashboard

1. Navigate to your Supabase project
2. Go to **Table Editor**
3. Select `environment_configs` table for non-sensitive values
4. Select `environment_secrets` table for sensitive values (API keys, private keys)
5. Insert rows with:
   - `config_name` / `secret_name`: Variable name (e.g., "ALCHEMY_API_KEY")
   - `config_value` / `encrypted_value`: The value (encrypted for secrets)
   - `category`: "blockchain", "testing", "security", etc.
   - `description`: What this variable is for
   - `is_active`: true

### Method 3: Using Sync Script

```bash
# Sync variables from local .env to Supabase
npm run env:sync

# Or manually
node --import tsx scripts/env-management/sync-env-to-supabase.ts
```

---

## Variables That MUST Be Changed for Mainnet Forking

### 🔴 Critical - Must Update Immediately

1. **ETHEREUM_RPC_URL** - Set to valid Alchemy/Infura endpoint
   - Current: Probably not set
   - Required: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
   - Get from: https://www.alchemy.com/ (free tier available)

2. **BASE_RPC_URL** - Set to valid Base mainnet RPC
   - Current: Probably not set
   - Required: `https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
   - Get from: https://www.alchemy.com/

3. **ETHERSCAN_API_KEY** - Required for fetching contract ABIs
   - Current: Probably not set
   - Required: Valid API key
   - Get from: https://etherscan.io/myapikey (free, instant)

4. **BASESCAN_API_KEY** - Required for fetching Base contract ABIs
   - Current: Probably not set
   - Required: Valid API key
   - Get from: https://basescan.org/myapikey (free, instant)

5. **HARDHAT_FORK_ENABLED** - Enable forking
   - Current: Probably `false`
   - Required: `true`

6. **HARDHAT_FORK_BLOCK_NUMBER** - Update to recent block
   - Current: May be outdated
   - Required: Recent block number (check etherscan.io)
   - Recommended: Update to within last 1000 blocks

7. **WALLET_PRIVATE_KEY** - Test wallet only!
   - Current: May not be set
   - Required: New test wallet private key
   - **CRITICAL**: NEVER use real wallet with funds

### 🟡 Important - Should Update Soon

8. **ETHEREUM_ARCHIVE_RPC_URL** - For historical queries
   - Current: May not be set
   - Needed for: Withdrawal proof verification
   - Cost: Alchemy Growth tier ($49/month) or free alternatives

9. **DRY_RUN** - Safety flag
   - Current: Should be `true`
   - Keep as: `true` for all testing

10. **SECURITY_TESTING_ENABLED** - Enable security features
    - Current: May not be set
    - Set to: `true`

### 🟢 Optional - Nice to Have

11. **Backup RPC URLs** - Fallback options
    - Add multiple backup endpoints
    - Free public RPCs available

12. **Other explorer API keys** - For multi-chain testing
    - POLYGONSCAN_API_KEY
    - ARBISCAN_API_KEY
    - etc.

---

## Verification Checklist

After setting variables in Supabase, verify with:

```bash
# Enable Supabase in local .env
echo "USE_SUPABASE=true" >> .env
echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
echo "SUPABASE_ANON_KEY=your-anon-key" >> .env
echo "SECRETS_ENCRYPTION_KEY=your-encryption-key" >> .env

# Check what's stored
npm run env:show

# Check blockchain-specific variables
node --import tsx scripts/show-env-from-supabase.ts blockchain

# Check with secrets revealed (last 4 chars only)
node --import tsx scripts/show-env-from-supabase.ts blockchain --secrets

# Check if RPC endpoints are working
npm run validate:env
```

### Expected Output

```
✅ ETHEREUM_RPC_URL: Connected successfully
✅ BASE_RPC_URL: Connected successfully  
✅ ETHERSCAN_API_KEY: Valid (rate limit: 5 req/s)
✅ BASESCAN_API_KEY: Valid (rate limit: 5 req/s)
✅ HARDHAT_FORK_ENABLED: true
✅ WALLET_PRIVATE_KEY: Set (test wallet)
```

---

## Quick Start Commands

```bash
# 1. Enable Supabase
echo "USE_SUPABASE=true" >> .env

# 2. Add Supabase credentials to .env
nano .env

# 3. Check what's stored in Supabase
npm run env:show

# 4. Test RPC connectivity
npm run validate:env

# 5. Fetch contract ABIs
npm run security:fetch-abis

# 6. Run security tests with forking
npm run security:test:bridge
```

---

## Cost Breakdown

### Free Tier (Good for Testing)

- **Alchemy Free**: 300M compute units/month
  - Regular RPC calls: ✅ Plenty
  - Archive calls: ❌ Limited
  - **Cost**: $0/month

- **Etherscan/Basescan Free**: 5 req/second
  - **Cost**: $0/month

- **Public RPC backups**: Free
  - **Cost**: $0/month

**Total Free Tier**: $0/month ✅

### Recommended Tier (For Serious Testing)

- **Alchemy Growth**: $49/month
  - Archive node access: ✅ Full
  - Higher rate limits: ✅ Yes
  - Priority support: ✅ Yes

- **Etherscan Pro**: $99/month (optional)
  - Higher rate limits: 30 req/s
  - Only needed for intensive ABI fetching

**Total Recommended**: $49-148/month

---

## Security Best Practices

### ✅ DO

- Store ALL credentials in Supabase (encrypted)
- Use dedicated test wallet for forking tests
- Keep `DRY_RUN=true` during testing
- Update `HARDHAT_FORK_BLOCK_NUMBER` regularly
- Use archive nodes for historical queries
- Have backup RPC endpoints configured
- Verify RPC connectivity before running tests

### ❌ DON'T

- Don't commit credentials to git
- Don't use real mainnet wallet for testing
- Don't disable `DRY_RUN` unless you know what you're doing
- Don't use public RPCs for high-frequency testing
- Don't hardcode API keys in code
- Don't share SECRETS_ENCRYPTION_KEY

---

## Troubleshooting

### "Supabase is DISABLED"
```bash
# Fix: Enable Supabase in .env
echo "USE_SUPABASE=true" >> .env
```

### "Supabase credentials MISSING"
```bash
# Fix: Add Supabase URL and key
echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
echo "SUPABASE_ANON_KEY=your-anon-key" >> .env
```

### "RPC endpoint not responding"
```bash
# Check if API key is valid
curl -X POST https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","id":1,"result":"0x..."}
```

### "Contract ABI fetch failed"
```bash
# Check if Etherscan API key is valid
curl "https://api.etherscan.io/api?module=contract&action=getabi&address=0x3154Cf16ccdb4C6d922629664174b904d80F2C35&apikey=YOUR_KEY"

# Should return: {"status":"1","message":"OK","result":"[{...}]"}
```

### "Archive node required"
```bash
# Upgrade Alchemy plan or use archive node
# Alchemy Growth: $49/month
# Or use free archive alternatives:
# - https://eth-mainnet.public.blastapi.io (limited)
# - https://rpc.ankr.com/eth (rate limited)
```

---

## Next Steps

1. ✅ Review this document
2. ⬜ Set up Supabase credentials in local .env
3. ⬜ Add all required variables to Supabase
4. ⬜ Verify connectivity with `npm run validate:env`
5. ⬜ Fetch contract ABIs with `npm run security:fetch-abis`
6. ⬜ Run security tests with `npm run security:test:bridge`
7. ⬜ Review test results and generate bug bounty reports

---

## Quick Reference: Minimum Required Variables

For basic mainnet forking to work, you **MUST** have these 6 variables in Supabase:

1. `ETHEREUM_RPC_URL` (secret)
2. `BASE_RPC_URL` (secret)
3. `ETHERSCAN_API_KEY` (secret)
4. `BASESCAN_API_KEY` (secret)
5. `HARDHAT_FORK_ENABLED=true` (config)
6. `WALLET_PRIVATE_KEY` (secret - test wallet only!)

Everything else is optional but recommended.

---

**Document Status**: Complete  
**Last Verified**: December 21, 2025  
**Maintained By**: TheWarden Security Team
