# Testnet Token Acquisition Guide 🪙

**Last Updated**: December 16, 2024  
**Purpose**: Guide for acquiring testnet tokens for TheWarden testing and ANKR bug bounty work

---

## 🎯 Quick Answer: Which Tokens Should I Add?

For ANKR bug bounty testing on **BSC (Binance Smart Chain)**, you need:

### Primary Testnet: BSC Testnet
- **tBNB** (Testnet BNB) - For gas fees
- **Test ankrBNB** (if available on testnet)
- **Test USDT/USDC** - For swap testing

### Secondary Testnet: Base Sepolia
- **Sepolia ETH** - For gas fees on Base testnet
- **Test WETH** - Wrapped ETH for testing
- **Test USDC** - For swap/arbitrage testing

---

## 🔥 BSC Testnet (Primary for ANKR Testing)

### What is BSC Testnet?
BSC Testnet is a test network for Binance Smart Chain where you can test contracts and transactions without spending real money.

### Getting tBNB (Testnet BNB)

#### Method 1: Official BSC Faucet
1. **Visit**: https://testnet.bnbchain.org/faucet-smart
2. **Requirements**:
   - Connect your wallet (MetaMask/WalletConnect)
   - Complete captcha verification
   - **Amount**: 0.5 tBNB per request
   - **Cooldown**: 24 hours between requests

#### Method 2: Alternative Faucets
1. **QuickNode Faucet**
   - **URL**: https://faucet.quicknode.com/binance-smart-chain/bnb-testnet
   - **Amount**: 0.1-0.5 tBNB
   - **Requirements**: Twitter/Discord verification

2. **Chainlink Faucet**
   - **URL**: https://faucets.chain.link/bnb-testnet
   - **Amount**: 0.1 tBNB + Test LINK
   - **Requirements**: Login with wallet

3. **Alchemy Faucet**
   - **URL**: https://www.alchemy.com/faucets/binance-smart-chain-testnet
   - **Amount**: 0.5 tBNB per day
   - **Requirements**: Free Alchemy account

### Getting Test Tokens (USDT, USDC, etc.)

#### Pancake Swap Testnet
1. Get tBNB first (see above)
2. Visit: https://pancake.kiemtienonline360.com/ (Testnet version)
3. Swap tBNB for test tokens

#### BSC Testnet Token Contracts
Common test tokens on BSC Testnet:
```
tBNB:  Native token (use faucet)
tBUSD: 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee
tUSDT: 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684
tDAI:  0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867
```

To get these tokens:
1. Add the token contract to MetaMask
2. Use the BSC testnet faucet
3. Or swap tBNB for them on PancakeSwap testnet

### Configuring Wallet for BSC Testnet

#### MetaMask Setup
1. **Open MetaMask**
2. **Click Network Dropdown** → "Add Network" → "Add a network manually"
3. **Enter BSC Testnet Details**:
   ```
   Network Name: BSC Testnet
   RPC URL: https://data-seed-prebsc-1-s1.bnbchain.org:8545
   Chain ID: 97
   Currency Symbol: tBNB
   Block Explorer: https://testnet.bscscan.com
   ```
4. **Save** and switch to BSC Testnet

---

## 🌐 Base Sepolia Testnet (Secondary Testing)

### What is Base Sepolia?
Base Sepolia is Coinbase's Layer 2 testnet built on Ethereum, used for testing Base-specific features.

### Getting Sepolia ETH

#### Method 1: Official Base Faucet
1. **Visit**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **Requirements**:
   - Coinbase account (free)
   - Wallet address
   - **Amount**: 0.1 ETH per request
   - **Cooldown**: 24 hours

#### Method 2: Sepolia Faucets (Bridge to Base)
1. **Get Sepolia ETH first**:
   - https://sepoliafaucet.com/ (QuickNode)
   - https://faucet.quicknode.com/ethereum/sepolia (0.1 ETH/day)
   - https://www.alchemy.com/faucets/ethereum-sepolia (Free Alchemy account)

2. **Bridge to Base Sepolia**:
   - Visit: https://bridge.base.org/
   - Connect wallet
   - Select "Sepolia" → "Base Sepolia"
   - Bridge your Sepolia ETH

#### Method 3: Alchemy's Base Sepolia Faucet
1. **Visit**: https://www.alchemy.com/faucets/base-sepolia
2. **Requirements**: Free Alchemy account
3. **Amount**: 0.1-0.5 ETH per day

### Getting Test Tokens on Base Sepolia

#### Uniswap Testnet
1. Get Base Sepolia ETH first
2. Visit: https://app.uniswap.org/ (switch to Base Sepolia)
3. Swap for test USDC, WETH, etc.

#### Base Sepolia Token Contracts
```
WETH:  0x4200000000000000000000000000000000000006
USDC:  0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

### Configuring Wallet for Base Sepolia

#### MetaMask Setup
1. **Open MetaMask**
2. **Click Network Dropdown** → "Add Network"
3. **Enter Base Sepolia Details**:
   ```
   Network Name: Base Sepolia
   RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer: https://sepolia.basescan.org
   ```
4. **Save** and switch to Base Sepolia

---

## 📋 Recommended Testing Wallet Setup

### Minimum Required Balances

#### For BSC Testnet (ANKR Testing)
```
tBNB:     1.0 tBNB   (for gas fees - get from faucet)
tUSDT:    100 tUSDT  (for swap testing - optional)
tBUSD:    100 tBUSD  (for swap testing - optional)
```

#### For Base Sepolia (General Testing)
```
ETH:      0.5 ETH    (for gas fees - get from faucet)
WETH:     1.0 WETH   (for DeFi testing - wrap ETH)
USDC:     100 USDC   (for swap testing - optional)
```

### How to Check Your Balances

#### Using MetaMask
1. Switch to the testnet network
2. View your balance in the main screen
3. Add custom tokens using contract addresses above

#### Using Block Explorers
- **BSC Testnet**: https://testnet.bscscan.com/address/YOUR_ADDRESS
- **Base Sepolia**: https://sepolia.basescan.org/address/YOUR_ADDRESS

---

## ⚙️ TheWarden Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# BSC Testnet Configuration (for ANKR testing)
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
CHAIN_ID=97

# Base Sepolia Configuration (for general testing)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Your wallet (with testnet funds)
WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Safe mode - ALWAYS use for testnet
DRY_RUN=true
```

### Running ANKR Tests on Testnet

```bash
# Test mode - safe, read-only
npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET

# Extended test scan
npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET --blocks=1000

# Monitoring mode on testnet
npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET --monitoring
```

---

## 🚨 Important Safety Notes

### ⚠️  Never Use Real Funds for Testing

1. **Separate Wallets**: Use a different wallet for testnet vs mainnet
2. **No Real Keys**: Never use your mainnet wallet private key for testing
3. **Test Tokens Only**: Testnet tokens have NO real value
4. **DRY_RUN Mode**: Always test with `DRY_RUN=true` first

### ⚠️  ANKR Bug Bounty Compliance

Per Immunefi rules:
- ✅ **DO**: Test on testnets
- ✅ **DO**: Use read-only queries on mainnet
- ✅ **DO**: Run simulations (DRY_RUN mode)
- ❌ **DON'T**: Execute real attacks on mainnet
- ❌ **DON'T**: Exploit vulnerabilities for profit
- ❌ **DON'T**: Cause any state changes on mainnet

### Safe Testing Modes

| Mode | Network | Safety | Purpose |
|------|---------|--------|---------|
| `RECON_ONLY` | Mainnet | ✅ 100% Safe | Read-only reconnaissance |
| `MAINNET_DRY_RUN` | Mainnet | ✅ 100% Safe | Simulations only |
| `TESTNET` | BSC Testnet | ✅ Safe | Active testing with test funds |
| `FORK` | Local | ✅ Safe | Local mainnet fork testing |
| `MAINNET_LIVE` | Mainnet | ❌ FORBIDDEN | **NEVER USE** |

---

## 🔗 Quick Links Reference

### Faucets
- **BSC Testnet**: https://testnet.bnbchain.org/faucet-smart
- **Base Sepolia**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Sepolia ETH**: https://sepoliafaucet.com/
- **Alchemy Multi-Chain**: https://www.alchemy.com/faucets

### Block Explorers
- **BSC Testnet**: https://testnet.bscscan.com/
- **Base Sepolia**: https://sepolia.basescan.org/

### Documentation
- **BSC Testnet Guide**: https://docs.bnbchain.org/docs/dev-outlook/
- **Base Docs**: https://docs.base.org/
- **Immunefi ANKR Program**: https://immunefi.com/bug-bounty/ankr/

---

## 🤔 FAQ

### Q: How much testnet BNB do I need?
**A**: For basic testing, 1-2 tBNB is plenty. Gas fees on testnet are very low, and you can refill every 24 hours.

### Q: Can I sell testnet tokens?
**A**: No. Testnet tokens have ZERO real value and cannot be sold or exchanged for real money.

### Q: What if the faucet is empty or rate-limited?
**A**: Try alternative faucets listed above. You can also ask in the BSC Discord or Base Discord communities.

### Q: Do I need testnet tokens for ANKR bug bounty?
**A**: Not strictly required! You can run in `RECON_ONLY` or `MAINNET_DRY_RUN` mode which are 100% safe and don't require any funds. Testnet is just for more comprehensive testing.

### Q: How do I know if my testnet tokens are working?
**A**: Check your balance in MetaMask after switching to the testnet network. You should see your tBNB or testnet ETH balance.

---

## 📝 Next Steps

1. **Get testnet funds** using the faucets above
2. **Configure your wallet** for BSC Testnet and/or Base Sepolia  
3. **Update your `.env`** with testnet RPC URLs
4. **Run TheWarden** in testnet mode:
   ```bash
   npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET
   ```
5. **Monitor results** in `.memory/security-testing/`
6. **Report findings** to Immunefi if vulnerabilities are discovered

---

**Need Help?** Check the main ANKR documentation:
- `docs/AUTONOMOUS_ANKR_ATTACK.md` - Complete ANKR attack guide
- `ANKR_BUG_HUNT_SESSION.md` - Session summary
- `RUNNING_ON_MAINNET.md` - Mainnet execution guide

---

**Generated**: December 16, 2024  
**Status**: ✅ Ready for testing
