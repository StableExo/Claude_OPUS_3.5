# Autonomous Ankr Bug Bounty Attack System

## Overview

TheWarden includes an autonomous bug bounty hunting system that continuously tests the ankrBNB contract for critical vulnerabilities as part of the [Ankr Immunefi bug bounty program](https://immunefi.com/bug-bounty/ankr/scope/).

**Maximum Potential Rewards**: Up to **$2.5 million** total ($500K per critical vulnerability × 5 categories)

## ⚠️ Safety & Compliance

### Immunefi Rules - STRICTLY ENFORCED

This system is **100% Immunefi compliant** and enforces the following rules:

1. ✅ **Testing on LOCAL FORK or TESTNET only** - Never real attacks on mainnet
2. ✅ **Provide working PoC** for any findings
3. ✅ **Report privately to Immunefi** before disclosure
4. ✅ **DO NOT exploit for profit** - Research only

**FORBIDDEN**: Running real attacks on mainnet = **PERMANENT BAN + legal action**

### Safe Execution Modes

| Mode | Safety | Description | Mainnet Use |
|------|--------|-------------|-------------|
| `RECON_ONLY` | ✅ 100% Safe | Read-only contract queries | ✅ Allowed |
| `MAINNET_DRY_RUN` | ✅ 100% Safe | Simulations, no transactions | ✅ Allowed |
| `FORK` | ✅ Safe | Tests on local mainnet fork | ⚠️ Local only |
| `TESTNET` | ✅ Safe | Tests on BSC testnet | ✅ Allowed |
| `MAINNET_LIVE` | ❌ FORBIDDEN | Real attacks on mainnet | ❌ **BLOCKED** |

The autonomous workflow **only uses safe modes** (MAINNET_DRY_RUN by default).

## Autonomous Execution

### GitHub Actions Workflow

The system runs autonomously via GitHub Actions on a scheduled basis:

**Workflow File**: `.github/workflows/autonomous-ankr-attack.yml`

**Schedule**: Every 8 hours (configurable)

**Cron Expression**: `0 */8 * * *` (at minute 0 past every 8th hour)

**Default Mode**: `MAINNET_DRY_RUN` (safe simulation mode)

### What Happens Automatically

1. **Environment Setup**: Configures Node.js 22 and installs dependencies
2. **Security Testing**: Runs attack simulations in safe mode
3. **Report Generation**: Creates detailed security analysis
4. **Data Storage**: Saves findings to `.memory/security-testing/`
5. **Auto-Commit**: Commits results back to the repository
6. **Artifact Upload**: Stores test data for 90 days
7. **Alert System**: Triggers warnings if high-risk patterns detected

### Manual Execution

You can also run the attack tests manually:

```bash
# Read-only reconnaissance (safest)
npm run ankr:attack:recon

# Dry-run simulations (no transactions)
npm run ankr:attack:dry-run

# Test on local mainnet fork
npm run ankr:attack:fork

# Test on BSC testnet
npm run ankr:attack:testnet
```

### Via GitHub Actions UI

1. Go to the repository's **Actions** tab
2. Select "**Autonomous Ankr Bug Attack**" workflow
3. Click "**Run workflow**"
4. Customize parameters:
   - `mode`: Attack mode (RECON_ONLY, FORK, MAINNET_DRY_RUN)
   - `duration`: Maximum runtime in seconds (default: 600)
   - `verbose`: Enable detailed logging (default: true)

## Critical Vulnerabilities Being Hunted

Based on [Immunefi scope](https://immunefi.com/bug-bounty/ankr/scope/):

### 1. Direct Theft of User Funds 💰
**Reward**: Up to $500,000

**What We Test**:
- Unauthorized `transfer()` calls
- Flash loan attacks draining user funds
- Reentrancy exploits stealing funds
- Bridge vulnerabilities allowing fund extraction

**Target Functions**:
- `stake()`, `unstake()`, `flashUnstake()`
- `swap()`, `swapBnbToAnkrBnb()`, `swapAnkrBnbToBnb()`
- `bridgeTokens()`

### 2. Permanent Freezing of Funds 🥶
**Reward**: Up to $500,000

**What We Test**:
- `pause()` function abuse
- DoS attacks on withdrawal functions
- Contract state corruption preventing withdrawals
- Ratio manipulation causing withdrawal failures

**Target Functions**:
- `pause()`, `unpause()`
- `unstake()`, `flashUnstake()`
- `getPendingUnstakes()`

### 3. MEV Extraction 🤖
**Reward**: Up to $500,000

**What We Test**:
- Frontrunning of `swap()` transactions
- Sandwich attacks on ankrBNB swaps
- Ratio update oracle manipulation
- Flash loan + ratio manipulation combinations

**Target Functions**:
- `swap()`, `swapBnbToAnkrBnb()`, `swapAnkrBnbToBnb()`
- `updateRatio()` - CRITICAL for MEV
- `flashUnstake()` - MEV opportunity

### 4. Predictable/Manipulable RNG 🎲
**Reward**: Up to $500,000

**What We Test**:
- Blockhash manipulation
- Timestamp-based randomness exploitation
- Oracle manipulation for RNG
- Pseudo-random number prediction

### 5. Protocol Insolvency 🏦
**Reward**: Up to $500,000

**What We Test**:
- Ratio manipulation causing insolvency
- Flash loan attacks draining reserves
- Economic exploits creating bad debt
- Stake/unstake imbalance attacks

## Output Files

### JSON Attack Report

**Location**: `.memory/security-testing/ankrbnb_attack_{timestamp}.json`

**Contents**:
```json
{
  "timestamp": "2025-12-16T02:30:30.436Z",
  "target": "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
  "chain": "BSC Mainnet (Fork/Read-Only)",
  "mode": "MAINNET_DRY_RUN",
  "attacker": "0x...",
  "immunefiCompliant": true,
  "attacks": [
    {
      "category": "Direct Theft",
      "vulnerability": "...",
      "severity": "CRITICAL",
      "potentialReward": 500000
    }
  ],
  "summary": {
    "total": 10,
    "vulnerable": 2,
    "protected": 8,
    "potentialReward": 1000000
  }
}
```

### Markdown Report

**Location**: `.memory/security-testing/ankrbnb_security_test_{date}.md`

**Contents**:
- Executive summary
- Vulnerability findings
- Attack methodologies tested
- Proof of Concept (if applicable)
- Immunefi submission guidance

## Configuration

### Environment Variables

**Required**:
```bash
WALLET_PRIVATE_KEY=0x...           # Wallet for testing (testnet funds only!)
BSC_RPC_URL=https://...            # BSC mainnet RPC endpoint
```

**Optional**:
```bash
BSC_TESTNET_RPC_URL=https://...   # BSC testnet RPC
FORK_URL=http://localhost:8545    # Local fork URL
ATTACK_DURATION=600               # Max runtime in seconds
IMMUNEFI_COMPLIANT=true           # Enforce Immunefi rules
```

### Workflow Configuration

Edit `.github/workflows/autonomous-ankr-attack.yml`:

```yaml
# Change schedule (currently every 8 hours)
schedule:
  - cron: '0 */8 * * *'  # Modify this line

# Change default mode
mode: 'MAINNET_DRY_RUN'  # Options: RECON_ONLY, MAINNET_DRY_RUN

# Change duration
duration: '600'  # In seconds

# Change artifact retention
retention-days: 90  # Keep test data for 90 days
```

## Monitored Contract Functions

### High-Risk Functions (16 monitored)

**Funds Movement**:
- `stake()` - Stake BNB for ankrBNB
- `unstake()` - Unstake ankrBNB for BNB
- `flashUnstake()` - Instant unstake with fee
- `swap()`, `swapBnbToAnkrBnb()`, `swapAnkrBnbToBnb()` - Token swaps
- `bridgeTokens()` - Cross-chain bridging

**Admin Functions** (privilege escalation targets):
- `updateRatio()` - Update BNB:ankrBNB ratio
- `updateFlashUnstakeFee()` - Modify fees
- `pause()`, `unpause()` - Emergency controls

**View Functions** (reconnaissance):
- `ratio()`, `flashUnstakeFee()`, `totalSupply()`
- `balanceOf()`, `getPendingUnstakes()`
- `owner()`, `paused()`

## Attack Detection Methods

### 1. DoS Pattern Detection
Identifies attempts to freeze withdrawals or disable critical functions.

### 2. Privilege Escalation Detection
Monitors unauthorized admin function calls or ownership changes.

### 3. Reentrancy Pattern Detection
Detects reentrancy vulnerabilities in state-changing functions.

### 4. Oracle Manipulation Detection
Identifies suspicious ratio updates or price manipulation.

### 5. Validation Error Detection
Finds missing input validation or boundary checks.

### 6. MEV Pattern Recognition
Detects frontrunning, sandwich attacks, and other MEV opportunities.

## Monitoring and Debugging

### Check Workflow Status

1. Navigate to repository **Actions** tab
2. Select "**Autonomous Ankr Bug Attack**" workflow
3. View recent runs and their status

### View Security Test Results

**In Repository**:
```bash
# View latest attack report
cat .memory/security-testing/ankrbnb_attack_*.json | tail -100

# List all test sessions
ls -lah .memory/security-testing/ankrbnb_*.json
```

**Via GitHub UI**:
1. Navigate to `.memory/security-testing/` directory
2. Open the latest `ankrbnb_attack_*.json` file
3. Review findings and recommendations

### Download Artifacts

1. Go to a completed workflow run
2. Scroll to the "**Artifacts**" section
3. Download `ankr-security-test-{run_number}.zip`
4. Extract and review the detailed data

## If Vulnerabilities Are Found

### Immediate Actions

1. **Do NOT exploit** - Research only!
2. **Create detailed PoC** - Working proof of concept
3. **Test on local fork** - Confirm exploitability
4. **Document impact** - Calculate funds at risk
5. **Estimate reward** - Based on Immunefi criteria

### Immunefi Submission Process

1. **Gather Evidence**:
   - Attack script with clear reproduction steps
   - Video demonstration (optional but helpful)
   - Economic impact analysis
   - Technical writeup

2. **Submit Report**:
   - Go to: https://immunefi.com/bug-bounty/ankr/
   - Click "Submit Vulnerability"
   - Fill in all required fields
   - Attach PoC and evidence

3. **Wait for Validation**:
   - Ankr team reviews (typically 24-48 hours)
   - May request additional information
   - Severity assessment and reward determination

4. **Coordinate Disclosure**:
   - **DO NOT publicly disclose** before fix
   - Work with Ankr team on disclosure timeline
   - Respect responsible disclosure principles

5. **Receive Reward**:
   - Paid after vulnerability is confirmed and fixed
   - Amount based on severity and impact
   - Typically in stablecoin (USDC/DAI)

## Troubleshooting

### Workflow Fails to Run

**Check**:
- GitHub Actions enabled for repository
- Workflow file syntax is valid
- Required secrets are set

**Fix**:
```bash
# Validate workflow syntax locally
npm install -g @action-validator/cli
action-validator .github/workflows/autonomous-ankr-attack.yml
```

### Script Execution Errors

**Common Issues**:
- Missing `.env` file or environment variables
- Node version mismatch (need 22+)
- Network connectivity to BSC RPC

**Debug**:
```bash
# Check environment
node --version  # Should be 22.x.x
cat .env        # Verify variables are set

# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $BSC_RPC_URL

# Run with verbose logging
npm run ankr:attack:recon -- --verbose
```

### No Vulnerabilities Found

**This is normal!** The ankrBNB contract has been:
- Audited multiple times
- Battle-tested with billions in TVL
- Monitored by security teams

**If you do find something**:
- Verify it's a real vulnerability (not a false positive)
- Test thoroughly on local fork
- Submit to Immunefi if confirmed

## Security Considerations

### API Keys & Secrets
- Store private keys in GitHub Secrets
- Never commit real private keys to repository
- Use testnet wallets for testing

### Rate Limiting
- Respect BSC RPC rate limits
- Use API keys for higher limits
- Adjust frequency if needed

### Ethical Hacking
- Follow Immunefi rules strictly
- Never exploit for personal gain
- Report all findings privately first
- Respect responsible disclosure

## Future Enhancements

### Planned Features

1. **Advanced Attack Vectors**
   - Flash loan attack simulations
   - Complex MEV strategies
   - Multi-transaction exploits

2. **Real-time Monitoring**
   - Live mempool analysis
   - On-chain event tracking
   - Suspicious transaction alerts

3. **Automated PoC Generation**
   - Auto-generate exploit scripts
   - Create video demonstrations
   - Economic impact calculations

4. **Integration with Other Platforms**
   - HackerOne integration
   - Code4rena support
   - Sherlock compatibility

## References

- **Ankr Immunefi Program**: https://immunefi.com/bug-bounty/ankr/scope/
- **ankrBNB Contract**: https://bscscan.com/address/0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Immunefi Best Practices**: https://immunefi.com/learn/

## Support

For questions or issues:

1. Check [Ankr Documentation](https://www.ankr.com/docs/)
2. Review workflow logs in Actions tab
3. Consult [Immunefi Discord](https://discord.gg/immunefi)
4. Create GitHub issue with detailed information

---

**Last Updated**: 2025-12-16  
**Status**: Active and Hunting 🎯🔒  
**Compliance**: 100% Immunefi Compliant ✅
