#!/usr/bin/env node
/**
 * Simple Autonomous Verification Checker for v2 and v3 Contracts
 * 
 * This script checks if FlashSwapV2 and FlashSwapV3 are verified on BaseScan
 * using the Etherscan API integration from recent MCP updates.
 * 
 * Usage:
 *   npm run verify:check
 *   
 * Or directly:
 *   npx tsx scripts/validation/verify-v2-v3-simple.ts
 */

import * as dotenv from 'dotenv';

dotenv.config();

interface ContractInfo {
  name: string;
  address: string;
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bright: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Check if a contract is verified on BaseScan
 */
async function checkVerification(address: string, apiKey: string): Promise<{
  verified: boolean;
  contractName?: string;
  compiler?: string;
  optimization?: string;
  license?: string;
}> {
  try {
    // Use unified Etherscan API v2 endpoint with chainid parameter for Base (8453)
    const url = `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result && data.result[0]) {
      const result = data.result[0];
      const verified = result.SourceCode && result.SourceCode !== '' && result.ABI !== 'Contract source code not verified';
      
      if (verified) {
        return {
          verified: true,
          contractName: result.ContractName,
          compiler: result.CompilerVersion,
          optimization: result.OptimizationUsed === '1' ? 'Yes' : 'No',
          license: result.LicenseType || 'Unknown',
        };
      }
    }
    
    return { verified: false };
  } catch (err) {
    log(`⚠️  Error checking verification: ${err}`, colors.yellow);
    return { verified: false };
  }
}

/**
 * Main function
 */
async function main() {
  log('', colors.reset);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  log('  FlashSwap v2 & v3 Contract Verification Status', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  log('', colors.reset);

  // Check for API key
  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    log('❌ Error: BASESCAN_API_KEY not found in environment', colors.red);
    log('Please set BASESCAN_API_KEY in your .env file', colors.yellow);
    process.exit(1);
  }

  const contracts: ContractInfo[] = [
    {
      name: 'FlashSwapV2',
      address: '0x6e2473E4BEFb66618962f8c332706F8f8d339c08',
    },
    {
      name: 'FlashSwapV3',
      address: '0x4926E08c0aF3307Ea7840855515b22596D39F7eb',
    },
  ];

  let allVerified = true;

  for (const contract of contracts) {
    log(`\n📋 Checking ${contract.name}...`, colors.blue);
    log(`   Address: ${contract.address}`, colors.blue);
    log(`   Explorer: https://basescan.org/address/${contract.address}#code`, colors.blue);
    
    const status = await checkVerification(contract.address, apiKey);
    
    if (status.verified) {
      log(`   ✅ Status: VERIFIED`, colors.green);
      if (status.contractName) {
        log(`   📝 Contract Name: ${status.contractName}`, colors.green);
      }
      if (status.compiler) {
        log(`   🔧 Compiler: ${status.compiler}`, colors.green);
      }
      if (status.optimization) {
        log(`   ⚡ Optimization: ${status.optimization}`, colors.green);
      }
      if (status.license) {
        log(`   📜 License: ${status.license}`, colors.green);
      }
    } else {
      log(`   ❌ Status: NOT VERIFIED`, colors.red);
      log(`   ℹ️  Manual verification needed`, colors.yellow);
      log(`   📖 See: ./verification/README.md for instructions`, colors.yellow);
      allVerified = false;
    }
  }

  log('\n═══════════════════════════════════════════════════════════', colors.cyan);
  log('  Summary', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  
  if (allVerified) {
    log('\n🎉 SUCCESS: All contracts are verified on BaseScan! ✅', colors.green);
    log('\nUsers can now:', colors.bright);
    log('  ✓ Read and audit the contract source code', colors.green);
    log('  ✓ Interact with contracts via BaseScan UI', colors.green);
    log('  ✓ Verify security and transparency', colors.green);
    log('\n✅ Phase 1 Action 2 Prerequisite: COMPLETE', colors.bright);
    log('Ready to launch autonomous Base network arbitrage.', colors.green);
  } else {
    log('\n⚠️  INCOMPLETE: Some contracts are not yet verified', colors.yellow);
    log('\nNext steps:', colors.bright);
    log('  1. See verification files in ./verification/ directory', colors.yellow);
    log('  2. Follow manual verification instructions', colors.yellow);
    log('  3. Visit: https://basescan.org/verifyContract', colors.yellow);
  }
  
  log('', colors.reset);

  process.exit(allVerified ? 0 : 1);
}

main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message || err}`, colors.red);
  process.exit(1);
});
