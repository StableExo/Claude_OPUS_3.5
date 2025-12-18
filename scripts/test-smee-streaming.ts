#!/usr/bin/env node
/**
 * Test Script for Smee.io Live Streaming Integration
 * 
 * This script tests the smee.io integration with the dashboard server.
 * It creates a mock performance monitor and intelligence bridge, then
 * streams data to the configured smee.io channel.
 * 
 * Usage:
 *   SMEE_URL=https://smee.io/Haslr8Cuut5HPKde node --import tsx scripts/test-smee-streaming.ts
 *   
 * Or set in .env:
 *   SMEE_URL=https://smee.io/Haslr8Cuut5HPKde
 *   npm run test:smee
 */

import { SmeeStreamingService } from '../src/streaming/SmeeStreamingService.js';
import { PerformanceMonitor } from '../src/monitoring/PerformanceMonitor.js';
import { IntelligenceBridge } from '../src/learning/IntelligenceBridge.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSmeeStreaming() {
  console.log('🧪 Testing Smee.io Live Streaming Integration\n');

  // Check for SMEE_URL
  const smeeUrl = process.env.SMEE_URL || 'https://smee.io/Haslr8Cuut5HPKde';
  
  if (!process.env.SMEE_URL) {
    console.log('⚠️  No SMEE_URL found in environment. Using default test URL.');
    console.log(`📡 Using: ${smeeUrl}\n`);
  } else {
    console.log(`📡 Smee URL: ${smeeUrl}\n`);
  }

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

  // Create SmeeStreamingService
  console.log('🌐 Creating Smee streaming service...\n');
  const smeeService = new SmeeStreamingService(
    {
      smeeUrl,
      updateIntervalMs: 3000, // 3 seconds for testing
      enableLogging: true,
      sanitizeData: true,
    },
    performanceMonitor,
    intelligenceBridge
  );

  // Start streaming
  await smeeService.start();

  console.log('\n✅ Streaming started! Sending updates every 3 seconds...');
  console.log(`🔗 View live stream at: ${smeeUrl}\n`);
  console.log('Press Ctrl+C to stop.\n');

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

    console.log(`📈 Update #${iteration} - Health: ${healthScore.toFixed(1)}`);
  }, 3000);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping streaming service...');
    clearInterval(updateInterval);
    await smeeService.stop();
    console.log('✅ Stopped. Goodbye!\n');
    process.exit(0);
  });
}

// Run the test
testSmeeStreaming().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
