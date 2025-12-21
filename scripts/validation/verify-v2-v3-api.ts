#!/usr/bin/env node
/**
 * Direct API-based Contract Verification for BaseScan
 * 
 * This script uses the BaseScan API directly to verify contracts
 * without requiring Hardhat or Foundry installations.
 * 
 * Usage:
 *   npm run verify:api
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

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

interface VerifyApiParams {
  apikey: string;
  module: string;
  action: string;
  contractaddress: string;
  sourceCode: string;
  codeformat: string;
  contractname: string;
  compilerversion: string;
  optimizationUsed: string;
  runs: string;
  constructorArguements: string; // Note the typo in BaseScan API
  evmversion: string;
  licenseType: string;
}

/**
 * Verify a contract using BaseScan API
 */
async function verifyContractViaAPI(
  address: string,
  contractName: string,
  sourceCode: string,
  constructorArgs: string,
  apiKey: string
): Promise<{ success: boolean; message: string; guid?: string }> {
  try {
    const params: VerifyApiParams = {
      apikey: apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: address,
      sourceCode: sourceCode,
      codeformat: 'solidity-single-file',
      contractname: contractName,
      compilerversion: 'v0.8.20+commit.a1b79de6',
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: constructorArgs,
      evmversion: 'shanghai',
      licenseType: '3', // MIT License
    };

    // Convert params to form data
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      formData.append(key, value);
    }

    // Use unified Etherscan API v2 endpoint with chainid parameter for Base (8453)
    const response = await fetch('https://api.etherscan.io/v2/api?chainid=8453', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    
    if (data.status === '1') {
      return {
        success: true,
        message: data.result,
        guid: data.result,
      };
    } else {
      return {
        success: false,
        message: data.result || 'Unknown error',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `API request failed: ${err.message}`,
    };
  }
}

/**
 * Check verification status using GUID
 */
async function checkVerificationStatus(
  guid: string,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Use unified Etherscan API v2 endpoint with chainid parameter for Base (8453)
    const url = `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      success: data.status === '1',
      message: data.result || 'Unknown status',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Status check failed: ${err.message}`,
    };
  }
}

/**
 * Main function
 */
async function main() {
  log('', colors.reset);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  log('  Direct API Contract Verification for BaseScan', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  log('', colors.reset);

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    log('❌ Error: BASESCAN_API_KEY not found', colors.red);
    process.exit(1);
  }

  const contracts = [
    {
      name: 'FlashSwapV2',
      address: '0x6e2473E4BEFb66618962f8c332706F8f8d339c08',
      sourceFile: 'verification/FlashSwapV2_flattened.sol',
      argsFile: 'verification/FlashSwapV2_constructor_args.txt',
      contractPath: 'contracts/FlashSwapV2.sol:FlashSwapV2',
    },
    {
      name: 'FlashSwapV3',
      address: '0x4926E08c0aF3307Ea7840855515b22596D39F7eb',
      sourceFile: 'verification/FlashSwapV3_flattened.sol',
      argsFile: 'verification/FlashSwapV3_constructor_args.txt',
      contractPath: 'contracts/FlashSwapV3.sol:FlashSwapV3',
    },
  ];

  for (const contract of contracts) {
    log(`\n📋 Processing ${contract.name}...`, colors.blue);
    log(`   Address: ${contract.address}`, colors.blue);
    
    // Read source code
    const sourcePath = path.join(process.cwd(), contract.sourceFile);
    if (!fs.existsSync(sourcePath)) {
      log(`   ❌ Source file not found: ${contract.sourceFile}`, colors.red);
      continue;
    }
    
    const sourceCode = fs.readFileSync(sourcePath, 'utf8');
    log(`   ✓ Loaded source code (${sourceCode.length} bytes)`, colors.green);
    
    // Read constructor args
    const argsPath = path.join(process.cwd(), contract.argsFile);
    if (!fs.existsSync(argsPath)) {
      log(`   ❌ Constructor args file not found: ${contract.argsFile}`, colors.red);
      continue;
    }
    
    const constructorArgs = fs.readFileSync(argsPath, 'utf8').trim();
    log(`   ✓ Loaded constructor args`, colors.green);
    
    // Submit for verification
    log(`\n   📤 Submitting to BaseScan API...`, colors.yellow);
    
    const result = await verifyContractViaAPI(
      contract.address,
      contract.contractPath,
      sourceCode,
      constructorArgs,
      apiKey
    );
    
    if (result.success && result.guid) {
      log(`   ✓ Submitted successfully!`, colors.green);
      log(`   GUID: ${result.guid}`, colors.green);
      
      // Wait and check status
      log(`\n   ⏳ Waiting 10 seconds for verification to complete...`, colors.yellow);
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const status = await checkVerificationStatus(result.guid, apiKey);
      
      if (status.success) {
        log(`   ✅ ${contract.name}: VERIFIED!`, colors.green);
        log(`   View at: https://basescan.org/address/${contract.address}#code`, colors.green);
      } else {
        log(`   ⏳ ${contract.name}: ${status.message}`, colors.yellow);
        log(`   Check status later at: https://basescan.org/address/${contract.address}#code`, colors.yellow);
      }
    } else {
      log(`   ❌ Submission failed: ${result.message}`, colors.red);
      
      // Check if already verified
      if (result.message.includes('already verified') || result.message.includes('Already Verified')) {
        log(`   ℹ️  Contract may already be verified`, colors.blue);
        log(`   Check: https://basescan.org/address/${contract.address}#code`, colors.blue);
      }
    }
  }

  log('\n═══════════════════════════════════════════════════════════', colors.cyan);
  log('  Verification process complete', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  log('\n📖 Check contract pages on BaseScan to confirm verification status', colors.blue);
  log('', colors.reset);
}

main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message || err}`, colors.red);
  process.exit(1);
});
