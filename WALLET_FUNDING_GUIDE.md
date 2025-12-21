# Wallet Funding Guide - Base Network Gas

## 🎯 Current Status

**Problem:** Wallet needs ETH on Base network for gas fees  
**Required:** Minimum 0.001 ETH (~$2.70 USD) for initial operations  
**Recommended:** 0.01 ETH (~$27 USD) for 2-3 weeks of autonomous operation

## 📊 Gas Economics on Base Network

**Why Base Network is Ideal:**
- Gas cost per transaction: ~0.000001 ETH (~$0.003 USD)
- 100x cheaper than Ethereum mainnet
- Predictable, low gas prices
- Perfect for autonomous arbitrage

**Funding Breakdown:**
```
0.001 ETH = ~1,000 transactions = ~3-5 days of operation
0.01 ETH  = ~10,000 transactions = ~3-4 weeks of operation
0.1 ETH   = ~100,000 transactions = ~6-8 months of operation
```

## 🚀 How to Fund Your Wallet

### Option 1: Bridge from Ethereum Mainnet (Recommended)

**Official Base Bridge:**
1. Visit: https://bridge.base.org/
2. Connect your wallet (MetaMask, WalletConnect, etc.)
3. Select: Ethereum → Base
4. Amount: Enter at least 0.001 ETH
5. Confirm: Review fees (~$1-3) and confirm
6. Wait: 5-10 minutes for bridge completion

**Pros:** Official, secure, direct
**Cons:** Requires ETH on mainnet + bridge fee

### Option 2: Withdraw from Centralized Exchange

**Supported Exchanges:**
- Coinbase (native Base support)
- Binance (Base network available)
- Kraken (Base withdrawals)
- OKX (Base network option)

**Steps:**
1. Login to your exchange
2. Go to Withdraw → ETH
3. Select Network: **Base** (NOT Ethereum!)
4. Enter wallet address: `0x...` (from your .env WALLET_PRIVATE_KEY)
5. Amount: 0.01 ETH minimum
6. Confirm withdrawal (typically 5-15 minutes)

**Pros:** Simple, no bridge fee, direct to Base
**Cons:** Requires exchange account, KYC

### Option 3: Use a Faucet (Testnet Only)

**For Testing on Base Sepolia Testnet:**
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-sepolia-faucet
- Alchemy Base Sepolia: https://www.alchemy.com/faucets/base-sepolia

**Note:** Faucets only work on testnet, not mainnet!

### Option 4: Swap on Base

**If you already have tokens on Base:**
1. Use Uniswap: https://app.uniswap.org/
2. Connect wallet, select Base network
3. Swap USDC/USDT/DAI → ETH
4. Minimum: 0.001 ETH

## ✅ Verify Wallet Funding

Once funded, verify your wallet balance:

```bash
# Quick check
node --import tsx -e "
import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY || '', provider);
const balance = await provider.getBalance(wallet.address);
console.log('Wallet:', wallet.address);
console.log('Balance:', ethers.formatEther(balance), 'ETH');
console.log('USD Value:', (parseFloat(ethers.formatEther(balance)) * 2700).toFixed(2), 'USD (approx)');
console.log('Transactions:', Math.floor(parseFloat(ethers.formatEther(balance)) * 1000000), 'estimated');
"
```

## 🔐 Security Best Practices

1. **Use a Dedicated Wallet:**
   - Don't use your main wallet for bot operations
   - Create a new wallet specifically for TheWarden
   - Only fund with what you're willing to risk

2. **Verify the Address:**
   - Always double-check the wallet address
   - Test with a small amount first (0.001 ETH)
   - Verify on BaseScan: https://basescan.org/address/YOUR_ADDRESS

3. **Monitor Balance:**
   - Set up low-balance alerts
   - Keep track of gas spending
   - Replenish before running out

## 📋 Pre-Launch Checklist

After funding, verify these items:

- [ ] Wallet has at least 0.001 ETH on Base network
- [ ] Wallet address matches .env configuration
- [ ] RPC endpoint is accessible (BASE_RPC_URL)
- [ ] Contracts are deployed and verified
- [ ] System health check passes
- [ ] Ready to launch Phase 1 Action 2

## 🚨 Common Issues

### "Insufficient funds for gas"
**Solution:** Fund wallet with at least 0.001 ETH on Base network

### "Wrong network" 
**Solution:** Ensure you're bridging/withdrawing to Base (8453), not Ethereum

### "Transaction failed"
**Solution:** Check RPC endpoint, verify network is Base, ensure wallet is funded

### "Can't see balance"
**Solution:** Wait 5-10 minutes after funding, refresh, check BaseScan

## 📊 Expected Gas Usage

**Per Transaction Type:**
- Pool scan: 0 ETH (read-only)
- Opportunity detection: 0 ETH (off-chain)
- Transaction simulation: 0 ETH (local)
- Actual arbitrage: ~0.000001-0.00001 ETH (on-chain)

**Daily Operations:**
- Conservative: 5-10 transactions/day = 0.00001 ETH/day
- Active: 20-50 transactions/day = 0.0001 ETH/day
- Aggressive: 100+ transactions/day = 0.001 ETH/day

**Monthly Budget:**
- Minimum: 0.003 ETH (~$8 USD)
- Recommended: 0.01 ETH (~$27 USD)
- Optimal: 0.03 ETH (~$81 USD)

## 🎯 Next Steps

Once wallet is funded:

1. **Verify Balance:**
   ```bash
   npm run check:balance
   ```

2. **Run Health Check:**
   ```bash
   npm run health:check
   ```

3. **Launch Phase 1 Action 2:**
   ```bash
   node --import tsx scripts/implementation/phase1-action2-base-launch.ts
   ```

4. **Monitor Operations:**
   ```bash
   tail -f logs/warden.log
   ```

## 🔗 Useful Links

- **Base Network:** https://base.org/
- **Base Bridge:** https://bridge.base.org/
- **BaseScan (Explorer):** https://basescan.org/
- **Base Docs:** https://docs.base.org/
- **Gas Tracker:** https://basescan.org/gastracker

---

**Remember:** Base network gas is extremely cheap (~$0.003/tx), so a small amount goes a long way!
