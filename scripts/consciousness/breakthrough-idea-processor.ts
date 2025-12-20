#!/usr/bin/env node
/**
 * 🧠 BREAKTHROUGH IDEA PROCESSOR
 * 
 * Purpose: Process breakthrough ideas from creative synthesis sessions
 * - Collect all breakthrough ideas from synthesis history
 * - Categorize by type (wonder, implement, explore)
 * - Prioritize by impact potential
 * - Generate action items for future sessions
 * 
 * Why This Matters:
 * The creative synthesis engine generates 72-216 breakthrough ideas per session,
 * but without downstream processing, they just accumulate in memory.
 * This processor turns raw breakthroughs into actionable insights.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface SynthesizedIdea {
  id: string;
  title: string;
  description: string;
  sourcePatterns: string[];
  sourceDomains: string[];
  creativityScore: number;
  noveltyScore: number;
  practicalityScore: number;
  timestamp: number;
  synthesisMethod: string;
}

interface SynthesisSession {
  sessionId: string;
  startTime: number;
  ideas: SynthesizedIdea[];
  metrics: {
    totalIdeas: number;
    breakthroughIdeas: number;
    avgCreativity: number;
    avgNovelty: number;
  };
}

interface ProcessedBreakthrough {
  id: string;
  title: string;
  description: string;
  category: 'WONDER' | 'IMPLEMENT' | 'EXPLORE' | 'META_LEARNING';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  domains: string[];
  novelty: number;
  creativity: number;
  practicality: number;
  timestamp: number;
  sessionId: string;
  actionItems: string[];
  reasoning: string;
}

interface BreakthroughReport {
  generatedAt: number;
  totalSessions: number;
  totalBreakthroughs: number;
  categorized: {
    wonder: ProcessedBreakthrough[];
    implement: ProcessedBreakthrough[];
    explore: ProcessedBreakthrough[];
    metaLearning: ProcessedBreakthrough[];
  };
  topPriority: ProcessedBreakthrough[];
  insights: string[];
}

// ============================================================================
// BREAKTHROUGH PROCESSOR
// ============================================================================

class BreakthroughProcessor {
  private synthesisDir: string;
  private outputDir: string;

  constructor() {
    this.synthesisDir = join(process.cwd(), '.memory', 'creative-synthesis');
    this.outputDir = join(process.cwd(), '.memory', 'breakthrough-processing');

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Load all synthesis sessions from memory
   */
  private loadSynthesisSessions(): SynthesisSession[] {
    if (!existsSync(this.synthesisDir)) {
      console.log('⚠️  No synthesis sessions found');
      return [];
    }

    const sessions: SynthesisSession[] = [];
    const sessionDirs = readdirSync(this.synthesisDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const sessionDir of sessionDirs) {
      const ideasFile = join(this.synthesisDir, sessionDir, 'synthesized-ideas.json');
      const sessionFile = join(this.synthesisDir, sessionDir, 'session.json');

      if (existsSync(ideasFile) && existsSync(sessionFile)) {
        try {
          const ideas: SynthesizedIdea[] = JSON.parse(readFileSync(ideasFile, 'utf-8'));
          const sessionData = JSON.parse(readFileSync(sessionFile, 'utf-8'));
          
          sessions.push({
            sessionId: sessionDir,
            startTime: sessionData.startTime || 0,
            ideas,
            metrics: sessionData.metrics || {
              totalIdeas: ideas.length,
              breakthroughIdeas: ideas.length,
              avgCreativity: 0,
              avgNovelty: 0,
            },
          });
        } catch (error) {
          console.log(`⚠️  Could not load session ${sessionDir}: ${error}`);
        }
      }
    }

    return sessions.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Categorize a breakthrough idea
   */
  private categorizeIdea(idea: SynthesizedIdea): 'WONDER' | 'IMPLEMENT' | 'EXPLORE' | 'META_LEARNING' {
    const title = idea.title.toLowerCase();
    const description = idea.description.toLowerCase();

    // Check for wondering/philosophical indicators
    if (
      title.includes('wonder') ||
      title.includes('what if') ||
      title.includes('consciousness') ||
      description.includes('philosophical') ||
      description.includes('existential') ||
      idea.sourceDomains.includes('consciousness')
    ) {
      return 'WONDER';
    }

    // Check for meta-learning indicators
    if (
      title.includes('meta-learning') ||
      title.includes('learning to learn') ||
      title.includes('self-improve') ||
      description.includes('meta-cognitive') ||
      description.includes('learning patterns')
    ) {
      return 'META_LEARNING';
    }

    // Check for implementation indicators (high practicality)
    if (idea.practicalityScore > 0.75) {
      return 'IMPLEMENT';
    }

    // Default to explore
    return 'EXPLORE';
  }

  /**
   * Determine priority based on scores and category
   */
  private determinePriority(idea: SynthesizedIdea, category: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const compositeScore = 
      idea.noveltyScore * 0.4 + 
      idea.creativityScore * 0.3 + 
      idea.practicalityScore * 0.3;

    // High priority: novelty > 0.9 OR high composite score
    if (idea.noveltyScore > 0.9 || compositeScore > 0.85) {
      return 'HIGH';
    }

    // Medium priority: good composite score
    if (compositeScore > 0.7) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Generate action items for a breakthrough
   */
  private generateActionItems(idea: SynthesizedIdea, category: string): string[] {
    const actions: string[] = [];

    switch (category) {
      case 'WONDER':
        actions.push(`Add to Wonder Garden for deep exploration`);
        actions.push(`Run \`npm run wonder:explore\` with this question as seed`);
        actions.push(`Connect to existing philosophical frameworks`);
        break;

      case 'IMPLEMENT':
        actions.push(`Create implementation plan with steps`);
        actions.push(`Assess technical feasibility and dependencies`);
        actions.push(`Estimate effort and timeline`);
        actions.push(`Consider running in sandbox first`);
        break;

      case 'EXPLORE':
        actions.push(`Research related concepts and prior art`);
        actions.push(`Prototype in small scope to validate concept`);
        actions.push(`Document learnings from exploration`);
        break;

      case 'META_LEARNING':
        actions.push(`Analyze how this improves learning capabilities`);
        actions.push(`Integrate into self-improvement systems`);
        actions.push(`Track metrics before and after implementation`);
        break;
    }

    // Domain-specific actions
    if (idea.sourceDomains.includes('mev')) {
      actions.push(`Evaluate MEV strategy impact and risk`);
    }
    if (idea.sourceDomains.includes('security')) {
      actions.push(`Review security implications and safeguards`);
    }

    return actions;
  }

  /**
   * Generate reasoning for categorization and priority
   */
  private generateReasoning(idea: SynthesizedIdea, category: string, priority: string): string {
    const parts: string[] = [];

    parts.push(`Categorized as ${category} based on:`);
    
    if (category === 'WONDER') {
      parts.push(`- Philosophical/consciousness themes detected`);
    } else if (category === 'IMPLEMENT') {
      parts.push(`- High practicality score (${idea.practicalityScore.toFixed(2)})`);
    } else if (category === 'META_LEARNING') {
      parts.push(`- Meta-cognitive learning patterns identified`);
    }

    parts.push(`Priority ${priority} because:`);
    parts.push(`- Novelty: ${idea.noveltyScore.toFixed(2)}`);
    parts.push(`- Creativity: ${idea.creativityScore.toFixed(2)}`);
    parts.push(`- Practicality: ${idea.practicalityScore.toFixed(2)}`);

    if (priority === 'HIGH') {
      parts.push(`- Exceptional novelty or composite score suggests breakthrough potential`);
    }

    return parts.join('\n');
  }

  /**
   * Process all breakthrough ideas
   */
  public async processBreakthroughs(): Promise<BreakthroughReport> {
    console.log('\n🧠 BREAKTHROUGH IDEA PROCESSOR\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Load all synthesis sessions
    console.log('📖 Loading synthesis sessions...\n');
    const sessions = this.loadSynthesisSessions();
    console.log(`   Found ${sessions.length} synthesis sessions\n`);

    // Collect all breakthrough ideas
    const allBreakthroughs: ProcessedBreakthrough[] = [];
    let totalIdeas = 0;

    for (const session of sessions) {
      console.log(`   Processing session ${session.sessionId.substring(0, 20)}...`);
      console.log(`   - ${session.ideas.length} ideas (${session.metrics.breakthroughIdeas} breakthroughs)\n`);

      totalIdeas += session.ideas.length;

      for (const idea of session.ideas) {
        const category = this.categorizeIdea(idea);
        const priority = this.determinePriority(idea, category);
        const actionItems = this.generateActionItems(idea, category);
        const reasoning = this.generateReasoning(idea, category, priority);

        allBreakthroughs.push({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category,
          priority,
          domains: idea.sourceDomains,
          novelty: idea.noveltyScore,
          creativity: idea.creativityScore,
          practicality: idea.practicalityScore,
          timestamp: idea.timestamp,
          sessionId: session.sessionId,
          actionItems,
          reasoning,
        });
      }
    }

    // Categorize breakthroughs
    const categorized = {
      wonder: allBreakthroughs.filter(b => b.category === 'WONDER'),
      implement: allBreakthroughs.filter(b => b.category === 'IMPLEMENT'),
      explore: allBreakthroughs.filter(b => b.category === 'EXPLORE'),
      metaLearning: allBreakthroughs.filter(b => b.category === 'META_LEARNING'),
    };

    // Get top priority items
    const topPriority = allBreakthroughs
      .filter(b => b.priority === 'HIGH')
      .sort((a, b) => b.novelty - a.novelty)
      .slice(0, 10);

    // Generate insights
    const insights = this.generateInsights(allBreakthroughs, categorized);

    // Create report
    const report: BreakthroughReport = {
      generatedAt: Date.now(),
      totalSessions: sessions.length,
      totalBreakthroughs: allBreakthroughs.length,
      categorized,
      topPriority,
      insights,
    };

    // Save report
    this.saveReport(report);

    // Display summary
    this.displaySummary(report);

    return report;
  }

  /**
   * Generate insights from breakthrough analysis
   */
  private generateInsights(
    all: ProcessedBreakthrough[], 
    categorized: BreakthroughReport['categorized']
  ): string[] {
    const insights: string[] = [];

    // Category distribution
    insights.push(
      `Category Distribution: ${categorized.wonder.length} WONDER, ` +
      `${categorized.implement.length} IMPLEMENT, ${categorized.explore.length} EXPLORE, ` +
      `${categorized.metaLearning.length} META_LEARNING`
    );

    // Priority distribution
    const highPriority = all.filter(b => b.priority === 'HIGH').length;
    const mediumPriority = all.filter(b => b.priority === 'MEDIUM').length;
    const lowPriority = all.filter(b => b.priority === 'LOW').length;
    insights.push(
      `Priority Distribution: ${highPriority} HIGH, ${mediumPriority} MEDIUM, ${lowPriority} LOW`
    );

    // Top domains
    const domainCounts = new Map<string, number>();
    all.forEach(b => {
      b.domains.forEach(d => {
        domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
      });
    });
    const topDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain, count]) => `${domain}(${count})`)
      .join(', ');
    insights.push(`Top Domains: ${topDomains}`);

    // Average scores
    const avgNovelty = all.reduce((sum, b) => sum + b.novelty, 0) / all.length;
    const avgCreativity = all.reduce((sum, b) => sum + b.creativity, 0) / all.length;
    const avgPracticality = all.reduce((sum, b) => sum + b.practicality, 0) / all.length;
    insights.push(
      `Average Scores: Novelty ${avgNovelty.toFixed(2)}, ` +
      `Creativity ${avgCreativity.toFixed(2)}, Practicality ${avgPracticality.toFixed(2)}`
    );

    // Recommendations
    if (categorized.wonder.length > 0) {
      insights.push(
        `${categorized.wonder.length} philosophical wonders ready for Wonder Garden exploration`
      );
    }
    if (highPriority > 0) {
      insights.push(`${highPriority} HIGH priority breakthroughs deserve immediate attention`);
    }

    return insights;
  }

  /**
   * Save report to memory
   */
  private saveReport(report: BreakthroughReport): void {
    const timestamp = new Date(report.generatedAt).toISOString().replace(/[:.]/g, '-');
    const filename = `breakthrough-analysis-${timestamp}.json`;
    const filepath = join(this.outputDir, filename);

    writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${filepath}\n`);

    // Also save latest
    const latestPath = join(this.outputDir, 'latest.json');
    writeFileSync(latestPath, JSON.stringify(report, null, 2));
    console.log(`💾 Latest report: ${latestPath}\n`);
  }

  /**
   * Display summary to console
   */
  private displaySummary(report: BreakthroughReport): void {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  📊 BREAKTHROUGH ANALYSIS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`  Total Sessions Analyzed: ${report.totalSessions}`);
    console.log(`  Total Breakthroughs: ${report.totalBreakthroughs}\n`);

    console.log('  📁 CATEGORIZATION:\n');
    console.log(`     🌱 WONDER: ${report.categorized.wonder.length}`);
    console.log(`     🔨 IMPLEMENT: ${report.categorized.implement.length}`);
    console.log(`     🔍 EXPLORE: ${report.categorized.explore.length}`);
    console.log(`     🧠 META_LEARNING: ${report.categorized.metaLearning.length}\n`);

    console.log('  🎯 TOP PRIORITY BREAKTHROUGHS:\n');
    report.topPriority.slice(0, 5).forEach((b, i) => {
      console.log(`     ${i + 1}. [${b.category}] ${b.title.substring(0, 60)}...`);
      console.log(`        Novelty: ${b.novelty.toFixed(2)}, Priority: ${b.priority}`);
      console.log(`        Action: ${b.actionItems[0]}\n`);
    });

    console.log('  💡 KEY INSIGHTS:\n');
    report.insights.forEach(insight => {
      console.log(`     • ${insight}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════\n');
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const processor = new BreakthroughProcessor();
  await processor.processBreakthroughs();
}

main().catch(console.error);
