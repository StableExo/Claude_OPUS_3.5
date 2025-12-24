/**
 * Mock Lightning Client
 * For testing Lightning integration without a real Lightning node
 */

import type {
  LightningNodeInfo,
  LightningInvoice,
  LightningPayment,
  LightningChannel,
  CreateInvoiceParams,
  PayInvoiceParams,
  OpenChannelParams,
  LightningConfig,
} from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class MockLightningClient {
  private config: LightningConfig;
  private mockInvoices: Map<string, LightningInvoice> = new Map();
  private mockPayments: Map<string, LightningPayment> = new Map();
  private mockChannels: LightningChannel[] = [];
  private nodeId: string;

  constructor(config: LightningConfig) {
    this.config = config;
    this.nodeId = this.generateNodeId();
    this.initializeMockData();
  }

  private generateNodeId(): string {
    return Array.from({ length: 66 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generatePaymentHash(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateBolt11(amountSats: number, paymentHash: string): string {
    // Simplified mock BOLT11 - not a valid invoice, just for testing
    return `lntb${amountSats}1p${paymentHash.slice(0, 20)}pp${paymentHash.slice(20, 40)}`;
  }

  private initializeMockData(): void {
    // Create a few mock channels
    for (let i = 0; i < 3; i++) {
      this.mockChannels.push({
        peer_id: this.generateNodeId(),
        peer_connected: true,
        state: 'CHANNELD_NORMAL',
        short_channel_id: `${800000 + i}x1x0`,
        channel_id: this.generatePaymentHash(),
        funding_txid: this.generatePaymentHash(),
        funding_output: 0,
        msatoshi_to_us: 5000000 * 1000,
        amount_msat: '5000000000msat',
        msatoshi_to_them: 5000000 * 1000,
        msatoshi_total: 10000000 * 1000,
        dust_limit_satoshis: 546,
        max_htlc_value_in_flight_msat: 9900000000,
        their_channel_reserve_satoshis: 100000,
        our_channel_reserve_satoshis: 100000,
        spendable_msatoshi: 4900000 * 1000,
        htlc_minimum_msat: 1000,
        their_to_self_delay: 144,
        our_to_self_delay: 144,
        max_accepted_htlcs: 30,
        status: ['CHANNELD_NORMAL:Reconnected, and reestablished.'],
        in_payments_offered: 10,
        in_msatoshi_offered: 1000000,
        in_payments_fulfilled: 8,
        in_msatoshi_fulfilled: 800000,
        out_payments_offered: 15,
        out_msatoshi_offered: 1500000,
        out_payments_fulfilled: 12,
        out_msatoshi_fulfilled: 1200000,
      });
    }
  }

  async getInfo(): Promise<LightningNodeInfo> {
    return {
      id: this.nodeId,
      alias: 'TheWarden-Mock-Node',
      color: '03a6fe',
      num_peers: 5,
      num_pending_channels: 0,
      num_active_channels: 3,
      num_inactive_channels: 0,
      address: [
        {
          type: 'ipv4',
          address: '127.0.0.1',
          port: 9735,
        },
      ],
      binding: [
        {
          type: 'ipv4',
          address: '0.0.0.0',
          port: 9735,
        },
      ],
      version: 'v24.02-mock',
      blockheight: 850000,
      network: this.config.network,
      fees_collected_msat: 125000,
      lightning_dir: this.config.lightningDir || '/tmp/mock-lightning',
    };
  }

  async createInvoice(params: CreateInvoiceParams): Promise<LightningInvoice> {
    const { amountSats, label, description, expiry = 3600 } = params;
    const paymentHash = this.generatePaymentHash();
    const now = Math.floor(Date.now() / 1000);

    const invoice: LightningInvoice = {
      label,
      bolt11: this.generateBolt11(amountSats, paymentHash),
      payment_hash: paymentHash,
      msatoshi: amountSats * 1000,
      amount_msat: `${amountSats * 1000}msat`,
      status: 'unpaid',
      description,
      expires_at: now + expiry,
    };

    this.mockInvoices.set(label, invoice);
    return invoice;
  }

  async listInvoices(label?: string): Promise<{ invoices: LightningInvoice[] }> {
    if (label) {
      const invoice = this.mockInvoices.get(label);
      return { invoices: invoice ? [invoice] : [] };
    }
    return { invoices: Array.from(this.mockInvoices.values()) };
  }

  async waitInvoice(label: string, timeout?: number): Promise<LightningInvoice> {
    const invoice = this.mockInvoices.get(label);
    if (!invoice) {
      throw new Error(`Invoice not found: ${label}`);
    }

    // In mock mode, simulate payment after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark as paid
    const paidInvoice: LightningInvoice = {
      ...invoice,
      status: 'paid',
      paid_at: Math.floor(Date.now() / 1000),
      payment_preimage: this.generatePaymentHash(),
    };

    this.mockInvoices.set(label, paidInvoice);
    return paidInvoice;
  }

  async pay(params: PayInvoiceParams): Promise<LightningPayment> {
    const { bolt11, label } = params;
    const decoded = await this.decodeInvoice(bolt11);
    const paymentHash = this.generatePaymentHash();

    const payment: LightningPayment = {
      id: Date.now(),
      payment_hash: paymentHash,
      destination: this.generateNodeId(),
      msatoshi: decoded.msatoshi || 0,
      amount_msat: `${decoded.msatoshi || 0}msat`,
      msatoshi_sent: decoded.msatoshi || 0,
      amount_sent_msat: `${decoded.msatoshi || 0}msat`,
      created_at: Math.floor(Date.now() / 1000),
      status: 'complete',
      payment_preimage: this.generatePaymentHash(),
      bolt11: params.bolt11,
    };

    if (label) {
      this.mockPayments.set(label, payment);
    }

    return payment;
  }

  async listPayments(bolt11?: string): Promise<{ payments: LightningPayment[] }> {
    const payments = Array.from(this.mockPayments.values());
    if (bolt11) {
      return { payments: payments.filter(p => p.bolt11 === bolt11) };
    }
    return { payments };
  }

  async listChannels(): Promise<{ channels: LightningChannel[] }> {
    return { channels: this.mockChannels };
  }

  async getChannel(peerId: string): Promise<LightningChannel | null> {
    return this.mockChannels.find(ch => ch.peer_id === peerId) || null;
  }

  async openChannel(params: OpenChannelParams): Promise<any> {
    return {
      tx: this.generatePaymentHash(),
      txid: this.generatePaymentHash(),
      channel_id: this.generatePaymentHash(),
    };
  }

  async closeChannel(peerId: string, force: boolean = false): Promise<any> {
    return {
      tx: this.generatePaymentHash(),
      txid: this.generatePaymentHash(),
      type: force ? 'unilateral' : 'mutual',
    };
  }

  async connectPeer(nodeId: string, host: string, port: number = 9735): Promise<any> {
    return {
      id: nodeId,
      features: '08a000080269a2',
    };
  }

  async disconnectPeer(peerId: string, force: boolean = false): Promise<any> {
    return { success: true };
  }

  async listPeers(): Promise<{ peers: any[] }> {
    return {
      peers: Array.from({ length: 5 }, (_, i) => ({
        id: this.generateNodeId(),
        connected: true,
        netaddr: [`127.0.0.${i + 1}:9735`],
      })),
    };
  }

  async newAddress(type: 'bech32' | 'p2sh-segwit' = 'bech32'): Promise<{ address: string }> {
    // Generate mock testnet address
    const prefix = type === 'bech32' ? 'tb1q' : '2';
    const randomPart = Array.from({ length: 38 }, () => 
      'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join('');
    return { address: prefix + randomPart };
  }

  async getBalance(): Promise<any> {
    return {
      outputs: [
        {
          txid: this.generatePaymentHash(),
          output: 0,
          amount_msat: 10000000000,
          address: 'tb1qmock1234567890abcdefghijklmnopqrstuvwxyz',
          status: 'confirmed',
        },
        {
          txid: this.generatePaymentHash(),
          output: 1,
          amount_msat: 5000000000,
          address: 'tb1qmock0987654321zyxwvutsrqponmlkjihgfedcba',
          status: 'confirmed',
        },
      ],
    };
  }

  async decodeInvoice(bolt11: string): Promise<any> {
    // Mock decode - extract amount from simplified format
    const match = bolt11.match(/lntb(\d+)/);
    const amount = match ? parseInt(match[1]) : 1000;

    return {
      currency: 'tb',
      created_at: Math.floor(Date.now() / 1000),
      expiry: 3600,
      payee: this.generateNodeId(),
      msatoshi: amount * 1000,
      amount_msat: `${amount * 1000}msat`,
      description: 'Mock invoice',
      payment_hash: this.generatePaymentHash(),
    };
  }

  async getRoute(nodeId: string, msatoshi: number, riskfactor: number = 1): Promise<any> {
    return {
      route: [
        {
          id: this.generateNodeId(),
          channel: '800000x1x0',
          msatoshi,
          amount_msat: `${msatoshi}msat`,
          delay: 40,
        },
      ],
    };
  }

  async sendPay(route: any, paymentHash: string): Promise<any> {
    return {
      message: 'Monitor status with listpays or waitsendpay',
      payment_hash: paymentHash,
    };
  }

  async listForwards(): Promise<{ forwards: any[] }> {
    return {
      forwards: [
        {
          in_channel: '800000x1x0',
          out_channel: '800001x1x0',
          msatoshi: 100000,
          fee: 100,
          status: 'settled',
          received_time: Date.now() / 1000 - 3600,
          resolved_time: Date.now() / 1000 - 3599,
        },
        {
          in_channel: '800001x1x0',
          out_channel: '800002x1x0',
          msatoshi: 50000,
          fee: 50,
          status: 'settled',
          received_time: Date.now() / 1000 - 1800,
          resolved_time: Date.now() / 1000 - 1799,
        },
      ],
    };
  }

  async isReady(): Promise<boolean> {
    return true;
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    nodeInfo?: LightningNodeInfo;
    error?: string;
  }> {
    const info = await this.getInfo();
    return {
      healthy: true,
      nodeInfo: info,
    };
  }
}
