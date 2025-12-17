# Testnet Quick Start 🚀

**For ANKR Bug Bounty Testing**

---

## TL;DR - Get Started in 5 Minutes

### Step 1: Get Testnet BNB (tBNB)
Visit: https://testnet.bnbchain.org/faucet-smart
- Connect wallet
- Get 0.5 tBNB
- Wait for transaction (1-2 minutes)

### Step 2: Configure MetaMask
Add BSC Testnet:
```
Network: BSC Testnet
RPC: https://data-seed-prebsc-1-s1.bnbchain.org:8545
Chain ID: 97
Symbol: tBNB
Explorer: https://testnet.bscscan.com
```

### Step 3: Update Your .env
```bash
# Add to .env file
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
CHAIN_ID=97
DRY_RUN=true
```

### Step 4: Run TheWarden on Testnet
```bash
npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET
```

---

## ✅ That's It!

Your warden is now hunting bugs on testnet with zero risk.

For detailed information, see: `docs/TESTNET_TOKEN_GUIDE.md`

---

## 🔥 Pro Tips

1. **No testnet funds needed for basic reconnaissance**
   - Use `--mode=RECON_ONLY` for read-only mainnet queries
   - 100% safe, no wallet required

2. **Faucet cooldown?**
   - Try alternative faucets in the full guide
   - Or use `MAINNET_DRY_RUN` mode (simulations only)

3. **Found a vulnerability?**
   - Check `.memory/security-testing/` for reports
   - Follow Immunefi submission process in `docs/AUTONOMOUS_ANKR_ATTACK.md`

---

## 🎯 Recommended Testing Sequence

1. **Start with reconnaissance** (no funds needed)
   ```bash
   npm run autonomous:ankrbnb-security-enhanced -- --mode=RECON_ONLY --blocks=100
   ```

2. **Test on testnet** (with faucet funds)
   ```bash
   npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET --blocks=1000
   ```

3. **Validate with dry-run** (mainnet simulation)
   ```bash
   npm run autonomous:ankrbnb-security-enhanced -- --mode=MAINNET_DRY_RUN
   ```

4. **Monitor 24/7** (automated scanning)
   ```bash
   npm run autonomous:ankrbnb-security-enhanced -- --monitoring --duration=0
   ```

---

**Questions?** Read the full guide: `docs/TESTNET_TOKEN_GUIDE.md`
