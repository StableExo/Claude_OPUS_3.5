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
```

Get your API key from: https://console.rated.network/

## Documentation

See [RATED_NETWORK_INTEGRATION.md](./RATED_NETWORK_INTEGRATION.md) for complete documentation.

## License

MIT
