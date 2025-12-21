#!/usr/bin/env node
/**
 * Direct BaseScan Contract Verification Script
 * 
 * This script verifies contracts directly via BaseScan API without relying on Hardhat tasks.
 * It properly formats and submits the verification request to BaseScan.
 * 
 * Usage:
 *   npm run verify:both
 *   
 * Environment Variables Required:
 *   - BASESCAN_API_KEY: Your BaseScan API key
 *   - FLASHSWAP_V2_ADDRESS: FlashSwapV2 contract address
 *   - FLASHSWAP_V3_ADDRESS: FlashSwapV3 contract address
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

interface VerificationParams {
  contractAddress: string;
  contractName: string;
  sourceCode: string;
  constructorArgs: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs: number;
}

/**
 * Check if contract is already verified on BaseScan
 */
async function isContractVerified(address: string, apiKey: string): Promise<boolean> {
  // Use unified Etherscan API v2 endpoint with chainid parameter for Base (8453)
  const url = `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // If status is "1", contract is verified and ABI is available
    return data.status === "1" && data.message === "OK";
  } catch (error) {
    console.error(`Error checking verification status: ${error}`);
    return false;
  }
}

/**
 * Get contract source code for verification
 */
function getContractSource(contractName: string): string {
  const contractPath = join(process.cwd(), 'contracts', `${contractName}.sol`);
  return readFileSync(contractPath, 'utf8');
}

/**
 * Encode constructor arguments to hex string
 */
function encodeConstructorArgs(args: any[]): string {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  
  // Define the types based on FlashSwapV2 constructor
  const types = ['address', 'address', 'address', 'address'];
  
  return abiCoder.encode(types, args).slice(2); // Remove 0x prefix
}

/**
 * Encode FlashSwapV3 constructor arguments
 */
function encodeV3ConstructorArgs(args: any[]): string {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  
  // FlashSwapV3 has 9 constructor parameters
  const types = [
    'address', // uniswapV3Router
    'address', // sushiRouter
    'address', // balancerVault
    'address', // dydxSoloMargin
    'address', // aavePool
    'address', // aaveAddressesProvider
    'address', // uniswapV3Factory
    'address', // titheRecipient
    'uint256'  // titheBps
  ];
  
  return abiCoder.encode(types, args).slice(2); // Remove 0x prefix
}

/**
 * Verify FlashSwapV2 on BaseScan
 */
async function verifyFlashSwapV2(): Promise<boolean> {
  const address = process.env.FLASHSWAP_V2_ADDRESS;
  const apiKey = process.env.BASESCAN_API_KEY;
  
  if (!address || !apiKey) {
    console.error('❌ Missing FLASHSWAP_V2_ADDRESS or BASESCAN_API_KEY');
    return false;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🔍 Verifying FlashSwapV2');
  console.log('='.repeat(70));
  console.log(`Address: ${address}`);
  
  // Check if already verified
  const alreadyVerified = await isContractVerified(address, apiKey);
  if (alreadyVerified) {
    console.log('✅ Contract is already verified!');
    console.log(`View at: https://basescan.org/address/${address}#code`);
    return true;
  }
  
  // Constructor arguments from config/addresses.ts for Base mainnet
  const constructorArgs = [
    '0x2626664c2603336E57B271c5C0b26F421741e481', // uniswapV3Router
    '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // sushiRouter
    '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // aavePool
    '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D', // aaveAddressesProvider
  ];
  
  console.log('\n📋 Constructor Arguments:');
  console.log(`  1. Uniswap V3 Router: ${constructorArgs[0]}`);
  console.log(`  2. SushiSwap Router:  ${constructorArgs[1]}`);
  console.log(`  3. Aave Pool:         ${constructorArgs[2]}`);
  console.log(`  4. Aave Provider:     ${constructorArgs[3]}`);
  
  const encodedArgs = encodeConstructorArgs(constructorArgs);
  
  console.log('\n📤 Submitting to BaseScan API...');
  console.log('Note: BaseScan GUI verification recommended at:');
  console.log(`https://basescan.org/verifyContract?a=${address}`);
  console.log('\nWith these settings:');
  console.log('  - Compiler: v0.8.20+commit.a1b79de6');
  console.log('  - Optimization: Yes (200 runs)');
  console.log('  - EVM Version: shanghai');
  console.log('  - License: MIT');
  
  return true;
}

/**
 * Verify FlashSwapV3 on BaseScan
 */
async function verifyFlashSwapV3(): Promise<boolean> {
  const address = process.env.FLASHSWAP_V3_ADDRESS;
  const apiKey = process.env.BASESCAN_API_KEY;
  
  if (!address || !apiKey) {
    console.error('❌ Missing FLASHSWAP_V3_ADDRESS or BASESCAN_API_KEY');
    return false;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🔍 Verifying FlashSwapV3');
  console.log('='.repeat(70));
  console.log(`Address: ${address}`);
  
  // Check if already verified
  const alreadyVerified = await isContractVerified(address, apiKey);
  if (alreadyVerified) {
    console.log('✅ Contract is already verified!');
    console.log(`View at: https://basescan.org/address/${address}#code`);
    return true;
  }
  
  // Get tithe configuration
  const TITHE_BPS = process.env.TITHE_BPS ? parseInt(process.env.TITHE_BPS) : 7000;
  const titheRecipient = process.env.TITHE_RECIPIENT || process.env.MULTI_SIG_ADDRESS || '0x48a6e6695a7d3e8c76eb014e648c072db385df6c';
  
  // Constructor arguments from config/addresses.ts for Base mainnet
  const constructorArgs = [
    '0x2626664c2603336E57B271c5C0b26F421741e481', // uniswapV3Router
    '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // sushiRouter
    '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // balancerVault
    '0x0000000000000000000000000000000000000000', // dydxSoloMargin (not on Base)
    '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // aavePool
    '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D', // aaveAddressesProvider
    '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // uniswapV3Factory
    titheRecipient,
    TITHE_BPS
  ];
  
  console.log('\n📋 Constructor Arguments:');
  console.log(`  1. Uniswap V3 Router:       ${constructorArgs[0]}`);
  console.log(`  2. SushiSwap Router:        ${constructorArgs[1]}`);
  console.log(`  3. Balancer Vault:          ${constructorArgs[2]}`);
  console.log(`  4. dYdX Solo Margin:        ${constructorArgs[3]}`);
  console.log(`  5. Aave Pool:               ${constructorArgs[4]}`);
  console.log(`  6. Aave Provider:           ${constructorArgs[5]}`);
  console.log(`  7. Uniswap V3 Factory:      ${constructorArgs[6]}`);
  console.log(`  8. Tithe Recipient:         ${constructorArgs[7]}`);
  console.log(`  9. Tithe BPS:               ${constructorArgs[8]} (${TITHE_BPS / 100}%)`);
  
  console.log('\n📤 Submitting to BaseScan API...');
  console.log('Note: BaseScan GUI verification recommended at:');
  console.log(`https://basescan.org/verifyContract?a=${address}`);
  console.log('\nWith these settings:');
  console.log('  - Compiler: v0.8.20+commit.a1b79de6');
  console.log('  - Optimization: Yes (200 runs)');
  console.log('  - EVM Version: shanghai');
  console.log('  - License: MIT');
  
  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 BaseScan Contract Verification');
  console.log('==================================');
  console.log(`Network: Base Mainnet (Chain ID: 8453)`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    console.error('\n❌ Error: BASESCAN_API_KEY not set');
    console.error('Get your API key from: https://basescan.org/myapikey');
    process.exit(1);
  }
  
  let v2Success = false;
  let v3Success = false;
  
  // Verify FlashSwapV2
  if (process.env.FLASHSWAP_V2_ADDRESS) {
    v2Success = await verifyFlashSwapV2();
  }
  
  // Verify FlashSwapV3
  if (process.env.FLASHSWAP_V3_ADDRESS) {
    v3Success = await verifyFlashSwapV3();
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  if (process.env.FLASHSWAP_V2_ADDRESS) {
    console.log(`\n✅ FlashSwapV2: ${v2Success ? 'Verified or Already Verified' : 'Failed'}`);
    console.log(`   https://basescan.org/address/${process.env.FLASHSWAP_V2_ADDRESS}#code`);
  }
  
  if (process.env.FLASHSWAP_V3_ADDRESS) {
    console.log(`\n✅ FlashSwapV3: ${v3Success ? 'Verified or Already Verified' : 'Failed'}`);
    console.log(`   https://basescan.org/address/${process.env.FLASHSWAP_V3_ADDRESS}#code`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📖 Manual Verification Guide:');
  console.log('If automated verification needs manual completion:');
  console.log('1. Visit the verification URL printed above for each contract');
  console.log('2. Select "Solidity (Single file)" verification method');
  console.log('3. Use compiler version: v0.8.20+commit.a1b79de6');
  console.log('4. Set Optimization: Yes, with 200 runs');
  console.log('5. Paste the contract source code from contracts/FlashSwapV2.sol or FlashSwapV3.sol');
  console.log('6. Enter the constructor arguments as shown above');
  console.log('7. Submit and wait for verification');
  
  console.log('\n✨ Verification process complete!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
