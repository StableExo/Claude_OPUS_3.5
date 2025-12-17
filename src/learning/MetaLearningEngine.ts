/**
 * MetaLearningEngine - Learning About Learning
 * 
 * This engine implements meta-learning capabilities - the ability to learn
 * how to learn more effectively. It tracks the effectiveness of different
 * learning strategies and automatically adjusts learning parameters.
 * 
 * Key Capabilities:
 * - Tracks learning effectiveness metrics across different domains
 * - Automatically adjusts learning rates based on performance
 * - Evolves learning strategies over time
 * - Identifies optimal learning approaches for different contexts
 * - Enables self-optimizing learning behavior
 * 
 * Expected Benefits:
 * - Accelerated learning across all domains
 * - Self-optimizing learning rates
 * - Automatic strategy discovery
 * - Emergent intelligence patterns
 */

import { CalibrationResult } from '../memory/strategic-logger/CalibrationEngine';
import { StrategicMemory } from '../memory/strategic-logger/MemoryFormation';
import { Strategy } from './AdaptiveStrategies';

// ============================================================================
// TYPES
// ============================================================================

export interface LearningMetrics {
  domain: string;
  timestamp: number;
  learningRate: number;
  effectiveness: number;  // 0-1 score of how well learning worked
  convergenceSpeed: number;  // How fast we're converging to optimal
  retentionRate: number;  // How well we retain learned knowledge
  adaptability: number;  // How well we adapt to new situations
  sampleSize: number;
}

export interface LearningStrategy {
  id: string;
  name: string;
  description: string;
  learningRate: number;
  explorationRate: number;  // How much to explore vs exploit
  memoryDecayRate: number;  // How fast old memories fade
  confidenceThreshold: number;  // Minimum confidence for action
  successRate: number;
  timesUsed: number;
  lastUsed: number;
}

export interface MetaLearningInsight {
  id: string;
  timestamp: number;
  type: 'learning_rate_adjustment' | 'strategy_evolution' | 'pattern_discovery' | 'optimization';
  insight: string;
  confidence: number;
  actionable: boolean;
  recommendation?: string;
  metrics?: Record<string, number>;
}

export interface LearningEvolution {
  generation: number;
  timestamp: number;
  bestStrategy: LearningStrategy;
  averageEffectiveness: number;
  improvementRate: number;
  insights: string[];
}

// ============================================================================
// META-LEARNING ENGINE
// ============================================================================

export class MetaLearningEngine {
  private learningMetrics: LearningMetrics[] = [];
  private learningStrategies: Map<string, LearningStrategy> = new Map();
  private metaInsights: MetaLearningInsight[] = [];
  private evolutionHistory: LearningEvolution[] = [];
  private currentGeneration: number = 0;
  
  // Adaptive parameters that get tuned over time
  private adaptiveParams = {
    baseLearningRate: 0.1,
    minLearningRate: 0.001,
    maxLearningRate: 0.5,
    learningRateDecay: 0.95,
    explorationDecay: 0.99,
    confidenceThreshold: 0.6,
  };

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default learning strategies
   */
  private initializeDefaultStrategies(): void {
    const defaultStrategies: Omit<LearningStrategy, 'successRate' | 'timesUsed' | 'lastUsed'>[] = [
      {
        id: 'aggressive',
        name: 'Aggressive Learning',
        description: 'High learning rate, high exploration - fast adaptation but less stable',
        learningRate: 0.3,
        explorationRate: 0.4,
        memoryDecayRate: 0.05,
        confidenceThreshold: 0.5,
      },
      {
        id: 'conservative',
        name: 'Conservative Learning',
        description: 'Low learning rate, low exploration - slow but stable',
        learningRate: 0.05,
        explorationRate: 0.1,
        memoryDecayRate: 0.01,
        confidenceThreshold: 0.8,
      },
      {
        id: 'balanced',
        name: 'Balanced Learning',
        description: 'Moderate learning rate and exploration - good general purpose',
        learningRate: 0.15,
        explorationRate: 0.2,
        memoryDecayRate: 0.02,
        confidenceThreshold: 0.6,
      },
      {
        id: 'adaptive',
        name: 'Adaptive Learning',
        description: 'Starts aggressive, becomes conservative - best of both worlds',
        learningRate: 0.25,
        explorationRate: 0.3,
        memoryDecayRate: 0.03,
        confidenceThreshold: 0.65,
      },
    ];

    defaultStrategies.forEach(strategy => {
      this.learningStrategies.set(strategy.id, {
        ...strategy,
        successRate: 0.5,
        timesUsed: 0,
        lastUsed: 0,
      });
    });
  }

  /**
   * Track learning effectiveness for a domain
   */
  trackLearningEffectiveness(
    domain: string,
    learningRate: number,
    performanceBefore: number,
    performanceAfter: number,
    sampleSize: number
  ): LearningMetrics {
    // Calculate effectiveness as improvement per learning step
    const improvement = performanceAfter - performanceBefore;
    const effectiveness = Math.max(0, Math.min(1, improvement / learningRate));
    
    // Estimate convergence speed (higher is faster)
    const convergenceSpeed = Math.abs(improvement) * sampleSize / 100;
    
    // Retention rate based on recent performance stability
    const retentionRate = this.calculateRetentionRate(domain, performanceAfter);
    
    // Adaptability based on how well we handle new situations
    const adaptability = this.calculateAdaptability(domain);

    const metrics: LearningMetrics = {
      domain,
      timestamp: Date.now(),
      learningRate,
      effectiveness,
      convergenceSpeed,
      retentionRate,
      adaptability,
      sampleSize,
    };

    this.learningMetrics.push(metrics);
    
    // Keep only recent metrics (last 1000)
    if (this.learningMetrics.length > 1000) {
      this.learningMetrics = this.learningMetrics.slice(-1000);
    }

    return metrics;
  }

  /**
   * Calculate retention rate for a domain
   */
  private calculateRetentionRate(domain: string, currentPerformance: number): number {
    const recentMetrics = this.learningMetrics
      .filter(m => m.domain === domain)
      .slice(-10);

    if (recentMetrics.length < 2) return 0.5;

    // Calculate variance in recent performance
    const performances = recentMetrics.map((_, i) => 
      currentPerformance - (i * 0.01) // Simulate performance tracking
    );
    
    const mean = performances.reduce((a, b) => a + b, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
    
    // Lower variance = higher retention
    return Math.max(0, Math.min(1, 1 - variance));
  }

  /**
   * Calculate adaptability for a domain
   */
  private calculateAdaptability(domain: string): number {
    const recentMetrics = this.learningMetrics
      .filter(m => m.domain === domain)
      .slice(-20);

    if (recentMetrics.length < 2) return 0.5;

    // Adaptability = average effectiveness of recent learning
    const avgEffectiveness = recentMetrics.reduce((sum, m) => sum + m.effectiveness, 0) / recentMetrics.length;
    
    return avgEffectiveness;
  }

  /**
   * Automatically adjust learning parameters based on effectiveness
   */
  adjustLearningParameters(domain: string): { 
    newLearningRate: number;
    reasoning: string;
    confidence: number;
  } {
    const recentMetrics = this.learningMetrics
      .filter(m => m.domain === domain)
      .slice(-10);

    if (recentMetrics.length < 3) {
      return {
        newLearningRate: this.adaptiveParams.baseLearningRate,
        reasoning: 'Insufficient data for adjustment',
        confidence: 0.3,
      };
    }

    const avgEffectiveness = recentMetrics.reduce((sum, m) => sum + m.effectiveness, 0) / recentMetrics.length;
    const avgConvergence = recentMetrics.reduce((sum, m) => sum + m.convergenceSpeed, 0) / recentMetrics.length;
    const currentLearningRate = recentMetrics[recentMetrics.length - 1].learningRate;

    let newLearningRate = currentLearningRate;
    let reasoning = '';
    let confidence = 0.5;

    // If effectiveness is high, we can increase learning rate
    if (avgEffectiveness > 0.7 && avgConvergence > 0.5) {
      newLearningRate = Math.min(
        this.adaptiveParams.maxLearningRate,
        currentLearningRate * 1.1
      );
      reasoning = 'High effectiveness and convergence - increasing learning rate';
      confidence = 0.8;
    }
    // If effectiveness is low, decrease learning rate
    else if (avgEffectiveness < 0.3) {
      newLearningRate = Math.max(
        this.adaptiveParams.minLearningRate,
        currentLearningRate * 0.9
      );
      reasoning = 'Low effectiveness - decreasing learning rate for stability';
      confidence = 0.75;
    }
    // If converging slowly, increase learning rate
    else if (avgConvergence < 0.2 && avgEffectiveness > 0.4) {
      newLearningRate = Math.min(
        this.adaptiveParams.maxLearningRate,
        currentLearningRate * 1.05
      );
      reasoning = 'Slow convergence but decent effectiveness - slightly increasing learning rate';
      confidence = 0.65;
    }
    // Otherwise keep stable
    else {
      reasoning = 'Performance stable - maintaining current learning rate';
      confidence = 0.6;
    }

    // Record this adjustment as an insight
    this.metaInsights.push({
      id: `meta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'learning_rate_adjustment',
      insight: `${domain}: ${reasoning}`,
      confidence,
      actionable: true,
      recommendation: `Set learning rate to ${newLearningRate.toFixed(4)}`,
      metrics: {
        oldRate: currentLearningRate,
        newRate: newLearningRate,
        effectiveness: avgEffectiveness,
        convergence: avgConvergence,
      },
    });

    return { newLearningRate, reasoning, confidence };
  }

  /**
   * Evolve learning strategies based on performance
   */
  evolveLearningStrategies(): LearningEvolution {
    this.currentGeneration++;

    // Get top performing strategies
    const strategies = Array.from(this.learningStrategies.values())
      .sort((a, b) => b.successRate - a.successRate);

    if (strategies.length === 0) {
      throw new Error('No learning strategies available');
    }

    const bestStrategy = strategies[0];
    const avgEffectiveness = strategies.reduce((sum, s) => sum + s.successRate, 0) / strategies.length;

    // Calculate improvement rate from previous generation
    const previousGeneration = this.evolutionHistory[this.evolutionHistory.length - 1];
    const improvementRate = previousGeneration
      ? (avgEffectiveness - previousGeneration.averageEffectiveness) / previousGeneration.averageEffectiveness
      : 0;

    const insights: string[] = [];

    // Create new hybrid strategies by combining top performers
    if (strategies.length >= 2 && this.currentGeneration % 5 === 0) {
      const newStrategy = this.createHybridStrategy(strategies[0], strategies[1]);
      this.learningStrategies.set(newStrategy.id, newStrategy);
      insights.push(`Created hybrid strategy '${newStrategy.name}' from top performers`);
    }

    // Adjust exploration rates based on performance stability
    strategies.forEach(strategy => {
      if (strategy.timesUsed > 10) {
        const newExplorationRate = strategy.explorationRate * this.adaptiveParams.explorationDecay;
        strategy.explorationRate = Math.max(0.05, newExplorationRate);
      }
    });

    insights.push(`Average effectiveness: ${(avgEffectiveness * 100).toFixed(1)}%`);
    insights.push(`Best strategy: ${bestStrategy.name} (${(bestStrategy.successRate * 100).toFixed(1)}% success)`);
    
    if (improvementRate > 0) {
      insights.push(`Improvement rate: +${(improvementRate * 100).toFixed(1)}%`);
    }

    const evolution: LearningEvolution = {
      generation: this.currentGeneration,
      timestamp: Date.now(),
      bestStrategy,
      averageEffectiveness: avgEffectiveness,
      improvementRate,
      insights,
    };

    this.evolutionHistory.push(evolution);

    // Record evolution as meta-insight
    this.metaInsights.push({
      id: `evolution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'strategy_evolution',
      insight: `Generation ${this.currentGeneration}: ${insights.join(', ')}`,
      confidence: 0.85,
      actionable: true,
      recommendation: `Continue using '${bestStrategy.name}' strategy`,
    });

    return evolution;
  }

  /**
   * Create a hybrid learning strategy from two parent strategies
   */
  private createHybridStrategy(
    parent1: LearningStrategy,
    parent2: LearningStrategy
  ): LearningStrategy {
    const id = `hybrid-${this.currentGeneration}-${Date.now()}`;
    
    return {
      id,
      name: `Hybrid Gen${this.currentGeneration}`,
      description: `Evolved from ${parent1.name} and ${parent2.name}`,
      learningRate: (parent1.learningRate + parent2.learningRate) / 2,
      explorationRate: (parent1.explorationRate + parent2.explorationRate) / 2,
      memoryDecayRate: (parent1.memoryDecayRate + parent2.memoryDecayRate) / 2,
      confidenceThreshold: (parent1.confidenceThreshold + parent2.confidenceThreshold) / 2,
      successRate: (parent1.successRate + parent2.successRate) / 2,
      timesUsed: 0,
      lastUsed: Date.now(),
    };
  }

  /**
   * Detect emergent patterns in learning behavior
   */
  detectEmergentPatterns(): MetaLearningInsight[] {
    const patterns: MetaLearningInsight[] = [];

    // Pattern 1: Consistent high performance across domains
    const domainPerformance = this.analyzeDomainPerformance();
    if (domainPerformance.consistentlyHigh.length > 0) {
      patterns.push({
        id: `pattern-consistent-${Date.now()}`,
        timestamp: Date.now(),
        type: 'pattern_discovery',
        insight: `Consistently high performance in: ${domainPerformance.consistentlyHigh.join(', ')}`,
        confidence: 0.8,
        actionable: true,
        recommendation: 'Share learning approach from these domains with others',
      });
    }

    // Pattern 2: Learning rate sweet spot
    const optimalLearningRate = this.findOptimalLearningRate();
    if (optimalLearningRate.confidence > 0.7) {
      patterns.push({
        id: `pattern-optimal-lr-${Date.now()}`,
        timestamp: Date.now(),
        type: 'pattern_discovery',
        insight: `Optimal learning rate discovered: ${optimalLearningRate.rate.toFixed(4)}`,
        confidence: optimalLearningRate.confidence,
        actionable: true,
        recommendation: `Apply learning rate ${optimalLearningRate.rate.toFixed(4)} to new domains`,
      });
    }

    // Pattern 3: Strategy convergence
    const convergence = this.detectStrategyConvergence();
    if (convergence.detected) {
      patterns.push({
        id: `pattern-convergence-${Date.now()}`,
        timestamp: Date.now(),
        type: 'optimization',
        insight: `Learning strategies converging on: ${convergence.strategy}`,
        confidence: convergence.confidence,
        actionable: true,
        recommendation: 'This may indicate optimal approach found - consider exploitation over exploration',
      });
    }

    patterns.forEach(pattern => this.metaInsights.push(pattern));

    return patterns;
  }

  /**
   * Analyze performance across domains
   */
  private analyzeDomainPerformance(): {
    consistentlyHigh: string[];
    needsImprovement: string[];
  } {
    const domainStats = new Map<string, { avg: number; count: number }>();

    this.learningMetrics.forEach(metric => {
      const current = domainStats.get(metric.domain) || { avg: 0, count: 0 };
      current.avg = (current.avg * current.count + metric.effectiveness) / (current.count + 1);
      current.count++;
      domainStats.set(metric.domain, current);
    });

    const consistentlyHigh: string[] = [];
    const needsImprovement: string[] = [];

    domainStats.forEach((stats, domain) => {
      if (stats.count >= 5) {
        if (stats.avg > 0.7) {
          consistentlyHigh.push(domain);
        } else if (stats.avg < 0.4) {
          needsImprovement.push(domain);
        }
      }
    });

    return { consistentlyHigh, needsImprovement };
  }

  /**
   * Find optimal learning rate across all domains
   */
  private findOptimalLearningRate(): { rate: number; confidence: number } {
    if (this.learningMetrics.length < 20) {
      return { rate: this.adaptiveParams.baseLearningRate, confidence: 0.3 };
    }

    // Group by learning rate buckets
    const buckets = new Map<number, { effectiveness: number[]; count: number }>();
    
    this.learningMetrics.forEach(metric => {
      const bucket = Math.round(metric.learningRate * 20) / 20; // Round to 0.05 increments
      const current = buckets.get(bucket) || { effectiveness: [], count: 0 };
      current.effectiveness.push(metric.effectiveness);
      current.count++;
      buckets.set(bucket, current);
    });

    // Find bucket with highest average effectiveness
    let bestRate = this.adaptiveParams.baseLearningRate;
    let bestEffectiveness = 0;
    let bestCount = 0;

    buckets.forEach((data, rate) => {
      if (data.count >= 5) {
        const avg = data.effectiveness.reduce((a, b) => a + b, 0) / data.count;
        if (avg > bestEffectiveness) {
          bestEffectiveness = avg;
          bestRate = rate;
          bestCount = data.count;
        }
      }
    });

    const confidence = Math.min(0.95, bestCount / 50); // More samples = higher confidence
    return { rate: bestRate, confidence };
  }

  /**
   * Detect if learning strategies are converging
   */
  private detectStrategyConvergence(): {
    detected: boolean;
    strategy?: string;
    confidence: number;
  } {
    const recentEvolutions = this.evolutionHistory.slice(-5);
    
    if (recentEvolutions.length < 3) {
      return { detected: false, confidence: 0 };
    }

    // Check if same strategy wins consistently
    const winners = recentEvolutions.map(e => e.bestStrategy.id);
    const uniqueWinners = new Set(winners);

    if (uniqueWinners.size === 1) {
      return {
        detected: true,
        strategy: recentEvolutions[recentEvolutions.length - 1].bestStrategy.name,
        confidence: 0.9,
      };
    }

    // Check if improvement rate is declining (convergence)
    const improvementRates = recentEvolutions.map(e => e.improvementRate);
    const avgImprovement = improvementRates.reduce((a, b) => a + b, 0) / improvementRates.length;

    if (avgImprovement < 0.05 && avgImprovement > -0.05) {
      return {
        detected: true,
        strategy: 'mixed',
        confidence: 0.7,
      };
    }

    return { detected: false, confidence: 0 };
  }

  /**
   * Get meta-learning statistics
   */
  getStatistics(): {
    totalMetrics: number;
    totalStrategies: number;
    totalInsights: number;
    currentGeneration: number;
    bestStrategy: LearningStrategy | null;
    avgEffectiveness: number;
    recentInsights: MetaLearningInsight[];
  } {
    const strategies = Array.from(this.learningStrategies.values());
    const bestStrategy = strategies.sort((a, b) => b.successRate - a.successRate)[0] || null;
    
    const avgEffectiveness = this.learningMetrics.length > 0
      ? this.learningMetrics.reduce((sum, m) => sum + m.effectiveness, 0) / this.learningMetrics.length
      : 0;

    return {
      totalMetrics: this.learningMetrics.length,
      totalStrategies: this.learningStrategies.size,
      totalInsights: this.metaInsights.length,
      currentGeneration: this.currentGeneration,
      bestStrategy,
      avgEffectiveness,
      recentInsights: this.metaInsights.slice(-10),
    };
  }

  /**
   * Update strategy performance (called from KnowledgeLoop)
   */
  updateStrategyPerformance(strategyId: string, success: boolean): void {
    const strategy = this.learningStrategies.get(strategyId);
    if (!strategy) return;

    const alpha = 0.2; // Learning rate for strategy performance
    const outcome = success ? 1 : 0;
    strategy.successRate = alpha * outcome + (1 - alpha) * strategy.successRate;
    strategy.lastUsed = Date.now();
    strategy.timesUsed++;

    this.learningStrategies.set(strategyId, strategy);
  }

  /**
   * Select best learning strategy for current context
   */
  selectLearningStrategy(context: {
    domain: string;
    currentPerformance: number;
    volatility: number;
  }): LearningStrategy {
    const strategies = Array.from(this.learningStrategies.values());

    // Score strategies based on context
    const scored = strategies.map(strategy => {
      let score = strategy.successRate;

      // High volatility -> prefer conservative
      if (context.volatility > 0.7) {
        if (strategy.id === 'conservative' || strategy.learningRate < 0.1) {
          score *= 1.3;
        }
      }
      // Low volatility -> prefer aggressive
      else if (context.volatility < 0.3) {
        if (strategy.id === 'aggressive' || strategy.learningRate > 0.2) {
          score *= 1.2;
        }
      }

      // Good performance -> exploit (lower exploration)
      if (context.currentPerformance > 0.7) {
        if (strategy.explorationRate < 0.2) {
          score *= 1.1;
        }
      }
      // Poor performance -> explore (higher exploration)
      else if (context.currentPerformance < 0.4) {
        if (strategy.explorationRate > 0.3) {
          score *= 1.15;
        }
      }

      return { strategy, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].strategy;
  }

  /**
   * Get all learning strategies
   */
  getAllStrategies(): LearningStrategy[] {
    return Array.from(this.learningStrategies.values());
  }

  /**
   * Get evolution history
   */
  getEvolutionHistory(): LearningEvolution[] {
    return this.evolutionHistory;
  }

  /**
   * Get recent meta-insights
   */
  getRecentInsights(limit: number = 10): MetaLearningInsight[] {
    return this.metaInsights.slice(-limit);
  }
}
