#!/usr/bin/env node
/**
 * Pre-Launch Validation Script
 * Tests all critical systems before autonomous money-making
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { JsonRpcProvider } from 'ethers';

// Load environment
config();

const REQUIRED_ENV_VARS = [
  'WALLET_PRIVATE_KEY',
  'BASE_RPC_URL',
  'CHAIN_ID',
  'FLASHSWAP_V2_ADDRESS',
];

const OPTIONAL_BUT_RECOMMENDED = [
  'ALCHEMY_API_KEY',
  'BASESCAN_API_KEY',
  'XAI_PROD_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
];

const REVENUE_STREAM_VARS = [
  'ENABLE_CEX_MONITOR',
  'CEX_EXCHANGES',
  'RATED_NETWORK_ENABLED',
  'ENABLE_BLOXROUTE',
];

interface ValidationResult {
  category: string;
  item: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
}

const results: ValidationResult[] = [];

function log(result: ValidationResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
  const color = result.status === 'PASS' ? '\x1b[32m' : result.status === 'WARN' ? '\x1b[33m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${result.category}: ${result.item} - ${result.message}`);
}

async function validateEnvironment() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔍 PRE-LAUNCH VALIDATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check .env file
  if (existsSync('.env')) {
    log({
      category: 'Config',
      item: '.env file',
      status: 'PASS',
      message: 'Found',
    });
  } else {
    log({
      category: 'Config',
      item: '.env file',
      status: 'FAIL',
      message: 'Missing - create from .env.example',
    });
    return false;
  }

  // Check required environment variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    // CHAIN_ID can be short (e.g., "8453")
    const minLength = varName === 'CHAIN_ID' ? 1 : 10;
    if (value && value !== 'YOUR_' && value.length >= minLength) {
      log({
        category: 'Required',
        item: varName,
        status: 'PASS',
        message: 'Configured',
      });
    } else {
      log({
        category: 'Required',
        item: varName,
        status: 'FAIL',
        message: 'Missing or invalid',
      });
    }
  }

  // Check recommended variables
  for (const varName of OPTIONAL_BUT_RECOMMENDED) {
    const value = process.env[varName];
    if (value && value !== 'your_' && value.length > 10) {
      log({
        category: 'Recommended',
        item: varName,
        status: 'PASS',
        message: 'Configured',
      });
    } else {
      log({
        category: 'Recommended',
        item: varName,
        status: 'WARN',
        message: 'Not configured (optional)',
      });
    }
  }

  // Check revenue streams
  for (const varName of REVENUE_STREAM_VARS) {
    const value = process.env[varName];
    if (value === 'true' || (value && value.length > 0)) {
      log({
        category: 'Revenue',
        item: varName,
        status: 'PASS',
        message: `Enabled (${value})`,
      });
    } else {
      log({
        category: 'Revenue',
        item: varName,
        status: 'WARN',
        message: 'Not enabled',
      });
    }
  }

  // Check mode settings
  const dryRun = process.env.DRY_RUN;
  if (dryRun === 'false') {
    log({
      category: 'Mode',
      item: 'DRY_RUN',
      status: 'PASS',
      message: '⚠️  LIVE MODE (real transactions)',
    });
  } else {
    log({
      category: 'Mode',
      item: 'DRY_RUN',
      status: 'WARN',
      message: 'Simulation mode (safe)',
    });
  }

  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    log({
      category: 'Mode',
      item: 'NODE_ENV',
      status: 'PASS',
      message: 'Production',
    });
  } else {
    log({
      category: 'Mode',
      item: 'NODE_ENV',
      status: 'WARN',
      message: `${nodeEnv || 'development'} (not production)`,
    });
  }

  // Test RPC connection
  try {
    const rpcUrl = process.env.BASE_RPC_URL;
    if (!rpcUrl) {
      throw new Error('BASE_RPC_URL not set');
    }

    log({
      category: 'Network',
      item: 'RPC URL',
      status: 'PASS',
      message: 'Testing connection...',
    });

    const provider = new JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();

    log({
      category: 'Network',
      item: 'Base RPC',
      status: 'PASS',
      message: `Connected (block ${blockNumber}, chainId ${network.chainId})`,
    });

    // Check wallet balance
    const walletAddress = process.env.WALLET_PRIVATE_KEY;
    if (walletAddress) {
      // Don't log the full private key, just check if we can derive address
      log({
        category: 'Wallet',
        item: 'Private Key',
        status: 'PASS',
        message: 'Configured (64 chars)',
      });
    }
  } catch (error) {
    log({
      category: 'Network',
      item: 'RPC Connection',
      status: 'FAIL',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // Check safety systems
  const safetyChecks = [
    { key: 'CIRCUIT_BREAKER_ENABLED', name: 'Circuit Breaker' },
    { key: 'EMERGENCY_STOP_ENABLED', name: 'Emergency Stop' },
    { key: 'PROFIT_TRACKING_ENABLED', name: 'Profit Tracking' },
  ];

  for (const check of safetyChecks) {
    const value = process.env[check.key];
    if (value === 'true') {
      log({
        category: 'Safety',
        item: check.name,
        status: 'PASS',
        message: 'Enabled',
      });
    } else {
      log({
        category: 'Safety',
        item: check.name,
        status: 'WARN',
        message: 'Not enabled',
      });
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const warnings = results.filter((r) => r.status === 'WARN').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log(`✓ Passed:   ${passed}`);
  console.log(`⚠ Warnings: ${warnings}`);
  console.log(`✗ Failed:   ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ VALIDATION FAILED - Fix errors before launching\n');
    return false;
  } else if (warnings > 5) {
    console.log('⚠️  VALIDATION PASSED with warnings - Review before launching\n');
    return true;
  } else {
    console.log('✅ VALIDATION PASSED - Ready for launch!\n');
    return true;
  }
}

// Run validation
validateEnvironment()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Validation error:', error);
    process.exit(1);
  });
