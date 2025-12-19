#!/usr/bin/env node
/**
 * Autonomous Contract Verification Script
 * 
 * Automatically verifies both FlashSwapV2 and FlashSwapV3 contracts on BaseScan.
 * This script orchestrates the verification process for both deployed contracts.
 * 
 * Usage:
 *   npm run verify:both
 *   
 * Or directly:
 *   npx tsx scripts/validation/verify-both-contracts.ts
 * 
 * Environment Variables Required:
 *   - BASESCAN_API_KEY: Your BaseScan API key
 *   - FLASHSWAP_V2_ADDRESS: FlashSwapV2 contract address
 *   - FLASHSWAP_V3_ADDRESS: FlashSwapV3 contract address
 *   - TITHE_RECIPIENT (optional): Tithe recipient for V3
 *   - TITHE_BPS (optional): Tithe basis points for V3 (default: 7000)
 */

import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

interface VerificationResult {
  contract: string;
  address: string;
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Run hardhat verification script as child process
 */
async function runVerification(
  scriptPath: string,
  contractAddress: string,
  contractName: string
): Promise<VerificationResult> {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Verifying ${contractName}`);
    console.log(`Address: ${contractAddress}`);
    console.log(`${'='.repeat(70)}\n`);

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
      const success = code === 0;
      const baseUrl = 'https://basescan.org/address';
      const url = `${baseUrl}/${contractAddress}#code`;

      resolve({
        contract: contractName,
        address: contractAddress,
        success,
        url: success ? url : undefined,
        error: success ? undefined : `Verification failed with exit code ${code}`,
      });
    });

    child.on('error', (error) => {
      resolve({
        contract: contractName,
        address: contractAddress,
        success: false,
        error: error.message,
      });
    });
  });
}

/**
 * Main verification orchestration
 */
async function main() {
  console.log('🚀 Autonomous Contract Verification');
  console.log('====================================');
  console.log(`Network: Base Mainnet (Chain ID: 8453)`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  // Check required environment variables
  const v2Address = process.env.FLASHSWAP_V2_ADDRESS;
  const v3Address = process.env.FLASHSWAP_V3_ADDRESS;
  const apiKey = process.env.BASESCAN_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: BASESCAN_API_KEY not found in environment');
    console.error('Please set BASESCAN_API_KEY in your .env file');
    process.exit(1);
  }

  if (!v2Address && !v3Address) {
    console.error('❌ Error: No contract addresses found in environment');
    console.error('Please set FLASHSWAP_V2_ADDRESS and/or FLASHSWAP_V3_ADDRESS in your .env file');
    process.exit(1);
  }

  const results: VerificationResult[] = [];

  // Verify FlashSwapV2
  if (v2Address) {
    const result = await runVerification(
      'scripts/validation/verifyFlashSwapV2.ts',
      v2Address,
      'FlashSwapV2'
    );
    results.push(result);
  } else {
    console.log('⏭️  Skipping FlashSwapV2 (address not configured)');
  }

  // Verify FlashSwapV3
  if (v3Address) {
    const result = await runVerification(
      'scripts/validation/verifyFlashSwapV3.ts',
      v3Address,
      'FlashSwapV3'
    );
    results.push(result);
  } else {
    console.log('⏭️  Skipping FlashSwapV3 (address not configured)');
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));

  let allSuccess = true;
  for (const result of results) {
    const status = result.success ? '✅ VERIFIED' : '❌ FAILED';
    console.log(`\n${result.contract}: ${status}`);
    console.log(`  Address: ${result.address}`);
    if (result.url) {
      console.log(`  URL: ${result.url}`);
    }
    if (result.error) {
      console.log(`  Error: ${result.error}`);
      allSuccess = false;
    }
  }

  console.log('\n' + '='.repeat(70));

  if (allSuccess) {
    console.log('\n🎉 All contracts verified successfully!');
    console.log('\n📖 Next steps:');
    console.log('  1. View contracts on BaseScan using the URLs above');
    console.log('  2. Users can now read the contract source code');
    console.log('  3. Users can interact with contracts via BaseScan UI');
    console.log('  4. Update documentation with BaseScan verification links');
  } else {
    console.log('\n⚠️  Some verifications failed. Check errors above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
