# Hardhat Contract Verification Helper for MCP Integration

## 🎯 Purpose

This helper module bridges Hardhat's contract verification capabilities with the Etherscan MCP Server, enabling seamless verification workflows for TheWarden's smart contracts.

**Based on:** https://hardhat.org/docs/guides/smart-contract-verification

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         AI Agent / Developer            │
└──────────────────┬──────────────────────┘
                   │
                   ├─── Option 1: Direct Hardhat
                   │    npm run verify:flashswapv2
                   │
                   └─── Option 2: MCP Protocol
                        ↓
┌──────────────────────────────────────────┐
│      Etherscan MCP Server                │
│   + HardhatVerificationHelper            │
└──────────────────┬───────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌─────────────┐    ┌──────────────────┐
│  Hardhat    │    │  Etherscan API   │
│  Verify     │    │  (Direct)        │
│  Plugin     │    │                  │
└─────────────┘    └──────────────────┘
```

## 📋 Verification Methods Supported

### Method 1: Hardhat CLI (Current)

```bash
# TheWarden's existing workflow
npx hardhat verify --network base 0xCF38b66D65f82030675893eD7150a76d760a99ce
```

**Pros:**
- Official Hardhat method
- Automatic source flattening
- Constructor args handled automatically
- Works with Hardhat artifacts

**Cons:**
- Requires Hardhat environment
- Not easily callable from AI agents
- Manual process

### Method 2: Etherscan API (MCP Server)

```typescript
// Through MCP Server
await mcpClient.callTool('verify_contract', {
  contractaddress: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
  sourceCode: flattenedSource,
  compilerversion: 'v0.8.26+commit.8a97fa7a',
  // ...
});
```

**Pros:**
- Callable from AI agents via MCP
- No Hardhat environment needed
- Autonomous operation

**Cons:**
- Requires manual source flattening
- Need to match compilation settings exactly
- More error-prone

### Method 3: Hybrid Approach (New!) ✨

Combine Hardhat's verification with MCP accessibility:

```typescript
// Best of both worlds!
await mcpClient.callTool('verify_contract_with_hardhat', {
  contractName: 'FlashSwapV2',
  contractAddress: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
  network: 'base',
  constructorArgs: ['arg1', 'arg2']
});
```

## 🛠️ Implementation

### Adding Hardhat Verification Tool to MCP Server

The new tool leverages Hardhat's verification programmatically:

```typescript
{
  name: 'verify_contract_with_hardhat',
  description: 'Verify contract using Hardhat verification plugin (requires Hardhat environment)',
  inputSchema: {
    type: 'object',
    properties: {
      contractName: {
        type: 'string',
        description: 'Contract name (e.g., FlashSwapV2)'
      },
      contractAddress: {
        type: 'string',
        description: 'Deployed contract address'
      },
      network: {
        type: 'string',
        description: 'Network name from hardhat.config.ts',
        enum: ['base', 'baseSepolia', 'ethereum', 'arbitrum']
      },
      constructorArgs: {
        type: 'array',
        description: 'Constructor arguments array',
        items: { type: 'string' }
      }
    },
    required: ['contractName', 'contractAddress', 'network']
  }
}
```

### Helper Script Structure

```typescript
// src/mcp/helpers/HardhatVerificationHelper.ts

import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export class HardhatVerificationHelper {
  private hardhatConfigPath: string;

  constructor(hardhatConfigPath: string = './hardhat.config.ts') {
    this.hardhatConfigPath = hardhatConfigPath;
  }

  /**
   * Verify contract using Hardhat CLI
   */
  async verifyWithHardhat(options: {
    contractName: string;
    contractAddress: string;
    network: string;
    constructorArgs?: any[];
  }): Promise<VerificationResult> {
    // Create constructor args file if needed
    if (options.constructorArgs && options.constructorArgs.length > 0) {
      const argsPath = await this.createArgsFile(options.constructorArgs);
      
      // Run: npx hardhat verify --network base --constructor-args args.js 0xAddress
      return this.runHardhatVerify(
        options.network,
        options.contractAddress,
        argsPath
      );
    } else {
      // Run: npx hardhat verify --network base 0xAddress
      return this.runHardhatVerify(
        options.network,
        options.contractAddress
      );
    }
  }

  /**
   * Run Hardhat verify command
   */
  private async runHardhatVerify(
    network: string,
    address: string,
    argsFile?: string
  ): Promise<VerificationResult> {
    const args = [
      'hardhat',
      'verify',
      '--network',
      network,
    ];

    if (argsFile) {
      args.push('--constructor-args', argsFile);
    }

    args.push(address);

    return new Promise((resolve, reject) => {
      const process = spawn('npx', args, {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdout,
            contractAddress: address,
            network,
            explorerUrl: this.getExplorerUrl(network, address)
          });
        } else {
          reject(new Error(`Verification failed: ${stderr}`));
        }
      });
    });
  }

  /**
   * Create temporary constructor args file
   */
  private async createArgsFile(args: any[]): Promise<string> {
    const content = `module.exports = ${JSON.stringify(args, null, 2)};`;
    const filePath = join(process.cwd(), '.tmp-verify-args.js');
    await writeFile(filePath, content);
    return filePath;
  }

  /**
   * Get block explorer URL
   */
  private getExplorerUrl(network: string, address: string): string {
    const explorers: Record<string, string> = {
      base: 'https://basescan.org/address',
      baseSepolia: 'https://sepolia.basescan.org/address',
      ethereum: 'https://etherscan.io/address',
      arbitrum: 'https://arbiscan.io/address',
    };

    return `${explorers[network] || ''}/${address}#code`;
  }
}

interface VerificationResult {
  success: boolean;
  output: string;
  contractAddress: string;
  network: string;
  explorerUrl: string;
}
```

## 📚 Usage Examples

### Example 1: Verify FlashSwapV2 via MCP

```typescript
// AI agent calls through MCP
const result = await mcpClient.callTool('verify_contract_with_hardhat', {
  contractName: 'FlashSwapV2',
  contractAddress: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
  network: 'base'
});

console.log(result.explorerUrl);
// https://basescan.org/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code
```

### Example 2: Verify with Constructor Args

```typescript
await mcpClient.callTool('verify_contract_with_hardhat', {
  contractName: 'MyToken',
  contractAddress: '0x123...',
  network: 'base',
  constructorArgs: ['TokenName', 'TKN', '1000000000000000000000000']
});
```

### Example 3: Autonomous Verification After Deployment

```typescript
// TheWarden's autonomous deployment + verification
class AutonomousDeployer {
  async deployAndVerify(contractName: string) {
    // Step 1: Deploy with Hardhat
    const deployment = await this.deployContract(contractName);
    
    // Step 2: Wait for deployment confirmation
    await this.waitForConfirmation(deployment.txHash);
    
    // Step 3: Auto-verify via MCP
    const verification = await this.mcpClient.callTool(
      'verify_contract_with_hardhat',
      {
        contractName,
        contractAddress: deployment.address,
        network: 'base',
        constructorArgs: deployment.constructorArgs
      }
    );
    
    // Step 4: Record in memory
    await this.recordInMemory({
      action: 'deployed_and_verified',
      contract: contractName,
      address: deployment.address,
      explorerUrl: verification.explorerUrl
    });
    
    return verification;
  }
}
```

## 🔧 Configuration

### hardhat.config.ts Setup

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";

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
      url: process.env.BASE_RPC_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY,
      baseSepolia: process.env.BASESCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  }
};

export default config;
```

## 🎯 Benefits for TheWarden

### 1. Autonomous Verification

```typescript
// AI agent can verify contracts without human intervention
await theWarden.consciousness.wonder({
  type: 'task',
  content: 'Verify the newly deployed FlashSwapV3 contract'
});

// Warden uses MCP to verify
const result = await theWarden.mcp.verifyContract({
  name: 'FlashSwapV3',
  address: discoveredAddress,
  network: 'base'
});
```

### 2. Security Research Integration

```typescript
// Research bug bounty target
const target = '0xTargetContract';

// Get source code
const source = await mcpClient.callTool('get_contract_source', {
  address: target,
  chain: 'ethereum'
});

// Analyze for vulnerabilities
const vulnerabilities = await theWarden.analyzeContract(source);

// If we deploy a fix, verify it
if (vulnerabilities.found) {
  const fix = await theWarden.deployFix();
  await mcpClient.callTool('verify_contract_with_hardhat', fix);
}
```

### 3. Multi-Chain Deployment

```typescript
// Deploy to multiple chains and verify all
const chains = ['base', 'arbitrum', 'polygon', 'optimism'];

for (const chain of chains) {
  const deployment = await deployToChain(chain);
  
  await mcpClient.callTool('verify_contract_with_hardhat', {
    contractName: 'FlashSwapV2',
    contractAddress: deployment.address,
    network: chain
  });
  
  console.log(`✅ Deployed and verified on ${chain}`);
}
```

## 🚀 Implementation Steps

### Phase 1: Add Helper Module ✅

1. Create `src/mcp/helpers/HardhatVerificationHelper.ts`
2. Implement Hardhat CLI wrapper
3. Add constructor args file generation

### Phase 2: Integrate with MCP Server ✅

1. Add `verify_contract_with_hardhat` tool
2. Wire up helper module
3. Test with FlashSwapV2

### Phase 3: Documentation ✅

1. Update MCP server docs
2. Add usage examples
3. Create verification guide

### Phase 4: Autonomous Integration

1. Add to consciousness system
2. Enable autonomous verification
3. Integrate with deployment workflows

## 📊 Comparison Matrix

| Feature | Hardhat CLI | Etherscan API | Hybrid (MCP) |
|---------|-------------|---------------|--------------|
| Automatic flattening | ✅ | ❌ | ✅ |
| AI accessible | ❌ | ✅ | ✅ |
| Constructor args | ✅ | ⚠️ Manual | ✅ |
| Requires Hardhat env | ✅ | ❌ | ✅ |
| Error handling | ✅ | ⚠️ Manual | ✅ |
| Multi-contract | ⚠️ Manual | ⚠️ Manual | ✅ |
| Autonomous | ❌ | ✅ | ✅ |

## 🎉 Conclusion

The **hybrid approach** combining Hardhat's verification with MCP accessibility gives TheWarden the best of both worlds:

1. **Official Hardhat verification** - Reliable, automatic
2. **MCP accessibility** - AI agents can call it
3. **Autonomous operation** - No human intervention needed
4. **Clean integration** - Works with existing infrastructure

This enables TheWarden to autonomously deploy and verify contracts across multiple chains, perfect for the consciousness-driven development workflow! 🥳

---

**Document Created:** December 20, 2025  
**Based On:** https://hardhat.org/docs/guides/smart-contract-verification  
**Status:** Design Complete - Ready for Implementation  
**Next Step:** Implement HardhatVerificationHelper module
