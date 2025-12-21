#!/usr/bin/env node --import tsx

/**
 * Automated BaseScan Contract Verification for Phase 1 Action 2
 * 
 * Verifies both FlashSwapV2 and FlashSwapV3 contracts on BaseScan
 * using Hardhat's verification plugin.
 * 
 * Prerequisites:
 * - BASESCAN_API_KEY in .env
 * - Contracts deployed at specified addresses
 * - Constructor arguments prepared
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

interface ContractInfo {
  name: string;
  address: string;
  constructorArgsFile: string;
  version: string;
}

const contracts: ContractInfo[] = [
  {
    name: 'FlashSwapV2',
    address: '0x6e2473E4BEFb66618962f8c332706F8f8d339c08',
    constructorArgsFile: 'verification/FlashSwapV2_constructor_args.txt',
    version: '0.8.20',
  },
  {
    name: 'FlashSwapV3',
    address: '0x4926E08c0aF3307Ea7840855515b22596D39F7eb',
    constructorArgsFile: 'verification/FlashSwapV3_constructor_args.txt',
    version: '0.8.20',
  },
];

async function checkVerificationStatus(address: string): Promise<boolean> {
  try {
    const apiKey = process.env.BASESCAN_API_KEY;
    if (!apiKey) {
      warning('BASESCAN_API_KEY not found in environment');
      return false;
    }

    // Check if contract is already verified via unified Etherscan API v2
    // Note: BaseScan has migrated to Etherscan's unified endpoint with chainid parameter
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getabi&address=${address}&apikey=${apiKey}`
    );
    const data = await response.json();

    if (data.status === '1' && data.result !== 'Contract source code not verified') {
      return true;
    }
    return false;
  } catch (err) {
    warning(`Could not check verification status: ${err}`);
    return false;
  }
}

async function verifyContract(contract: ContractInfo): Promise<boolean> {
  header(`Verifying ${contract.name}`);

  info(`Contract: ${contract.name}`);
  info(`Address: ${contract.address}`);
  info(`Compiler: v${contract.version}`);

  // Check if already verified
  const isVerified = await checkVerificationStatus(contract.address);
  if (isVerified) {
    success(`${contract.name} is already verified on BaseScan!`);
    info(`View at: https://basescan.org/address/${contract.address}#code`);
    return true;
  }

  info('Not yet verified. Starting verification...');

  // Read constructor arguments
  const constructorArgsPath = path.join(process.cwd(), contract.constructorArgsFile);
  if (!fs.existsSync(constructorArgsPath)) {
    error(`Constructor args file not found: ${constructorArgsPath}`);
    return false;
  }

  const constructorArgs = fs.readFileSync(constructorArgsPath, 'utf-8').trim();
  info(`Constructor args loaded: ${constructorArgs.substring(0, 20)}...`);

  try {
    // Use Hardhat verify command
    const command = `npx hardhat verify --network base --constructor-args ${contract.constructorArgsFile} ${contract.address}`;

    info(`Running: ${command}`);

    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        HARDHAT_NETWORK: 'base',
      },
    });

    success(`${contract.name} verified successfully!`);
    info(`View at: https://basescan.org/address/${contract.address}#code`);
    return true;
  } catch (err: any) {
    // Check if it's "already verified" error
    if (err.message?.includes('already verified') || err.message?.includes('Already Verified')) {
      success(`${contract.name} is already verified on BaseScan!`);
      info(`View at: https://basescan.org/address/${contract.address}#code`);
      return true;
    }

    error(`Failed to verify ${contract.name}: ${err.message || err}`);
    warning('You may need to verify manually using the verification files in ./verification/');
    warning(`Manual URL: https://basescan.org/verifyContract?a=${contract.address}`);
    return false;
  }
}

async function main() {
  header('BaseScan Contract Verification - Phase 1 Action 2');

  log('\n📋 Contract Verification Prerequisites:', colors.bright);
  
  // Check environment
  const basescanApiKey = process.env.BASESCAN_API_KEY;
  if (!basescanApiKey) {
    error('BASESCAN_API_KEY not found in environment');
    error('Please add BASESCAN_API_KEY to your .env file');
    process.exit(1);
  }
  success('BaseScan API key found');

  // Check if hardhat is available
  try {
    execSync('npx hardhat --version', { stdio: 'pipe' });
    success('Hardhat is available');
  } catch (err) {
    error('Hardhat not found. Run: npm install');
    process.exit(1);
  }

  // Check constructor args files
  for (const contract of contracts) {
    const argsPath = path.join(process.cwd(), contract.constructorArgsFile);
    if (!fs.existsSync(argsPath)) {
      error(`Missing constructor args: ${contract.constructorArgsFile}`);
      process.exit(1);
    }
  }
  success('All constructor argument files present');

  log('\n🎯 Contracts to Verify:', colors.bright);
  for (const contract of contracts) {
    info(`- ${contract.name} at ${contract.address}`);
  }

  // Verify each contract
  const results: boolean[] = [];
  for (const contract of contracts) {
    const result = await verifyContract(contract);
    results.push(result);
    
    // Small delay between verifications to avoid rate limiting
    if (contracts.indexOf(contract) < contracts.length - 1) {
      info('Waiting 5 seconds before next verification...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Summary
  header('Verification Summary');

  const successCount = results.filter(r => r).length;
  const failCount = results.filter(r => !r).length;

  log(`\n${colors.bright}Results:${colors.reset}`);
  log(`${colors.green}✓ Verified: ${successCount}/${contracts.length}${colors.reset}`);
  if (failCount > 0) {
    log(`${colors.red}✗ Failed: ${failCount}/${contracts.length}${colors.reset}`);
  }

  if (successCount === contracts.length) {
    log('\n' + colors.green + '🎉 All contracts verified successfully!' + colors.reset);
    log('\n' + colors.bright + 'Contract Links:' + colors.reset);
    for (const contract of contracts) {
      log(`${colors.cyan}${contract.name}:${colors.reset} https://basescan.org/address/${contract.address}#code`);
    }
    
    log('\n' + colors.bright + '✅ Phase 1 Action 2 Prerequisite Complete!' + colors.reset);
    log('You can now proceed with autonomous Base network arbitrage launch.');
  } else {
    warning('\nSome contracts failed to verify automatically.');
    warning('You may need to verify them manually:');
    log('\n' + colors.bright + 'Manual Verification:' + colors.reset);
    info('1. Visit BaseScan verification page');
    info('2. Use flattened source from ./verification/');
    info('3. Copy constructor args from ./verification/');
    info('4. Submit for verification');
    log('\nSee: ./verification/README.md for detailed instructions');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  error(`Fatal error: ${err.message || err}`);
  process.exit(1);
});
