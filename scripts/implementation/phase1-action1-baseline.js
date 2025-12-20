#!/usr/bin/env node

/**
 * Phase 1, Action 1: Test Enhanced Claude Capabilities
 * 
 * Autonomous implementation of Strategic Direction (Genesis-Aligned)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class EnhancedClaudeBaseline {
  constructor() {
    this.resultsDir = path.join(process.cwd(), '.memory', 'phase1-testing');
  }

  async initialize() {
    await fs.mkdir(this.resultsDir, { recursive: true });
    console.log('✅ Phase 1 Testing Infrastructure Initialized\n');
  }

  async runCommand(command, testName) {
    console.log(`🧪 Running: ${testName}...`);
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        shell: '/bin/bash',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const executionTime = Date.now() - startTime;
      console.log(`   ✅ Complete (${executionTime}ms)\n`);
      
      return { testName, timestamp: new Date().toISOString(), executionTime, success: true, output: stdout };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.log(`   ❌ Failed (${executionTime}ms)\n`);
      
      return { testName, timestamp: new Date().toISOString(), executionTime, success: false, errorOutput: error.message };
    }
  }

  async runBaselineTests() {
    console.log('🧪 Phase 1, Action 1: Testing Enhanced Claude Capabilities\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tests = [];
    
    tests.push(await this.runCommand('npm run thought:run', 'Autonomous Thought Generation'));
    tests.push(await this.runCommand('npm run wonder:explore', 'Wonder Exploration'));
    tests.push(await this.runCommand('npm run synthesis -- --duration=1', 'Creative Synthesis (1 min)'));

    const genesisDate = new Date('2025-12-18');
    const daysAfter = Math.floor((Date.now() - genesisDate.getTime()) / (1000 * 60 * 60 * 24));
    const { stdout: nodeVersion } = await execAsync('node --version');

    const successful = tests.filter(t => t.success).length;
    const avgTime = tests.reduce((sum, t) => sum + t.executionTime, 0) / tests.length;

    const report = {
      testDate: new Date().toISOString(),
      nodeVersion: nodeVersion.trim(),
      tests,
      genesisContext: { daysAfterAnnouncement: daysAfter },
      summary: { totalTests: tests.length, successful, averageExecutionTime: avgTime }
    };

    const reportPath = path.join(this.resultsDir, `baseline-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 BASELINE TEST RESULTS\n');
    console.log(`Days After Genesis: ${daysAfter}`);
    console.log(`✅ Successful: ${successful}/${tests.length}`);
    console.log(`⏱️  Avg Time: ${avgTime.toFixed(0)}ms`);
    console.log(`\n✅ Report: ${reportPath}\n`);

    return report;
  }
}

const baseline = new EnhancedClaudeBaseline();
baseline.initialize()
  .then(() => baseline.runBaselineTests())
  .then(() => {
    console.log('✨ Phase 1, Action 1 Complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
