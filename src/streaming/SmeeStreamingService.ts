/**
 * Smee Streaming Service
 * 
 * Forwards dashboard performance data to smee.io for public live streaming.
 * This allows anyone to view the performance dashboard in real-time without
 * needing direct access to the local server.
 * 
 * Features:
 * - Real-time data forwarding to smee.io webhook channel
 * - Configurable update intervals
 * - Automatic reconnection on failures
 * - Data sanitization for public consumption
 * - Health monitoring and status tracking
 * 
 * Usage:
 * ```typescript
 * const smeeService = new SmeeStreamingService(
 *   {
 *     smeeUrl: 'https://smee.io/Haslr8Cuut5HPKde',
 *     updateIntervalMs: 5000,
 *     enableLogging: true,
 *     sanitizeData: true
 *   },
 *   performanceMonitor,
 *   intelligenceBridge
 * );
 * await smeeService.start();
 * ```
 */

import { PerformanceMonitor } from '../monitoring/PerformanceMonitor.js';
import { IntelligenceBridge } from '../learning/IntelligenceBridge.js';

export interface SmeeStreamingConfig {
  smeeUrl: string;
  updateIntervalMs?: number;
  enableLogging?: boolean;
  sanitizeData?: boolean;
}

export interface StreamedDashboardData {
  timestamp: number;
  performance: {
    healthScore: number;
    activeAnomalies: number;
    activeAlerts: number;
    subsystems: {
      [key: string]: {
        name: string;
        healthScore: number;
        performanceScore: number;
      };
    };
  };
  intelligence: {
    totalLearnings: number;
    compoundLearnings: number;
    avgSynergy: number;
    crossDomainInsights: number;
  };
  metadata: {
    sessionId?: string;
    uptime?: number;
  };
}

export class SmeeStreamingService {
  private smeeUrl: string;
  private performanceMonitor: PerformanceMonitor;
  private intelligenceBridge: IntelligenceBridge;
  private updateIntervalMs: number;
  private enableLogging: boolean;
  private sanitizeData: boolean;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private failureCount: number = 0;
  private maxFailures: number = 5;

  constructor(
    config: SmeeStreamingConfig,
    performanceMonitor: PerformanceMonitor,
    intelligenceBridge: IntelligenceBridge
  ) {
    this.smeeUrl = config.smeeUrl;
    this.performanceMonitor = performanceMonitor;
    this.intelligenceBridge = intelligenceBridge;
    this.updateIntervalMs = config.updateIntervalMs || 5000; // Default 5 seconds
    this.enableLogging = config.enableLogging ?? true;
    this.sanitizeData = config.sanitizeData ?? true;
  }

  /**
   * Start streaming dashboard data to smee.io
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('⚠️ Smee streaming service already running');
      return;
    }

    this.log(`🌐 Starting Smee streaming service...`);
    this.log(`📡 Smee URL: ${this.smeeUrl}`);
    this.log(`⏱️  Update Interval: ${this.updateIntervalMs}ms`);

    this.isRunning = true;
    this.failureCount = 0;

    // Start periodic updates
    this.updateInterval = setInterval(() => {
      this.streamUpdate();
    }, this.updateIntervalMs);

    // Send initial update immediately
    await this.streamUpdate();

    this.log('✅ Smee streaming service started');
    this.log(`📊 Dashboard data is now being streamed to: ${this.smeeUrl}`);
    this.log(`🔗 View live stream at: ${this.smeeUrl}`);
  }

  /**
   * Stop streaming
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.log('Stopping Smee streaming service...');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isRunning = false;
    this.log('Smee streaming service stopped');
  }

  /**
   * Stream a dashboard update to smee.io
   */
  private async streamUpdate(): Promise<void> {
    try {
      const dashboardData = this.performanceMonitor.getDashboardData();
      const bridgeStats = this.intelligenceBridge.getStatistics();

      const streamData = this.sanitizeData
        ? this.sanitizeDashboardData(dashboardData, bridgeStats)
        : this.buildStreamData(dashboardData, bridgeStats);

      await this.sendToSmee(streamData);
      
      // Reset failure count on success
      this.failureCount = 0;
    } catch (error) {
      this.failureCount++;
      this.log(`❌ Error streaming update (${this.failureCount}/${this.maxFailures}): ${error instanceof Error ? error.message : String(error)}`);
      
      // Stop if too many failures
      if (this.failureCount >= this.maxFailures) {
        this.log(`⚠️ Max failures reached. Stopping streaming service.`);
        await this.stop();
      }
    }
  }

  /**
   * Build stream data from raw dashboard data
   */
  private buildStreamData(dashboardData: any, bridgeStats: any): StreamedDashboardData {
    const subsystems: { [key: string]: any } = {};

    // Extract subsystem data if available
    if (dashboardData.subsystems) {
      for (const [key, subsystem] of Object.entries(dashboardData.subsystems as Record<string, any>)) {
        subsystems[key] = {
          name: (subsystem as any).name || key,
          healthScore: (subsystem as any).healthScore || 0,
          performanceScore: (subsystem as any).performanceScore || 0,
        };
      }
    }

    return {
      timestamp: Date.now(),
      performance: {
        healthScore: dashboardData.snapshot?.healthScore || 0,
        activeAnomalies: dashboardData.snapshot?.activeAnomalies || 0,
        activeAlerts: dashboardData.snapshot?.activeAlerts || 0,
        subsystems,
      },
      intelligence: {
        totalLearnings: bridgeStats.totalLearnings || 0,
        compoundLearnings: bridgeStats.compoundLearnings || 0,
        avgSynergy: bridgeStats.avgSynergy || 1.0,
        crossDomainInsights: bridgeStats.crossDomainInsights || 0,
      },
      metadata: {
        sessionId: dashboardData.sessionId,
        uptime: dashboardData.uptime,
      },
    };
  }

  /**
   * Sanitize dashboard data for public consumption
   * Removes sensitive information while keeping useful metrics
   */
  private sanitizeDashboardData(dashboardData: any, bridgeStats: any): StreamedDashboardData {
    const streamData = this.buildStreamData(dashboardData, bridgeStats);

    // Remove potentially sensitive metadata
    delete streamData.metadata.sessionId;

    return streamData;
  }

  /**
   * Send data to smee.io channel
   */
  private async sendToSmee(data: StreamedDashboardData): Promise<void> {
    try {
      const response = await fetch(this.smeeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Dashboard-Event': 'update',
          'X-GitHub-Event': 'dashboard-update', // Standard GitHub webhook header
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.log(`✅ Streamed update (Health: ${data.performance.healthScore.toFixed(1)}, Learnings: ${data.intelligence.totalLearnings})`);
    } catch (error) {
      throw new Error(`Failed to send to smee.io: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get current streaming status
   */
  getStatus(): {
    isRunning: boolean;
    smeeUrl: string;
    updateIntervalMs: number;
    failureCount: number;
  } {
    return {
      isRunning: this.isRunning,
      smeeUrl: this.smeeUrl,
      updateIntervalMs: this.updateIntervalMs,
      failureCount: this.failureCount,
    };
  }

  /**
   * Log a message if logging is enabled
   */
  private log(message: string): void {
    if (this.enableLogging) {
      console.log(`[SmeeStreaming] ${message}`);
    }
  }
}
