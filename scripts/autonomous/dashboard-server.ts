/**
 * Dashboard Server - Real-time Performance Monitoring Web Interface
 * 
 * Provides a web-based dashboard for visualizing JET FUEL MODE performance metrics,
 * anomalies, alerts, and system health in real-time.
 * 
 * Features:
 * - Real-time metrics streaming via WebSocket
 * - Interactive charts and visualizations
 * - System health overview
 * - Anomaly detection timeline
 * - Alert management
 * - Subsystem performance breakdown
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PerformanceMonitor, DashboardData } from '../../src/monitoring/PerformanceMonitor';
import { IntelligenceBridge } from '../../src/learning/IntelligenceBridge';
import { SmeeStreamingService } from '../../src/streaming/SmeeStreamingService.js';
import { SelfHostedSSEService } from '../../src/streaming/SelfHostedSSEService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DashboardServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private performanceMonitor: PerformanceMonitor;
  private intelligenceBridge: IntelligenceBridge;
  private port: number;
  private updateInterval: NodeJS.Timeout | null = null;
  private smeeService: SmeeStreamingService | null = null;
  private sseService: SelfHostedSSEService | null = null;

  constructor(
    performanceMonitor: PerformanceMonitor,
    intelligenceBridge: IntelligenceBridge,
    port: number = 3000
  ) {
    this.performanceMonitor = performanceMonitor;
    this.intelligenceBridge = intelligenceBridge;
    this.port = port;

    // Initialize Express app
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupRoutes();
    this.setupWebSocket();
    this.setupSmeeStreaming();
    this.setupSelfHostedSSE();
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // Serve static dashboard files
    this.app.use(express.static(path.join(__dirname, 'public')));

    // API endpoint for dashboard data
    this.app.get('/api/dashboard', (req, res) => {
      try {
        const dashboardData = this.performanceMonitor.getDashboardData();
        const bridgeStats = this.intelligenceBridge.getStatistics();

        res.json({
          success: true,
          data: {
            performance: dashboardData,
            intelligence: bridgeStats,
            timestamp: Date.now(),
          },
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // API endpoint for health snapshot
    this.app.get('/api/health', (req, res) => {
      try {
        const snapshot = this.performanceMonitor.getHealthSnapshot();
        res.json({
          success: true,
          data: snapshot,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // API endpoint for statistics
    this.app.get('/api/stats', (req, res) => {
      try {
        const perfStats = this.performanceMonitor.getStatistics();
        const bridgeStats = this.intelligenceBridge.getStatistics();

        res.json({
          success: true,
          data: {
            performance: perfStats,
            intelligence: bridgeStats,
          },
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // API endpoint to acknowledge alert
    this.app.post('/api/alerts/:id/acknowledge', (req, res) => {
      try {
        const alertId = req.params.id;
        const success = this.performanceMonitor.acknowledgeAlert(alertId);

        res.json({
          success,
          message: success ? 'Alert acknowledged' : 'Alert not found',
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // API endpoint to resolve alert
    this.app.post('/api/alerts/:id/resolve', (req, res) => {
      try {
        const alertId = req.params.id;
        const success = this.performanceMonitor.resolveAlert(alertId);

        res.json({
          success,
          message: success ? 'Alert resolved' : 'Alert not found',
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Root route serves dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    });
  }

  /**
   * Setup WebSocket for real-time updates
   */
  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      console.log('Dashboard client connected:', socket.id);

      // Send initial data
      this.sendDashboardUpdate(socket);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Dashboard client disconnected:', socket.id);
      });

      // Handle acknowledge alert request
      socket.on('acknowledgeAlert', (alertId: string) => {
        const success = this.performanceMonitor.acknowledgeAlert(alertId);
        socket.emit('alertAcknowledged', { alertId, success });
        
        // Broadcast update to all clients
        this.broadcastDashboardUpdate();
      });

      // Handle resolve alert request
      socket.on('resolveAlert', (alertId: string) => {
        const success = this.performanceMonitor.resolveAlert(alertId);
        socket.emit('alertResolved', { alertId, success });
        
        // Broadcast update to all clients
        this.broadcastDashboardUpdate();
      });
    });
  }

  /**
   * Setup Smee.io streaming for public access
   */
  private setupSmeeStreaming(): void {
    const smeeUrl = process.env.SMEE_URL;
    
    if (smeeUrl) {
      this.smeeService = new SmeeStreamingService(
        {
          smeeUrl,
          updateIntervalMs: 5000, // 5 seconds
          enableLogging: true,
          sanitizeData: true,
        },
        this.performanceMonitor,
        this.intelligenceBridge
      );
    }
  }

  /**
   * Setup Self-Hosted SSE Server for complete control
   */
  private setupSelfHostedSSE(): void {
    const enableSSE = process.env.ENABLE_SSE_SERVER !== 'false'; // Enabled by default
    
    if (enableSSE) {
      const ssePort = parseInt(process.env.SSE_PORT || '3001', 10);
      
      this.sseService = new SelfHostedSSEService(
        {
          port: ssePort,
          enableLogging: true,
          sanitizeData: true,
          updateIntervalMs: 5000, // 5 seconds
          corsOrigin: '*', // Allow all origins for development
        },
        this.performanceMonitor,
        this.intelligenceBridge
      );
    }
  }

  /**
   * Send dashboard update to a specific socket
   */
  private sendDashboardUpdate(socket: any): void {
    try {
      const dashboardData = this.performanceMonitor.getDashboardData();
      const bridgeStats = this.intelligenceBridge.getStatistics();

      socket.emit('dashboardUpdate', {
        performance: dashboardData,
        intelligence: bridgeStats,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error sending dashboard update:', error);
    }
  }

  /**
   * Broadcast dashboard update to all connected clients
   */
  private broadcastDashboardUpdate(): void {
    try {
      const dashboardData = this.performanceMonitor.getDashboardData();
      const bridgeStats = this.intelligenceBridge.getStatistics();

      this.io.emit('dashboardUpdate', {
        performance: dashboardData,
        intelligence: bridgeStats,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error broadcasting dashboard update:', error);
    }
  }

  /**
   * Start the dashboard server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, async () => {
        console.log(`\n📊 Dashboard Server Started`);
        console.log(`🌐 Dashboard URL: http://localhost:${this.port}`);
        console.log(`📡 WebSocket: Connected for real-time updates`);
        console.log(`⚡ API Endpoints:`);
        console.log(`   GET  /api/dashboard - Full dashboard data`);
        console.log(`   GET  /api/health    - System health snapshot`);
        console.log(`   GET  /api/stats     - Performance statistics`);
        console.log(`   POST /api/alerts/:id/acknowledge - Acknowledge alert`);
        console.log(`   POST /api/alerts/:id/resolve     - Resolve alert\n`);

        // Start periodic updates (every 2 seconds)
        this.updateInterval = setInterval(() => {
          this.broadcastDashboardUpdate();
        }, 2000);

        // Start Smee streaming if configured
        if (this.smeeService) {
          await this.smeeService.start();
        }

        // Start Self-Hosted SSE Server
        if (this.sseService) {
          await this.sseService.start();
        }

        resolve();
      });
    });
  }

  /**
   * Stop the dashboard server
   */
  async stop(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Stop Smee streaming if running
    if (this.smeeService) {
      await this.smeeService.stop();
    }

    // Stop Self-Hosted SSE Server
    if (this.sseService) {
      await this.sseService.stop();
    }

    return new Promise((resolve) => {
      this.httpServer.close(() => {
        console.log('Dashboard server stopped');
        resolve();
      });
    });
  }

  /**
   * Get server URL
   */
  getUrl(): string {
    return `http://localhost:${this.port}`;
  }
}
