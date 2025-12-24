/**
 * Lightning API Server
 * REST API for Lightning Network invoice creation and payment management
 * Phase 2 of Lightning Network integration
 */

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { CoreLightningClient } from './CoreLightningClient.js';
import { LightningPaymentProcessor } from './LightningPaymentProcessor.js';
import type { 
  LightningInvoice, 
  ServicePricing, 
  RevenueAllocation,
  LightningStats 
} from './types.js';

export interface LightningAPIConfig {
  port?: number;
  host?: string;
  lightningClient: CoreLightningClient;
  paymentProcessor: LightningPaymentProcessor;
  apiKeyRequired?: boolean;
  apiKeys?: string[];
  corsOrigins?: string[];
  rateLimitPerMinute?: number;
}

interface CreateInvoiceRequest {
  serviceType: string;
  amountSats: number;
  description: string;
  userId?: string;
}

interface InvoiceResponse {
  success: boolean;
  transactionId: string;
  invoice: {
    bolt11: string;
    paymentHash: string;
    amountSats: number;
    expiresAt: number;
  };
  qrCode?: string;
}

interface PaymentNotification {
  transactionId: string;
  status: 'paid' | 'expired' | 'pending';
  amountSats: number;
  allocation?: RevenueAllocation;
  timestamp: number;
}

/**
 * Lightning Network REST API Server
 */
export class LightningAPIServer {
  private app: express.Application;
  private server: http.Server;
  private io: SocketIOServer;
  private config: LightningAPIConfig;
  private lightningClient: CoreLightningClient;
  private paymentProcessor: LightningPaymentProcessor;
  private rateLimitStore: Map<string, number[]> = new Map();

  constructor(config: LightningAPIConfig) {
    this.config = {
      port: 3001,
      host: '0.0.0.0',
      apiKeyRequired: true,
      corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      rateLimitPerMinute: 60,
      ...config,
    };

    this.lightningClient = config.lightningClient;
    this.paymentProcessor = config.paymentProcessor;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: this.config.corsOrigins,
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true,
    }));

    // JSON parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });

    // API key authentication
    if (this.config.apiKeyRequired && this.config.apiKeys) {
      this.app.use('/api', this.authenticateAPIKey.bind(this));
    }

    // Rate limiting
    this.app.use('/api', this.rateLimit.bind(this));
  }

  /**
   * API key authentication middleware
   */
  private authenticateAPIKey(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey || typeof apiKey !== 'string') {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    if (!this.config.apiKeys?.includes(apiKey)) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    next();
  }

  /**
   * Rate limiting middleware
   */
  private rateLimit(req: Request, res: Response, next: NextFunction): void {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const limit = this.config.rateLimitPerMinute || 60;

    // Get or initialize request log for this client
    let requestLog = this.rateLimitStore.get(clientId) || [];
    
    // Remove requests older than 1 minute
    requestLog = requestLog.filter(timestamp => now - timestamp < 60000);
    
    // Check if limit exceeded
    if (requestLog.length >= limit) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }

    // Add current request
    requestLog.push(now);
    this.rateLimitStore.set(clientId, requestLog);

    next();
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const health = await this.lightningClient.healthCheck();
        res.json({
          status: health.healthy ? 'healthy' : 'unhealthy',
          lightning: health.healthy,
          nodeInfo: health.nodeInfo,
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Create invoice
    this.app.post('/api/invoice', async (req: Request, res: Response) => {
      try {
        const { serviceType, amountSats, description, userId } = req.body as CreateInvoiceRequest;

        // Validate input
        if (!serviceType || !amountSats || !description) {
          res.status(400).json({ 
            error: 'Missing required fields: serviceType, amountSats, description' 
          });
          return;
        }

        if (amountSats <= 0) {
          res.status(400).json({ error: 'Amount must be positive' });
          return;
        }

        // Create invoice
        const { invoice, transactionId } = await this.paymentProcessor.createServiceInvoice(
          serviceType,
          amountSats,
          description,
          userId
        );

        const response: InvoiceResponse = {
          success: true,
          transactionId,
          invoice: {
            bolt11: invoice.bolt11,
            paymentHash: invoice.payment_hash,
            amountSats,
            expiresAt: invoice.expires_at,
          },
        };

        // Start watching for payment
        this.watchPayment(invoice.label, transactionId, amountSats);

        res.status(201).json(response);
      } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ 
          error: 'Failed to create invoice',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Get invoice status
    this.app.get('/api/invoice/:transactionId', async (req: Request, res: Response) => {
      try {
        const { transactionId } = req.params;
        
        // This would query Supabase for transaction status
        // For now, return a placeholder
        res.json({
          transactionId,
          status: 'pending',
          message: 'Invoice status lookup not yet implemented (requires Supabase)',
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get invoice status',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // List recent invoices
    this.app.get('/api/invoices', async (req: Request, res: Response) => {
      try {
        const result = await this.lightningClient.listInvoices();
        res.json({
          success: true,
          invoices: result.invoices.slice(0, 50), // Last 50 invoices
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to list invoices',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Get node info
    this.app.get('/api/node/info', async (req: Request, res: Response) => {
      try {
        const info = await this.lightningClient.getInfo();
        res.json({
          success: true,
          nodeInfo: info,
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get node info',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Get stats
    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const stats = this.paymentProcessor.getStats();
        res.json({
          success: true,
          stats,
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get stats',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Get balance
    this.app.get('/api/wallet/balance', async (req: Request, res: Response) => {
      try {
        const balance = await this.lightningClient.getBalance();
        
        let totalSats = 0;
        if (balance.outputs) {
          for (const output of balance.outputs) {
            totalSats += output.amount_msat / 1000;
          }
        }

        res.json({
          success: true,
          balance: {
            totalSats,
            outputs: balance.outputs,
          },
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get balance',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // List channels
    this.app.get('/api/channels', async (req: Request, res: Response) => {
      try {
        const result = await this.lightningClient.listChannels();
        res.json({
          success: true,
          channels: result.channels,
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to list channels',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Decode invoice
    this.app.post('/api/invoice/decode', async (req: Request, res: Response) => {
      try {
        const { bolt11 } = req.body;

        if (!bolt11) {
          res.status(400).json({ error: 'Missing bolt11 invoice' });
          return;
        }

        const decoded = await this.lightningClient.decodeInvoice(bolt11);
        res.json({
          success: true,
          decoded,
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to decode invoice',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Setup WebSocket connections
   */
  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      console.log(`⚡ WebSocket client connected: ${socket.id}`);

      // Subscribe to transaction updates
      socket.on('subscribe:transaction', (transactionId: string) => {
        console.log(`Client ${socket.id} subscribed to transaction ${transactionId}`);
        socket.join(`transaction:${transactionId}`);
      });

      // Unsubscribe from transaction
      socket.on('unsubscribe:transaction', (transactionId: string) => {
        console.log(`Client ${socket.id} unsubscribed from transaction ${transactionId}`);
        socket.leave(`transaction:${transactionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Watch for payment on an invoice
   */
  private async watchPayment(
    label: string, 
    transactionId: string, 
    amountSats: number
  ): Promise<void> {
    try {
      // Wait for payment in background
      const result = await this.paymentProcessor.waitForPayment(label, transactionId);

      if (result.success && result.allocation) {
        // Notify via WebSocket
        const notification: PaymentNotification = {
          transactionId,
          status: 'paid',
          amountSats,
          allocation: result.allocation,
          timestamp: Date.now(),
        };

        this.io.to(`transaction:${transactionId}`).emit('payment:received', notification);
        console.log(`✅ Payment notification sent for ${transactionId}`);
      }
    } catch (error) {
      console.error(`Error watching payment for ${label}:`, error);
      
      // Notify failure via WebSocket
      const notification: PaymentNotification = {
        transactionId,
        status: 'expired',
        amountSats,
        timestamp: Date.now(),
      };

      this.io.to(`transaction:${transactionId}`).emit('payment:expired', notification);
    }
  }

  /**
   * Send WebSocket notification
   */
  public notifyPayment(notification: PaymentNotification): void {
    this.io.to(`transaction:${notification.transactionId}`).emit('payment:received', notification);
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log('\n⚡ Lightning API Server Started');
        console.log(`   Host: ${this.config.host}`);
        console.log(`   Port: ${this.config.port}`);
        console.log(`   API Base: http://${this.config.host}:${this.config.port}/api`);
        console.log(`   WebSocket: ws://${this.config.host}:${this.config.port}`);
        console.log(`   Health: http://${this.config.host}:${this.config.port}/health`);
        console.log('');
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.io.close(() => {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('⚡ Lightning API Server stopped');
            resolve();
          }
        });
      });
    });
  }

  /**
   * Get Express app (for testing)
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get WebSocket server (for testing)
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}
