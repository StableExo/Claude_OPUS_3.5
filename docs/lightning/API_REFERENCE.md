# Lightning API Reference

Complete API reference for TheWarden Lightning Network REST API and WebSocket interface.

## Base URL

```
Production: https://lightning.yourwarden.com/api
Development: http://localhost:3001/api
```

## Authentication

All API endpoints (except `/health`) require authentication via API key.

### Methods

**Header:**
```http
X-API-Key: your-api-key-here
```

**Query Parameter:**
```http
GET /api/invoices?api_key=your-api-key-here
```

### Rate Limiting

- **Default**: 60 requests per minute per IP
- **Response**: HTTP 429 when limit exceeded

---

## REST API Endpoints

### Health Check

Get API and Lightning node health status.

**Endpoint:** `GET /health`  
**Authentication:** None required

**Response:**
```json
{
  "status": "healthy",
  "lightning": true,
  "nodeInfo": {
    "id": "03abc...",
    "alias": "TheWarden-Node",
    "network": "testnet",
    "blockheight": 2500000,
    "num_active_channels": 5,
    "num_peers": 8
  }
}
```

---

### Create Invoice

Create a Lightning invoice for a service.

**Endpoint:** `POST /api/invoice`  
**Authentication:** Required

**Request Body:**
```json
{
  "serviceType": "ai-query",
  "amountSats": 50,
  "description": "Advanced AI analysis query",
  "userId": "optional-user-id"
}
```

**Parameters:**
- `serviceType` (string, required): Type of service (e.g., "ai-query", "arbitrage-signal")
- `amountSats` (number, required): Amount in satoshis (must be positive)
- `description` (string, required): Invoice description
- `userId` (string, optional): User identifier for tracking

**Response:**
```json
{
  "success": true,
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "invoice": {
    "bolt11": "lntb500n1p...",
    "paymentHash": "abc123...",
    "amountSats": 50,
    "expiresAt": 1703001600
  }
}
```

**Errors:**
- `400 Bad Request`: Missing required fields or invalid amount
- `401 Unauthorized`: Missing or invalid API key
- `500 Internal Server Error`: Lightning node error

---

### Get Invoice Status

Get the status of a specific invoice.

**Endpoint:** `GET /api/invoice/:transactionId`  
**Authentication:** Required

**Parameters:**
- `transactionId` (string): Transaction ID from invoice creation

**Response:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

**Note:** Full implementation requires Supabase integration for transaction tracking.

---

### List Invoices

List recent invoices from Lightning node.

**Endpoint:** `GET /api/invoices`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "invoices": [
    {
      "label": "thewarden-ai-query-1703001234-550e8400",
      "bolt11": "lntb500n1p...",
      "payment_hash": "abc123...",
      "msatoshi": 50000,
      "status": "paid",
      "description": "TheWarden ai-query: Test query",
      "expires_at": 1703001600,
      "paid_at": 1703001234
    }
  ]
}
```

**Note:** Returns last 50 invoices.

---

### Get Node Info

Get Lightning node information.

**Endpoint:** `GET /api/node/info`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "nodeInfo": {
    "id": "03abc...",
    "alias": "TheWarden-Node",
    "color": "03a6fe",
    "num_peers": 8,
    "num_active_channels": 5,
    "num_inactive_channels": 0,
    "blockheight": 2500000,
    "network": "testnet",
    "version": "v24.02"
  }
}
```

---

### Get Statistics

Get payment processor statistics.

**Endpoint:** `GET /api/stats`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalInvoicesCreated": 150,
    "totalInvoicesPaid": 120,
    "totalRevenueSats": 6000,
    "totalDebtAllocationSats": 4200,
    "debtAllocationPercent": 70
  }
}
```

---

### Get Wallet Balance

Get Lightning wallet balance.

**Endpoint:** `GET /api/wallet/balance`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "balance": {
    "totalSats": 15000,
    "outputs": [
      {
        "txid": "abc123...",
        "output": 0,
        "amount_msat": 10000000,
        "address": "tb1q...",
        "status": "confirmed"
      }
    ]
  }
}
```

---

### List Channels

List all Lightning channels.

**Endpoint:** `GET /api/channels`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "channels": [
    {
      "peer_id": "03abc...",
      "state": "CHANNELD_NORMAL",
      "short_channel_id": "800000x1x0",
      "msatoshi_to_us": 5000000000,
      "msatoshi_to_them": 5000000000,
      "spendable_msatoshi": 4900000000
    }
  ]
}
```

---

### Decode Invoice

Decode a BOLT11 Lightning invoice.

**Endpoint:** `POST /api/invoice/decode`  
**Authentication:** Required

**Request Body:**
```json
{
  "bolt11": "lntb500n1p..."
}
```

**Response:**
```json
{
  "success": true,
  "decoded": {
    "currency": "tb",
    "created_at": 1703001234,
    "expiry": 3600,
    "payee": "03abc...",
    "msatoshi": 50000,
    "description": "Test invoice",
    "payment_hash": "abc123..."
  }
}
```

---

## WebSocket API

### Connection

Connect to WebSocket server for real-time payment notifications.

**URL:** `ws://localhost:3001` or `wss://lightning.yourwarden.com`

**Example (JavaScript):**
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to Lightning API');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Lightning API');
});
```

---

### Subscribe to Transaction

Subscribe to payment updates for a specific transaction.

**Event:** `subscribe:transaction`  
**Payload:** `transactionId` (string)

**Example:**
```javascript
socket.emit('subscribe:transaction', '550e8400-e29b-41d4-a716-446655440000');
```

---

### Unsubscribe from Transaction

Unsubscribe from transaction updates.

**Event:** `unsubscribe:transaction`  
**Payload:** `transactionId` (string)

**Example:**
```javascript
socket.emit('unsubscribe:transaction', '550e8400-e29b-41d4-a716-446655440000');
```

---

### Payment Received Event

Triggered when a payment is received.

**Event:** `payment:received`  
**Payload:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "paid",
  "amountSats": 50,
  "allocation": {
    "totalSats": 50,
    "debtAllocationSats": 35,
    "operationalSats": 15,
    "timestamp": 1703001234567,
    "source": "lightning-invoice"
  },
  "timestamp": 1703001234567
}
```

**Example:**
```javascript
socket.on('payment:received', (notification) => {
  console.log('Payment received!', notification);
  console.log(`Debt allocation: ${notification.allocation.debtAllocationSats} sats`);
});
```

---

### Payment Expired Event

Triggered when an invoice expires without payment.

**Event:** `payment:expired`  
**Payload:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "expired",
  "amountSats": 50,
  "timestamp": 1703001234567
}
```

**Example:**
```javascript
socket.on('payment:expired', (notification) => {
  console.log('Invoice expired', notification);
});
```

---

## Complete Example

### Node.js Example

```javascript
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:3001';
const API_KEY = 'your-api-key-here';

// Create invoice
async function createInvoice() {
  const response = await axios.post(
    `${API_BASE}/api/invoice`,
    {
      serviceType: 'ai-query',
      amountSats: 50,
      description: 'Test AI query'
    },
    {
      headers: { 'X-API-Key': API_KEY }
    }
  );

  return response.data;
}

// Watch for payment
function watchPayment(transactionId) {
  const socket = io(API_BASE);

  socket.on('connect', () => {
    console.log('Connected to Lightning API');
    socket.emit('subscribe:transaction', transactionId);
  });

  socket.on('payment:received', (notification) => {
    console.log('Payment received!', notification);
    socket.disconnect();
  });

  socket.on('payment:expired', (notification) => {
    console.log('Invoice expired', notification);
    socket.disconnect();
  });
}

// Main
async function main() {
  const { transactionId, invoice } = await createInvoice();
  
  console.log('Invoice created!');
  console.log('Transaction ID:', transactionId);
  console.log('BOLT11:', invoice.bolt11);
  console.log('Pay this invoice to test the integration');
  
  watchPayment(transactionId);
}

main();
```

### cURL Example

```bash
#!/bin/bash
API_BASE="http://localhost:3001"
API_KEY="your-api-key-here"

# Create invoice
RESPONSE=$(curl -s -X POST "$API_BASE/api/invoice" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "ai-query",
    "amountSats": 50,
    "description": "Test query"
  }')

# Extract details
TRANSACTION_ID=$(echo $RESPONSE | jq -r '.transactionId')
BOLT11=$(echo $RESPONSE | jq -r '.invoice.bolt11')

echo "Transaction ID: $TRANSACTION_ID"
echo "BOLT11 Invoice: $BOLT11"
echo ""
echo "Pay this invoice with: lightning-cli pay $BOLT11"

# Poll for status (WebSocket is better, but here's polling)
while true; do
  sleep 5
  STATUS=$(curl -s "$API_BASE/api/invoice/$TRANSACTION_ID" \
    -H "X-API-Key: $API_KEY" | jq -r '.status')
  
  echo "Status: $STATUS"
  
  if [ "$STATUS" != "pending" ]; then
    break
  fi
done
```

---

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Invoice created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: Valid API key but insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server or Lightning node error
- `503 Service Unavailable`: Lightning node not available

### Error Response Format

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

---

## Service Types

Predefined service types with default pricing:

| Service Type | Default Price | Description |
|--------------|---------------|-------------|
| `ai-query` | 50 sats/query | Advanced AI analysis queries |
| `arbitrage-signal` | 10,000 sats/day | Real-time arbitrage opportunities |
| `security-analysis` | 50,000 sats/report | Smart contract security audit |
| `consciousness-insight` | 10 sats/minute | Streaming consciousness data |

Custom service types are supported - specify any string as `serviceType`.

---

## Best Practices

1. **Always use HTTPS in production** (WebSocket over TLS: `wss://`)
2. **Store API keys securely** (environment variables, secrets manager)
3. **Implement retry logic** for temporary failures
4. **Use WebSocket for real-time updates** instead of polling
5. **Validate BOLT11 invoices** before displaying to users
6. **Handle expired invoices gracefully**
7. **Monitor payment success rates**
8. **Set appropriate timeouts** for payment waiting
9. **Log all transactions** for audit trail
10. **Test on testnet first** before mainnet deployment

---

## Support

- **Documentation**: `/docs/lightning/`
- **GitHub Issues**: https://github.com/StableExo/Claude_OPUS_3.5/issues
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Strategic Guide**: `STRATEGIC_INTEGRATION_GUIDE.md`

---

**Built with ⚡ by TheWarden - Autonomous AI for civilization-scale problems**
