#!/usr/bin/env node
/**
 * Lightning API Server Startup Script
 * Starts the Lightning REST API and WebSocket server
 */

import { CoreLightningClient } from '../../src/lightning/CoreLightningClient.js';
import { MockLightningClient } from '../../src/lightning/MockLightningClient.js';
import { LightningPaymentProcessor } from '../../src/lightning/LightningPaymentProcessor.js';
import { LightningAPIServer } from '../../src/lightning/LightningAPIServer.js';

const USE_MOCK = process.env.LIGHTNING_MOCK === 'true' || process.argv.includes('--mock');
const PORT = parseInt(process.env.LIGHTNING_API_PORT || '3001');
const HOST = process.env.LIGHTNING_API_HOST || '0.0.0.0';

async function main() {
  console.log('⚡ Lightning API Server Startup');
  console.log('================================\n');

  // Initialize Lightning client
  let lightningClient: any;
  
  if (USE_MOCK) {
    console.log('🧪 Using Mock Lightning Client (no real node required)\n');
    lightningClient = new MockLightningClient({
      network: 'testnet',
    });
  } else {
    console.log('🔌 Connecting to Real Lightning Node\n');
    lightningClient = new CoreLightningClient({
      network: process.env.LIGHTNING_NETWORK as any || 'testnet',
      lightningDir: process.env.LIGHTNING_DIR,
    });

    // Check if node is accessible
    const health = await lightningClient.healthCheck();
    if (!health.healthy) {
      console.error('❌ Lightning node not accessible:', health.error);
      console.log('\nOptions:');
      console.log('  1. Start Lightning node: lightningd --network=testnet --daemon');
      console.log('  2. Use mock mode: npm run lightning:api -- --mock');
      console.log('  3. Set LIGHTNING_MOCK=true environment variable\n');
      process.exit(1);
    }

    console.log('✅ Lightning node connected');
    if (health.nodeInfo) {
      console.log(`   Node ID: ${health.nodeInfo.id}`);
      console.log(`   Network: ${health.nodeInfo.network}`);
      console.log(`   Channels: ${health.nodeInfo.num_active_channels} active\n`);
    }
  }

  // Initialize payment processor
  console.log('📊 Initializing Payment Processor...');
  const paymentProcessor = new LightningPaymentProcessor({
    lightningClient,
    debtAllocationPercent: 70, // 70% to US debt
    consciousnessIntegration: true,
  });
  console.log('✅ Payment processor ready\n');

  // API keys from environment
  const apiKeys = process.env.LIGHTNING_API_KEYS
    ? process.env.LIGHTNING_API_KEYS.split(',')
    : ['demo-key-12345']; // Default demo key for testing

  if (apiKeys[0] === 'demo-key-12345') {
    console.log('⚠️  Using demo API key for testing');
    console.log('   Set LIGHTNING_API_KEYS environment variable for production\n');
  }

  // Initialize API server
  const apiServer = new LightningAPIServer({
    port: PORT,
    host: HOST,
    lightningClient,
    paymentProcessor,
    apiKeyRequired: true,
    apiKeys,
    corsOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
    ],
    rateLimitPerMinute: 60,
  });

  // Start server
  await apiServer.start();

  console.log('📝 Available Endpoints:');
  console.log(`   POST   /api/invoice         - Create invoice`);
  console.log(`   GET    /api/invoice/:id     - Get invoice status`);
  console.log(`   GET    /api/invoices        - List recent invoices`);
  console.log(`   GET    /api/node/info       - Get node information`);
  console.log(`   GET    /api/stats           - Get payment statistics`);
  console.log(`   GET    /api/wallet/balance  - Get wallet balance`);
  console.log(`   GET    /api/channels        - List channels`);
  console.log(`   POST   /api/invoice/decode  - Decode BOLT11 invoice`);
  console.log(`   GET    /health              - Health check (no auth)`);
  console.log('');
  
  console.log('🔐 Authentication:');
  console.log(`   Header: X-API-Key: ${apiKeys[0]}`);
  console.log(`   Or query: ?api_key=${apiKeys[0]}`);
  console.log('');

  console.log('💡 Example Usage:');
  console.log(`   curl -X POST http://${HOST}:${PORT}/api/invoice \\`);
  console.log(`     -H "X-API-Key: ${apiKeys[0]}" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"serviceType":"ai-query","amountSats":50,"description":"Test query"}'`);
  console.log('');

  console.log('📡 WebSocket Events:');
  console.log(`   Connect: ws://${HOST}:${PORT}`);
  console.log(`   Subscribe: socket.emit('subscribe:transaction', transactionId)`);
  console.log(`   Events: payment:received, payment:expired`);
  console.log('');

  if (USE_MOCK) {
    console.log('🎯 Mock Mode Features:');
    console.log('   - Invoices auto-paid after 1 second');
    console.log('   - Simulated channels and balance');
    console.log('   - Perfect for testing without real BTC\n');
  }

  console.log('✅ Lightning API Server Ready!\n');
  console.log('Press Ctrl+C to stop\n');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚡ Shutting down Lightning API Server...');
    await apiServer.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚡ Shutting down Lightning API Server...');
    await apiServer.stop();
    process.exit(0);
  });
}

// Run server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
