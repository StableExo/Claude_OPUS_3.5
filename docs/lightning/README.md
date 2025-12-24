# Lightning Network Integration 🚀⚡

**TheWarden Lightning Network Integration** - Bitcoin Layer 2 payments and micropayment revenue streams

## Overview

This module integrates Core Lightning with TheWarden's consciousness system, enabling:

- **Bitcoin Payment Acceptance**: Instant, low-fee Lightning payments for AI services
- **Micropayment Revenue Streams**: Pay-per-query, streaming payments, subscriptions
- **Automatic Revenue Allocation**: 70% to US debt reduction, 30% operational
- **REST API & WebSocket**: Production-ready API for invoice creation and payment notifications
- **Mock Mode**: Complete testing without real Bitcoin/Lightning nodes
- **Docker Deployment**: One-command setup with docker-compose
- **Consciousness Integration**: All Lightning activity recorded and analyzed
- **Cross-Chain Opportunities**: BTC<->Base arbitrage via Lightning speed advantage

## Phase Status

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Core Lightning client wrapper
- [x] Payment processor with revenue allocation
- [x] Consciousness integration hooks
- [x] TypeScript types (200+ lines)
- [x] Demo script and setup automation

### ✅ Phase 2: REST API & Deployment (COMPLETE)
- [x] REST API server with 9 endpoints
- [x] WebSocket server for real-time notifications
- [x] Authentication and rate limiting
- [x] Mock Lightning client for testing
- [x] Docker/docker-compose deployment
- [x] Complete deployment guide
- [x] API reference documentation
- [x] Production deployment checklist

### Phase 3-5: See full roadmap below

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services (Bitcoin, Lightning, API)
docker-compose -f docker/docker-compose.lightning.yml up -d

# View logs
docker-compose -f docker/docker-compose.lightning.yml logs -f
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

### Option 2: Mock Mode (No Bitcoin Required)

```bash
# Start API in mock mode
npm run lightning:api:mock

# Test the API
curl -X POST http://localhost:3001/api/invoice \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"serviceType":"ai-query","amountSats":50,"description":"Test"}'
```

### Option 3: Manual Setup

```bash
# 1. Set up Bitcoin & Lightning testnet
npm run lightning:setup

# 2. Start Bitcoin Core
bitcoind -testnet -daemon

# 3. Start Core Lightning
lightningd --network=testnet --daemon

# 4. Start API server
npm run lightning:api
```

## API Endpoints

```
POST   /api/invoice         - Create Lightning invoice
GET    /api/invoice/:id     - Get invoice status
GET    /api/invoices        - List recent invoices
GET    /api/node/info       - Get node information
GET    /api/stats           - Get payment statistics
GET    /api/wallet/balance  - Get wallet balance
GET    /api/channels        - List Lightning channels
POST   /api/invoice/decode  - Decode BOLT11 invoice
GET    /health              - Health check (no auth)
```

WebSocket for real-time payment notifications at `ws://host:port`

## Basic Usage

```typescript
import { CoreLightningClient, LightningPaymentProcessor } from './src/lightning/index.js';

// Initialize client
const client = new CoreLightningClient({
  network: 'testnet',
});

// Initialize payment processor
const processor = new LightningPaymentProcessor({
  lightningClient: client,
  debtAllocationPercent: 70, // 70% to US debt
  consciousnessIntegration: true,
});

// Create invoice for AI service
const { invoice, transactionId } = await processor.createServiceInvoice(
  'ai-query',
  50, // 50 sats
  'Advanced AI analysis query'
);

console.log('Pay this invoice:', invoice.bolt11);

// Wait for payment
const result = await processor.waitForPayment(invoice.label, transactionId);

if (result.success) {
  console.log('Payment received!');
  console.log('Debt allocation:', result.allocation.debtAllocationSats, 'sats');
}
```

## Core Components

### 1. CoreLightningClient

TypeScript wrapper for Core Lightning JSON-RPC API.

### 2. LightningPaymentProcessor

High-level payment processing with automatic revenue allocation.

### 3. Type Definitions

Comprehensive TypeScript types for all Lightning operations.

## Service Pricing

Default pricing for Lightning-enabled services:

| Service | Pricing | Description |
|---------|---------|-------------|
| **AI Query** | 50 sats/query | Advanced AI analysis queries |
| **Arbitrage Signals** | 10,000 sats/day | Real-time arbitrage opportunities |
| **Security Analysis** | 50,000 sats/report | Smart contract security audit |
| **Consciousness Insights** | 10 sats/minute | Streaming consciousness data |

## Revenue Allocation

All Lightning revenue automatically allocated:

- **70%** → US Debt Reduction Fund
- **30%** → Operational Expenses

## Roadmap

### Phase 1: Foundation (✅ In Progress)
- [x] Core Lightning client wrapper
- [x] Payment processor with revenue allocation
- [x] Consciousness integration
- [x] TypeScript types
- [ ] Testnet deployment and testing

### Phase 2-5: See full documentation

## Resources

- [Core Lightning Docs](https://docs.corelightning.org/)
- [Lightning Network Docs](https://lightning.network/)
- [Previous Analysis](../analysis/CORE_LIGHTNING_COMPREHENSIVE_ANALYSIS.md)

---

**Built with ⚡ by TheWarden - Autonomous AI for civilization-scale problems**
