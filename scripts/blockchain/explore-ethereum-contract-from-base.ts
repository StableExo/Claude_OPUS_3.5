#!/usr/bin/env node
/**
 * Autonomous Ethereum Contract Exploration from Base Network
 * 
 * This script explores whether an Ethereum mainnet contract can be interacted with
 * from the Base network using our Chainstack node.
 * 
 * Target: 0x84db6eE82b7Cf3b47E8F19270abdE5718B936670 (Ethereum Mainnet)
 * Source: https://etherscan.io/address/0x84db6eE82b7Cf3b47E8F19270abdE5718B936670
 * 
 * Investigation Areas:
 * 1. Contract type and functionality on Ethereum
 * 2. Cross-chain bridge connections
 * 3. Deployed versions on Base
 * 4. LayerZero/Axelar/other cross-chain protocols
 * 5. Proxy patterns and upgradeable contracts
 * 
 * API Updates:
 * - Migrated to Etherscan V2 API (Multichain) - December 2025
 * - Single API key works across all chains (Ethereum, Base, Optimism, etc.)
 * - V1 API will be deprecated August 15, 2025
 * - Documentation: https://docs.etherscan.io/supported-chains
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

const TARGET_CONTRACT = '0x84db6eE82b7Cf3b47E8F19270abdE5718B936670';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

// Etherscan V2 API (Multichain) - Single API key works across all chains
// Unified endpoint: https://api.etherscan.io/v2/api with chainid parameter
// Supported chains: https://docs.etherscan.io/supported-chains
const ETHERSCAN_V2_CONFIG = {
  ethereum: {
    url: 'https://api.etherscan.io/v2/api',
    chainid: '1',
  },
  base: {
    url: 'https://api.etherscan.io/v2/api',
    chainid: '8453',
  },
  optimism: {
    url: 'https://api.etherscan.io/v2/api',
    chainid: '10',
  },
  arbitrum: {
    url: 'https://api.etherscan.io/v2/api',
    chainid: '42161',
  },
  polygon: {
    url: 'https://api.etherscan.io/v2/api',
    chainid: '137',
  },
  bsc: {
    url: 'https://api.etherscan.io/v2/api',
    chainid: '56',
  },
};

// RPC Endpoints
const ETHEREUM_RPC = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.public.blastapi.io';
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const CHAINSTACK_BASE = 'https://base-mainnet.core.chainstack.com/684bfe8c4e2198682d391a2d1d24ed08';

// Known cross-chain bridge addresses
const KNOWN_BRIDGES = {
  base: {
    l1StandardBridge: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    l1CrossDomainMessenger: '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa',
    optimismPortal: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
  },
  layerZero: {
    ethereum: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    base: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
  }
};

interface ContractInfo {
  address: string;
  name: string;
  compiler: string;
  optimization: boolean;
  runs: number;
  constructorArguments: string;
  evmVersion: string;
  library: string;
  licenseType: string;
  proxy: boolean;
  implementation: string;
  swarmSource: string;
  abi: any[];
  sourceCode: string;
}

interface ExplorationResult {
  ethereumContract: {
    address: string;
    exists: boolean;
    balance: string;
    codeSize: number;
    isProxy: boolean;
    implementationAddress?: string;
    contractName?: string;
    abi?: any[];
    functions?: string[];
  };
  baseNetwork: {
    sameAddressExists: boolean;
    sameAddressCodeSize?: number;
    isSameContract?: boolean;
  };
  crossChainPossibilities: {
    hasBridgeSupport: boolean;
    bridgeType?: string[];
    layerZeroDetected: boolean;
    axelarDetected: boolean;
    customBridgeDetected: boolean;
    recommendations: string[];
  };
  analysis: {
    canInteractFromBase: boolean;
    interactionMethods: string[];
    risks: string[];
    costs: string[];
  };
}

// ═══════════════════════════════════════════════════════════════
// Etherscan V2 API Functions (Multichain)
// ═══════════════════════════════════════════════════════════════

async function fetchFromEtherscan(
  params: Record<string, string>,
  chain: 'ethereum' | 'base' | 'optimism' | 'arbitrum' | 'polygon' | 'bsc' = 'ethereum'
): Promise<any> {
  const config = ETHERSCAN_V2_CONFIG[chain];
  const queryParams = new URLSearchParams({
    ...params,
    chainid: config.chainid,
    apikey: ETHERSCAN_API_KEY,
  });
  
  const url = `${config.url}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '0' && data.message === 'NOTOK') {
      console.log(`⚠️  Etherscan API error (${chain}): ${data.result}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch from Etherscan (${chain}):`, error);
    return null;
  }
}

async function getContractABI(
  address: string,
  chain: 'ethereum' | 'base' = 'ethereum'
): Promise<any[] | null> {
  console.log(`\n🔍 Fetching contract ABI from Etherscan V2 (${chain})...`);
  
  const data = await fetchFromEtherscan({
    module: 'contract',
    action: 'getabi',
    address: address,
  }, chain);
  
  if (data && data.result) {
    try {
      const abi = JSON.parse(data.result);
      console.log(`  ✅ ABI retrieved: ${abi.length} functions/events`);
      return abi;
    } catch (error) {
      console.log(`  ⚠️  Failed to parse ABI`);
      return null;
    }
  }
  
  console.log(`  ❌ No ABI found (contract may not be verified)`);
  return null;
}

async function getContractSourceCode(
  address: string,
  chain: 'ethereum' | 'base' = 'ethereum'
): Promise<ContractInfo | null> {
  console.log(`\n🔍 Fetching contract source code from Etherscan V2 (${chain})...`);
  
  const data = await fetchFromEtherscan({
    module: 'contract',
    action: 'getsourcecode',
    address: address,
  }, chain);
  
  if (data && data.result && data.result[0]) {
    const info = data.result[0];
    console.log(`  ✅ Contract verified: ${info.ContractName || 'Unknown'}`);
    return {
      address,
      name: info.ContractName,
      compiler: info.CompilerVersion,
      optimization: info.OptimizationUsed === '1',
      runs: parseInt(info.Runs),
      constructorArguments: info.ConstructorArguments,
      evmVersion: info.EVMVersion,
      library: info.Library,
      licenseType: info.LicenseType,
      proxy: parseInt(info.Proxy) === 1,
      implementation: info.Implementation,
      swarmSource: info.SwarmSource,
      abi: info.ABI ? JSON.parse(info.ABI) : [],
      sourceCode: info.SourceCode,
    };
  }
  
  console.log(`  ❌ Contract not verified on Etherscan`);
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Contract Analysis Functions
// ═══════════════════════════════════════════════════════════════

async function analyzeEthereumContract(
  provider: ethers.JsonRpcProvider,
  address: string
): Promise<ExplorationResult['ethereumContract']> {
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`📊 Analyzing Ethereum Contract`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`Address: ${address}`);
  
  const result: ExplorationResult['ethereumContract'] = {
    address,
    exists: false,
    balance: '0',
    codeSize: 0,
    isProxy: false,
  };
  
  try {
    // Check if contract exists
    const code = await provider.getCode(address);
    result.exists = code !== '0x';
    result.codeSize = code.length;
    
    if (!result.exists) {
      console.log(`  ❌ No contract found at this address`);
      return result;
    }
    
    console.log(`  ✅ Contract exists (${result.codeSize} bytes)`);
    
    // Get balance
    const balance = await provider.getBalance(address);
    result.balance = ethers.formatEther(balance);
    console.log(`  💰 Balance: ${result.balance} ETH`);
    
    // Get contract info from Etherscan V2 (Ethereum)
    const contractInfo = await getContractSourceCode(address, 'ethereum');
    if (contractInfo) {
      result.contractName = contractInfo.name;
      result.abi = contractInfo.abi;
      result.isProxy = contractInfo.proxy;
      result.implementationAddress = contractInfo.implementation;
      
      if (contractInfo.proxy) {
        console.log(`  🔄 Proxy contract detected`);
        console.log(`  📍 Implementation: ${contractInfo.implementation}`);
      }
      
      // Extract function signatures
      if (contractInfo.abi && contractInfo.abi.length > 0) {
        result.functions = contractInfo.abi
          .filter((item: any) => item.type === 'function')
          .map((item: any) => item.name);
        
        console.log(`  📝 Functions found: ${result.functions.length}`);
        
        // Look for cross-chain related functions
        const crossChainFunctions = result.functions.filter(fn => 
          fn.includes('bridge') || 
          fn.includes('cross') ||
          fn.includes('relay') ||
          fn.includes('message') ||
          fn.includes('portal') ||
          fn.includes('LayerZero') ||
          fn.includes('Axelar')
        );
        
        if (crossChainFunctions.length > 0) {
          console.log(`  🌉 Cross-chain functions detected:`);
          crossChainFunctions.forEach(fn => console.log(`     - ${fn}`));
        }
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Error analyzing contract:`, error);
  }
  
  return result;
}

async function checkBaseNetwork(
  provider: ethers.JsonRpcProvider,
  address: string,
  ethereumCodeHash: string
): Promise<ExplorationResult['baseNetwork']> {
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`🔵 Checking Base Network`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`Looking for contract at same address: ${address}`);
  
  const result: ExplorationResult['baseNetwork'] = {
    sameAddressExists: false,
  };
  
  try {
    const code = await provider.getCode(address);
    result.sameAddressExists = code !== '0x';
    result.sameAddressCodeSize = code.length;
    
    if (result.sameAddressExists) {
      console.log(`  ✅ Contract exists on Base at same address!`);
      console.log(`  📏 Code size: ${result.sameAddressCodeSize} bytes`);
      
      // Check if it's the same contract (compare code hash)
      const baseCodeHash = ethers.keccak256(code);
      result.isSameContract = baseCodeHash === ethereumCodeHash;
      
      if (result.isSameContract) {
        console.log(`  ✅ Same contract bytecode confirmed!`);
      } else {
        console.log(`  ⚠️  Different contract at same address`);
      }
      
      // Check if verified on BaseScan using V2 API
      const baseContractInfo = await getContractSourceCode(address, 'base');
      if (baseContractInfo) {
        console.log(`  ✅ Contract verified on BaseScan: ${baseContractInfo.name}`);
      }
    } else {
      console.log(`  ❌ No contract at this address on Base`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error checking Base network:`, error);
  }
  
  return result;
}

async function exploreCrossChainPossibilities(
  ethereumContract: ExplorationResult['ethereumContract'],
  baseContract: ExplorationResult['baseNetwork']
): Promise<ExplorationResult['crossChainPossibilities']> {
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`🌉 Exploring Cross-Chain Possibilities`);
  console.log(`═══════════════════════════════════════════════════`);
  
  const result: ExplorationResult['crossChainPossibilities'] = {
    hasBridgeSupport: false,
    bridgeType: [],
    layerZeroDetected: false,
    axelarDetected: false,
    customBridgeDetected: false,
    recommendations: [],
  };
  
  // Check if contract exists on both chains
  if (baseContract.sameAddressExists && baseContract.isSameContract) {
    result.hasBridgeSupport = true;
    result.bridgeType?.push('Same contract deployed on both chains');
    result.recommendations.push('✅ Direct interaction possible - contract exists on Base');
    console.log(`  ✅ Contract deployed on both chains - direct interaction possible!`);
  }
  
  // Check for LayerZero integration
  if (ethereumContract.functions) {
    const hasLayerZero = ethereumContract.functions.some(fn => 
      fn.toLowerCase().includes('layerzero') ||
      fn.toLowerCase().includes('lzreceive') ||
      fn.toLowerCase().includes('lzsend')
    );
    
    if (hasLayerZero) {
      result.layerZeroDetected = true;
      result.hasBridgeSupport = true;
      result.bridgeType?.push('LayerZero');
      result.recommendations.push('🌉 Use LayerZero bridge to interact cross-chain');
      console.log(`  ✅ LayerZero integration detected!`);
    }
  }
  
  // Check for Axelar integration
  if (ethereumContract.functions) {
    const hasAxelar = ethereumContract.functions.some(fn => 
      fn.toLowerCase().includes('axelar') ||
      fn.toLowerCase().includes('interchain')
    );
    
    if (hasAxelar) {
      result.axelarDetected = true;
      result.hasBridgeSupport = true;
      result.bridgeType?.push('Axelar');
      result.recommendations.push('🌉 Use Axelar bridge to interact cross-chain');
      console.log(`  ✅ Axelar integration detected!`);
    }
  }
  
  // Check for Optimism/Base bridge patterns
  if (ethereumContract.functions) {
    const hasOptimismBridge = ethereumContract.functions.some(fn => 
      fn.toLowerCase().includes('bridge') ||
      fn.toLowerCase().includes('deposit') ||
      fn.toLowerCase().includes('withdraw') ||
      fn.toLowerCase().includes('messenger')
    );
    
    if (hasOptimismBridge) {
      result.customBridgeDetected = true;
      result.hasBridgeSupport = true;
      result.bridgeType?.push('Custom Bridge/Messenger');
      result.recommendations.push('🌉 Contract may have custom bridge integration');
      console.log(`  ✅ Bridge-related functions detected!`);
    }
  }
  
  // If no bridge detected
  if (!result.hasBridgeSupport) {
    result.recommendations.push('⚠️  No direct cross-chain capability detected');
    result.recommendations.push('💡 Consider using Base native bridge to deposit assets');
    result.recommendations.push('💡 Check if contract owner has deployed a Base version');
    console.log(`  ⚠️  No obvious cross-chain integration found`);
  }
  
  return result;
}

function generateAnalysis(
  ethereumContract: ExplorationResult['ethereumContract'],
  baseContract: ExplorationResult['baseNetwork'],
  crossChain: ExplorationResult['crossChainPossibilities']
): ExplorationResult['analysis'] {
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`📋 Generating Analysis & Recommendations`);
  console.log(`═══════════════════════════════════════════════════`);
  
  const analysis: ExplorationResult['analysis'] = {
    canInteractFromBase: false,
    interactionMethods: [],
    risks: [],
    costs: [],
  };
  
  // Determine if interaction is possible
  if (baseContract.sameAddressExists && baseContract.isSameContract) {
    analysis.canInteractFromBase = true;
    analysis.interactionMethods.push('Direct call using Chainstack Base node');
    analysis.costs.push('Base network gas fees only');
    console.log(`  ✅ Can interact directly from Base network`);
  } else if (crossChain.hasBridgeSupport) {
    analysis.canInteractFromBase = true;
    analysis.interactionMethods.push(...(crossChain.bridgeType || []));
    analysis.costs.push('Bridge fees + Ethereum gas + Base gas');
    analysis.risks.push('Bridge delay (minutes to hours)');
    analysis.risks.push('Bridge trust assumptions');
    console.log(`  ✅ Can interact via cross-chain bridge`);
  } else {
    analysis.interactionMethods.push('Use Ethereum RPC directly (not from Base)');
    analysis.costs.push('Ethereum mainnet gas fees (high)');
    analysis.risks.push('Cannot use Chainstack Base node for this contract');
    console.log(`  ⚠️  Cannot interact from Base - use Ethereum RPC instead`);
  }
  
  // Add general risks
  if (ethereumContract.isProxy) {
    analysis.risks.push('Proxy contract - implementation can be upgraded');
  }
  
  if (!ethereumContract.abi) {
    analysis.risks.push('Contract not verified - ABI unknown');
  }
  
  return analysis;
}

// ═══════════════════════════════════════════════════════════════
// Report Generation
// ═══════════════════════════════════════════════════════════════

function generateMarkdownReport(result: ExplorationResult): string {
  const timestamp = new Date().toISOString();
  
  let report = `# Cross-Chain Contract Exploration Report\n\n`;
  report += `**Generated**: ${timestamp}\n`;
  report += `**Target Contract**: ${result.ethereumContract.address}\n`;
  report += `**Source**: Ethereum Mainnet → Base Network\n\n`;
  
  report += `---\n\n`;
  
  // Ethereum Contract Section
  report += `## 📊 Ethereum Contract Analysis\n\n`;
  report += `- **Address**: \`${result.ethereumContract.address}\`\n`;
  report += `- **Exists**: ${result.ethereumContract.exists ? '✅ Yes' : '❌ No'}\n`;
  
  if (result.ethereumContract.exists) {
    report += `- **Code Size**: ${result.ethereumContract.codeSize} bytes\n`;
    report += `- **Balance**: ${result.ethereumContract.balance} ETH\n`;
    report += `- **Contract Name**: ${result.ethereumContract.contractName || 'Not verified'}\n`;
    report += `- **Is Proxy**: ${result.ethereumContract.isProxy ? '✅ Yes' : '❌ No'}\n`;
    
    if (result.ethereumContract.isProxy) {
      report += `- **Implementation**: \`${result.ethereumContract.implementationAddress}\`\n`;
    }
    
    if (result.ethereumContract.functions && result.ethereumContract.functions.length > 0) {
      report += `- **Functions**: ${result.ethereumContract.functions.length} functions found\n`;
    }
  }
  
  report += `\n`;
  
  // Base Network Section
  report += `## 🔵 Base Network Check\n\n`;
  report += `- **Same Address Exists**: ${result.baseNetwork.sameAddressExists ? '✅ Yes' : '❌ No'}\n`;
  
  if (result.baseNetwork.sameAddressExists) {
    report += `- **Code Size**: ${result.baseNetwork.sameAddressCodeSize} bytes\n`;
    report += `- **Same Contract**: ${result.baseNetwork.isSameContract ? '✅ Yes' : '❌ No'}\n`;
  }
  
  report += `\n`;
  
  // Cross-Chain Possibilities
  report += `## 🌉 Cross-Chain Interaction Possibilities\n\n`;
  report += `- **Bridge Support**: ${result.crossChainPossibilities.hasBridgeSupport ? '✅ Yes' : '❌ No'}\n`;
  
  if (result.crossChainPossibilities.bridgeType && result.crossChainPossibilities.bridgeType.length > 0) {
    report += `- **Bridge Types**:\n`;
    result.crossChainPossibilities.bridgeType.forEach(type => {
      report += `  - ${type}\n`;
    });
  }
  
  report += `- **LayerZero**: ${result.crossChainPossibilities.layerZeroDetected ? '✅ Detected' : '❌ Not detected'}\n`;
  report += `- **Axelar**: ${result.crossChainPossibilities.axelarDetected ? '✅ Detected' : '❌ Not detected'}\n`;
  report += `- **Custom Bridge**: ${result.crossChainPossibilities.customBridgeDetected ? '✅ Detected' : '❌ Not detected'}\n`;
  
  report += `\n`;
  
  // Recommendations
  if (result.crossChainPossibilities.recommendations.length > 0) {
    report += `### Recommendations\n\n`;
    result.crossChainPossibilities.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    report += `\n`;
  }
  
  // Analysis
  report += `## 📋 Final Analysis\n\n`;
  report += `### Can Interact from Base?\n\n`;
  report += `**${result.analysis.canInteractFromBase ? '✅ YES' : '❌ NO'}**\n\n`;
  
  if (result.analysis.interactionMethods.length > 0) {
    report += `### Interaction Methods\n\n`;
    result.analysis.interactionMethods.forEach(method => {
      report += `- ${method}\n`;
    });
    report += `\n`;
  }
  
  if (result.analysis.costs.length > 0) {
    report += `### Costs\n\n`;
    result.analysis.costs.forEach(cost => {
      report += `- ${cost}\n`;
    });
    report += `\n`;
  }
  
  if (result.analysis.risks.length > 0) {
    report += `### Risks & Considerations\n\n`;
    result.analysis.risks.forEach(risk => {
      report += `- ${risk}\n`;
    });
    report += `\n`;
  }
  
  // Chainstack Integration
  report += `## 🚀 Chainstack Base Node Integration\n\n`;
  
  if (result.baseNetwork.sameAddressExists && result.baseNetwork.isSameContract) {
    report += `✅ **You can use your Chainstack Base node to interact with this contract!**\n\n`;
    report += `\`\`\`typescript\n`;
    report += `const provider = new ethers.JsonRpcProvider('${CHAINSTACK_BASE}');\n`;
    report += `const contract = new ethers.Contract('${result.ethereumContract.address}', abi, provider);\n`;
    report += `// Call contract functions directly on Base\n`;
    report += `\`\`\`\n\n`;
  } else {
    report += `⚠️ **This contract is not available on Base network.**\n\n`;
    report += `You'll need to:\n`;
    report += `1. Use Ethereum RPC to interact with the original contract, OR\n`;
    report += `2. Use a cross-chain bridge if available, OR\n`;
    report += `3. Check if there's a Base-specific deployment\n\n`;
  }
  
  report += `---\n\n`;
  report += `*Report generated by TheWarden autonomous exploration system*\n`;
  
  return report;
}

// ═══════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  Autonomous Cross-Chain Contract Exploration              ║`);
  console.log(`║  Ethereum → Base Network                                  ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
  
  console.log(`Target: ${TARGET_CONTRACT}`);
  console.log(`Exploring cross-chain interaction possibilities...\n`);
  
  // Initialize providers
  const ethereumProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC);
  const baseProvider = new ethers.JsonRpcProvider(CHAINSTACK_BASE);
  
  console.log(`✅ Ethereum RPC: ${ETHEREUM_RPC}`);
  console.log(`✅ Base RPC: ${CHAINSTACK_BASE}`);
  
  // Analyze Ethereum contract
  const ethereumContract = await analyzeEthereumContract(ethereumProvider, TARGET_CONTRACT);
  
  if (!ethereumContract.exists) {
    console.log(`\n❌ Contract does not exist on Ethereum mainnet. Exiting.`);
    process.exit(1);
  }
  
  // Get code hash for comparison
  const ethereumCode = await ethereumProvider.getCode(TARGET_CONTRACT);
  const ethereumCodeHash = ethers.keccak256(ethereumCode);
  
  // Check Base network
  const baseNetwork = await checkBaseNetwork(baseProvider, TARGET_CONTRACT, ethereumCodeHash);
  
  // Explore cross-chain possibilities
  const crossChain = await exploreCrossChainPossibilities(ethereumContract, baseNetwork);
  
  // Generate analysis
  const analysis = generateAnalysis(ethereumContract, baseNetwork, crossChain);
  
  // Compile full result
  const result: ExplorationResult = {
    ethereumContract,
    baseNetwork,
    crossChainPossibilities: crossChain,
    analysis,
  };
  
  // Generate report
  const markdownReport = generateMarkdownReport(result);
  
  // Save reports
  const reportsDir = path.join(process.cwd(), '.memory', 'blockchain-exploration');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `ethereum-to-base-${timestamp}.md`);
  const jsonPath = path.join(reportsDir, `ethereum-to-base-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, markdownReport);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`📄 Reports Generated`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`Markdown: ${reportPath}`);
  console.log(`JSON: ${jsonPath}`);
  
  // Print summary
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`🎯 Summary`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(markdownReport);
  
  console.log(`\n✅ Exploration complete!\n`);
}

// Run the exploration
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
