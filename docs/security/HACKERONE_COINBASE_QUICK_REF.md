# HackerOne Coinbase - Quick Reference

**Last Updated**: 2025-12-21  
**Purpose**: Quick access to key Coinbase bug bounty information

---

## 🎯 Program URLs

- **HackerOne**: https://hackerone.com/coinbase
- **Cantina Onchain**: https://cantina.xyz/bounties/55316f42-3c5e-4746-9bd0-0f18dcbc344b
- **Coinbase Blog**: https://www.coinbase.com/blog/Consumer-protection-tuesday-Coinbase-launches-a-new-5M-bug-bounty-program

---

## 💰 Bounty Tiers

### Off-Chain (HackerOne)
- **Critical**: $10K-$30K+ (Auth bypass, RCE)
- **High**: $5K-$15K (Privilege escalation)
- **Medium**: $1K-$5K (IDOR, Stored XSS)
- **Low**: $200-$1K (Reflected XSS, CSRF)

### On-Chain (Cantina)
- **Extreme**: $1M-$5M (Total insolvency)
- **Critical**: $250K-$1M (Major fund theft)
- **High**: $50K-$250K (Limited theft)
- **Medium**: $10K-$50K (DoS, Economic)
- **Low**: $1K-$10K (Informational)

---

## 🎯 In-Scope Assets

### Off-Chain
- coinbase.com, pro.coinbase.com
- Mobile apps (iOS, Android)
- All APIs (REST, WebSocket, GraphQL)
- Cloud infrastructure

### On-Chain
- **Base L2 contracts** (bridges, sequencer)
- **cbBTC, cbETH** (wrapped tokens)
- **All Coinbase smart contracts**
- Wallets, identity, payments, NFTs

---

## ⚡ Response Times

- **First Response**: 4-48 hours
- **Triage**: 1-7 days
- **Bounty Decision**: 1-14 days
- **Payout**: 3-14 days after tax form
- **Total**: ~7-21 days for valid reports

---

## 🔍 Top Vulnerability Types

### Off-Chain Priority
1. Authentication bypass
2. Business logic flaws
3. API security issues
4. Injection attacks (SQL, Command, SSRF)
5. Data exposure

### On-Chain Priority
1. Reentrancy attacks
2. Fund drainage exploits
3. Flash loan manipulation
4. Oracle manipulation
5. Access control bypass

---

## 📊 Program Stats

- **Total Paid**: $2.3M+
- **Public Payouts**: $100K+ (82 reports)
- **Max Single Bounty**: $5M
- **Response Rank**: Top efficiency on HackerOne
- **Program Age**: Established (years)

---

## 🛡️ TheWarden Priority Focus

1. **Base L2 Security** ⭐⭐⭐
   - Direct operational impact
   - Bridge and sequencer contracts
   
2. **Flash Loan Protection** ⭐⭐⭐
   - TheWarden uses flash loans
   - MEV protection patterns

3. **cbBTC/cbETH Security** ⭐⭐
   - High-value targets
   - Wrapped asset patterns

4. **Access Control** ⭐⭐
   - Admin function protection
   - Multi-sig patterns

5. **General DeFi Patterns** ⭐
   - Broad vulnerability catalog
   - Continuous learning

---

## 🚀 Quick Actions

### For Research
```bash
# Monitor HackerOne disclosures
curl "https://hackerone.com/coinbase/hacktivity" 

# Check Cantina updates
# Visit: https://cantina.xyz/bounties/55316f42-3c5e-4746-9bd0-0f18dcbc344b
```

### For Learning
1. Review disclosed reports on HackerOne
2. Study Base L2 contract implementations on Basescan
3. Analyze cbBTC/cbETH contracts on Etherscan
4. Extract patterns for TheWarden database

### For Implementation
```typescript
// Add to VulnerabilityPatternDatabase
const coinbasePatterns = [
  'base-bridge-security',
  'flash-loan-protection',
  'oracle-manipulation-defense',
  'access-control-patterns',
  'upgrade-mechanism-security'
];
```

---

## 📚 Key Contacts

- **Platform**: HackerOne (security@coinbase.com)
- **Response Team**: Top-ranked efficiency
- **Disclosure**: 30-90 days post-fix
- **Legal**: Strong safe harbor protections

---

## ⚠️ Critical Notes

- ✅ **NEVER** test on mainnet (read-only OK)
- ✅ Use testnets or forks for PoC
- ✅ Follow responsible disclosure
- ✅ Legal safe harbor if compliant
- ❌ No social engineering
- ❌ No destructive testing
- ❌ No unauthorized access to user data

---

## 🔗 Related Docs

- [Full Analysis](./HACKERONE_COINBASE_ANALYSIS.md)
- [Strategic Comparison](./HACKERONE_STRATEGIC_COMPARISON.md)
- [Crypto.com Analysis](./HACKERONE_CRYPTO_BOUNTY_ANALYSIS.md)

---

**For detailed information, see [HACKERONE_COINBASE_ANALYSIS.md](./HACKERONE_COINBASE_ANALYSIS.md)**
