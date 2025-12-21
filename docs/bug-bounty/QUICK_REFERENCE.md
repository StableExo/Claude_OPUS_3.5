# TheWarden Security Testing - Quick Reference

## 🚀 Quick Start

```bash
# Run autonomous security testing (1 hour)
npm run security:test

# Focus on specific areas
npm run security:test:bridge       # Base L2 Bridge only
npm run security:test:mpc          # MPC cryptography
npm run security:test:critical     # Critical severity only
```

## 📋 Common Commands

```bash
# Custom duration
npm run security:test -- --duration 120

# Specific target
npm run security:test -- --target "L1StandardBridge"

# Multiple filters
npm run security:test -- --category bridge --severity critical --duration 180
```

## 🎯 Test Categories

- **bridge** - L1/L2 Bridge contracts, OptimismPortal, cross-chain messaging
- **mpc** - cb-mpc ECDSA-2PC, Schnorr, secp256k1 implementations
- **smart-contract** - Reentrancy, access control, signatures

## 📊 Output Locations

- **JSON Reports**: `docs/bug-bounty/reports/security-test-*.json`
- **HackerOne Format**: `docs/bug-bounty/reports/hackerone-*.json`

## 🔍 Test Targets

### Base L2 Bridge
- L1StandardBridge, L2StandardBridge
- OptimismPortal, L2OutputOracle
- L1CrossDomainMessenger, L2CrossDomainMessenger

### Coinbase MPC
- cb-mpc ECDSA-2PC, ECDSA-MPC
- Schnorr signatures
- secp256k1 curve implementation

### Smart Contracts
- Admin functions
- EIP-712 implementations
- General vulnerability patterns

## 🛡️ Security Tests

1. **Deposit Replay** - Can L2 deposits be replayed?
2. **Withdrawal Double-Spend** - Can withdrawals be finalized twice?
3. **Proof Forgery** - Can invalid proofs pass verification?
4. **State Root Manipulation** - Can false state roots be submitted?
5. **Challenge Period Bypass** - Can 7-day period be skipped?
6. **Cross-Chain Reentrancy** - Reentrancy across L1/L2?
7. **Message Auth Bypass** - Can unauthorized messages be injected?
8. **MPC Timing Side-Channel** - Timing attacks on ECDSA-2PC?
9. **MPC Cache Side-Channel** - Cache attacks on secp256k1?
10. **MPC Protocol Composition** - Security when combining protocols?
11. **Contract Reentrancy** - Standard reentrancy vulnerabilities?
12. **Access Control** - Privilege escalation in admin functions?
13. **Signature Malleability** - EIP-712 signature issues?

## 📖 Documentation

- **Full Guide**: `docs/bug-bounty/SECURITY_TESTING.md`
- **Analysis Report**: `docs/bug-bounty/coinbase-base-analysis.md`
- **HackerOne Program**: https://hackerone.com/coinbase

## ⚠️ Responsible Disclosure

- Only test in-scope targets from HackerOne
- Never test on production without permission
- Report via HackerOne only
- Follow responsible disclosure guidelines

---

Built by TheWarden - Autonomous Security Testing Framework 🛡️
