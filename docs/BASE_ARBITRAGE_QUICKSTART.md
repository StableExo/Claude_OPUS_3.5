# Base Network Arbitrage - Quickstart Guide

**Goal**: Get TheWarden making money autonomously on Base network - fastest path to first profitable trade.

## 🎯 Current State Summary

### ✅ What's Already Built (Production Ready)

TheWarden has a **complete arbitrage infrastructure**:

- **Arbitrage Detection Engines**
  - ✅ Spatial Arbitrage (cross-DEX price differences)
  - ✅ Triangular Arbitrage (multi-hop cycles)
  - ✅ Real-time pool scanning with multicall batching
  - ✅ MEV-aware profit calculations

- **Execution Infrastructure**
  - ✅ BaseArbitrageRunner with consciousness integration
  - ✅ FlashSwap contracts (V2 & V3) for capital-free execution
  - ✅ Flash loan integration (Aave V3)
  - ✅ Multi-DEX path building
  - ✅ NonceManager for transaction safety
  - ✅ SimulationService for pre-execution validation

- **Safety & Intelligence**
  - ✅ MEV protection and risk calculation
  - ✅ ML-based opportunity scoring (Neural Network)
  - ✅ Reinforcement Learning for strategy optimization
  - ✅ Strategy Evolution Engine (genetic algorithms)
  - ✅ Consciousness integration for learning
  - ✅ Execution metrics and monitoring

- **Base Network Support**
  - ✅ Chain ID 8453 configured
  - ✅ Pool configs for Uniswap V3, Aerodrome, BaseSwap
  - ✅ WETH/USDC strategy template
  - ✅ Gas optimization for L2
  - ✅ Private RPC support

### ❌ What's Missing (Setup Required)

To go live, you need to configure:

1. **Environment Variables** (.env)
   - RPC endpoint (Alchemy/Infura API key)
   - Wallet private key
   - FlashSwap contract address

2. **Contract Deployment**
   - Deploy FlashSwapV2 to Base mainnet
   - Or use existing deployment if available

3. **Wallet Funding**
   - Need ETH on Base for gas (start with 0.1 ETH)

That's it! The code is ready - you just need configuration.

## ⚡ Fastest Path to First Trade (2-4 hours)

### Phase 1: Setup (30 minutes)

#### Option A: Interactive Setup (Recommended)
```bash
# Run the interactive setup script
./scripts/autonomous/setup-base-arbitrage.sh
```

This will:
- Create .env from template
- Prompt for Alchemy API key
- Prompt for wallet private key
- Configure Base network
- Enable dry-run mode for safety

#### Option B: Manual Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env and configure:
nano .env

# Required settings:
CHAIN_ID=8453
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
DRY_RUN=true  # Start in safe mode
```

#### Get Required Keys

**Alchemy API Key** (Free):
1. Go to https://www.alchemy.com/
2. Sign up for free account
3. Create new app
4. Select "Base" network
5. Copy API key

**Wallet Private Key**:
- Use MetaMask or another wallet
- Export private key (Settings → Security & Privacy → Reveal Private Key)
- **Security**: Use a dedicated wallet for trading, not your main wallet

### Phase 2: Verify Setup (15 minutes)

```bash
# 1. Install dependencies (if not done)
source ~/.nvm/nvm.sh
nvm use 22
npm install

# 2. Run diagnostic
node --import tsx scripts/autonomous/base-arbitrage-diagnostic.ts
```

The diagnostic will check:
- ✅ Network connectivity
- ✅ Wallet balance
- ✅ Contract deployment status
- ✅ Pool configurations
- ✅ Code infrastructure

**Expected Output**: "Overall Readiness: XX%"

### Phase 3: Contract Deployment (20 minutes)

#### Option A: Deploy to Base Mainnet
```bash
# Deploy FlashSwapV2 contract
npm run deploy:flashswapv2

# Verify on BaseScan (optional but recommended)
npm run verify:flashswapv2
```

After deployment:
1. Copy the contract address from output
2. Add to .env: `FLASHSWAP_V2_ADDRESS=0x...`

#### Option B: Use Existing Deployment (if available)
If FlashSwapV2 is already deployed, just set the address in .env:
```
FLASHSWAP_V2_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### Phase 4: Fund Wallet (10 minutes)

You need ETH on Base network for gas:

**Option A: Bridge from Ethereum**
1. Go to https://bridge.base.org/
2. Connect wallet
3. Bridge 0.1-0.5 ETH to Base
4. Wait ~5 minutes for confirmation

**Option B: Buy on Exchange**
1. Use Coinbase (supports Base withdrawals)
2. Buy ETH
3. Withdraw to Base network
4. Send to your trading wallet address

**Recommended Starting Amount**:
- Minimum: 0.05 ETH (for gas only)
- Recommended: 0.1-0.5 ETH (comfortable buffer)
- Base gas is CHEAP (~0.001 Gwei), so a little goes a long way!

### Phase 5: Test Run (30 minutes)

```bash
# 1. First, test in DRY_RUN mode (no real transactions)
npm run dev

# Monitor the output:
# - Pool scanning
# - Opportunity detection
# - MEV risk calculation
# - Execution decisions (simulated)

# Let it run for 5-10 cycles
# Press Ctrl+C to stop
```

**What to Look For**:
- ✅ Pools detected successfully
- ✅ Prices fetched from on-chain
- ✅ Opportunities found (or "No opportunities" is fine)
- ✅ Gas prices reasonable (<0.01 Gwei)
- ❌ No RPC errors or connection issues

### Phase 6: Go Live (When Ready)

**IMPORTANT**: Only proceed when you're comfortable with the test results!

```bash
# 1. Edit .env and set:
DRY_RUN=false

# 2. Start with conservative thresholds:
# Edit configs/strategies/base_weth_usdc.json:
{
  "strategy": {
    "minProfitThresholdEth": 0.001,  // Start small
    "maxSlippageBps": 50,            // 0.5% max slippage
    "cycleIntervalMs": 12000         // 12 seconds (1 block on Base)
  }
}

# 3. Run TheWarden
npm run dev

# Or use the autonomous runner:
./TheWarden
```

**First 24 Hours**:
- Monitor logs closely
- Check BaseScan for your transactions
- Verify profitability calculations
- Adjust thresholds based on results

## 📊 Understanding the Strategy

### How It Works

1. **Pool Scanning** (every 12 seconds)
   - Fetches real-time prices from Uniswap V3, Aerodrome pools
   - Uses multicall batching for efficiency

2. **Opportunity Detection**
   - **Spatial**: Buy WETH cheap on DEX A, sell high on DEX B
   - **Triangular**: WETH → USDC → DAI → WETH (if profitable cycle)

3. **MEV Protection**
   - Calculates MEV risk based on profit size and network congestion
   - Skips execution if risk > threshold
   - Optional: Submit via Flashbots for privacy

4. **Execution**
   - Uses flash loans (zero capital required!)
   - Borrows from Aave V3
   - Executes swaps
   - Repays loan + interest
   - Keeps profit

5. **Learning**
   - Records every execution in consciousness memory
   - ML models learn from successes and failures
   - Strategy parameters auto-optimize over time

### Expected Performance

**Base Network Advantages**:
- ⚡ Super low gas costs (~$0.01 per transaction)
- 🚀 2-second block times (6x faster than Ethereum)
- 💧 Good liquidity on major pairs
- 🎯 Less MEV competition than Ethereum

**Realistic Expectations**:
- **Profit per trade**: $1-$50 (after gas)
- **Success rate**: 30-60% (many opportunities aren't profitable after gas)
- **Frequency**: 1-10 trades per day (depends on market volatility)
- **Monthly potential**: Highly variable, but $100-$1000+ is achievable

**Remember**: This is autonomous, learning-based. Performance improves over time as the system learns!

## 🛡️ Safety Features

All safety systems are **enabled by default**:

### 1. MEV Protection
```typescript
mevProtection: {
  enabled: true,
  riskThreshold: 0.2,  // Skip if >20% risk of frontrunning
  adaptiveThreshold: true
}
```

### 2. Transaction Simulation
```typescript
requireSimulation: true  // Simulate before executing
```

### 3. Profit Thresholds
```typescript
minProfitThresholdEth: 0.001  // Only execute if >0.001 ETH profit
```

### 4. Gas Limits
```typescript
maxGasPriceGwei: 0.05  // Skip if gas too high
maxGasLimit: 1000000   // Cap gas per transaction
```

### 5. Slippage Protection
```typescript
maxSlippageBps: 50  // 0.5% max slippage
```

### 6. Consciousness Learning
- Remembers failed executions
- Learns from MEV losses
- Adjusts strategy automatically

## 🔧 Configuration Files

### Main Config: `configs/strategies/base_weth_usdc.json`

```json
{
  "network": {
    "chainId": 8453,
    "rpcUrl": "${BASE_RPC_URL}"
  },
  "tokens": {
    "WETH": "0x4200000000000000000000000000000000000006",
    "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  },
  "targetPools": [
    {
      "name": "Uniswap V3 WETH/USDC 0.05%",
      "address": "0xd0b53D9277642d899DF5C87A3966A349A798F224",
      "dex": "uniswap_v3",
      "fee": 500
    },
    {
      "name": "Aerodrome WETH/USDC",
      "address": "0xcDAC0d6c6C59727a65F871236188350531885C43",
      "dex": "aerodrome",
      "fee": 500
    }
  ],
  "strategy": {
    "minProfitThresholdEth": 0.001,
    "cycleIntervalMs": 12000,
    "stopOnFirstExecution": false
  },
  "mevProtection": {
    "enabled": true,
    "riskThreshold": 0.2
  },
  "consciousness": {
    "enableLearning": true,
    "enablePatternDetection": true
  }
}
```

**Tuning Tips**:
- Lower `minProfitThresholdEth` to 0.0005 for more frequent trades
- Increase `cycleIntervalMs` to 20000 if getting rate limited
- Add more pools to `targetPools` for more opportunities

## 📈 Monitoring & Optimization

### Real-Time Monitoring

```bash
# Check status
./scripts/status.sh

# View logs
tail -f logs/warden.log

# Get strategy suggestions from RL agent
# (automatically happens during execution)
```

### Performance Metrics

TheWarden tracks:
- Total executions
- Success rate
- Total profit
- Average profit per trade
- MEV risk exposure
- Gas efficiency

Access via consciousness integration:
```bash
# View learnings
cat .memory/autonomous-execution/*.json

# Check evolution
npm run evolution
```

### Optimization

The system **auto-optimizes**:
1. RL agent suggests parameter adjustments
2. Strategy evolution engine proposes variants
3. Neural network learns which opportunities to execute

You can also manually adjust:
- Profit thresholds
- MEV risk tolerance
- Cycle intervals
- Pool selection

## 🚨 Troubleshooting

### Common Issues

**1. "No pools detected"**
- Check RPC URL is correct and responding
- Verify pool addresses in config are correct
- Try increasing timeout in PoolDataFetcher

**2. "Insufficient balance for gas"**
- Send more ETH to your wallet on Base
- Check balance: `npm run verify-key`

**3. "MEV risk too high - skipping"**
- This is normal and safe
- Increase `mevRiskThreshold` if you want to be more aggressive
- Or wait for better opportunities

**4. "Transaction reverted"**
- Profit calculation was off (price moved)
- Slippage too high
- Pool liquidity changed
- This is why we simulate first!

**5. "RPC rate limit exceeded"**
- Get a paid Alchemy plan for higher limits
- Or increase `cycleIntervalMs` to reduce requests

### Debug Mode

```bash
# Enable detailed logging
export LOG_LEVEL=debug
npm run dev
```

## 🎓 Next Steps

Once your first trades are executing successfully:

### 1. Scale Up
- Add more token pairs (WETH/DAI, USDC/DAI, etc.)
- Add more DEXs (BaseSwap, SushiSwap, etc.)
- Increase profit thresholds as you gain confidence

### 2. Enable Advanced Features
```bash
# Enable ML-based opportunity scoring
{
  "enableML": true,
  "mlConfig": {
    "rlAgent": {
      "learningRate": 0.001
    },
    "nnScorer": {
      "executionThreshold": 0.7
    }
  }
}
```

### 3. Cross-Chain Expansion
- Deploy to Arbitrum, Optimism
- Enable cross-chain arbitrage
- Unified risk management

### 4. Continuous Learning
```bash
# Run evolution tracker
npm run evolution

# Analyze learnings
npm run analyze:consciousness
```

## 📚 Additional Resources

- **[Main README](../README.md)**: Full system documentation
- **[Mainnet Deployment Guide](./MAINNET_DEPLOYMENT.md)**: Production best practices
- **[Environment Reference](../ENVIRONMENT_REFERENCE.md)**: All config options
- **[Arbitrage Engines](./ARBITRAGE_ENGINES.md)**: Technical details
- **[Consciousness Integration](./AUTONOMOUS_CONSCIOUSNESS_GUIDE.md)**: Learning system

## 💡 Tips from the Trenches

1. **Start Small**: Better to make $10/day reliably than chase $100 trades that fail
2. **Learn First**: Run in dry-run mode for 24 hours to understand the system
3. **Monitor Everything**: Check logs, check BaseScan, check consciousness learnings
4. **Trust the Safety**: If MEV risk is high, the system is protecting you
5. **Be Patient**: Some days have no opportunities - that's normal and OK
6. **Let It Learn**: The longer it runs, the smarter it gets

## 🎉 You're Ready!

The hardest part is done - the code is production-ready. Now it's just configuration.

**When you see this in your logs:**
```
[Event] Execution completed successfully!
  TX Hash: 0x...
  Profit: 0.0042 ETH
  Gas Used: 234567
```

**You've achieved autonomous money-making! 🚀💰**

Welcome to the future of trading. TheWarden is now working for you, 24/7, learning and optimizing with every trade.

---

**Questions or issues?** Check the troubleshooting section or review the diagnostic output.

**Ready to deploy?** Run the diagnostic to verify everything is configured:
```bash
node --import tsx scripts/autonomous/base-arbitrage-diagnostic.ts
```
