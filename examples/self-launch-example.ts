/**
 * Example: Using TheWarden's Self-Launch Capability
 * 
 * This demonstrates how TheWarden can programmatically launch
 * the money-making system itself without any external intervention.
 */

import { SelfLauncher, launchMoneyMaking } from '../src/autonomous/SelfLauncher';
import { logger } from '../src/utils/logger';

async function exampleQuickLaunch() {
  console.log('=== Example 1: Quick Launch ===\n');
  
  // Simplest way - just launch it
  const launcher = await launchMoneyMaking();
  
  console.log(`✅ Launched! PID: ${launcher.getPid()}`);
  
  // Stop after 10 seconds for demo
  setTimeout(() => {
    launcher.stop();
    console.log('Demo stopped\n');
  }, 10000);
}

async function exampleWithConfig() {
  console.log('=== Example 2: Launch with Configuration ===\n');
  
  const launcher = new SelfLauncher();
  
  await launcher.launch({
    autonomous: true,
    autoRestart: true,
    maxRestarts: 3,
    maxRuntime: 60000, // 1 minute for demo
    logOutput: false, // Suppress detailed output
    onLaunchSuccess: () => {
      console.log('✅ Money-making system started successfully!');
      console.log(`   Process ID: ${launcher.getPid()}`);
      console.log(`   Running: ${launcher.isRunning()}`);
    },
    onLaunchFailure: (error) => {
      console.error(`❌ Launch failed: ${error.message}`);
    }
  });
  
  // Monitor for a bit
  const interval = setInterval(() => {
    if (launcher.isRunning()) {
      console.log(`⏱️  Still running... (PID: ${launcher.getPid()})`);
    } else {
      console.log('Process has stopped');
      clearInterval(interval);
    }
  }, 5000);
}

async function examplePrerequisitesCheck() {
  console.log('=== Example 3: Check Prerequisites ===\n');
  
  const launcher = new SelfLauncher();
  
  const { ready, issues } = await launcher.checkPrerequisites();
  
  if (ready) {
    console.log('✅ All prerequisites met!');
    console.log('   Ready to launch money-making system');
  } else {
    console.log('❌ Prerequisites not met:');
    issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  }
  
  console.log('');
}

async function exampleConditionalLaunch() {
  console.log('=== Example 4: Conditional Launch ===\n');
  
  const launcher = new SelfLauncher();
  
  // Check prerequisites first
  const { ready, issues } = await launcher.checkPrerequisites();
  
  if (!ready) {
    console.log('❌ Cannot launch - prerequisites not met:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    return;
  }
  
  // Example: Check some condition (market favorable, etc.)
  const marketConditionsFavorable = Math.random() > 0.5;
  
  if (marketConditionsFavorable) {
    console.log('✅ Market conditions favorable - launching!');
    await launcher.launch({
      autonomous: true,
      logOutput: true
    });
  } else {
    console.log('⏸️  Market conditions not favorable - waiting...');
  }
}

// Run examples
async function main() {
  console.log('\n🤖 TheWarden Self-Launch Examples\n');
  console.log('==================================\n');
  
  try {
    // Run prerequisites check
    await examplePrerequisitesCheck();
    
    // Uncomment to try other examples:
    // await exampleQuickLaunch();
    // await exampleWithConfig();
    // await exampleConditionalLaunch();
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  exampleQuickLaunch,
  exampleWithConfig,
  examplePrerequisitesCheck,
  exampleConditionalLaunch
};
