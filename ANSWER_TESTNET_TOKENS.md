# 🎯 Quick Answer: Your Question About Testnet Tokens

**Your Question**: "Witch tokes should i add to wallet?"

---

## ⚡ TL;DR - The Answer

For **ANKR bug bounty testing**, you need:

### 1. BSC Testnet Tokens (Primary)
- **tBNB** (Testnet BNB) - For gas fees
- **Amount**: 0.5 - 1.0 tBNB is plenty

### 2. Where to Get It
🔗 **Official BSC Faucet**: https://testnet.bnbchain.org/faucet-smart

**Steps**:
1. Visit the link above
2. Connect your wallet (MetaMask)
3. Complete the captcha
4. Get 0.5 tBNB instantly
5. Wait 24 hours if you need more

### 3. Alternative Faucets (If Official is Empty)
- QuickNode: https://faucet.quicknode.com/binance-smart-chain/bnb-testnet
- Chainlink: https://faucets.chain.link/bnb-testnet
- Alchemy: https://www.alchemy.com/faucets/binance-smart-chain-testnet

---

## 🚀 What to Do Next

### Step 1: Get tBNB (5 minutes)
```bash
# Visit the faucet
https://testnet.bnbchain.org/faucet-smart

# Connect wallet → Get 0.5 tBNB → Done!
```

### Step 2: Configure MetaMask
Add BSC Testnet to MetaMask:
- **Network Name**: BSC Testnet
- **RPC URL**: https://data-seed-prebsc-1-s1.bnbchain.org:8545
- **Chain ID**: 97
- **Currency**: tBNB
- **Explorer**: https://testnet.bscscan.com

### Step 3: Update Your .env
```bash
# Add to your .env file
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
CHAIN_ID=97
DRY_RUN=true
```

### Step 4: Run TheWarden
```bash
# Test on testnet (with your new tBNB)
npm run ankr:attack:testnet

# OR run in safe mode (no funds needed!)
npm run ankr:attack:recon
```

---

## 📚 Want More Details?

- **Quick Start** (5 min): See `TESTNET_QUICK_START.md`
- **Full Guide** (everything): See `docs/TESTNET_TOKEN_GUIDE.md`
- **Node.js 22 Setup**: See `docs/NODE22_SETUP_GUIDE.md`

---

## 💡 Pro Tips

1. **No testnet funds needed for basic testing!**
   - Use `--mode=RECON_ONLY` for read-only mainnet queries
   - 100% safe, no wallet required

2. **Track your progress**
   ```bash
   npm run ankr:session:status  # See your scan history
   npm run ankr:continue        # Auto-continue from last scan
   ```

3. **Found a vulnerability?**
   - Check `.memory/security-testing/` for reports
   - Follow Immunefi submission process
   - Potential reward: Up to $500K per critical finding!

---

## ❓ FAQ

**Q: How much tBNB do I need?**
A: 1-2 tBNB is plenty. Gas fees are very low on testnet.

**Q: Can I use these tokens on mainnet?**
A: No! Testnet tokens have ZERO value and only work on testnet.

**Q: What if the faucet is empty?**
A: Try the alternative faucets listed above, or use `RECON_ONLY` mode (no funds needed).

**Q: Do I need testnet tokens to hunt bugs?**
A: Not necessarily! You can run in `RECON_ONLY` or `MAINNET_DRY_RUN` mode which don't require any funds.

---

## 🎁 Bonus: Auto-Continue Feature

TheWarden can now autonomously continue from where it left off:

```bash
# View your session history
npm run ankr:session:status

# Shows:
# - Total scans performed
# - Blocks scanned
# - Vulnerabilities found
# - Next scheduled scan time

# Auto-continue (runs if 8 hours have passed)
npm run ankr:continue
```

---

**That's it!** You're ready to hunt bugs on ANKR. Get your tBNB and start scanning! 🔍

**Need help?** Check the full guides or ask for assistance.
