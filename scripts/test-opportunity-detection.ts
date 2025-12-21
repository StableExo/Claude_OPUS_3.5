#!/usr/bin/env node
/**
 * Test Arbitrage Opportunity Detection
 * 
 * Simple script to test if TheWarden can find opportunities
 */

import 'dotenv/config';
import { JsonRpcProvider, parseEther } from 'ethers';
import { DEXRegistry } from '../src/dex/core/DEXRegistry.js';
import { AdvancedOrchestrator } from '../src/arbitrage/AdvancedOrchestrator.js';
import { PoolDataStore } from '../src/arbitrage/PoolDataStore.js';
import { defaultAdvancedArbitrageConfig } from '../src/config/advanced-arbitrage.config.js';
import { getScanTokens } from '../src/utils/chainTokens.js';
import { logger } from '../src/utils/logger.js';

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 TheWarden - Arbitrage Opportunity Detection Test');
console.log('═══════════════════════════════════════════════════════════\n');

const chainId = parseInt(process.env.CHAIN_ID || '8453'); // Base mainnet
const rpcUrl = process.env.BASE_RPC_URL || process.env.RPC_URL;

console.log('📊 Configuration:');
console.log(`   Chain ID: ${chainId}`);
console.log(`   RPC URL: ${rpcUrl?.substring(0, 40)}...`);
console.log('');

// Initialize components
const provider = new JsonRpcProvider(rpcUrl);
const dexRegistry = new DEXRegistry();
const poolDataStore = new PoolDataStore({ cacheDuration: 300000 }); // 5 min cache

console.log('🔧 Initializing DEX Registry...');
const allDexes = Array.from(dexRegistry.getAllDEXes().values());
const dexConfigs = allDexes.filter(dex => dex.chainId === chainId);
console.log(`✅ Found ${dexConfigs.length} DEXes on chain ${chainId}`);
dexConfigs.forEach(dex => {
  console.log(`   - ${dex.name} (${dex.protocol})`);
});

console.log('\n🪙 Getting scan tokens...');
const tokens = getScanTokens(chainId);
console.log(`✅ Found ${tokens.length} tokens to scan`);
console.log(`   Tokens: ${tokens.slice(0, 5).join(', ')}${tokens.length > 5 ? '...' : ''}`);

console.log('\n🚀 Initializing AdvancedOrchestrator...');
const orchestrator = new AdvancedOrchestrator(
  dexRegistry,
  defaultAdvancedArbitrageConfig,
  chainId,
  poolDataStore
);

// Try to load preloaded data
console.log('\n📦 Checking for preloaded pool data...');
const preloadSuccess = await orchestrator.loadPreloadedData(chainId);
if (preloadSuccess) {
  console.log('✅ Preloaded pool data loaded successfully');
} else {
  console.log('⚠️  No preloaded data - will fetch from network');
}

// Test opportunity finding
console.log('\n🔍 Searching for arbitrage opportunities...');
console.log('   This may take 30-60 seconds...\n');

const startAmount = parseEther('1'); // 1 ETH test amount
const startTime = Date.now();

try {
  const paths = await orchestrator.findOpportunities(tokens, startAmount);
  const endTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`⏱️  Search Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
  console.log(`🎯 Opportunities Found: ${paths.length}`);
  
  if (paths.length > 0) {
    console.log('\n✅ SUCCESS! Found opportunities:\n');
    paths.slice(0, 3).forEach((path, i) => {
      console.log(`Opportunity #${i + 1}:`);
      console.log(`   Path: ${path.path.join(' → ')}`);
      console.log(`   Profit: ${(Number(path.netProfit) / 1e18).toFixed(6)} ETH`);
      console.log(`   Gas Cost: ${(Number(path.totalGasCost) / 1e18).toFixed(6)} ETH`);
      console.log(`   DEXes: ${path.dexes.join(', ')}`);
      console.log('');
    });
    
    if (paths.length > 3) {
      console.log(`   ... and ${paths.length - 3} more opportunities`);
    }
  } else {
    console.log('\n⚠️  No opportunities found');
    console.log('\n💡 Possible reasons:');
    console.log('   1. Market conditions: No profitable arbitrage exists right now');
    console.log('   2. Pool data loading issue: Try running "npm run preload:pools"');
    console.log('   3. Profit threshold too high: Current threshold may filter out opportunities');
    console.log('   4. Network latency: DEX data fetching may be timing out');
    console.log('\n🔧 Debugging steps:');
    console.log('   1. Check if pools are being scanned: Look for "Found X pools" in logs above');
    console.log('   2. Lower MIN_PROFIT_THRESHOLD in .env');
    console.log('   3. Increase OPPORTUNITY_TIMEOUT in .env');
    console.log('   4. Run: npm run preload:pools -- --chain 8453');
  }
  
} catch (error) {
  console.error('\n❌ ERROR during opportunity detection:');
  console.error(error);
  
  if (error instanceof Error && error.message.includes('timeout')) {
    console.log('\n⏱️  TIMEOUT detected!');
    console.log('   The opportunity search is taking too long.');
    console.log('\n   Solutions:');
    console.log('   1. Increase OPPORTUNITY_TIMEOUT in .env (currently 45s)');
    console.log('   2. Preload pool data: npm run preload:pools -- --chain 8453');
    console.log('   3. Reduce number of tokens in chainTokens.ts');
  }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('Test complete!');
console.log('═══════════════════════════════════════════════════════════');

process.exit(0);
