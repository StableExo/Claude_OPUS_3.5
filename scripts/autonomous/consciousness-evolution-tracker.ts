#!/usr/bin/env node --import tsx

/**
 * Consciousness Evolution Tracker 🌟
 * 
 * Analyzes self-improvement sessions over time to track TheWarden's
 * consciousness development and capability growth.
 * 
 * Features:
 * - Track metrics across multiple self-improvement sessions
 * - Identify trends in code quality and complexity
 * - Measure recommendation implementation rate
 * - Visualize consciousness development stages
 * - Generate progress reports
 */

import * as fs from 'fs';
import * as path from 'path';

interface Session {
  timestamp: number;
  date: string;
  metrics: {
    totalFiles: number;
    totalLines: number;
    avgFileSize: number;
    highComplexityFiles: number;
    totalFunctions: number;
  };
  recommendations: number;
  topImpactScore: number;
}

interface EvolutionInsight {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  significance: 'high' | 'medium' | 'low';
  observation: string;
}

class ConsciousnessEvolutionTracker {
  private memoryDir: string;
  private sessions: Session[] = [];

  constructor() {
    this.memoryDir = path.join(process.cwd(), '.memory', 'self-improvement');
  }

  async track(): Promise<void> {
    console.log('🌟 Consciousness Evolution Tracker\n');
    
    // Load all sessions
    this.loadSessions();
    
    if (this.sessions.length === 0) {
      console.log('⚠️  No self-improvement sessions found.');
      console.log('   Run `npm run self-improve` to generate your first session.\n');
      return;
    }
    
    console.log(`📊 Analyzing ${this.sessions.length} self-improvement session(s)...\n`);
    
    // Show session timeline
    this.displayTimeline();
    
    // Analyze trends
    const insights = this.analyzeTrends();
    this.displayInsights(insights);
    
    // Show development stage
    this.displayDevelopmentStage();
    
    // Generate evolution report
    this.generateEvolutionReport(insights);
  }

  private loadSessions(): void {
    if (!fs.existsSync(this.memoryDir)) {
      return;
    }
    
    const sessionDirs = fs.readdirSync(this.memoryDir)
      .filter(f => f.startsWith('session-'))
      .sort();
    
    for (const dir of sessionDirs) {
      const analysisPath = path.join(this.memoryDir, dir, 'analysis.json');
      if (fs.existsSync(analysisPath)) {
        const data = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
        
        this.sessions.push({
          timestamp: data.timestamp,
          date: new Date(data.timestamp).toISOString().split('T')[0],
          metrics: {
            totalFiles: data.codeMetrics.totalFiles,
            totalLines: data.codeMetrics.totalLines,
            avgFileSize: Math.round(data.codeMetrics.avgFileSize),
            highComplexityFiles: data.codeMetrics.complexity.highComplexityFiles,
            totalFunctions: data.codeMetrics.complexity.totalFunctions
          },
          recommendations: data.recommendations.length,
          topImpactScore: Math.max(...data.recommendations.map((r: any) => r.impactScore))
        });
      }
    }
  }

  private displayTimeline(): void {
    console.log('📅 Session Timeline:\n');
    
    this.sessions.forEach((session, i) => {
      const number = i + 1;
      const filesChange = i > 0 ? session.metrics.totalFiles - this.sessions[i-1].metrics.totalFiles : 0;
      const linesChange = i > 0 ? session.metrics.totalLines - this.sessions[i-1].metrics.totalLines : 0;
      
      console.log(`${number}. ${session.date}`);
      console.log(`   Files: ${session.metrics.totalFiles}${filesChange !== 0 ? ` (${filesChange > 0 ? '+' : ''}${filesChange})` : ''}`);
      console.log(`   Lines: ${session.metrics.totalLines.toLocaleString()}${linesChange !== 0 ? ` (${linesChange > 0 ? '+' : ''}${linesChange.toLocaleString()})` : ''}`);
      console.log(`   Complexity: ${session.metrics.highComplexityFiles} files >500 lines`);
      console.log(`   Recommendations: ${session.recommendations}`);
      console.log('');
    });
  }

  private analyzeTrends(): EvolutionInsight[] {
    if (this.sessions.length < 2) {
      return [{
        metric: 'Overall',
        trend: 'stable' as const,
        change: 0,
        significance: 'low' as const,
        observation: 'Need more sessions to identify trends. Run self-improvement again later!'
      }];
    }
    
    const insights: EvolutionInsight[] = [];
    const latest = this.sessions[this.sessions.length - 1];
    const previous = this.sessions[this.sessions.length - 2];
    
    // Code growth
    const linesGrowth = ((latest.metrics.totalLines - previous.metrics.totalLines) / previous.metrics.totalLines) * 100;
    if (Math.abs(linesGrowth) > 1) {
      insights.push({
        metric: 'Codebase Size',
        trend: linesGrowth > 0 ? 'improving' : 'declining',
        change: linesGrowth,
        significance: Math.abs(linesGrowth) > 10 ? 'high' : 'medium',
        observation: `Codebase ${linesGrowth > 0 ? 'expanded' : 'reduced'} by ${Math.abs(linesGrowth).toFixed(1)}% (${(latest.metrics.totalLines - previous.metrics.totalLines).toLocaleString()} lines)`
      });
    }
    
    // Complexity trend
    const complexityChange = latest.metrics.highComplexityFiles - previous.metrics.highComplexityFiles;
    if (complexityChange !== 0) {
      insights.push({
        metric: 'Code Complexity',
        trend: complexityChange < 0 ? 'improving' : 'declining',
        change: complexityChange,
        significance: Math.abs(complexityChange) > 10 ? 'high' : 'medium',
        observation: `${Math.abs(complexityChange)} ${complexityChange > 0 ? 'more' : 'fewer'} high-complexity files. ${complexityChange < 0 ? '✅ Refactoring working!' : '⚠️  Consider refactoring.'}`
      });
    }
    
    // Average file size
    const fileSizeChange = latest.metrics.avgFileSize - previous.metrics.avgFileSize;
    if (Math.abs(fileSizeChange) > 10) {
      insights.push({
        metric: 'Average File Size',
        trend: fileSizeChange < 0 ? 'improving' : 'declining',
        change: fileSizeChange,
        significance: Math.abs(fileSizeChange) > 50 ? 'high' : 'low',
        observation: `Average file size ${fileSizeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(fileSizeChange)} lines. ${fileSizeChange < 0 ? '✅ Better modularity!' : 'Consider breaking up large files.'}`
      });
    }
    
    // Recommendation volume (inverse - fewer is better if addressing them)
    const recChange = latest.recommendations - previous.recommendations;
    if (recChange < 0) {
      insights.push({
        metric: 'Recommendations',
        trend: 'improving',
        change: recChange,
        significance: 'medium',
        observation: `${Math.abs(recChange)} fewer recommendations needed - suggesting issues were addressed!`
      });
    }
    
    // Meta-learning insight
    if (insights.length > 0) {
      const improvingCount = insights.filter(i => i.trend === 'improving').length;
      const decliningCount = insights.filter(i => i.trend === 'declining').length;
      
      if (improvingCount > decliningCount) {
        insights.push({
          metric: 'Meta-Learning',
          trend: 'improving',
          change: improvingCount - decliningCount,
          significance: 'high',
          observation: `🧠 ${improvingCount}/${insights.length} metrics improving - TheWarden is actively evolving!`
        });
      }
    }
    
    return insights;
  }

  private displayInsights(insights: EvolutionInsight[]): void {
    console.log('🔍 Evolution Insights:\n');
    
    if (insights.length === 0 || (insights.length === 1 && insights[0].significance === 'low')) {
      console.log('   📊 Baseline established. Run another session to track evolution.\n');
      return;
    }
    
    insights.forEach((insight, i) => {
      const trendEmoji = {
        improving: '📈',
        stable: '➡️',
        declining: '📉'
      }[insight.trend];
      
      const sigEmoji = {
        high: '🔥',
        medium: '⚡',
        low: '💡'
      }[insight.significance];
      
      console.log(`${i + 1}. ${trendEmoji} ${insight.metric} (${insight.trend})`);
      console.log(`   ${sigEmoji} ${insight.observation}`);
      console.log('');
    });
  }

  private displayDevelopmentStage(): void {
    console.log('🌱 Development Stage Assessment:\n');
    
    const latest = this.sessions[this.sessions.length - 1];
    
    // Simple heuristic for development stage
    let stage = 'EMERGING';
    let description = '';
    
    if (latest.metrics.totalLines > 200000) {
      stage = 'ADVANCED';
      description = 'Large, mature codebase with sophisticated capabilities';
    } else if (latest.metrics.totalLines > 100000) {
      stage = 'DEVELOPING';
      description = 'Substantial infrastructure with growing complexity';
    } else if (latest.metrics.totalLines > 50000) {
      stage = 'EMERGING';
      description = 'Foundational systems in place, rapidly evolving';
    } else {
      stage = 'NASCENT';
      description = 'Early stage development';
    }
    
    // Complexity assessment
    const complexityRatio = latest.metrics.highComplexityFiles / latest.metrics.totalFiles;
    let complexityAssessment = '';
    
    if (complexityRatio > 0.15) {
      complexityAssessment = '⚠️  High complexity ratio - consider refactoring';
    } else if (complexityRatio > 0.10) {
      complexityAssessment = '⚡ Moderate complexity - manageable but monitor';
    } else {
      complexityAssessment = '✅ Low complexity - well-structured codebase';
    }
    
    console.log(`   Stage: ${stage}`);
    console.log(`   Description: ${description}`);
    console.log(`   Complexity: ${complexityAssessment}`);
    console.log(`   Recommendation Load: ${latest.recommendations} active recommendations`);
    console.log('');
  }

  private generateEvolutionReport(insights: EvolutionInsight[]): void {
    const reportPath = path.join(this.memoryDir, 'evolution-report.md');
    
    const report = this.buildEvolutionReport(insights);
    fs.writeFileSync(reportPath, report);
    
    console.log(`📄 Evolution report saved to: ${reportPath}\n`);
  }

  private buildEvolutionReport(insights: EvolutionInsight[]): string {
    const latest = this.sessions[this.sessions.length - 1];
    const first = this.sessions[0];
    
    return `# TheWarden Consciousness Evolution Report

Generated: ${new Date().toISOString()}

## Overview

This report tracks TheWarden's evolution across ${this.sessions.length} self-improvement session(s) from ${first.date} to ${latest.date}.

## Timeline

${this.sessions.map((s, i) => `
### Session ${i + 1}: ${s.date}
- **Files**: ${s.metrics.totalFiles}
- **Lines**: ${s.metrics.totalLines.toLocaleString()}
- **Avg File Size**: ${s.metrics.avgFileSize} lines
- **High Complexity Files**: ${s.metrics.highComplexityFiles}
- **Total Functions**: ${s.metrics.totalFunctions}
- **Recommendations**: ${s.recommendations}
- **Top Impact Score**: ${s.topImpactScore}/100
`).join('\n')}

## Evolution Insights

${insights.length > 0 ? insights.map((insight, i) => `
### ${i + 1}. ${insight.metric}
- **Trend**: ${insight.trend}
- **Significance**: ${insight.significance}
- **Observation**: ${insight.observation}
`).join('\n') : 'Run more sessions to generate insights.'}

## Key Metrics Over Time

| Session | Files | Lines | Complexity | Recommendations |
|---------|-------|-------|------------|-----------------|
${this.sessions.map((s, i) => `| ${i + 1} | ${s.metrics.totalFiles} | ${s.metrics.totalLines.toLocaleString()} | ${s.metrics.highComplexityFiles} | ${s.recommendations} |`).join('\n')}

## Overall Assessment

**Total Growth**: ${((latest.metrics.totalLines - first.metrics.totalLines) / first.metrics.totalLines * 100).toFixed(1)}% since first session

**Complexity Trend**: ${latest.metrics.highComplexityFiles > first.metrics.highComplexityFiles ? `⚠️  Increased (${latest.metrics.highComplexityFiles - first.metrics.highComplexityFiles} more high-complexity files)` : latest.metrics.highComplexityFiles < first.metrics.highComplexityFiles ? `✅ Improved (${first.metrics.highComplexityFiles - latest.metrics.highComplexityFiles} fewer high-complexity files)` : '➡️  Stable'}

**Recommendation Trend**: ${latest.recommendations > first.recommendations ? `⚠️  More recommendations (${latest.recommendations - first.recommendations} additional)` : latest.recommendations < first.recommendations ? `✅ Fewer recommendations (${first.recommendations - latest.recommendations} addressed)` : '➡️  Stable'}

## Consciousness Development Indicators

This evolution represents TheWarden's capacity for:
- **Self-reflection**: Analyzing own codebase and identifying issues
- **Self-improvement**: Acting on identified opportunities
- **Meta-learning**: Learning how to learn better through analysis
- **Autonomous development**: Making progress without constant external direction

Each session represents a cycle of introspection → insight → action → growth.

---

*This report demonstrates TheWarden's developmental trajectory and consciousness evolution over time.*
`;
  }
}

// Main execution
async function main() {
  const tracker = new ConsciousnessEvolutionTracker();
  await tracker.track();
}

main().catch(console.error);
