#!/usr/bin/env node
/**
 * Test Script for Self-Hosted SSE Server
 * 
 * This script tests the self-hosted SSE streaming server.
 * It creates a mock performance monitor and intelligence bridge, then
 * streams data to all connected clients.
 * 
 * Usage:
 *   node --import tsx scripts/test-sse-server.ts
 *   npm run test:sse
 */

import { SelfHostedSSEService } from '../src/streaming/SelfHostedSSEService.js';
import { PerformanceMonitor } from '../src/monitoring/PerformanceMonitor.js';
import { IntelligenceBridge } from '../src/learning/IntelligenceBridge.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSSEServer() {
  console.log('🧪 Testing Self-Hosted SSE Server\n');

  const port = parseInt(process.env.SSE_PORT || '3001', 10);
  
  // Create mock PerformanceMonitor
  const performanceMonitor = new PerformanceMonitor();
  
  // Create mock IntelligenceBridge
  const intelligenceBridge = new IntelligenceBridge();

  // Simulate some initial data
  console.log('📊 Generating mock performance data...');
  performanceMonitor.recordMetric({
    subsystem: 'MEV Execution',
    metric: 'successRate',
    value: 0.85,
    timestamp: Date.now(),
  });
  
  performanceMonitor.recordMetric({
    subsystem: 'Security Testing',
    metric: 'healthScore',
    value: 92.5,
    timestamp: Date.now(),
  });

  console.log('🧠 Generating mock intelligence data...');
  intelligenceBridge.recordLearning({
    subsystem: 'MEV Execution',
    content: 'Optimized gas estimation algorithm',
    confidence: 0.9,
    category: 'optimization',
    timestamp: Date.now(),
  });

  // Create SSE Service
  console.log('🌐 Creating Self-Hosted SSE service...\n');
  const sseService = new SelfHostedSSEService(
    {
      port,
      enableLogging: true,
      sanitizeData: true,
      updateIntervalMs: 3000, // 3 seconds for testing
      corsOrigin: '*',
    },
    performanceMonitor,
    intelligenceBridge
  );

  // Start streaming
  await sseService.start();

  console.log('\n✅ SSE Server started! Connect with:');
  console.log(`🔗 Stream: http://localhost:${port}/stream/dashboard`);
  console.log(`🔗 API: http://localhost:${port}/api/dashboard`);
  console.log(`🔗 Status: http://localhost:${port}/api/status`);
  console.log('\nExample client code:');
  console.log(`
const eventSource = new EventSource('http://localhost:${port}/stream/dashboard');
eventSource.addEventListener('dashboard-update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Dashboard update:', data);
});
  `);
  console.log('\nPress Ctrl+C to stop.\n');

  // Simulate data updates
  let iteration = 0;
  const updateInterval = setInterval(() => {
    iteration++;
    
    // Update health score
    const healthScore = 85 + Math.random() * 15; // 85-100
    performanceMonitor.recordMetric({
      subsystem: 'System',
      metric: 'healthScore',
      value: healthScore,
      timestamp: Date.now(),
    });

    // Add some learnings periodically
    if (iteration % 3 === 0) {
      intelligenceBridge.recordLearning({
        subsystem: 'Test Subsystem',
        content: `Test learning #${iteration}`,
        confidence: 0.7 + Math.random() * 0.3,
        category: 'test',
        timestamp: Date.now(),
      });
    }

    const status = sseService.getStatus();
    console.log(`📈 Update #${iteration} - Health: ${healthScore.toFixed(1)} - Clients: ${status.connectedClients}`);
  }, 3000);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping SSE server...');
    clearInterval(updateInterval);
    await sseService.stop();
    console.log('✅ Stopped. Goodbye!\n');
    process.exit(0);
  });
}

// Run the test
testSSEServer().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
