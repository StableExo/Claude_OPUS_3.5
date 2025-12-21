#!/usr/bin/env node
/**
 * Autonomous Contract Verification v2 - Enhanced Edition
 * 
 * This script autonomously verifies FlashSwapV2 and FlashSwapV3 contracts on BaseScan
 * by first checking their current verification status, then automatically verifying them.
 * 
 * Key Enhancements over v1:
 * - Uses Etherscan API to check verification status FIRST
 * - Actually runs verification (not just prepares files)
 * - Leverages existing Hardhat verification scripts
 * - Detailed progress reporting and error handling
 * - Fully autonomous - no manual steps required
 * 
 * Features:
 * - ✅ Checks verification status before attempting verification
 * - ✅ Uses Etherscan API for real-time status checking
 * - ✅ Handles already-verified contracts gracefully
 * - ✅ Provides detailed status reports and progress indicators
 * - ✅ Autonomous operation with zero user intervention
 * - ✅ Proper error handling and retry logic
 * 
 * Usage:
 *   npm run verify:v2-v3-auto
 *   
 * Or directly:
 *   npx tsx scripts/validation/verify-contracts-autonomous.ts
 * 
 * Environment Variables Required:
 *   - BASESCAN_API_KEY: Your BaseScan API key
 *   - FLASHSWAP_V2_ADDRESS (optional, defaults to known deployment)
 *   - FLASHSWAP_V3_ADDRESS (optional, defaults to known deployment)
 */

import * as dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

interface ContractInfo {
  name: string;
  address: string;
  envKey: string;
  verifyScript: string;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(text: string) {
  log('\n═══════════════════════════════════════════════════════════', colors.cyan);
  log(`  ${text}`, colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
}

function success(text: string) {
  log(`✓ ${text}`, colors.green);
}

function warning(text: string) {
  log(`⚠️  ${text}`, colors.yellow);
}

function info(text: string) {
  log(`ℹ️  ${text}`, colors.blue);
}

function error(text: string) {
  log(`✗ ${text}`, colors.red);
}

/**
 * Check if a contract is verified on BaseScan using the API
 */
async function checkVerificationStatus(address: string): Promise<{
  isVerified: boolean;
  contractName?: string;
  compiler?: string;
}> {
  try {
    const apiKey = process.env.BASESCAN_API_KEY;
    if (!apiKey) {
      warning('BASESCAN_API_KEY not found in environment');
      return { isVerified: false };
    }

    const url = `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result && data.result[0]) {
      const result = data.result[0];
      const isVerified = result.SourceCode && result.SourceCode !== '' && result.ABI !== 'Contract source code not verified';
      
      if (isVerified) {
        return {
          isVerified: true,
          contractName: result.ContractName,
          compiler: result.CompilerVersion,
        };
      }
    }
    
    return { isVerified: false };
  } catch (err) {
    warning(`Could not check verification status: ${err}`);
    return { isVerified: false };
  }
}

/**
 * Run verification script for a contract
 */
async function runVerificationScript(
  scriptPath: string,
  contractAddress: string,
  contractName: string
): Promise<boolean> {
  return new Promise((resolve) => {
    info(`Running verification script: ${scriptPath}`);

    const env = {
      ...process.env,
      CONTRACT_ADDRESS: contractAddress,
    };

    const child = spawn(
      'npx',
      ['hardhat', 'run', scriptPath, '--network', 'base'],
      {
        env,
        stdio: 'inherit',
        shell: true,
      }
    );

    child.on('close', (code) => {
      if (code === 0) {
        success(`${contractName} verification completed successfully`);
        resolve(true);
      } else {
        error(`${contractName} verification failed with exit code ${code}`);
        resolve(false);
      }
    });

    child.on('error', (err) => {
      error(`Failed to run verification script: ${err.message}`);
      resolve(false);
    });
  });
}

/**
 * Verify a single contract autonomously
 */
async function verifyContract(contract: ContractInfo): Promise<boolean> {
  header(`Processing ${contract.name}`);

  info(`Contract: ${contract.name}`);
  info(`Address: ${contract.address}`);
  info(`Block Explorer: https://basescan.org/address/${contract.address}`);

  // Step 1: Check current verification status
  log('\n📊 Step 1: Checking verification status...', colors.bright);
  const status = await checkVerificationStatus(contract.address);

  if (status.isVerified) {
    success(`${contract.name} is already verified on BaseScan! ✅`);
    if (status.contractName) {
      info(`  Contract Name: ${status.contractName}`);
    }
    if (status.compiler) {
      info(`  Compiler: ${status.compiler}`);
    }
    info(`  View at: https://basescan.org/address/${contract.address}#code`);
    return true;
  }

  info(`${contract.name} is not yet verified. Proceeding with verification...`);

  // Step 2: Run verification
  log('\n🔧 Step 2: Running verification script...', colors.bright);
  
  const success = await runVerificationScript(
    contract.verifyScript,
    contract.address,
    contract.name
  );

  if (success) {
    log('\n🎉 Verification successful!', colors.green);
    info(`View at: https://basescan.org/address/${contract.address}#code`);
    return true;
  } else {
    log('\n⚠️  Verification script failed', colors.yellow);
    warning('The contract may already be verified or there may be an API issue');
    warning('Checking status again...');
    
    // Double-check status in case it was already verified
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const recheckStatus = await checkVerificationStatus(contract.address);
    
    if (recheckStatus.isVerified) {
      success(`${contract.name} is now verified! ✅`);
      return true;
    }
    
    return false;
  }
}

/**
 * Main autonomous verification function
 */
async function main() {
  header('Autonomous Contract Verification System');
  
  log('\n🤖 Starting autonomous verification process...', colors.bright);
  log(`Network: Base Mainnet (Chain ID: 8453)`, colors.blue);
  log(`Time: ${new Date().toISOString()}`, colors.blue);

  // Check for API key
  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    error('BASESCAN_API_KEY not found in environment');
    error('Please add BASESCAN_API_KEY to your .env file');
    error('Get your API key at: https://basescan.org/myapikey');
    process.exit(1);
  }
  success('BaseScan API key found');

  // Define contracts to verify
  const contracts: ContractInfo[] = [];

  // FlashSwapV2
  const v2Address = process.env.FLASHSWAP_V2_ADDRESS || '0x6e2473E4BEFb66618962f8c332706F8f8d339c08';
  if (v2Address && v2Address !== 'YOUR_FLASHSWAP_V2_ADDRESS') {
    contracts.push({
      name: 'FlashSwapV2',
      address: v2Address,
      envKey: 'FLASHSWAP_V2_ADDRESS',
      verifyScript: 'scripts/validation/verifyFlashSwapV2.ts',
    });
  }

  // FlashSwapV3
  const v3Address = process.env.FLASHSWAP_V3_ADDRESS || '0x4926E08c0aF3307Ea7840855515b22596D39F7eb';
  if (v3Address && v3Address !== 'YOUR_FLASHSWAP_V3_ADDRESS') {
    contracts.push({
      name: 'FlashSwapV3',
      address: v3Address,
      envKey: 'FLASHSWAP_V3_ADDRESS',
      verifyScript: 'scripts/validation/verifyFlashSwapV3.ts',
    });
  }

  if (contracts.length === 0) {
    warning('No contracts configured for verification');
    info('Please set FLASHSWAP_V2_ADDRESS and/or FLASHSWAP_V3_ADDRESS in your .env file');
    process.exit(1);
  }

  log(`\n📋 Contracts to process: ${contracts.length}`, colors.bright);
  for (const contract of contracts) {
    info(`  - ${contract.name} at ${contract.address}`);
  }

  // Verify each contract
  const results: Array<{ contract: string; success: boolean }> = [];

  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i];
    const success = await verifyContract(contract);
    results.push({ contract: contract.name, success });

    // Add delay between contracts to avoid rate limiting
    if (i < contracts.length - 1) {
      log('\n⏳ Waiting 5 seconds before processing next contract...', colors.blue);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Final summary
  header('Verification Summary');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  log(`\n${colors.bright}Results:${colors.reset}`);
  
  for (const result of results) {
    if (result.success) {
      success(`${result.contract}: VERIFIED ✅`);
    } else {
      error(`${result.contract}: FAILED ❌`);
    }
  }

  log(`\n${colors.bright}Statistics:${colors.reset}`);
  log(`${colors.green}✓ Verified: ${successCount}/${contracts.length}${colors.reset}`);
  if (failCount > 0) {
    log(`${colors.red}✗ Failed: ${failCount}/${contracts.length}${colors.reset}`);
  }

  if (successCount === contracts.length) {
    log('\n🎉 All contracts successfully verified!', colors.green);
    log('\n✅ Phase 1 Action 2 Prerequisite Complete!', colors.bright);
    log('You can now proceed with autonomous Base network arbitrage launch.', colors.blue);
    
    log('\n📖 Next Steps:', colors.bright);
    info('1. View contracts on BaseScan using the links above');
    info('2. Users can now read and verify the contract source code');
    info('3. Users can interact with contracts via BaseScan UI');
    info('4. Launch Phase 1 Action 2: npm run phase1:action2:launch');
  } else {
    warning('\n⚠️  Some contracts failed to verify');
    warning('This may be due to:');
    info('  - Rate limiting (try again in a few minutes)');
    info('  - API key issues (check your BaseScan API key)');
    info('  - Constructor argument mismatches');
    info('  - Network connectivity issues');
    
    log('\n📋 Manual Verification:', colors.bright);
    info('If needed, you can verify manually:');
    info('1. See ./verification/README.md for detailed instructions');
    info('2. Use prepared files in ./verification/ directory');
    info('3. Visit: https://basescan.org/verifyContract');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  error(`Fatal error: ${err.message || err}`);
  process.exit(1);
});
