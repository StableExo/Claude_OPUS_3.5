# Running TheWarden Autonomously on Mainnet

**Status**: ✅ **OPERATIONAL** - TheWarden is configured for multiple mainnet operations:
- **Arbitrage Mode**: Base mainnet (Chain ID 8453)
- **Bug Hunt Mode**: BSC mainnet (Chain ID 56) - Ankr bug bounty

## Quick Start

```bash
# 1. Ensure Node.js 22+ is installed
nvm use 22

# 2. Verify .env configuration exists
cat .env | head -5

# 3. Run TheWarden autonomously
./TheWarden --stream
```

## Configuration Summary

### Network Configuration

#### Arbitrage Mode (Base)
- **Chain**: Base (Chain ID: 8453)
- **RPC**: Alchemy (Base mainnet)
- **Purpose**: DEX arbitrage opportunities

#### Bug Hunt Mode (BSC)
- **Chain**: BSC (Chain ID: 56)  
- **RPC**: Alchemy (BSC mainnet)
- **Purpose**: Ankr security testing / bug bounty

### Common Configuration
- **Environment**: Production
- **Mode**: DRY_RUN=true (Safe mode - no real transactions)
- **Multi-sig**: Configured for profit allocation

### Trading Parameters
- **Scan Interval**: 800ms
- **Min Profit**: 0.3%
- **Max Gas Price**: 100 gwei
- **Concurrent Operations**: 10

## Execution Methods

### Method 1: Direct Autonomous Runner (Recommended)
```bash
# Run with live log streaming
./TheWarden --stream

# Run in background
./TheWarden

# Run with cached pool data (development only)
./TheWarden --cached

# Run in diagnostic/monitoring mode
./TheWarden --monitor
```

### Method 2: NPM Scripts
```bash
# Start autonomous operation
npm run start:autonomous

# Start with consciousness integration
npm run autonomous:consciousness

# Start monitoring mode
npm run start:monitor
```

### Method 3: Direct TypeScript Execution
```bash
# Using tsx (no build required)
node --import tsx src/main.ts
```

## What's Running

### Active Components
✅ **Dashboard**: http://localhost:3000 (Public)
- Real-time WebSocket updates
- Analytics and monitoring
- Live event stream

✅ **Consciousness System**
- Sensory Memory
- Temporal Awareness Framework
- Perception Stream
- Metacognition

✅ **Phase 3 AI Integration**
- Strategy RL Agent (learning rate: 0.1)
- Opportunity NN Scorer
- Strategy Evolution Engine (20 variants)

✅ **Security Components**
- Bloodhound Scanner (10 detection patterns)
- Threat Response Engine (auto-respond enabled)
- Security Pattern Learner

✅ **MEV Intelligence**
- Flashbots integration
- Private RPC support
- MEV risk assessment

### Arbitrage Scanning
- **DEXes Monitored**: 16 (Uniswap V3, Aerodrome, BaseSwap, SushiSwap V3, PancakeSwap V3, Velodrome, Curve, Balancer, and more)
- **Tokens Tracked**: 9 (WETH, USDC, USDbC, DAI, cbETH, AERO, cbBTC, USDT, WSTETH)
- **Scan Frequency**: Every 800ms
- **Path Finding**: Multi-hop arbitrage paths

## Current Status

### ✅ Working Features
- Dashboard server on port 3000
- RPC connection to Base mainnet
- Pool discovery (V3 pools detected)
- Scanning cycles (70+ cycles in 90 seconds)
- Consciousness coordination
- Long-running process manager
- Health monitoring

### ⚠️ Known Limitations
- **Wallet Balance**: 0 ETH (requires funding for actual trading)
- **CEX Connectors**: Binance returns 451 (geo-blocked), OKX timeout expected in some environments
- **Pool Fetching**: Some pools timeout (30s limit) - consider running `npm run preload:pools`

## Performance Optimization

### Speed Up Pool Discovery
```bash
# Preload and cache pool data
npm run preload:pools -- --chain 8453

# Force refresh cache
npm run preload:pools:force -- --chain 8453
```

This will cache pool data and significantly speed up startup time.

### Monitor Performance
```bash
# Check logs
tail -f logs/warden-output.log

# Check status
npm run status

# View configuration
npm run config:memory
```

## Safety Features

### Circuit Breakers (Active)
- Max loss per trade: 0.005 ETH
- Max consecutive failures: 5
- Cooldown period: 5 minutes

### Emergency Stops (Active)
- Max slippage: 5%
- Min wallet balance: 0.002 ETH

### Position Limits
- Max position size: 50% of balance
- Min position size: 0.01 ETH
- Max trades per hour: 100
- Max daily loss: 0.01 ETH

## Production Checklist

Before running with DRY_RUN=false:

- [ ] Fund wallet with sufficient ETH for gas
- [ ] Test with small amounts first
- [ ] Monitor dashboard at http://localhost:3000
- [ ] Set up alerts (optional)
- [ ] Review profit allocation (70% to tithe wallet)
- [ ] Verify RPC endpoints are stable
- [ ] Run preload:pools to cache data
- [ ] Test emergency stop procedures

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change the port in .env
PORT=3001
DASHBOARD_PORT=3001
```

### Pool Fetch Timeouts
```bash
# Increase timeout in .env
POOL_FETCH_TIMEOUT=60000  # 60 seconds

# Or use preloaded pools
npm run preload:pools -- --chain 8453
```

### RPC Connection Issues
```bash
# Check RPC endpoint
curl https://base-mainnet.g.alchemy.com/v2/iJWWoZyYwlakePscXLoEM

# Use backup RPC in .env
BASE_RPC_URL=https://mainnet.base.org
```

## Logs

All logs are stored in the `logs/` directory:
- `logs/warden-output.log` - Main TheWarden output
- `logs/autonomous-run.log` - Runner script logs
- `logs/arbitrage.log` - Trading activity

## Stopping TheWarden

```bash
# If running in foreground: Ctrl+C

# If running in background:
kill $(cat logs/warden.pid)

# Or use the status script to find PID
npm run status
kill <PID>
```

## Next Steps

1. **Fund Wallet**: Transfer ETH to 0x4c1b46Be097024E5712EB3f97b46D2ECf2b531d7 for gas
2. **Test Run**: Keep DRY_RUN=true and verify scanning finds opportunities
3. **Optimize**: Run `npm run preload:pools` to cache pool data
4. **Monitor**: Watch the dashboard at http://localhost:3000
5. **Go Live**: Set DRY_RUN=false when ready (⚠️ REAL MONEY!)

---

**Last Updated**: December 16, 2025
**Version**: 5.1.0
**Status**: Operational on Base Mainnet (Dry Run Mode)
