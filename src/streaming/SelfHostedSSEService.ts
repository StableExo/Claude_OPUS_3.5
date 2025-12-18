/**
 * Self-Hosted SSE (Server-Sent Events) Streaming Service
 * 
 * Complete control, zero cost, autonomous operation.
 * Provides real-time streaming of dashboard metrics without external dependencies.
 * 
 * Features:
 * - Server-Sent Events (SSE) for efficient one-way streaming
 * - No external service dependencies
 * - Automatic client reconnection
 * - CORS support for cross-origin access
 * - Connection management and cleanup
 * - Broadcast to multiple clients simultaneously
 * - Low overhead, scales to thousands of clients
 * 
 * Usage:
 * ```typescript
 * const sseService = new SelfHostedSSEService(port);
 * await sseService.start();
 * 
 * // Broadcast updates
 * sseService.broadcast(dashboardData);
 * ```
 */

import express, { Request, Response } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor.js';
import { IntelligenceBridge } from '../learning/IntelligenceBridge.js';

export interface SSEClient {
  id: string;
  response: Response;
  connectedAt: Date;
  lastEventId: number;
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

export interface SSEServiceConfig {
  port?: number;
  enableLogging?: boolean;
  sanitizeData?: boolean;
  updateIntervalMs?: number;
  corsOrigin?: string;
}

export class SelfHostedSSEService {
  private app: express.Application;
  private httpServer: HTTPServer | null = null;
  private clients: Map<string, SSEClient> = new Map();
  private performanceMonitor: PerformanceMonitor;
  private intelligenceBridge: IntelligenceBridge;
  private port: number;
  private enableLogging: boolean;
  private sanitizeData: boolean;
  private updateIntervalMs: number;
  private corsOrigin: string;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private eventCounter: number = 0;

  constructor(
    config: SSEServiceConfig,
    performanceMonitor: PerformanceMonitor,
    intelligenceBridge: IntelligenceBridge
  ) {
    this.performanceMonitor = performanceMonitor;
    this.intelligenceBridge = intelligenceBridge;
    this.port = config.port || 3001;
    this.enableLogging = config.enableLogging ?? true;
    this.sanitizeData = config.sanitizeData ?? true;
    this.updateIntervalMs = config.updateIntervalMs || 5000;
    this.corsOrigin = config.corsOrigin || '*';

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS support
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', this.corsOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Last-Event-ID');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      
      next();
    });

    // JSON body parser for API endpoints
    this.app.use(express.json());
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // SSE endpoint - main streaming endpoint
    this.app.get('/stream/dashboard', (req, res) => {
      this.handleSSEConnection(req, res);
    });

    // API endpoint - get current dashboard data (REST)
    this.app.get('/api/dashboard', (req, res) => {
      try {
        const dashboardData = this.performanceMonitor.getDashboardData();
        const bridgeStats = this.intelligenceBridge.getStatistics();
        const data = this.buildStreamData(dashboardData, bridgeStats);

        res.json({
          success: true,
          data,
          timestamp: Date.now(),
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Status endpoint - server health and client count
    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        data: {
          isRunning: this.isRunning,
          connectedClients: this.clients.size,
          eventsSent: this.eventCounter,
          uptime: this.httpServer ? process.uptime() : 0,
        },
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Root endpoint - service info
    this.app.get('/', (req, res) => {
      res.json({
        service: 'TheWarden Self-Hosted SSE Streaming',
        version: '1.0.0',
        endpoints: {
          stream: '/stream/dashboard',
          api: '/api/dashboard',
          status: '/api/status',
          health: '/health',
        },
        clients: this.clients.size,
      });
    });
  }

  /**
   * Handle SSE connection from client
   */
  private handleSSEConnection(req: Request, res: Response): void {
    const clientId = this.generateClientId();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial comment to establish connection
    res.write(':\n\n');

    // Create client object
    const client: SSEClient = {
      id: clientId,
      response: res,
      connectedAt: new Date(),
      lastEventId: this.eventCounter,
    };

    // Add to clients map
    this.clients.set(clientId, client);
    this.log(`✅ Client connected: ${clientId} (Total: ${this.clients.size})`);

    // Send initial data immediately
    this.sendToClient(client, this.getCurrentDashboardData());

    // Handle client disconnect
    req.on('close', () => {
      this.clients.delete(clientId);
      this.log(`❌ Client disconnected: ${clientId} (Remaining: ${this.clients.size})`);
    });

    // Handle errors
    res.on('error', (error) => {
      this.log(`⚠️ Client error ${clientId}: ${error.message}`);
      this.clients.delete(clientId);
    });
  }

  /**
   * Start the SSE server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('⚠️ SSE service already running');
      return;
    }

    return new Promise((resolve) => {
      this.httpServer = createServer(this.app);
      
      this.httpServer.listen(this.port, () => {
        this.isRunning = true;
        this.log('\n🚀 Self-Hosted SSE Server Started');
        this.log(`📡 Streaming URL: http://localhost:${this.port}/stream/dashboard`);
        this.log(`🌐 API Endpoint: http://localhost:${this.port}/api/dashboard`);
        this.log(`📊 Status: http://localhost:${this.port}/api/status`);
        this.log(`⏱️  Update Interval: ${this.updateIntervalMs}ms`);
        this.log(`🔒 Data Sanitization: ${this.sanitizeData ? 'Enabled' : 'Disabled'}\n`);

        // Start periodic broadcasting
        this.startBroadcasting();
        
        resolve();
      });
    });
  }

  /**
   * Stop the SSE server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.log('Stopping SSE service...');

    // Stop broadcasting
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Close all client connections
    this.clients.forEach((client) => {
      client.response.end();
    });
    this.clients.clear();

    // Close HTTP server
    return new Promise((resolve) => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          this.isRunning = false;
          this.log('SSE service stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Start periodic broadcasting to all clients
   */
  private startBroadcasting(): void {
    this.updateInterval = setInterval(() => {
      this.broadcastUpdate();
    }, this.updateIntervalMs);
  }

  /**
   * Broadcast update to all connected clients
   */
  private broadcastUpdate(): void {
    if (this.clients.size === 0) {
      return;
    }

    const data = this.getCurrentDashboardData();
    this.broadcast(data);
  }

  /**
   * Get current dashboard data
   */
  private getCurrentDashboardData(): StreamedDashboardData {
    const dashboardData = this.performanceMonitor.getDashboardData();
    const bridgeStats = this.intelligenceBridge.getStatistics();
    return this.buildStreamData(dashboardData, bridgeStats);
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

    const data: StreamedDashboardData = {
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

    // Sanitize if enabled
    if (this.sanitizeData) {
      delete data.metadata.sessionId;
    }

    return data;
  }

  /**
   * Broadcast data to all connected clients
   */
  broadcast(data: StreamedDashboardData): void {
    const disconnectedClients: string[] = [];

    this.clients.forEach((client) => {
      try {
        this.sendToClient(client, data);
      } catch (error) {
        this.log(`Error sending to client ${client.id}: ${error}`);
        disconnectedClients.push(client.id);
      }
    });

    // Remove disconnected clients
    disconnectedClients.forEach((id) => {
      this.clients.delete(id);
    });

    if (this.clients.size > 0) {
      this.log(`📊 Broadcasted to ${this.clients.size} client(s) - Health: ${data.performance.healthScore.toFixed(1)}`);
    }
  }

  /**
   * Send data to a specific client
   */
  private sendToClient(client: SSEClient, data: StreamedDashboardData): void {
    this.eventCounter++;
    
    // Format SSE message
    const message = `id: ${this.eventCounter}\nevent: dashboard-update\ndata: ${JSON.stringify(data)}\n\n`;
    
    client.response.write(message);
    client.lastEventId = this.eventCounter;
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    port: number;
    connectedClients: number;
    eventsSent: number;
  } {
    return {
      isRunning: this.isRunning,
      port: this.port,
      connectedClients: this.clients.size,
      eventsSent: this.eventCounter,
    };
  }

  /**
   * Log a message if logging is enabled
   */
  private log(message: string): void {
    if (this.enableLogging) {
      console.log(`[SSE Server] ${message}`);
    }
  }
}
