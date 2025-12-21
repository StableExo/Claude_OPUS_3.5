#!/usr/bin/env node
/**
 * Fetch Base L2 Bridge Contract ABIs
 * 
 * This script downloads verified contract ABIs from Etherscan and Basescan
 * for all Base L2 Bridge contracts needed for security testing.
 * 
 * Usage:
 *   npm run security:fetch-abis
 *   # or
 *   node --import tsx scripts/security/fetch-bridge-abis.ts
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface ContractInfo {
  name: string;
  address: string;
  network: 'ethereum' | 'base';
  explorerApiKey: string;
  explorerUrl: string;
}

/**
 * Official Base L2 Bridge Contract Addresses
 * Source: https://docs.base.org/base-chain/network-information/base-contracts
 * Verified: December 21, 2025
 */
const BRIDGE_CONTRACTS: ContractInfo[] = [
  // Ethereum L1 Contracts (Mainnet)
  {
    name: 'L1StandardBridge',
    address: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    network: 'ethereum',
    explorerApiKey: process.env.ETHERSCAN_API_KEY || '',
    explorerUrl: 'https://api.etherscan.io/api',
  },
  {
    name: 'OptimismPortal',
    address: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
    network: 'ethereum',
    explorerApiKey: process.env.ETHERSCAN_API_KEY || '',
    explorerUrl: 'https://api.etherscan.io/api',
  },
  {
    name: 'L2OutputOracle',
    address: '0x56315b90c40730925ec5485cf004d835058518A0',
    network: 'ethereum',
    explorerApiKey: process.env.ETHERSCAN_API_KEY || '',
    explorerUrl: 'https://api.etherscan.io/api',
  },
  {
    name: 'L1CrossDomainMessenger',
    address: '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa',
    network: 'ethereum',
    explorerApiKey: process.env.ETHERSCAN_API_KEY || '',
    explorerUrl: 'https://api.etherscan.io/api',
  },
  {
    name: 'L1ERC721Bridge',
    address: '0x608d94945A64503E642E6370Ec598e519a2C1E53',
    network: 'ethereum',
    explorerApiKey: process.env.ETHERSCAN_API_KEY || '',
    explorerUrl: 'https://api.etherscan.io/api',
  },
  // Base L2 Contracts (Predeploy addresses - same on mainnet and testnet)
  {
    name: 'L2StandardBridge',
    address: '0x4200000000000000000000000000000000000010',
    network: 'base',
    explorerApiKey: process.env.BASESCAN_API_KEY || '',
    explorerUrl: 'https://api.basescan.org/api',
  },
  {
    name: 'L2CrossDomainMessenger',
    address: '0x4200000000000000000000000000000000000007',
    network: 'base',
    explorerApiKey: process.env.BASESCAN_API_KEY || '',
    explorerUrl: 'https://api.basescan.org/api',
  },
  {
    name: 'L2ToL1MessagePasser',
    address: '0x4200000000000000000000000000000000000016',
    network: 'base',
    explorerApiKey: process.env.BASESCAN_API_KEY || '',
    explorerUrl: 'https://api.basescan.org/api',
  },
  {
    name: 'L2ERC721Bridge',
    address: '0x4200000000000000000000000000000000000014',
    network: 'base',
    explorerApiKey: process.env.BASESCAN_API_KEY || '',
    explorerUrl: 'https://api.basescan.org/api',
  },
  // Base L2 System Contracts (useful for testing)
  {
    name: 'WETH9',
    address: '0x4200000000000000000000000000000000000006',
    network: 'base',
    explorerApiKey: process.env.BASESCAN_API_KEY || '',
    explorerUrl: 'https://api.basescan.org/api',
  },
  {
    name: 'GasPriceOracle',
    address: '0x420000000000000000000000000000000000000F',
    network: 'base',
    explorerApiKey: process.env.BASESCAN_API_KEY || '',
    explorerUrl: 'https://api.basescan.org/api',
  },
];

async function fetchABI(contract: ContractInfo): Promise<any> {
  if (!contract.explorerApiKey) {
    throw new Error(`Missing API key for ${contract.network} (${contract.name})`);
  }

  const url = `${contract.explorerUrl}?module=contract&action=getabi&address=${contract.address}&apikey=${contract.explorerApiKey}`;

  console.log(`📡 Fetching ABI for ${contract.name} (${contract.network})...`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(`API error: ${data.result || data.message}`);
    }

    const abi = JSON.parse(data.result);
    console.log(`   ✅ Success - ${abi.length} functions/events`);
    
    return abi;
  } catch (error) {
    console.error(`   ❌ Failed: ${error}`);
    throw error;
  }
}

async function fetchAllABIs() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🔍 FETCHING BASE L2 BRIDGE CONTRACT ABIs 🔍          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Check API keys
  console.log('🔑 Checking API keys...');
  const etherscanKey = process.env.ETHERSCAN_API_KEY;
  const basescanKey = process.env.BASESCAN_API_KEY;

  if (!etherscanKey) {
    console.error('❌ ETHERSCAN_API_KEY not set in .env');
    console.error('   Get one at: https://etherscan.io/myapikey');
    process.exit(1);
  }

  if (!basescanKey) {
    console.error('❌ BASESCAN_API_KEY not set in .env');
    console.error('   Get one at: https://basescan.org/myapikey');
    process.exit(1);
  }

  console.log('   ✅ Etherscan API key found');
  console.log('   ✅ Basescan API key found');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'abis', 'bridge');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`\n📁 Created directory: ${outputDir}`);
  }

  // Fetch ABIs
  console.log(`\n🚀 Fetching ${BRIDGE_CONTRACTS.length} contract ABIs...\n`);

  const results: Record<string, any> = {};
  let successCount = 0;
  let failCount = 0;

  for (const contract of BRIDGE_CONTRACTS) {
    try {
      const abi = await fetchABI(contract);
      results[contract.name] = {
        address: contract.address,
        network: contract.network,
        abi: abi,
      };

      // Save individual ABI file
      const filename = path.join(outputDir, `${contract.name}.json`);
      fs.writeFileSync(filename, JSON.stringify(abi, null, 2));
      console.log(`   💾 Saved to: ${filename}\n`);

      successCount++;

      // Rate limit: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`   ⚠️  Skipping ${contract.name}\n`);
      failCount++;
    }
  }

  // Save combined file
  const combinedPath = path.join(outputDir, 'bridge-contracts.json');
  fs.writeFileSync(combinedPath, JSON.stringify(results, null, 2));

  // Generate TypeScript interfaces
  await generateTypeScriptInterfaces(results, outputDir);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                     SUMMARY                               ║
╚═══════════════════════════════════════════════════════════╝

✅ Successfully fetched: ${successCount}/${BRIDGE_CONTRACTS.length} contracts
${failCount > 0 ? `❌ Failed: ${failCount}` : ''}

📁 ABIs saved to: ${outputDir}
📄 Combined file: ${combinedPath}
📝 TypeScript interfaces: ${outputDir}/interfaces.ts

🎯 Next Steps:
   1. Review ABIs in ${outputDir}
   2. Import interfaces in test files
   3. Run security tests: npm run security:test:bridge
  `);
}

async function generateTypeScriptInterfaces(contracts: Record<string, any>, outputDir: string) {
  console.log('🔨 Generating TypeScript interfaces...');

  let interfaceCode = `/**
 * Auto-generated TypeScript interfaces for Base L2 Bridge contracts
 * Generated: ${new Date().toISOString()}
 */

import { ethers } from 'ethers';

`;

  for (const [name, data] of Object.entries(contracts)) {
    interfaceCode += `
// ${name} (${data.network})
// Address: ${data.address}
export const ${name}ABI = ${JSON.stringify(data.abi, null, 2)} as const;

export type ${name} = {
  address: string;
  abi: typeof ${name}ABI;
};

export const ${name}Contract: ${name} = {
  address: '${data.address}',
  abi: ${name}ABI,
};

`;
  }

  interfaceCode += `
// Contract addresses by network
export const BRIDGE_CONTRACTS = {
  ethereum: {
${Object.entries(contracts)
  .filter(([_, data]) => data.network === 'ethereum')
  .map(([name, data]) => `    ${name}: '${data.address}',`)
  .join('\n')}
  },
  base: {
${Object.entries(contracts)
  .filter(([_, data]) => data.network === 'base')
  .map(([name, data]) => `    ${name}: '${data.address}',`)
  .join('\n')}
  },
} as const;

// Helper to create contract instance
export function getBridgeContract(
  contractName: string,
  provider: ethers.Provider
): ethers.Contract {
  const contractData = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(contracts).map(([name, data]) => [
        name,
        { address: data.address, abi: 'abi' },
      ])
    )
  )};
  
  const data = contractData[contractName as keyof typeof contractData];
  if (!data) {
    throw new Error(\`Unknown contract: \${contractName}\`);
  }
  
  // @ts-ignore
  const abi = eval(\`\${contractName}ABI\`);
  return new ethers.Contract(data.address, abi, provider);
}
`;

  const interfacePath = path.join(outputDir, 'interfaces.ts');
  fs.writeFileSync(interfacePath, interfaceCode);
  console.log(`   ✅ TypeScript interfaces generated: ${interfacePath}\n`);
}

// Run
fetchAllABIs().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
