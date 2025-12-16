# Base Network Deployment Checklist

**Quick reference for deploying TheWarden on Base network**

---

## ✅ Pre-Deployment Checklist

### Environment Configuration

- [ ] **CHAIN_ID=8453** (Base mainnet)
- [ ] **BASE_RPC_URL** configured (Chainstack or fallback)
- [ ] **CHAINSTACK_BASE_WSS** configured for WebSocket
- [ ] **WALLET_PRIVATE_KEY** set (0x prefix required)
- [ ] **FLASHSWAP_V2_ADDRESS** deployed contract
- [ ] **DRY_RUN=true** for initial testing

### Network Settings

- [ ] **ENABLE_WEBSOCKET_MONITORING=true**
- [ ] **BASE_WEBSOCKET_ENABLED=true**
- [ ] **WS_SUBSCRIBE_BLOCKS=true**
- [ ] **WS_SUBSCRIBE_PENDING_TXS=true**
- [ ] **WS_SUBSCRIBE_LOGS=true**

### Gas Optimization

- [ ] **MAX_GAS_PRICE=0.5** (0.5 gwei max for Base)
- [ ] **GAS_MULTIPLIER=1.1** (10% buffer)
- [ ] **MAX_GAS_COST_PERCENTAGE=5** (only 5% of profit)

### Profitability

- [ ] **MIN_PROFIT_THRESHOLD=0.15** (0.15% minimum)
- [ ] **MIN_PROFIT_PERCENT=0.3** (0.3% target)
- [ ] **MIN_PROFIT_ABSOLUTE=0.001** (very low absolute minimum)

### Liquidity Thresholds

- [ ] **MIN_LIQUIDITY_V3=1000000000000** (10^12)
- [ ] **MIN_LIQUIDITY_V3_LOW=100000000000** (10^11)
- [ ] **MIN_LIQUIDITY_V2=1000000000000000** (10^15)

### Performance

- [ ] **SCAN_INTERVAL=800** (800ms between scans)
- [ ] **CONCURRENCY=10** (10 parallel operations)
- [ ] **TARGET_THROUGHPUT=10000** (10k ops/sec)
- [ ] **SCAN_CHAINS=8453** (Base only)

### Safety Systems

- [ ] **CIRCUIT_BREAKER_ENABLED=true**
- [ ] **CIRCUIT_BREAKER_MAX_CONSECUTIVE_FAILURES=5**
- [ ] **EMERGENCY_STOP_ENABLED=true**
- [ ] **MAX_POSITION_SIZE=0.5** (50% max)

### DEX Configuration

- [ ] **ENABLE_UNISWAP_V3=true**
- [ ] **ENABLE_SUSHISWAP=true**
- [ ] **ENABLE_PANCAKESWAP=true**
- [ ] **ENABLE_CURVE=true**
- [ ] **ENABLE_BALANCER=true**

### Optional Features

- [ ] **ENABLE_CEX_MONITOR=true** (for CEX-DEX arbitrage)
- [ ] **ENABLE_COINMARKETCAP=true** (price data)
- [ ] **RATED_NETWORK_ENABLED=true** (builder metrics)
- [ ] **USE_PRELOADED_POOLS=true** (faster startup)

---

## 🚀 Deployment Steps

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit with your keys
nano .env

# Verify configuration
npm run validate-env
```

### 2. Install Dependencies

```bash
# Use Node 22+
nvm install 22
nvm use 22

# Install packages
npm install

# Build project
npm run build
```

### 3. Test RPC Connection

```bash
# Quick RPC test
npm run check:rpc

# WebSocket test
# (should connect to Chainstack WSS)
```

### 4. Preload Pools (Optional)

```bash
# Preload Base pools for faster startup
npm run preload:pools -- --chain 8453

# Force refresh
npm run preload:pools -- --chain 8453 --force
```

### 5. Dry Run Test

```bash
# Start in dry run mode
./scripts/start-base-optimized.sh --dry-run

# OR
DRY_RUN=true npm run start
```

### 6. Monitor for 24 Hours

```bash
# Check logs
tail -f logs/base-startup.log

# Check health
curl http://localhost:8080/health/live

# Check metrics
# (watch dashboard or logs for opportunities)
```

### 7. Optimize Parameters

Based on dry run results:

```bash
# If no opportunities found
# → Lower liquidity thresholds

# If too many low-quality opportunities
# → Raise profit thresholds

# If gas too high
# → Lower MAX_GAS_PRICE

# If missing opportunities
# → Decrease SCAN_INTERVAL
```

### 8. Go Live (When Ready)

```bash
# ⚠️  REAL MONEY MODE
./scripts/start-base-optimized.sh --live

# OR
DRY_RUN=false MAINNET_DRY_RUN=false npm run start
```

---

## 🔍 Validation Commands

### Environment Check

```bash
# Validate all variables
npm run validate-env

# Check mainnet config
npm run validate-mainnet

# Verify private key format
npm run verify-key
```

### Network Check

```bash
# Test RPC connectivity
npm run check:rpc

# Check port availability
npm run check:ports

# Test pool detection
npm run test:pools
```

### Readiness Check

```bash
# Comprehensive readiness check
npm run check:readiness

# Wait for readiness
npm run check:readiness:wait
```

---

## 📊 Success Criteria

### Before Going Live

- [ ] Dry run completes without errors
- [ ] Opportunities detected (10+ per day)
- [ ] Gas calculations accurate (<$0.10 per trade)
- [ ] No RPC/WebSocket errors
- [ ] Pool discovery working (50+ pools)
- [ ] Success rate >60% in simulations

### During Live Operation

- [ ] Transactions executing successfully
- [ ] Gas costs within expected range
- [ ] Profit margins as calculated
- [ ] No circuit breaker trips
- [ ] RPC latency <100ms
- [ ] WebSocket stable connection

---

## ⚠️ Common Issues

### Issue: No Opportunities Found

**Causes:**
- Liquidity thresholds too high
- Profit thresholds too high
- Wrong chain ID
- DEXes not enabled

**Solutions:**
```bash
# Lower thresholds
export MIN_LIQUIDITY_V3=100000000000
export MIN_PROFIT_THRESHOLD=0.1

# Verify chain
echo $CHAIN_ID  # Should be 8453

# Enable all DEXes
export ENABLE_UNISWAP_V3=true
export ENABLE_SUSHISWAP=true
# ... etc
```

### Issue: RPC Errors

**Causes:**
- Invalid API key
- Rate limiting
- Network issues

**Solutions:**
```bash
# Switch to fallback
export BASE_RPC_URL=https://mainnet.base.org

# Or use another backup
export BASE_RPC_URL=https://base.llamarpc.com

# Reduce rate
export RPC_RATE_LIMIT=5000
```

### Issue: High Gas Costs

**Causes:**
- MAX_GAS_PRICE too high
- Network congestion
- Wrong gas oracle

**Solutions:**
```bash
# Set strict limit
export MAX_GAS_PRICE=0.3  # 0.3 gwei max

# Base rarely exceeds 0.1 gwei under normal conditions
```

### Issue: WebSocket Disconnections

**Causes:**
- Network instability
- Firewall blocking WSS
- Server timeout

**Solutions:**
```bash
# Increase reconnect attempts
export WS_MAX_RECONNECT_ATTEMPTS=20
export WS_RECONNECT_DELAY=3000

# Shorter heartbeat
export WS_HEARTBEAT_INTERVAL=15000
```

---

## 🎯 Performance Targets

### Gas Efficiency

- **Target:** <$0.10 per trade
- **Acceptable:** <$0.20 per trade
- **Alert:** >$0.50 per trade

### Profitability

- **Target:** 0.5% average profit per trade
- **Acceptable:** 0.3% average profit
- **Alert:** <0.15% average profit

### Success Rate

- **Target:** >70% success rate
- **Acceptable:** >60% success rate
- **Alert:** <50% success rate

### Latency

- **Target:** <50ms RPC latency
- **Acceptable:** <100ms RPC latency
- **Alert:** >200ms RPC latency

### Uptime

- **Target:** 99.9% uptime
- **Acceptable:** 99% uptime
- **Alert:** <95% uptime

---

## 📞 Support Resources

### Documentation

- **Main Guide:** `docs/BASE_NETWORK_OPTIMIZATION.md`
- **Rollup-Boost:** `docs/ROLLUP_BOOST_INTEGRATION.md`
- **Gas Advantage:** `docs/BASE_GAS_FEE_ADVANTAGE.md`
- **Mainnet Guide:** `docs/MAINNET_DEPLOYMENT.md`

### Configuration

- **Network Config:** `configs/networks/base-optimized.json`
- **Chain Config:** `configs/chains/networks.json`
- **Strategy:** `configs/strategies/base_weth_usdc.json`

### Scripts

- **Startup:** `scripts/start-base-optimized.sh`
- **Status:** `scripts/status.sh`
- **Pools:** `npm run preload:pools -- --chain 8453`

### Logs

- **Startup:** `logs/base-startup.log`
- **Main:** `logs/arbitrage.log`
- **Health:** Check `/health/live` endpoint

---

## ✨ Quick Commands Reference

```bash
# Start (dry run)
./scripts/start-base-optimized.sh --dry-run

# Start (live)
./scripts/start-base-optimized.sh --live

# Preload pools
npm run preload:pools -- --chain 8453

# Check health
curl http://localhost:8080/health/live

# View logs
tail -f logs/base-startup.log

# Check status
./scripts/status.sh

# Stop
kill $(cat logs/warden.pid)
```

---

**Remember:** Base is 1600x cheaper than Ethereum. Start small, learn fast, scale organically. 🚀
