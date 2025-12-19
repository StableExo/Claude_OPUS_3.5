#!/usr/bin/env node
/**
 * Autonomous Contract Verification for BaseScan
 * 
 * This script automates the verification of FlashSwapV2 and FlashSwapV3 contracts on BaseScan.
 * It uses Hardhat's contract flattening and provides manual verification instructions.
 * 
 * Usage:
 *   npm run verify:autonomous
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

interface ContractConfig {
  name: string;
  address: string;
  constructorArgs: any[];
  constructorTypes: string[];
}

/**
 * Flatten contract source code using Hardhat
 */
function flattenContract(contractName: string): string {
  console.log(`\n📦 Flattening ${contractName}...`);
  try {
    const output = execSync(
      `npx hardhat flatten contracts/${contractName}.sol`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    // Remove dotenv injection messages and duplicate SPDX license identifiers
    const lines = output.split('\n');
    let firstSpdx = true;
    const filtered = lines.filter(line => {
      // Remove dotenv injection messages
      if (line.includes('[dotenv@')) {
        return false;
      }
      // Remove duplicate SPDX headers
      if (line.includes('SPDX-License-Identifier')) {
        if (firstSpdx) {
          firstSpdx = false;
          return true;
        }
        return false;
      }
      return true;
    });
    
    return filtered.join('\n');
  } catch (error) {
    console.error(`❌ Error flattening ${contractName}:`, error);
    throw error;
  }
}

/**
 * Encode constructor arguments
 */
function encodeConstructorArgs(types: string[], args: any[]): string {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(types, args);
  return encoded.slice(2); // Remove 0x prefix
}

/**
 * Check if contract is verified on BaseScan
 */
async function checkVerificationStatus(address: string, apiKey: string): Promise<boolean> {
  const url = `https://api.basescan.org/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1" && data.result && data.result[0]) {
      const isVerified = data.result[0].SourceCode !== "";
      return isVerified;
    }
    return false;
  } catch (error) {
    console.warn(`⚠️  Could not check verification status: ${error}`);
    return false;
  }
}

/**
 * Process contract verification
 */
async function processContract(config: ContractConfig, apiKey: string): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 Processing ${config.name}`);
  console.log('='.repeat(80));
  console.log(`Address: ${config.address}`);
  
  // Check if already verified
  console.log('\n⏳ Checking verification status...');
  const isVerified = await checkVerificationStatus(config.address, apiKey);
  
  if (isVerified) {
    console.log('✅ Contract is already verified on BaseScan!');
    console.log(`\n🔗 View at: https://basescan.org/address/${config.address}#code`);
    return;
  }
  
  console.log('⚠️  Contract is not verified yet.');
  
  // Flatten the contract
  const flattened = flattenContract(config.name);
  
  // Save flattened source
  const flattenedDir = join(process.cwd(), 'verification');
  if (!existsSync(flattenedDir)) {
    mkdirSync(flattenedDir, { recursive: true });
  }
  
  const flattenedPath = join(flattenedDir, `${config.name}_flattened.sol`);
  writeFileSync(flattenedPath, flattened);
  console.log(`✅ Flattened source saved to: ${flattenedPath}`);
  
  // Encode constructor arguments
  const encodedArgs = encodeConstructorArgs(config.constructorTypes, config.constructorArgs);
  const argsPath = join(flattenedDir, `${config.name}_constructor_args.txt`);
  writeFileSync(argsPath, encodedArgs);
  console.log(`✅ Constructor arguments saved to: ${argsPath}`);
  
  // Print constructor arguments for reference
  console.log('\n📋 Constructor Arguments:');
  config.constructorArgs.forEach((arg, idx) => {
    const type = config.constructorTypes[idx];
    console.log(`  ${idx + 1}. [${type}] ${arg}`);
  });
  
  console.log('\n📝 Encoded Constructor Arguments (ABI):');
  console.log(`  ${encodedArgs}`);
  
  // Print manual verification instructions
  console.log('\n' + '='.repeat(80));
  console.log('📖 MANUAL VERIFICATION INSTRUCTIONS');
  console.log('='.repeat(80));
  console.log(`\n1. Visit BaseScan Contract Verification:`);
  console.log(`   https://basescan.org/verifyContract?a=${config.address}`);
  console.log(`\n2. Select "Solidity (Single file)" as verification method`);
  console.log(`\n3. Enter Contract Details:`);
  console.log(`   - Compiler Type: Solidity (Single file)`);
  console.log(`   - Compiler Version: v0.8.20+commit.a1b79de6`);
  console.log(`   - Open Source License Type: MIT License (MIT)`);
  console.log(`\n4. Contract Source Code:`);
  console.log(`   - Copy the flattened source from: ${flattenedPath}`);
  console.log(`   - Or use: cat ${flattenedPath} | pbcopy (macOS) / xclip (Linux)`);
  console.log(`\n5. Optimization Settings:`);
  console.log(`   - Optimization: Yes`);
  console.log(`   - Runs: 200`);
  console.log(`   - EVM Version: shanghai`);
  console.log(`\n6. Constructor Arguments (ABI-encoded):`);
  console.log(`   ${encodedArgs}`);
  console.log(`   - Copy from: ${argsPath}`);
  console.log(`\n7. Click "Verify and Publish"`);
  console.log(`\n8. Wait for verification (usually 10-30 seconds)`);
  console.log('='.repeat(80));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Autonomous Contract Verification for BaseScan');
  console.log('================================================');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Network: Base Mainnet (Chain ID: 8453)`);
  
  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    console.error('\n❌ Error: BASESCAN_API_KEY not set in .env');
    console.error('Get your API key from: https://basescan.org/myapikey');
    process.exit(1);
  }
  
  const contracts: ContractConfig[] = [];
  
  // FlashSwapV2 configuration
  if (process.env.FLASHSWAP_V2_ADDRESS) {
    contracts.push({
      name: 'FlashSwapV2',
      address: process.env.FLASHSWAP_V2_ADDRESS,
      constructorArgs: [
        '0x2626664c2603336E57B271c5C0b26F421741e481', // uniswapV3Router
        '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // sushiRouter
        '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // aavePool
        '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D', // aaveAddressesProvider
      ],
      constructorTypes: ['address', 'address', 'address', 'address']
    });
  }
  
  // FlashSwapV3 configuration
  if (process.env.FLASHSWAP_V3_ADDRESS) {
    const TITHE_BPS = process.env.TITHE_BPS ? parseInt(process.env.TITHE_BPS) : 7000;
    const titheRecipient = process.env.TITHE_RECIPIENT || 
                           process.env.MULTI_SIG_ADDRESS || 
                           '0x48a6e6695a7d3e8c76eb014e648c072db385df6c';
    
    contracts.push({
      name: 'FlashSwapV3',
      address: process.env.FLASHSWAP_V3_ADDRESS,
      constructorArgs: [
        '0x2626664c2603336E57B271c5C0b26F421741e481', // uniswapV3Router
        '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // sushiRouter
        '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // balancerVault
        '0x0000000000000000000000000000000000000000', // dydxSoloMargin (not on Base)
        '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // aavePool
        '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D', // aaveAddressesProvider
        '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // uniswapV3Factory
        titheRecipient,
        TITHE_BPS
      ],
      constructorTypes: [
        'address', 'address', 'address', 'address', 
        'address', 'address', 'address', 'address', 'uint256'
      ]
    });
  }
  
  if (contracts.length === 0) {
    console.error('\n❌ Error: No contract addresses configured');
    console.error('Set FLASHSWAP_V2_ADDRESS and/or FLASHSWAP_V3_ADDRESS in .env');
    process.exit(1);
  }
  
  // Process each contract
  for (const contract of contracts) {
    await processContract(contract, apiKey);
  }
  
  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  
  for (const contract of contracts) {
    const isVerified = await checkVerificationStatus(contract.address, apiKey);
    const status = isVerified ? '✅ VERIFIED' : '⏳ PENDING MANUAL VERIFICATION';
    console.log(`\n${contract.name}: ${status}`);
    console.log(`  Address: ${contract.address}`);
    console.log(`  URL: https://basescan.org/address/${contract.address}#code`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✨ Verification process complete!');
  console.log('\nAll flattened sources and constructor arguments have been saved to:');
  console.log(`  ${join(process.cwd(), 'verification')}/`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
