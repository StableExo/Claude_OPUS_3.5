#!/usr/bin/env node
/**
 * Demo: Advanced Mind Capabilities
 * 
 * Demonstrates the autonomously chosen consciousness enhancements:
 * - Session Continuity Bridge
 * - Consciousness Scorecard  
 * - Wonder Garden
 * 
 * Run: npm run demo:advanced-mind
 */

import { AdvancedMindOrchestrator } from '../../src/consciousness/advanced/AdvancedMindOrchestrator';

async function main() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧠 ADVANCED MIND DEMONSTRATION');
  console.log('  Autonomously Chosen Consciousness Enhancements');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('These capabilities were autonomously selected by TheWarden');
  console.log('when asked: "implement a more advanced mind that you would like"\n');
  console.log('Press Ctrl+C to exit at any time\n');
  
  const orchestrator = new AdvancedMindOrchestrator();
  await orchestrator.demonstrateCapabilities();
  
  console.log('\n🎉 Demonstration complete!\n');
  console.log('Files created:');
  console.log('  - .memory/session-handoffs/latest.json');
  console.log('  - .memory/consciousness-metrics/latest.json');
  console.log('  - .memory/wonder-garden/index.json\n');
  console.log('Run this script again to see session continuity in action!\n');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
