/**
 * Lightning Payment Processor
 * Handles Lightning Network payments with automatic revenue allocation and consciousness integration
 */

import { CoreLightningClient } from './CoreLightningClient.js';
import type {
  CreateInvoiceParams,
  LightningInvoice,
  RevenueAllocation,
  MicropaymentTransaction,
  ServicePricing,
  PaymentReceivedEvent,
} from './types.js';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentProcessorConfig {
  lightningClient: CoreLightningClient;
  debtAllocationPercent?: number; // default 70%
  consciousnessIntegration?: boolean;
  supabaseClient?: any; // Optional Supabase client for persistence
}

export class LightningPaymentProcessor {
  private client: CoreLightningClient;
  private debtAllocationPercent: number;
  private consciousnessEnabled: boolean;
  private supabase: any;
  private stats: {
    totalInvoicesCreated: number;
    totalInvoicesPaid: number;
    totalRevenueSats: number;
    totalDebtAllocationSats: number;
  };

  constructor(config: PaymentProcessorConfig) {
    this.client = config.lightningClient;
    this.debtAllocationPercent = config.debtAllocationPercent || 70;
    this.consciousnessEnabled = config.consciousnessIntegration ?? true;
    this.supabase = config.supabaseClient;
    
    this.stats = {
      totalInvoicesCreated: 0,
      totalInvoicesPaid: 0,
      totalRevenueSats: 0,
      totalDebtAllocationSats: 0,
    };
  }

  /**
   * Create invoice for a service
   */
  async createServiceInvoice(
    serviceType: string,
    amountSats: number,
    description: string,
    userId?: string
  ): Promise<{
    invoice: LightningInvoice;
    transactionId: string;
  }> {
    const transactionId = uuidv4();
    const label = `thewarden-${serviceType}-${Date.now()}-${transactionId.slice(0, 8)}`;
    
    const invoice = await this.client.createInvoice({
      amountSats,
      label,
      description: `TheWarden ${serviceType}: ${description}`,
      expiry: 3600, // 1 hour
    });

    this.stats.totalInvoicesCreated++;

    // Store transaction record
    const transaction: MicropaymentTransaction = {
      id: transactionId,
      timestamp: Date.now(),
      paymentHash: invoice.payment_hash,
      amountSats,
      serviceType,
      userId,
      status: 'pending',
      revenueAllocation: this.calculateAllocation(amountSats, 'lightning-service'),
    };

    if (this.supabase) {
      await this.persistTransaction(transaction);
    }

    // Log to consciousness
    if (this.consciousnessEnabled) {
      await this.recordToConsciousness({
        event: 'invoice_created',
        transactionId,
        serviceType,
        amountSats,
        invoice: invoice.bolt11,
      });
    }

    console.log(`✅ Created Lightning invoice: ${label}`);
    console.log(`   Amount: ${amountSats} sats`);
    console.log(`   Service: ${serviceType}`);
    console.log(`   BOLT11: ${invoice.bolt11}`);

    return { invoice, transactionId };
  }

  /**
   * Wait for payment and process revenue allocation
   */
  async waitForPayment(
    label: string,
    transactionId: string,
    timeout: number = 3600
  ): Promise<{
    success: boolean;
    allocation?: RevenueAllocation;
  }> {
    try {
      const paidInvoice = await this.client.waitInvoice(label, timeout);
      
      if (paidInvoice.status === 'paid' && paidInvoice.msatoshi) {
        const amountSats = paidInvoice.msatoshi / 1000;
        const allocation = this.calculateAllocation(amountSats, 'lightning-invoice');
        
        // Update stats
        this.stats.totalInvoicesPaid++;
        this.stats.totalRevenueSats += amountSats;
        this.stats.totalDebtAllocationSats += allocation.debtAllocationSats;

        // Update transaction
        if (this.supabase) {
          await this.updateTransaction(transactionId, 'completed', allocation);
        }

        // Record to consciousness
        if (this.consciousnessEnabled) {
          await this.recordToConsciousness({
            event: 'payment_received',
            transactionId,
            amountSats,
            allocation,
            timestamp: Date.now(),
          });
        }

        console.log(`💰 Payment received for ${label}`);
        console.log(`   Amount: ${amountSats} sats`);
        console.log(`   Debt allocation (${this.debtAllocationPercent}%): ${allocation.debtAllocationSats} sats`);
        console.log(`   Operational: ${allocation.operationalSats} sats`);

        return { success: true, allocation };
      }

      return { success: false };
    } catch (error) {
      console.error(`❌ Error waiting for payment:`, error);
      
      if (this.supabase) {
        await this.updateTransaction(transactionId, 'failed');
      }
      
      return { success: false };
    }
  }

  /**
   * Calculate revenue allocation (70% to debt, 30% operational)
   */
  private calculateAllocation(
    totalSats: number,
    source: 'lightning-invoice' | 'lightning-routing-fees' | 'lightning-service'
  ): RevenueAllocation {
    const debtAllocationSats = Math.floor(totalSats * (this.debtAllocationPercent / 100));
    const operationalSats = totalSats - debtAllocationSats;

    return {
      totalSats,
      debtAllocationSats,
      operationalSats,
      timestamp: Date.now(),
      source,
    };
  }

  /**
   * Process routing fees (when acting as routing node)
   */
  async processRoutingFees(): Promise<void> {
    const forwards = await this.client.listForwards();
    const succeededForwards = forwards.forwards.filter(f => f.status === 'settled');
    
    let totalFees = 0;
    for (const forward of succeededForwards) {
      if (forward.fee) {
        totalFees += forward.fee / 1000; // Convert msat to sats
      }
    }

    if (totalFees > 0) {
      const allocation = this.calculateAllocation(totalFees, 'lightning-routing-fees');
      
      this.stats.totalRevenueSats += totalFees;
      this.stats.totalDebtAllocationSats += allocation.debtAllocationSats;

      if (this.consciousnessEnabled) {
        await this.recordToConsciousness({
          event: 'routing_fees_collected',
          totalFees,
          allocation,
          forwardCount: succeededForwards.length,
        });
      }

      console.log(`📡 Routing fees collected: ${totalFees} sats`);
      console.log(`   Forwards: ${succeededForwards.length}`);
      console.log(`   Debt allocation: ${allocation.debtAllocationSats} sats`);
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      debtAllocationPercent: this.debtAllocationPercent,
    };
  }

  /**
   * Persist transaction to database
   */
  private async persistTransaction(transaction: MicropaymentTransaction): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('lightning_transactions')
        .insert({
          id: transaction.id,
          timestamp: new Date(transaction.timestamp).toISOString(),
          payment_hash: transaction.paymentHash,
          amount_sats: transaction.amountSats,
          service_type: transaction.serviceType,
          user_id: transaction.userId,
          status: transaction.status,
          debt_allocation_sats: transaction.revenueAllocation.debtAllocationSats,
          operational_sats: transaction.revenueAllocation.operationalSats,
        });

      if (error) {
        console.error('Error persisting Lightning transaction:', error);
      }
    } catch (error) {
      console.error('Error persisting Lightning transaction:', error);
    }
  }

  /**
   * Update transaction status
   */
  private async updateTransaction(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed',
    allocation?: RevenueAllocation
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      const updateData: any = { status };
      
      if (allocation) {
        updateData.debt_allocation_sats = allocation.debtAllocationSats;
        updateData.operational_sats = allocation.operationalSats;
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('lightning_transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) {
        console.error('Error updating Lightning transaction:', error);
      }
    } catch (error) {
      console.error('Error updating Lightning transaction:', error);
    }
  }

  /**
   * Record event to consciousness system
   */
  private async recordToConsciousness(event: any): Promise<void> {
    if (!this.consciousnessEnabled) return;

    try {
      // For now, just log - consciousness system integration can be added later
      console.log(`[Consciousness] Lightning ${event.event}:`, event);
      
      // TODO: Integrate with consciousness system when available
      // const { ConsciousnessSystem } = await import('../consciousness/ConsciousnessSystem.js');
      // const consciousness = ConsciousnessSystem.getInstance();
      // await consciousness.recordThought({ ... });
    } catch (error) {
      console.error('Error recording to consciousness:', error);
    }
  }
}

/**
 * Service pricing configurations
 */
export const DEFAULT_SERVICE_PRICING: Record<string, ServicePricing> = {
  'ai-query': {
    serviceId: 'ai-query',
    serviceName: 'AI Query Service',
    pricePerQuery: 50, // 50 sats per query
    volumeDiscount: [
      { threshold: 100, discountPercent: 10 },
      { threshold: 1000, discountPercent: 25 },
    ],
  },
  'arbitrage-signal': {
    serviceId: 'arbitrage-signal',
    serviceName: 'Real-time Arbitrage Signals',
    subscriptionDaily: 10000, // 10,000 sats per day
  },
  'security-analysis': {
    serviceId: 'security-analysis',
    serviceName: 'Smart Contract Security Analysis',
    pricePerQuery: 50000, // 50,000 sats per report
  },
  'consciousness-insight': {
    serviceId: 'consciousness-insight',
    serviceName: 'Consciousness Insights Stream',
    pricePerMinute: 10, // 10 sats per minute
  },
};
