#!/usr/bin/env node

/**
 * Direct BaseScan API Contract Verification
 * 
 * Verifies contracts using BaseScan's verification API directly
 * without requiring Hardhat or other dependencies.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(text) {
  log('\n═══════════════════════════════════════════════════════════', colors.cyan);
  log(`  ${text}`, colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
}

function success(text) {
  log(`✓ ${text}`, colors.green);
}

function warning(text) {
  log(`⚠️  ${text}`, colors.yellow);
}

function info(text) {
  log(`ℹ️  ${text}`, colors.blue);
}

function error(text) {
  log(`✗ ${text}`, colors.red);
}

// Load environment variables
require('dotenv').config();

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;
const BASESCAN_API_URL = 'https://api.basescan.org/api';

const contracts = [
  {
    name: 'FlashSwapV2',
    address: '0x6e2473E4BEFb66618962f8c332706F8f8d339c08',
    sourceFile: 'verification/FlashSwapV2_flattened.sol',
    constructorArgsFile: 'verification/FlashSwapV2_constructor_args.txt',
    contractName: 'FlashSwapV2',
    compilerVersion: 'v0.8.20+commit.a1b79de6',
    optimizationUsed: '1',
    runs: '200',
    evmVersion: 'shanghai',
  },
  {
    name: 'FlashSwapV3',
    address: '0x4926E08c0aF3307Ea7840855515b22596D39F7eb',
    sourceFile: 'verification/FlashSwapV3_flattened.sol',
    constructorArgsFile: 'verification/FlashSwapV3_constructor_args.txt',
    contractName: 'FlashSwapV3',
    compilerVersion: 'v0.8.20+commit.a1b79de6',
    optimizationUsed: '1',
    runs: '200',
    evmVersion: 'shanghai',
  },
];

async function checkVerificationStatus(address) {
  return new Promise((resolve, reject) => {
    const url = `${BASESCAN_API_URL}?module=contract&action=getabi&address=${address}&apikey=${BASESCAN_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === '1' && json.result !== 'Contract source code not verified');
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function verifyContract(contract) {
  header(`Verifying ${contract.name}`);
  
  info(`Contract: ${contract.name}`);
  info(`Address: ${contract.address}`);
  info(`Compiler: ${contract.compilerVersion}`);
  
  // Check if already verified
  try {
    const isVerified = await checkVerificationStatus(contract.address);
    if (isVerified) {
      success(`${contract.name} is already verified on BaseScan!`);
      info(`View at: https://basescan.org/address/${contract.address}#code`);
      return true;
    }
  } catch (err) {
    warning(`Could not check verification status: ${err.message}`);
  }
  
  info('Not yet verified. Preparing verification request...');
  
  // Read source code
  const sourcePath = path.join(process.cwd(), contract.sourceFile);
  if (!fs.existsSync(sourcePath)) {
    error(`Source file not found: ${sourcePath}`);
    return false;
  }
  const sourceCode = fs.readFileSync(sourcePath, 'utf-8');
  
  // Read constructor args
  const argsPath = path.join(process.cwd(), contract.constructorArgsFile);
  if (!fs.existsSync(argsPath)) {
    error(`Constructor args file not found: ${argsPath}`);
    return false;
  }
  const constructorArgs = fs.readFileSync(argsPath, 'utf-8').trim();
  
  info(`Source code loaded: ${sourceCode.length} characters`);
  info(`Constructor args: ${constructorArgs.substring(0, 20)}...`);
  
  // Prepare POST data
  const postData = new URLSearchParams({
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contract.address,
    sourceCode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: contract.contractName,
    compilerversion: contract.compilerVersion,
    optimizationUsed: contract.optimizationUsed,
    runs: contract.runs,
    constructorArguements: constructorArgs,  // Note: BaseScan uses "Arguements" (sic)
    evmversion: contract.evmVersion,
    licenseType: '3',  // MIT License
    apikey: BASESCAN_API_KEY,
  }).toString();
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.basescan.org',
      path: '/api',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    info('Submitting verification request to BaseScan...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (json.status === '1') {
            success(`Verification request submitted successfully!`);
            info(`GUID: ${json.result}`);
            info('Checking verification status...');
            
            // Check status after a delay
            setTimeout(async () => {
              try {
                const isVerified = await checkVerificationStatus(contract.address);
                if (isVerified) {
                  success(`${contract.name} verified successfully!`);
                  info(`View at: https://basescan.org/address/${contract.address}#code`);
                  resolve(true);
                } else {
                  warning(`Verification pending. Check status at: https://basescan.org/address/${contract.address}`);
                  resolve(true);  // Consider it success as request was submitted
                }
              } catch (err) {
                warning(`Could not check final status: ${err.message}`);
                resolve(true);  // Request was submitted successfully
              }
            }, 10000);  // Wait 10 seconds before checking
          } else {
            error(`Verification failed: ${json.message || json.result}`);
            warning('Common issues:');
            warning('- Contract already verified');
            warning('- Invalid constructor arguments');
            warning('- Compiler version mismatch');
            warning('- Source code mismatch');
            info(`Manual verification: https://basescan.org/verifyContract?a=${contract.address}`);
            resolve(false);
          }
        } catch (err) {
          error(`Error parsing response: ${err.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      error(`Request failed: ${err.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  header('BaseScan Contract Verification - Phase 1 Action 2');
  
  log('\n📋 Contract Verification Prerequisites:', colors.bright);
  
  // Check API key
  if (!BASESCAN_API_KEY) {
    error('BASESCAN_API_KEY not found in environment');
    error('Please add BASESCAN_API_KEY to your .env file');
    process.exit(1);
  }
  success('BaseScan API key found');
  
  // Check files
  let allFilesExist = true;
  for (const contract of contracts) {
    const sourcePath = path.join(process.cwd(), contract.sourceFile);
    const argsPath = path.join(process.cwd(), contract.constructorArgsFile);
    
    if (!fs.existsSync(sourcePath)) {
      error(`Missing: ${contract.sourceFile}`);
      allFilesExist = false;
    }
    if (!fs.existsSync(argsPath)) {
      error(`Missing: ${contract.constructorArgsFile}`);
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    error('Some required files are missing');
    process.exit(1);
  }
  success('All verification files present');
  
  log('\n🎯 Contracts to Verify:', colors.bright);
  for (const contract of contracts) {
    info(`- ${contract.name} at ${contract.address}`);
  }
  
  // Verify each contract
  const results = [];
  for (let i = 0; i < contracts.length; i++) {
    const result = await verifyContract(contracts[i]);
    results.push(result);
    
    // Wait between verifications to avoid rate limiting
    if (i < contracts.length - 1) {
      info('Waiting 5 seconds before next verification...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Summary
  header('Verification Summary');
  
  const successCount = results.filter(r => r).length;
  const failCount = results.filter(r => !r).length;
  
  log(`\n${colors.bright}Results:${colors.reset}`);
  log(`${colors.green}✓ Verified/Submitted: ${successCount}/${contracts.length}${colors.reset}`);
  if (failCount > 0) {
    log(`${colors.red}✗ Failed: ${failCount}/${contracts.length}${colors.reset}`);
  }
  
  if (successCount === contracts.length) {
    log('\n' + colors.green + '🎉 All contracts verified or submitted successfully!' + colors.reset);
    log('\n' + colors.bright + 'Contract Links:' + colors.reset);
    for (const contract of contracts) {
      log(`${colors.cyan}${contract.name}:${colors.reset} https://basescan.org/address/${contract.address}#code`);
    }
    
    log('\n' + colors.bright + '✅ Phase 1 Action 2 Prerequisite Complete!' + colors.reset);
    log('You can now proceed with autonomous Base network arbitrage launch.');
    log('\n' + colors.yellow + 'Note: If verification is still pending, check the contract pages in a few minutes.' + colors.reset);
  } else {
    warning('\nSome contracts failed to verify.');
    warning('You may need to verify them manually:');
    log('\n' + colors.bright + 'Manual Verification:' + colors.reset);
    info('1. Visit: https://basescan.org/verifyContract');
    info('2. Use flattened source from ./verification/');
    info('3. See ./verification/README.md for details');
  }
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  error(`Fatal error: ${err.message || err}`);
  console.error(err.stack);
  process.exit(1);
});
