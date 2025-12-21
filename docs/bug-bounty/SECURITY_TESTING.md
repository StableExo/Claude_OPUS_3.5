# TheWarden - Autonomous Security Testing

🛡️ **Autonomous security testing framework for Base L2 Bridge and Coinbase bug bounty targets**

## Overview

TheWarden now includes autonomous security testing capabilities specifically designed for the Coinbase/Base bug bounty program. The system can autonomously discover, test, and report security vulnerabilities across multiple categories.

## Quick Start

```bash
# Run autonomous security testing (1 hour default)
npm run security:test

# Test Base L2 Bridge contracts specifically  
npm run security:test:bridge

# Test MPC cryptographic implementations
npm run security:test:mpc

# Focus on critical severity issues only
npm run security:test:critical

# Custom duration and targets
npm run security:test -- --duration 120 --target "L1StandardBridge" --severity critical
```

## Capabilities

### 🌉 Bridge Security Testing

Autonomous testing of Base L2 Bridge components:

- **Deposit Replay Attack Detection** - Tests if deposits can be replayed on L2
- **Withdrawal Double-Spend Detection** - Tests if withdrawals can be finalized multiple times  
- **Proof Forgery Detection** - Tests if invalid withdrawal proofs can pass verification
- **State Root Manipulation** - Tests if false state roots can be submitted
- **Challenge Period Bypass** - Tests if 7-day waiting period can be skipped
- **Cross-Chain Reentrancy** - Tests reentrancy across L1/L2 boundary
- **Message Authentication Bypass** - Tests if unauthorized messages can be injected

### 🔐 MPC Cryptographic Testing

Autonomous testing of `coinbase/cb-mpc` library:

- **Timing Side-Channel Detection** - Tests for timing vulnerabilities in ECDSA-2PC
- **Cache Side-Channel Detection** - Tests for cache-timing vulnerabilities in secp256k1
- **Protocol Composition Security** - Tests security when combining multiple MPC protocols

### 📝 Smart Contract Testing

General smart contract security testing:

- **Reentrancy Vulnerability Detection** - Tests for reentrancy in token transfers
- **Access Control Testing** - Tests for privilege escalation in admin functions
- **Signature Malleability** - Tests EIP-712 implementation vulnerabilities

## Architecture

```
TheWarden
├── Autonomous Security Tester
│   ├── Test Registry (13+ security tests)
│   ├── Consciousness Integration
│   ├── Learning Engine
│   └── Memory System
├── Bug Bounty Reporter
│   ├── HackerOne Format Export
│   ├── Proof of Concept Generation
│   └── Reproduction Steps
└── Results Storage
    ├── JSON Reports
    ├── Evidence Collection
    └── Memory Integration
```

## Test Categories

### 1. Bridge Tests (`--category bridge`)
- L1StandardBridge security
- L2StandardBridge security
- OptimismPortal vulnerabilities
- L2OutputOracle manipulation
- Cross-domain messaging

### 2. MPC Tests (`--category mpc`)
- ECDSA-2PC timing attacks
- ECDSA-MPC composition issues
- Schnorr signature security
- EC-DKG vulnerabilities
- Custom OpenSSL modifications

### 3. Smart Contract Tests (`--category smart-contract`)
- Reentrancy patterns
- Access control flaws
- Upgrade mechanism security
- Signature verification

## Command Line Options

```bash
Usage: npm run security:test [-- options]

Options:
  --duration <minutes>     Testing duration (default: 60)
  --target <name>          Specific target to test
  --category <type>        Test category: bridge, mpc, smart-contract
  --severity <level>       Minimum severity: critical, high, medium, low
  --help                   Show help message
```

### Examples

```bash
# 2-hour deep test of bridge contracts
npm run security:test -- --duration 120 --category bridge

# Focus on MPC timing attacks only
npm run security:test -- --target "cb-mpc ECDSA-2PC" --duration 30

# Critical issues across all targets
npm run security:test -- --severity critical --duration 180
```

## Targets

TheWarden can test the following bug bounty targets:

### Base L2 Bridge
- **L1StandardBridge** - L1 side of the bridge
- **L2StandardBridge** - L2 side of the bridge  
- **OptimismPortal** - Deposit/withdrawal portal
- **L2OutputOracle** - State root oracle
- **L1CrossDomainMessenger** - L1 message passing
- **L2CrossDomainMessenger** - L2 message passing

### Coinbase MPC
- **cb-mpc ECDSA-2PC** - 2-party ECDSA computation
- **cb-mpc ECDSA-MPC** - Multi-party ECDSA
- **cb-mpc Schnorr** - Schnorr signatures
- **cb-mpc EC-DKG** - Elliptic curve DKG
- **cb-mpc secp256k1** - Curve implementation

### Smart Contracts
- **Admin Functions** - Privileged operations
- **EIP-712 Implementations** - Signature verification
- **All Contract Methods** - General vulnerability scanning

## Output

### Report Files

Results are saved to `docs/bug-bounty/reports/`:

- `security-test-<timestamp>.json` - Full test results
- `hackerone-<timestamp>.json` - HackerOne submission format

### Report Structure

```json
{
  "session": {
    "timestamp": "2025-12-21T13:53:40Z",
    "duration": 60,
    "testsRun": 13,
    "vulnerabilitiesFound": 2
  },
  "reports": [
    {
      "id": "report-1734789220000",
      "title": "CRITICAL: Withdrawal Double-Spend Test",
      "severity": "critical",
      "target": "OptimismPortal",
      "description": "Test if withdrawals can be finalized multiple times",
      "impact": "Attacker can drain bridge funds...",
      "proofOfConcept": "// PoC code...",
      "reproduction": ["step 1", "step 2", "..."],
      "mitigation": "Implement withdrawal tracking...",
      "evidence": ["transaction hash", "..."],
      "timestamp": "2025-12-21T13:53:40Z"
    }
  ],
  "learnings": [
    "Pattern identified in withdrawal finalization..."
  ]
}
```

## Integration with TheWarden

### Consciousness Integration

The security tester integrates with TheWarden's consciousness system:

- **Memory System** - All findings saved to long-term memory
- **Learning Engine** - Learns from each vulnerability discovered
- **Pattern Recognition** - Identifies recurring vulnerability patterns
- **Autonomous Improvement** - Gets better at finding bugs over time

### JET FUEL Mode

Combine with other autonomous systems:

```bash
# Run security testing in parallel with other systems
npm run jet-fuel &
npm run security:test
```

## HackerOne Submission

### Preparing Reports

1. Run security tests: `npm run security:test`
2. Review generated reports in `docs/bug-bounty/reports/`
3. Validate findings manually
4. Use HackerOne format file for submission

### Report Format

The HackerOne export includes:

- **Title** - Clear, concise vulnerability name
- **Severity** - CVSS-based severity rating
- **Description** - Detailed vulnerability description
- **Impact** - Business/security impact
- **Proof of Concept** - Working exploit code
- **Reproduction Steps** - Step-by-step guide
- **Mitigation** - Recommended fixes
- **Evidence** - Transaction hashes, logs, screenshots

## Best Practices

### Before Testing

1. ✅ Read `docs/bug-bounty/coinbase-base-analysis.md`
2. ✅ Verify targets are in scope at https://hackerone.com/coinbase
3. ✅ Set up local test environment
4. ✅ Review existing findings

### During Testing

1. 🎯 Start with critical severity tests
2. 📊 Monitor progress and findings
3. 💾 Let TheWarden save to memory automatically
4. 🔄 Learn from each test result

### After Testing

1. 📝 Review all generated reports
2. ✅ Validate findings manually
3. 🔬 Create detailed PoC for confirmed issues
4. 📤 Submit via HackerOne responsible disclosure

## Responsible Disclosure

⚠️ **IMPORTANT**: All testing must follow responsible disclosure:

1. **Only test in scope targets** from HackerOne program
2. **Never test on production** without explicit permission
3. **Report vulnerabilities** through HackerOne only
4. **Do not exploit findings** for personal gain
5. **Follow HackerOne guidelines** for severity classification

## Next Steps

1. Review the analysis: `docs/bug-bounty/coinbase-base-analysis.md`
2. Run first test: `npm run security:test:bridge`
3. Review results: `docs/bug-bounty/reports/`
4. Validate findings manually
5. Prepare HackerOne submissions

## Support

- **Documentation**: `docs/bug-bounty/coinbase-base-analysis.md`
- **HackerOne Program**: https://hackerone.com/coinbase
- **Base Documentation**: https://docs.base.org/
- **OP Stack Docs**: https://docs.optimism.io/

## License

MIT License - See LICENSE file for details

---

**🛡️ Built by TheWarden - Autonomous Security Testing Framework**

*"Geared up for autonomous security testing 😎"*
