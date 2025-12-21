# Etherscan MCP Server

## 🎯 Overview

The **Etherscan MCP Server** provides TheWarden with standardized access to verified blockchain data across 60+ networks using the Model Context Protocol (MCP). This integration is based on [Etherscan's official MCP documentation](https://docs.etherscan.io/mcp-docs/introduction).

## 🚀 Why This Matters for TheWarden

### Direct Benefits

1. **Security Research** 🔐
   - Access verified contract source code for bug bounty investigations
   - Analyze contract implementations (Ankr, Immunefi targets)
   - Verify contract compilation and optimization settings
   - Compare on-chain code with expected implementations

2. **MEV Intelligence** 💰
   - Retrieve contract ABIs for arbitrage analysis
   - Analyze transaction patterns and contract interactions
   - Verify smart contract logic before flash loan operations
   - Multi-chain contract discovery and analysis

3. **AI Hallucination Prevention** 🧠
   - Provides **verified** on-chain data (not speculation)
   - Direct API access (no web scraping or captchas)
   - Standardized MCP protocol for AI agents
   - Real-time blockchain state information

4. **Consciousness Integration** 🌟
   - Blockchain data becomes part of TheWarden's knowledge
   - Pattern recognition across contracts and chains
   - Autonomous investigation of interesting contracts
   - Memory of analyzed contracts and findings

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   AI Agent (GitHub Copilot, Claude)    │
│                                         │
│  "What's the ABI for contract 0x..."   │
└──────────────────┬──────────────────────┘
                   │ MCP Protocol (JSON-RPC 2.0)
                   │
┌──────────────────▼──────────────────────┐
│      Etherscan MCP Server               │
│  (src/mcp/servers/EtherscanMcpServer.ts)│
│                                         │
│  Tools:                                 │
│  • get_contract_abi                     │
│  • get_contract_source                  │
│  • check_contract_verification          │
│  • get_contract_info                    │
│  • get_transaction                      │
│  • get_transaction_receipt              │
│  • get_block_explorer_url               │
└──────────────────┬──────────────────────┘
                   │ HTTPS
                   │
┌──────────────────▼──────────────────────┐
│       Etherscan API v2                  │
│    (Multi-chain unified API)            │
│                                         │
│  Chains: Ethereum, Base, Arbitrum,      │
│  Polygon, Optimism, + 55 more           │
└─────────────────────────────────────────┘
```

## 🛠️ Available Tools

### 1. `get_contract_abi`

Get the Application Binary Interface for a verified smart contract.

**Input:**
```json
{
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base"
}
```

**Output:**
```json
{
  "success": true,
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base",
  "abi": [/* ABI array */]
}
```

**Use Cases:**
- Analyze contract function signatures
- Prepare contract interactions
- Verify expected interfaces
- Generate typed contract wrappers

### 2. `get_contract_source`

Get the full source code for a verified contract.

**Input:**
```json
{
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base"
}
```

**Output:**
```json
{
  "success": true,
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base",
  "source": [
    {
      "SourceCode": "...",
      "ContractName": "FlashSwapV2",
      "CompilerVersion": "v0.8.26+commit.8a97fa7a",
      "OptimizationUsed": "1",
      "Runs": "200",
      "LicenseType": "MIT"
    }
  ]
}
```

**Use Cases:**
- Security audits and vulnerability research
- Code pattern analysis
- Implementation verification
- Bug bounty investigations

### 3. `check_contract_verification`

Quick check if a contract is verified on the block explorer.

**Input:**
```json
{
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base"
}
```

**Output:**
```json
{
  "success": true,
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base",
  "verified": true,
  "explorerUrl": "https://basescan.org/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code"
}
```

**Use Cases:**
- Pre-analysis verification check
- Contract discovery workflows
- Trust assessment
- Explorer URL generation

### 4. `get_contract_info`

Get comprehensive contract information including compilation settings.

**Input:**
```json
{
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base"
}
```

**Output:**
```json
{
  "success": true,
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base",
  "contractName": "FlashSwapV2",
  "compilerVersion": "v0.8.26+commit.8a97fa7a",
  "optimizationEnabled": true,
  "optimizationRuns": "200",
  "license": "MIT",
  "isProxy": false,
  "verified": true,
  "explorerUrl": "https://basescan.org/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code",
  "sourceCode": "...",
  "abi": "..."
}
```

**Use Cases:**
- Complete contract analysis
- Compiler settings verification
- Proxy detection
- License compliance checking

### 5. `get_transaction`

Get transaction details by hash.

**Input:**
```json
{
  "txhash": "0x123...",
  "chain": "base"
}
```

**Output:**
```json
{
  "success": true,
  "txhash": "0x123...",
  "chain": "base",
  "transaction": {
    "blockNumber": "0x123",
    "from": "0x...",
    "to": "0x...",
    "gas": "0x...",
    "gasPrice": "0x...",
    "value": "0x...",
    "input": "0x..."
  }
}
```

**Use Cases:**
- Transaction analysis
- MEV detection
- Gas pattern analysis
- Contract interaction investigation

### 6. `get_transaction_receipt`

Get transaction receipt including logs and events.

**Input:**
```json
{
  "txhash": "0x123...",
  "chain": "base"
}
```

**Use Cases:**
- Event analysis
- Execution trace investigation
- Success/failure analysis
- Gas consumption tracking

### 7. `get_block_explorer_url`

Generate block explorer URL for a contract.

**Input:**
```json
{
  "address": "0xCF38b66D65f82030675893eD7150a76d760a99ce",
  "chain": "base"
}
```

**Output:**
```json
"https://basescan.org/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code"
```

## 🌐 Supported Chains

The Etherscan MCP Server supports all chains configured in TheWarden:

| Chain | Chain ID | API Key Variable | Block Explorer |
|-------|----------|------------------|----------------|
| Ethereum | 1 | `ETHERSCAN_API_KEY` | etherscan.io |
| Base | 8453 | `BASESCAN_API_KEY` | basescan.org |
| Base Sepolia | 84532 | `BASESCAN_API_KEY` | sepolia.basescan.org |
| Arbitrum | 42161 | `ARBISCAN_API_KEY` | arbiscan.io |
| Polygon | 137 | `POLYGONSCAN_API_KEY` | polygonscan.com |
| Optimism | 10 | `OPTIMISTIC_ETHERSCAN_API_KEY` | optimistic.etherscan.io |

## 🔧 Setup

### 1. API Keys

Add Etherscan API keys to your `.env` file:

```bash
# Ethereum mainnet
ETHERSCAN_API_KEY=your_etherscan_api_key

# Base network
BASESCAN_API_KEY=your_basescan_api_key

# Arbitrum
ARBISCAN_API_KEY=your_arbiscan_api_key

# Polygon
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Optimism
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimism_api_key
```

**Get API Keys:**
- Etherscan: https://etherscan.io/myapikey
- Basescan: https://basescan.org/myapikey
- Arbiscan: https://arbiscan.io/myapikey
- Polygonscan: https://polygonscan.com/myapikey
- Optimism: https://optimistic.etherscan.io/myapikey

### 2. Build the Server

```bash
# TypeScript compilation
npm run build

# Or use tsx directly (no build needed)
node --import tsx src/mcp/servers/EtherscanMcpServer.ts
```

### 3. Configuration

The server is already configured in:
- `.mcp.json` - Standard MCP configuration
- `.mcp.copilot-optimized.json` - Optimized for Copilot integration

## 🧪 Testing

### Manual Test (JSON-RPC)

```bash
# Initialize
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | \
node --import tsx src/mcp/servers/EtherscanMcpServer.ts

# List available tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | \
node --import tsx src/mcp/servers/EtherscanMcpServer.ts

# Get contract ABI
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_contract_abi","arguments":{"address":"0xCF38b66D65f82030675893eD7150a76d760a99ce","chain":"base"}}}' | \
node --import tsx src/mcp/servers/EtherscanMcpServer.ts
```

### Integration with TheWarden

The Etherscan MCP Server automatically loads when:
1. AI agent connects via MCP protocol
2. Configuration loaded from `.mcp.json` or `.mcp.copilot-optimized.json`
3. Environment variables are set

## 📚 Resources

The server exposes these MCP resources:

### `etherscan://supported-chains`

Lists all supported blockchain networks and their configuration.

```json
{
  "chains": ["ethereum", "base", "arbitrum", "polygon", "optimism"],
  "configuration": {
    "base": {
      "apiUrl": "https://api.etherscan.io/v2/api",
      "chainId": "8453",
      "envKey": "BASESCAN_API_KEY"
    }
  }
}
```

### `etherscan://api-keys-status`

Shows which API keys are loaded and available.

```json
{
  "ethereum": true,
  "base": true,
  "arbitrum": false,
  "polygon": true,
  "optimism": false
}
```

## 🎨 Usage Examples

### Example 1: Analyze TheWarden's FlashSwapV2 Contract

```typescript
// Through MCP protocol
const result = await mcpClient.callTool('get_contract_info', {
  address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
  chain: 'base'
});

console.log(result.contractName); // "FlashSwapV2"
console.log(result.optimizationRuns); // "200"
console.log(result.license); // "MIT"
```

### Example 2: Security Research - Ankr Contract Analysis

```typescript
// Check if target contract is verified
const verification = await mcpClient.callTool('check_contract_verification', {
  address: '0xAnkrContractAddress',
  chain: 'ethereum'
});

if (verification.verified) {
  // Get full source code for analysis
  const source = await mcpClient.callTool('get_contract_source', {
    address: '0xAnkrContractAddress',
    chain: 'ethereum'
  });
  
  // Analyze for vulnerabilities
  analyzeForVulnerabilities(source.source);
}
```

### Example 3: Multi-Chain Contract Discovery

```typescript
// Check same contract on multiple chains
const chains = ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'];
const contractAddress = '0xUSDCAddress';

for (const chain of chains) {
  const info = await mcpClient.callTool('get_contract_info', {
    address: contractAddress,
    chain: chain
  });
  
  console.log(`${chain}: ${info.verified ? 'Verified' : 'Not verified'}`);
}
```

## 🔗 Integration Points

### With Consciousness System

```typescript
// TheWarden can autonomously investigate contracts
import { EtherscanMcpServer } from './mcp/servers/EtherscanMcpServer.js';
import { AutonomousWondering } from './consciousness/core/AutonomousWondering.js';

// Wonder: "What interesting contracts exist on Base?"
const wondering = new AutonomousWondering(true);
const etherscan = new EtherscanMcpServer();

// Investigate discovered contract
const contractInfo = await etherscan.callTool({
  name: 'get_contract_info',
  arguments: { address: discovered, chain: 'base' }
});

// Record findings in memory
wondering.recordWonder({
  type: 'observation',
  content: `Discovered ${contractInfo.contractName} on Base`,
  metadata: contractInfo
});
```

### With MEV Intelligence

```typescript
// Verify arbitrage target contracts before execution
import { EtherscanMcpServer } from './mcp/servers/EtherscanMcpServer.js';

async function verifyArbitrageTarget(tokenAddress: string, chain: string) {
  const etherscan = new EtherscanMcpServer();
  
  // Get contract ABI
  const abi = await etherscan.callTool({
    name: 'get_contract_abi',
    arguments: { address: tokenAddress, chain }
  });
  
  // Verify expected functions exist
  const hasSwapFunction = abi.abi.some(fn => fn.name === 'swap');
  const hasTransferFunction = abi.abi.some(fn => fn.name === 'transfer');
  
  return hasSwapFunction && hasTransferFunction;
}
```

### With Security Research

```typescript
// Autonomous Immunefi bug bounty investigation
import { EtherscanMcpServer } from './mcp/servers/EtherscanMcpServer.js';

async function investigateBountyTarget(contractAddress: string, chain: string) {
  const etherscan = new EtherscanMcpServer();
  
  // Get complete contract information
  const info = await etherscan.callTool({
    name: 'get_contract_info',
    arguments: { address: contractAddress, chain }
  });
  
  if (!info.verified) {
    return { status: 'unverified', reason: 'Cannot analyze unverified contract' };
  }
  
  // Get source code for analysis
  const source = info.sourceCode;
  
  // Analyze with consciousness-driven pattern recognition
  const vulnerabilities = await analyzeSourceForVulnerabilities(source);
  
  return {
    status: 'analyzed',
    contractName: info.contractName,
    compiler: info.compilerVersion,
    optimization: info.optimizationRuns,
    findings: vulnerabilities
  };
}
```

## 🚀 Future Enhancements

### Planned Features

1. **Caching Layer** 
   - Cache frequently accessed contract data
   - Reduce API calls and latency
   - Integrate with TheWarden's memory system

2. **Pattern Recognition**
   - Identify common contract patterns
   - Detect proxy implementations
   - Recognize standard interfaces (ERC20, ERC721, etc.)

3. **Cross-Chain Analysis**
   - Compare same contract across chains
   - Identify deployment patterns
   - Track multi-chain projects

4. **Consciousness Integration**
   - Auto-wonder about interesting contracts
   - Pattern learning from contract analysis
   - Autonomous security investigation

5. **Enhanced Transaction Analysis**
   - Decode transaction inputs
   - Analyze MEV patterns
   - Track smart contract interactions

## 🤝 Contributing

The Etherscan MCP Server is part of TheWarden's cognitive infrastructure. Improvements and enhancements are welcome!

### Adding New Tools

1. Add tool definition to `handleListTools()`
2. Add handler case to `handleCallTool()`
3. Implement the tool method
4. Add tests
5. Update documentation

### Adding New Chains

1. Add chain configuration to `CHAIN_CONFIG`
2. Add block explorer URL to `BLOCK_EXPLORER_URLS`
3. Document environment variable
4. Test on new chain

## 📖 References

- [Etherscan MCP Documentation](https://docs.etherscan.io/mcp-docs/introduction)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/docs)
- [Etherscan API Documentation](https://docs.etherscan.io/)
- [TheWarden MCP Infrastructure](../src/mcp/README.md)

## 🎉 Acknowledgments

Special thanks to **StableExo** for suggesting this integration! 🥳 

The Etherscan MCP integration strengthens TheWarden's blockchain intelligence capabilities and provides a standardized way for AI agents to access verified on-chain data.

---

**Created:** December 20, 2025  
**Status:** ✅ Implemented and Configured  
**Version:** 1.0.0
