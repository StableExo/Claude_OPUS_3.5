# Hardhat Configuration Variables - Secure Secrets for TheWarden

## 🎯 Overview

This guide implements **Hardhat Configuration Variables** to give the Etherscan MCP Server secure access to TheWarden's API keys and secrets, as suggested by StableExo! 🥳

**Based on:** https://hardhat.org/docs/guides/configuration-variables

## 🔐 Why Configuration Variables?

### Current Approach (Environment Variables)
```typescript
// hardhat.config.ts - Current
const apiKey = process.env.BASESCAN_API_KEY;
```

**Problems:**
- ❌ Exposed to all child processes
- ❌ Can leak in logs and error messages
- ❌ Visible in `ps` process listings
- ❌ Stored in plain `.env` files

### New Approach (Configuration Variables)
```typescript
// hardhat.config.ts - Secure
import { vars } from "hardhat/config";
const apiKey = vars.get("BASESCAN_API_KEY");
```

**Benefits:**
- ✅ Encrypted storage in keystore
- ✅ Lazy loading (only when needed)
- ✅ Password-protected access
- ✅ No plain text files
- ✅ Secure for production

## 🚀 Implementation Guide

### Step 1: Update hardhat.config.ts

```typescript
// hardhat.config.ts
import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";

// Use configuration variables instead of process.env
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    base: {
      url: vars.get("BASE_RPC_URL", ""),
      accounts: vars.has("WALLET_PRIVATE_KEY") 
        ? [vars.get("WALLET_PRIVATE_KEY")] 
        : []
    },
    baseSepolia: {
      url: vars.get("BASE_SEPOLIA_RPC_URL", ""),
      accounts: vars.has("WALLET_PRIVATE_KEY")
        ? [vars.get("WALLET_PRIVATE_KEY")]
        : []
    },
    ethereum: {
      url: vars.get("ETHEREUM_RPC_URL", ""),
      accounts: vars.has("WALLET_PRIVATE_KEY")
        ? [vars.get("WALLET_PRIVATE_KEY")]
        : []
    }
  },
  
  etherscan: {
    apiKey: {
      base: vars.get("BASESCAN_API_KEY", ""),
      baseSepolia: vars.get("BASESCAN_API_KEY", ""),
      mainnet: vars.get("ETHERSCAN_API_KEY", ""),
      arbitrumOne: vars.get("ARBISCAN_API_KEY", ""),
      polygon: vars.get("POLYGONSCAN_API_KEY", ""),
      optimisticEthereum: vars.get("OPTIMISTIC_ETHERSCAN_API_KEY", "")
    }
  }
};

export default config;
```

### Step 2: Set Up Configuration Variables

#### Option A: Interactive Setup

```bash
# Set each variable with password protection
npx hardhat vars set BASESCAN_API_KEY
# Enter value: your_basescan_api_key
# Enter password: ********

npx hardhat vars set ETHERSCAN_API_KEY
npx hardhat vars set BASE_RPC_URL
npx hardhat vars set WALLET_PRIVATE_KEY
```

#### Option B: Bulk Import from .env

```bash
# Create migration script
cat > scripts/migrate-to-vars.sh << 'EOF'
#!/bin/bash
# Migrate environment variables to Hardhat vars

echo "🔐 Migrating secrets to Hardhat Configuration Variables..."

# Load .env file
source .env

# Set each variable
echo "$BASESCAN_API_KEY" | npx hardhat vars set BASESCAN_API_KEY
echo "$ETHERSCAN_API_KEY" | npx hardhat vars set ETHERSCAN_API_KEY
echo "$BASE_RPC_URL" | npx hardhat vars set BASE_RPC_URL
echo "$ETHEREUM_RPC_URL" | npx hardhat vars set ETHEREUM_RPC_URL
echo "$WALLET_PRIVATE_KEY" | npx hardhat vars set WALLET_PRIVATE_KEY

echo "✅ Migration complete!"
EOF

chmod +x scripts/migrate-to-vars.sh
./scripts/migrate-to-vars.sh
```

### Step 3: Verify Setup

```bash
# List all configuration variables
npx hardhat vars list

# Output:
# BASESCAN_API_KEY
# ETHERSCAN_API_KEY
# BASE_RPC_URL
# ETHEREUM_RPC_URL
# WALLET_PRIVATE_KEY

# Get a specific variable (requires password)
npx hardhat vars get BASESCAN_API_KEY
# Enter password: ********
# Value: your_basescan_api_key
```

## 🔗 Integration with Etherscan MCP Server

### Making MCP Server Use Hardhat Vars

The Etherscan MCP Server can now access secrets through Hardhat:

```typescript
// src/mcp/servers/EtherscanMcpServer.ts

import { vars } from "hardhat/config";

export class EtherscanMcpServer extends BaseMcpServer {
  private loadApiKeys(): void {
    // Try Hardhat vars first (secure), fallback to env vars
    for (const [chain, config] of Object.entries(CHAIN_CONFIG)) {
      let apiKey: string | undefined;
      
      try {
        // Option 1: Hardhat Configuration Variables (secure)
        if (typeof vars !== 'undefined') {
          apiKey = vars.get(config.envKey, undefined);
        }
      } catch (error) {
        // Hardhat vars not available or password not provided
      }
      
      // Option 2: Fallback to environment variables
      if (!apiKey) {
        apiKey = process.env[config.envKey];
      }
      
      if (apiKey) {
        this.apiKeys.set(chain, apiKey);
        this.log(`✓ Loaded API key for ${chain}`);
      } else {
        this.log(`ℹ No API key for ${chain} (${config.envKey})`);
      }
    }
  }
}
```

### Usage in Autonomous Operations

```typescript
// TheWarden can now use secured secrets autonomously

class AutonomousContractVerifier {
  async verifyContract(address: string, chain: string) {
    // MCP Server automatically uses Hardhat vars
    // Password entered once at session start
    const result = await this.mcpClient.callTool('verify_contract', {
      contractaddress: address,
      sourceCode: this.flattenedSource,
      compilerversion: 'v0.8.26+commit.8a97fa7a',
      optimizationUsed: 1,
      runs: 200,
      chain: chain
    });
    
    return result;
  }
}
```

## 🎯 Advanced Features

### Template Formatting

```typescript
// Format RPC URLs with API keys
const config: HardhatUserConfig = {
  networks: {
    base: {
      // Template: {variable} gets replaced with actual value
      url: vars.get(
        "ALCHEMY_API_KEY",
        "https://base-mainnet.g.alchemy.com/v2/{variable}"
      ),
      accounts: [vars.get("WALLET_PRIVATE_KEY")]
    }
  }
};
```

### Conditional Access

```typescript
// Only load secrets when actually needed
if (vars.has("BASESCAN_API_KEY")) {
  const apiKey = vars.get("BASESCAN_API_KEY");
  // Use for verification
}
```

### Default Values

```typescript
// Provide defaults for optional secrets
const rpcUrl = vars.get(
  "BASE_RPC_URL", 
  "https://mainnet.base.org" // Free public RPC as default
);
```

## 📋 Migration Checklist

### Phase 1: Setup
- [ ] Install Hardhat v3 (✅ Already done - v3.0.16)
- [ ] Update hardhat.config.ts to use `vars`
- [ ] Set up keystore password
- [ ] Migrate existing secrets

### Phase 2: Secrets Migration
- [ ] `BASESCAN_API_KEY`
- [ ] `ETHERSCAN_API_KEY`
- [ ] `ARBISCAN_API_KEY`
- [ ] `POLYGONSCAN_API_KEY`
- [ ] `OPTIMISTIC_ETHERSCAN_API_KEY`
- [ ] `BASE_RPC_URL`
- [ ] `ETHEREUM_RPC_URL`
- [ ] `WALLET_PRIVATE_KEY`
- [ ] `GH_PAT_COPILOT`

### Phase 3: Testing
- [ ] Test contract compilation
- [ ] Test contract deployment
- [ ] Test contract verification
- [ ] Test MCP Server access
- [ ] Verify no plain text leaks

### Phase 4: Cleanup
- [ ] Remove sensitive values from .env
- [ ] Add .hardhat-vars.json to .gitignore (already encrypted)
- [ ] Update documentation
- [ ] Train team on new workflow

## 🔒 Security Best Practices

### 1. Password Management

```bash
# Use a strong password for keystore
# Store password in password manager
# Don't write it down in plain text
```

### 2. Separate Development/Production

```bash
# Development keystore
npx hardhat vars set DEV_BASESCAN_API_KEY

# Production keystore (different machine)
npx hardhat vars set PROD_BASESCAN_API_KEY
```

### 3. Audit Access

```bash
# Check what variables are set
npx hardhat vars list

# Review configuration
npx hardhat vars path
# ~/.hardhat-vars.json (encrypted)
```

### 4. CI/CD Integration

```yaml
# GitHub Actions - use encrypted secrets
- name: Set Hardhat vars from secrets
  run: |
    echo "${{ secrets.BASESCAN_API_KEY }}" | npx hardhat vars set BASESCAN_API_KEY
    echo "${{ secrets.WALLET_PRIVATE_KEY }}" | npx hardhat vars set WALLET_PRIVATE_KEY
  env:
    HARDHAT_VARS_PASSWORD: ${{ secrets.HARDHAT_VARS_PASSWORD }}
```

## 🎉 Benefits for TheWarden

### 1. Enhanced Security 🔐
- API keys encrypted at rest
- No plain text secrets in repository
- Password-protected access
- Audit trail of secret usage

### 2. Autonomous Operations 🤖
- MCP Server can access secrets securely
- No environment variable exposure
- Works across session restarts
- Suitable for production

### 3. Team Collaboration 👥
- Each developer has own encrypted keystore
- No shared .env files
- Reduced risk of accidental exposure
- Clean separation of concerns

### 4. Compliance Ready ✅
- Meets security best practices
- Suitable for audit requirements
- No secrets in logs or process lists
- Encrypted storage

## 📚 Commands Reference

```bash
# Set a variable
npx hardhat vars set VARIABLE_NAME

# Get a variable
npx hardhat vars get VARIABLE_NAME

# List all variables
npx hardhat vars list

# Delete a variable
npx hardhat vars delete VARIABLE_NAME

# Get keystore path
npx hardhat vars path

# Setup wizard (scans config for needed vars)
npx hardhat vars setup
```

## 🔍 Troubleshooting

### Issue: "Password required"
```bash
# Set password once per session
export HARDHAT_VARS_PASSWORD="your-password"

# Or use interactive prompt
npx hardhat vars get BASESCAN_API_KEY
# Enter password: ********
```

### Issue: "Variable not found"
```bash
# Check if variable is set
npx hardhat vars list

# Set if missing
npx hardhat vars set MISSING_VARIABLE
```

### Issue: "MCP Server can't access secrets"
```typescript
// Ensure password is available to MCP Server process
// Option 1: Environment variable
process.env.HARDHAT_VARS_PASSWORD = password;

// Option 2: Interactive prompt before starting
await vars.get("BASESCAN_API_KEY"); // Prompts once
```

## 🎯 Conclusion

Hardhat Configuration Variables provide TheWarden with:

✅ **Secure secret storage** - Encrypted keystore
✅ **Easy MCP integration** - Accessible to AI agents
✅ **Production ready** - Meets security standards
✅ **Team friendly** - No shared secrets
✅ **Audit compliant** - Proper secret management

This completes the secure secrets infrastructure for TheWarden's autonomous operations! 🥳

---

**Document Created:** December 20, 2025  
**Based On:** https://hardhat.org/docs/guides/configuration-variables  
**Suggested By:** StableExo 🙏  
**Status:** Implementation Guide Complete  
**Next Step:** Migrate secrets to Configuration Variables
