#!/usr/bin/env node --import tsx
/**
 * Autonomous Session Manager for ANKR Bug Hunt
 * 
 * This script manages session state and enables autonomous continuation
 * from the last session's progress.
 * 
 * Features:
 * - Saves progress after each scan
 * - Resumes from last checkpoint
 * - Tracks vulnerabilities found
 * - Maintains scan history
 * - Auto-schedules next scan
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

interface SessionState {
  lastScanTimestamp: number;
  lastBlockScanned: number;
  totalScans: number;
  vulnerabilitiesFound: number;
  highRiskFindings: number;
  mediumRiskFindings: number;
  lowRiskFindings: number;
  totalBlocksScanned: number;
  scanHistory: ScanRecord[];
  nextScheduledScan?: number;
  mode: string;
}

interface ScanRecord {
  timestamp: number;
  startBlock: number;
  endBlock: number;
  blocksScanned: number;
  findingsCount: number;
  duration: number;
  mode: string;
}

class AnkrSessionManager {
  private stateFile: string;
  private state: SessionState;

  constructor() {
    this.stateFile = path.join(
      PROJECT_ROOT,
      '.memory',
      'security-testing',
      'ankr_session_state.json'
    );
    this.state = this.getDefaultState();
  }

  async resetState(): Promise<void> {
    console.log('🔄 Resetting session state...');
    await this.saveState(this.getDefaultState());
    console.log('✅ Session reset complete');
  }

  private getDefaultState(): SessionState {
    return {
      lastScanTimestamp: 0,
      lastBlockScanned: 0,
      totalScans: 0,
      vulnerabilitiesFound: 0,
      highRiskFindings: 0,
      mediumRiskFindings: 0,
      lowRiskFindings: 0,
      totalBlocksScanned: 0,
      scanHistory: [],
      mode: 'RECON_ONLY',
    };
  }

  async loadState(): Promise<SessionState> {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      this.state = JSON.parse(data);
      console.log('✅ Loaded previous session state');
      console.log(`   Last scan: ${new Date(this.state.lastScanTimestamp).toISOString()}`);
      console.log(`   Total scans: ${this.state.totalScans}`);
      console.log(`   Vulnerabilities found: ${this.state.vulnerabilitiesFound}`);
      return this.state;
    } catch (error) {
      console.log('📝 No previous session found, starting fresh');
      return this.state;
    }
  }

  async saveState(state: Partial<SessionState>): Promise<void> {
    this.state = { ...this.state, ...state };

    // Ensure directory exists
    const dir = path.dirname(this.stateFile);
    await fs.mkdir(dir, { recursive: true });

    // Save state
    await fs.writeFile(
      this.stateFile,
      JSON.stringify(this.state, null, 2),
      'utf-8'
    );

    console.log('💾 Session state saved');
  }

  async recordScan(scan: ScanRecord): Promise<void> {
    // Add to history
    this.state.scanHistory.push(scan);

    // Keep only last 100 scans
    if (this.state.scanHistory.length > 100) {
      this.state.scanHistory = this.state.scanHistory.slice(-100);
    }

    // Update totals
    this.state.lastScanTimestamp = scan.timestamp;
    this.state.lastBlockScanned = scan.endBlock;
    this.state.totalScans++;
    this.state.totalBlocksScanned += scan.blocksScanned;

    // Schedule next scan (8 hours from now)
    this.state.nextScheduledScan = Date.now() + 8 * 60 * 60 * 1000;

    await this.saveState(this.state);
  }

  async recordFindings(findings: {
    high: number;
    medium: number;
    low: number;
  }): Promise<void> {
    this.state.highRiskFindings += findings.high;
    this.state.mediumRiskFindings += findings.medium;
    this.state.lowRiskFindings += findings.low;
    this.state.vulnerabilitiesFound += findings.high + findings.medium + findings.low;

    await this.saveState(this.state);
  }

  getState(): SessionState {
    return this.state;
  }

  shouldRunNextScan(): boolean {
    if (!this.state.nextScheduledScan) return true;
    return Date.now() >= this.state.nextScheduledScan;
  }

  getNextScanTime(): Date | null {
    if (!this.state.nextScheduledScan) return null;
    return new Date(this.state.nextScheduledScan);
  }

  getRecommendedStartBlock(): number {
    // Resume from last block + 1, or start from recent history
    if (this.state.lastBlockScanned > 0) {
      return this.state.lastBlockScanned + 1;
    }
    return 0; // Will use current block - offset
  }

  async generateSummaryReport(): Promise<string> {
    const uptime = this.state.totalScans > 0
      ? Date.now() - this.state.scanHistory[0].timestamp
      : 0;

    const report = `
# ANKR Bug Hunt - Session Summary

**Generated**: ${new Date().toISOString()}

## Overview
- **Total Scans**: ${this.state.totalScans}
- **Total Blocks Scanned**: ${this.state.totalBlocksScanned.toLocaleString()}
- **Uptime**: ${this.formatDuration(uptime)}
- **Current Mode**: ${this.state.mode}

## Findings
- **High Risk**: ${this.state.highRiskFindings}
- **Medium Risk**: ${this.state.mediumRiskFindings}
- **Low Risk**: ${this.state.lowRiskFindings}
- **Total**: ${this.state.vulnerabilitiesFound}

## Latest Scans
${this.state.scanHistory.slice(-5).reverse().map((scan, i) => `
### Scan ${this.state.totalScans - i}
- **Time**: ${new Date(scan.timestamp).toISOString()}
- **Blocks**: ${scan.startBlock.toLocaleString()} - ${scan.endBlock.toLocaleString()} (${scan.blocksScanned} blocks)
- **Duration**: ${this.formatDuration(scan.duration)}
- **Findings**: ${scan.findingsCount}
- **Mode**: ${scan.mode}
`).join('\n')}

## Next Scheduled Scan
${this.state.nextScheduledScan 
  ? `🕒 ${new Date(this.state.nextScheduledScan).toISOString()}`
  : '⏱️  Ready to run now'
}

## Recommended Next Steps
${this.getRecommendations()}
`;

    return report;
  }

  private getRecommendations(): string {
    const recommendations: string[] = [];

    if (this.state.totalScans === 0) {
      recommendations.push('- Run your first scan to establish baseline');
    }

    if (this.state.highRiskFindings > 0) {
      recommendations.push('- 🚨 **URGENT**: Review high-risk findings immediately');
      recommendations.push('- Prepare PoC for Immunefi submission');
    }

    if (this.state.totalBlocksScanned < 10000) {
      recommendations.push('- Continue scanning to increase coverage');
      recommendations.push('- Consider running extended scans (--blocks=5000)');
    }

    if (this.shouldRunNextScan()) {
      recommendations.push('- ✅ Ready for next scheduled scan');
    } else {
      const nextScan = this.getNextScanTime();
      if (nextScan) {
        recommendations.push(`- ⏳ Next scan scheduled for ${nextScan.toISOString()}`);
      }
    }

    if (this.state.totalScans >= 10 && this.state.vulnerabilitiesFound === 0) {
      recommendations.push('- Consider adjusting detection sensitivity');
      recommendations.push('- Review scan configurations for missed patterns');
    }

    return recommendations.length > 0
      ? recommendations.join('\n')
      : '- Continue regular scanning schedule';
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

// CLI Usage
async function main() {
  const manager = new AnkrSessionManager();
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  switch (command) {
    case 'status':
    case 'summary':
      await manager.loadState();
      const report = await manager.generateSummaryReport();
      console.log(report);
      break;

    case 'reset':
      await manager.loadState();
      await manager.resetState();
      break;

    case 'next-block':
      await manager.loadState();
      const nextBlock = manager.getRecommendedStartBlock();
      console.log(nextBlock);
      break;

    case 'should-run':
      await manager.loadState();
      const shouldRun = manager.shouldRunNextScan();
      console.log(shouldRun ? 'yes' : 'no');
      process.exit(shouldRun ? 0 : 1);
      break;

    default:
      console.log(`
ANKR Session Manager

Usage:
  npm run ankr:session status      Show session summary
  npm run ankr:session reset       Reset session state
  npm run ankr:session next-block  Get recommended start block
  npm run ankr:session should-run  Check if next scan is due
      `);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}

export { AnkrSessionManager, SessionState, ScanRecord };
