#!/usr/bin/env node
/**
 * Autonomous Security Testing Runner
 * 
 * Launch TheWarden in autonomous security testing mode
 * for Base L2 Bridge and Coinbase bug bounty targets
 */

import { AutonomousSecurityTester } from '../src/security/autonomous-security-tester';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🛡️  THE WARDEN - AUTONOMOUS SECURITY TESTER 🛡️     ║
║                                                           ║
║        Preparing for Base L2 Bridge Bug Bounty           ║
║        Target: Coinbase HackerOne Program                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: any = {
    duration: 60, // default 1 hour
    targets: [],
    categories: [],
    minSeverity: 'medium'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) {
      options.duration = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--target' && args[i + 1]) {
      options.targets.push(args[i + 1]);
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      options.categories.push(args[i + 1]);
      i++;
    } else if (args[i] === '--severity' && args[i + 1]) {
      options.minSeverity = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      showHelp();
      process.exit(0);
    }
  }

  console.log(`⚙️  Configuration:`);
  console.log(`   Duration: ${options.duration} minutes`);
  console.log(`   Min Severity: ${options.minSeverity}`);
  if (options.targets.length > 0) {
    console.log(`   Targets: ${options.targets.join(', ')}`);
  }
  if (options.categories.length > 0) {
    console.log(`   Categories: ${options.categories.join(', ')}`);
  }
  console.log();

  // Initialize security tester
  const tester = new AutonomousSecurityTester();

  try {
    // Run autonomous security testing
    const results = await tester.runAutonomousSecurityTesting(options);

    console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║                    SESSION COMPLETE                       ║`);
    console.log(`╚═══════════════════════════════════════════════════════════╝\n`);

    console.log(`📊 Final Results:`);
    console.log(`   Tests Executed: ${results.testsRun}`);
    console.log(`   Vulnerabilities Found: ${results.vulnerabilitiesFound}`);
    console.log(`   Reports Generated: ${results.reports.length}`);
    console.log(`   Learnings Captured: ${results.learnings.length}`);

    // Save reports
    if (results.reports.length > 0) {
      const reportsDir = path.join(__dirname, '../docs/bug-bounty/reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(reportsDir, `security-test-${timestamp}.json`);
      
      fs.writeFileSync(reportFile, JSON.stringify({
        session: {
          timestamp: new Date().toISOString(),
          duration: options.duration,
          testsRun: results.testsRun,
          vulnerabilitiesFound: results.vulnerabilitiesFound
        },
        reports: results.reports,
        learnings: results.learnings
      }, null, 2));

      console.log(`\n📄 Reports saved to: ${reportFile}`);

      // Generate HackerOne format
      const hackerOneFile = path.join(reportsDir, `hackerone-${timestamp}.json`);
      fs.writeFileSync(hackerOneFile, tester.exportToHackerOne());
      console.log(`📄 HackerOne format: ${hackerOneFile}`);
    }

    // Display vulnerabilities
    if (results.vulnerabilitiesFound > 0) {
      console.log(`\n⚠️  VULNERABILITIES DETECTED:\n`);
      results.reports.forEach((report, i) => {
        console.log(`${i + 1}. [${report.severity.toUpperCase()}] ${report.title}`);
        console.log(`   Target: ${report.target}`);
        console.log(`   Impact: ${report.impact.substring(0, 100)}...`);
        console.log();
      });
    }

    // Save to memory
    await tester.saveToMemory();
    console.log(`✅ Session data saved to TheWarden memory system`);

  } catch (error) {
    console.error(`\n❌ Error during security testing:`, error);
    process.exit(1);
  }

  console.log(`\n🎯 Next Steps:`);
  console.log(`   1. Review generated reports in docs/bug-bounty/reports/`);
  console.log(`   2. Validate findings with manual testing`);
  console.log(`   3. Prepare HackerOne submissions for confirmed vulnerabilities`);
  console.log(`   4. Run again with: npm run security:test\n`);
}

function showHelp() {
  console.log(`
Usage: npm run security:test [options]

Options:
  --duration <minutes>     Testing duration in minutes (default: 60)
  --target <name>          Specific target to test (can use multiple times)
  --category <type>        Test category: bridge, mpc, smart-contract, cryptographic
  --severity <level>       Minimum severity: critical, high, medium, low
  --help                   Show this help message

Examples:
  npm run security:test --duration 30
  npm run security:test --target "L1StandardBridge" --severity critical
  npm run security:test --category bridge --duration 120
  npm run security:test --category mpc --target "cb-mpc ECDSA-2PC"

Targets:
  - L1StandardBridge       - Base L2 Bridge (L1 side)
  - L2StandardBridge       - Base L2 Bridge (L2 side)
  - OptimismPortal         - Deposit/withdrawal portal
  - L2OutputOracle         - State root oracle
  - cb-mpc ECDSA-2PC       - MPC ECDSA 2-party computation
  - cb-mpc secp256k1       - Secp256k1 implementation
  - Admin Functions        - Smart contract admin functions
  - EIP-712 Implementations - EIP-712 signature verification

For more information, see: docs/bug-bounty/coinbase-base-analysis.md
  `);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
