# Rated Network API Integration

Complete TypeScript integration with the [Rated Network API](https://docs.rated.network/rated-api) for Ethereum validator, operator, and builder performance metrics.

## Overview

This integration provides TheWarden with real-time access to:
- ✅ **Validator effectiveness metrics** - Performance tracking for individual validators
- ✅ **Operator statistics** - Infrastructure quality and reliability data
- ✅ **Builder performance** - Block builder market share and efficiency
- ✅ **MEV relay health** - Relay uptime and success rates
- ✅ **Network statistics** - Overall Ethereum network health
- ✅ **Slashing events** - Risk indicators and penalty tracking

## Quick Start

```typescript
import { createRatedNetworkClient } from './integrations/rated-network';

// Create client
const client = createRatedNetworkClient(process.env.RATED_NETWORK_API_KEY!);

// Get operator effectiveness
const data = await client.getOperatorEffectiveness('flashbots');
console.log('Effectiveness:', data[0].proposerEffectiveness);
```

## Configuration

Add to `.env`:

```bash
RATED_NETWORK_API_KEY=your_api_key_here
RATED_NETWORK_ENABLED=true
RATED_NETWORK_CACHE_TTL=300  # 5 minutes
RATED_NETWORK_RATE_LIMIT=10   # requests per second
```

Get your API key from: https://console.rated.network/

## Features

### 🔐 Authentication
- Bearer token authentication
- Secure API key management
- HTTPS-only requests

### ⚡ Performance
- Response caching with configurable TTL
- Rate limiting (token bucket algorithm)
- Automatic retry with exponential backoff

### 📊 Data Processing
- Builder data adapter for BuilderRegistry
- Market share validation
- Performance scoring
- Builder rankings

## Usage Examples

See the complete example at: `scripts/examples/rated-network-example.ts`

Run with:
```bash
npm run example:rated-network
```

## Resources

- [Rated Network API Documentation](https://docs.rated.network/rated-api)
- [Rated Network Console](https://console.rated.network/)
- [TheWarden Integration Code](../../src/integrations/rated-network/)

## License

MIT
