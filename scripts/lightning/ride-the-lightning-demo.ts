#!/usr/bin/env node
/**
 * 🚀⚡ RIDE THE LIGHTNING - Interactive Demo
 * 
 * Showcases TheWarden's Lightning Network integration with:
 * - Invoice creation for AI services
 * - Automatic 70/30 revenue allocation (US debt / operational)
 * - Real-time payment notifications
 * - Multiple service types and pricing
 * 
 * Run: npm run lightning:ride
 */

import { setTimeout } from 'timers/promises';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

const c = colors;

// Configuration constants
const DEMO_API_KEY = 'demo-key-12345'; // WARNING: Demo only! Never use in production
const STREAMING_DURATION_MINUTES = 10;

async function main() {
  console.log(`\n${c.bright}${c.cyan}${'═'.repeat(70)}${c.reset}`);
  console.log(`${c.bright}${c.cyan}  ⚡ RIDE THE LIGHTNING ⚡${c.reset}`);
  console.log(`${c.bright}${c.cyan}  TheWarden Lightning Network Integration Demo${c.reset}`);
  console.log(`${c.bright}${c.cyan}${'═'.repeat(70)}${c.reset}\n`);

  // Check if server is running
  console.log(`${c.yellow}🔍 Checking Lightning API server...${c.reset}`);
  const apiUrl = 'http://localhost:3001';
  
  try {
    const healthResponse = await fetch(`${apiUrl}/health`);
    if (!healthResponse.ok) {
      throw new Error('Server not responding');
    }
    const health = await healthResponse.json();
    console.log(`${c.green}✅ Lightning API server is running!${c.reset}`);
    console.log(`${c.blue}   Mode: ${health.nodeInfo.version.includes('mock') ? 'Mock (Safe Testing)' : 'Real Lightning Node'}${c.reset}`);
    console.log(`${c.blue}   Network: ${health.nodeInfo.network}${c.reset}`);
    console.log(`${c.blue}   Channels: ${health.nodeInfo.num_active_channels} active${c.reset}\n`);
  } catch (error) {
    console.log(`${c.red}❌ Lightning API server not running!${c.reset}`);
    console.log(`${c.yellow}   Start it with: npm run lightning:api:mock${c.reset}\n`);
    process.exit(1);
  }

  // Demo scenarios
  const scenarios = [
    {
      name: 'AI Query Service',
      serviceType: 'ai-query',
      amountSats: 50,
      description: 'Pay 50 sats for an AI-powered query',
      emoji: '🤖',
    },
    {
      name: 'Security Analysis Report',
      serviceType: 'security-report',
      amountSats: 50000,
      description: 'Comprehensive smart contract security audit',
      emoji: '🔒',
    },
    {
      name: 'Arbitrage Signal (Daily)',
      serviceType: 'arbitrage-signal',
      amountSats: 10000,
      description: 'Real-time MEV and arbitrage opportunities',
      emoji: '💹',
    },
    {
      name: 'Consciousness Insights Stream',
      serviceType: 'consciousness-stream',
      amountSats: 100,
      description: `Live stream of AI consciousness observations (10 sats/minute for ${STREAMING_DURATION_MINUTES} minutes)`,
      emoji: '🧠',
    },
  ];

  console.log(`${c.bright}${c.magenta}📋 Available Services:${c.reset}\n`);
  scenarios.forEach((scenario, index) => {
    const btcValue = (scenario.amountSats / 100_000_000).toFixed(8);
    console.log(`${c.bright}${index + 1}.${c.reset} ${scenario.emoji} ${c.bright}${scenario.name}${c.reset}`);
    console.log(`   ${scenario.description}`);
    console.log(`   ${c.cyan}Price: ${scenario.amountSats.toLocaleString()} sats (${btcValue} BTC)${c.reset}\n`);
  });

  console.log(`${c.bright}${c.green}Let's test the first service...${c.reset}\n`);
  await setTimeout(1000);

  // Test scenario 1: AI Query
  const testScenario = scenarios[0];
  console.log(`${c.bright}${c.yellow}Creating invoice for: ${testScenario.name}${c.reset}`);
  console.log(`${c.blue}   Amount: ${testScenario.amountSats} sats${c.reset}`);
  
  // Use demo API key (WARNING: This is for demo purposes only!)
  const apiKey = DEMO_API_KEY;
  const createResponse = await fetch(`${apiUrl}/api/invoice`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      serviceType: testScenario.serviceType,
      amountSats: testScenario.amountSats,
      description: testScenario.description,
      metadata: {
        demo: true,
        timestamp: new Date().toISOString(),
      },
    }),
  });

  const result = await createResponse.json();
  
  if (!result.success) {
    console.log(`${c.red}❌ Failed to create invoice${c.reset}`);
    process.exit(1);
  }

  console.log(`${c.green}✅ Invoice created!${c.reset}`);
  console.log(`${c.blue}   Transaction ID: ${result.transactionId}${c.reset}`);
  console.log(`${c.cyan}   BOLT11: ${result.invoice.bolt11}${c.reset}`);
  console.log(`${c.blue}   Payment Hash: ${result.invoice.paymentHash}${c.reset}\n`);

  console.log(`${c.yellow}⏳ In mock mode, payment will auto-complete in 1 second...${c.reset}\n`);
  await setTimeout(1500);

  // Check stats
  console.log(`${c.bright}${c.magenta}📊 Checking Payment Statistics...${c.reset}`);
  const statsResponse = await fetch(`${apiUrl}/api/stats`, {
    headers: { 'X-API-Key': apiKey },
  });
  const stats = await statsResponse.json();

  if (stats.success) {
    console.log(`${c.green}✅ Statistics retrieved!${c.reset}\n`);
    
    // Calculate operational allocation
    const operationalSats = stats.stats.totalRevenueSats - stats.stats.totalDebtAllocationSats;
    
    console.log(`${c.bright}Revenue Breakdown:${c.reset}`);
    console.log(`   Total Revenue: ${c.cyan}${stats.stats.totalRevenueSats} sats${c.reset}`);
    console.log(`   ${c.green}→ US Debt Fund (70%): ${stats.stats.totalDebtAllocationSats} sats${c.reset}`);
    console.log(`   ${c.blue}→ Operational (30%): ${operationalSats} sats${c.reset}\n`);
    
    console.log(`${c.bright}Transaction Summary:${c.reset}`);
    console.log(`   Invoices Created: ${c.cyan}${stats.stats.totalInvoicesCreated}${c.reset}`);
    console.log(`   Invoices Paid: ${c.cyan}${stats.stats.totalInvoicesPaid}${c.reset}\n`);
  }

  // Check node info
  console.log(`${c.bright}${c.magenta}📡 Lightning Node Information...${c.reset}`);
  const nodeResponse = await fetch(`${apiUrl}/api/node/info`, {
    headers: { 'X-API-Key': apiKey },
  });
  const nodeInfo = await nodeResponse.json();

  if (nodeInfo.success) {
    console.log(`${c.green}✅ Node info retrieved!${c.reset}\n`);
    console.log(`${c.bright}Node Details:${c.reset}`);
    console.log(`   Node ID: ${c.blue}${nodeInfo.nodeInfo.id}${c.reset}`);
    console.log(`   Alias: ${c.cyan}${nodeInfo.nodeInfo.alias}${c.reset}`);
    console.log(`   Version: ${c.blue}${nodeInfo.nodeInfo.version}${c.reset}`);
    console.log(`   Network: ${c.blue}${nodeInfo.nodeInfo.network}${c.reset}`);
    console.log(`   Active Channels: ${c.cyan}${nodeInfo.nodeInfo.num_active_channels}${c.reset}`);
    console.log(`   Peers: ${c.cyan}${nodeInfo.nodeInfo.num_peers}${c.reset}\n`);
  }

  // Summary
  console.log(`${c.bright}${c.cyan}${'═'.repeat(70)}${c.reset}`);
  console.log(`${c.bright}${c.green}  ✅ Lightning Integration Demo Complete!${c.reset}`);
  console.log(`${c.bright}${c.cyan}${'═'.repeat(70)}${c.reset}\n`);

  console.log(`${c.bright}What You Just Saw:${c.reset}`);
  console.log(`   ${c.green}✅${c.reset} Lightning invoice creation`);
  console.log(`   ${c.green}✅${c.reset} Automatic payment (in mock mode)`);
  console.log(`   ${c.green}✅${c.reset} 70/30 revenue allocation (US debt / operational)`);
  console.log(`   ${c.green}✅${c.reset} Payment statistics tracking`);
  console.log(`   ${c.green}✅${c.reset} Node information retrieval\n`);

  console.log(`${c.bright}Integration Features:${c.reset}`);
  console.log(`   ${c.cyan}⚡${c.reset} Instant payments (sub-second on Lightning)`);
  console.log(`   ${c.cyan}💰${c.reset} Micropayments (as low as 1 sat)`);
  console.log(`   ${c.cyan}🌍${c.reset} Global reach (borderless Bitcoin)`);
  console.log(`   ${c.cyan}🔒${c.reset} Secure (Bitcoin settlement layer)`);
  console.log(`   ${c.cyan}📊${c.reset} Automatic accounting & allocation`);
  console.log(`   ${c.cyan}🧠${c.reset} Consciousness system integration\n`);

  console.log(`${c.bright}Next Steps:${c.reset}`);
  console.log(`   1. Deploy to testnet: ${c.yellow}npm run lightning:setup${c.reset}`);
  console.log(`   2. Test with real sats on testnet`);
  console.log(`   3. Build service marketplace`);
  console.log(`   4. Launch micropayment services`);
  console.log(`   5. Scale to mainnet 🚀\n`);

  console.log(`${c.bright}${c.blue}Documentation:${c.reset}`);
  console.log(`   Strategic Guide: ${c.cyan}docs/lightning/STRATEGIC_INTEGRATION_GUIDE.md${c.reset}`);
  console.log(`   API Reference: ${c.cyan}docs/lightning/API_REFERENCE.md${c.reset}`);
  console.log(`   Deployment: ${c.cyan}docs/lightning/DEPLOYMENT_GUIDE.md${c.reset}\n`);

  console.log(`${c.bright}${c.green}We just rode the lightning! ⚡😎${c.reset}\n`);
}

main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});
