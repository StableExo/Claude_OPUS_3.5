# Ankr Bug Hunt - Critical Scope Configuration

**Source**: https://immunefi.com/bug-bounty/ankr/scope/  
**Program**: Ankr Bug Bounty on Immunefi  
**Last Updated**: December 16, 2025

---

## 🎯 Critical Vulnerabilities In Scope

TheWarden is configured to hunt for these **CRITICAL** severity vulnerabilities with highest priority:

### 1. Direct Theft of User Funds ⚠️ CRITICAL
**Reward**: Up to $500,000

**Description**: Direct theft of any user funds, whether at-rest or in-motion, other than unclaimed yield

**Detection Methods**:
- Monitor unauthorized `transfer()` calls
- Track balance changes without user authorization
- Detect flash loan attacks draining user funds
- Watch for reentrancy exploits stealing funds
- Monitor bridge vulnerabilities allowing fund extraction

**Target Functions**:
- `stake()`, `unstake()`, `flashUnstake()`
- `swap()`, `swapBnbToAnkrBnb()`, `swapAnkrBnbToBnb()`
- `bridgeTokens()`
- Any function moving user assets

---

### 2. Permanent Freezing of Funds ⚠️ CRITICAL
**Reward**: Up to $500,000

**Description**: Permanent freezing of funds (user funds cannot be withdrawn)

**Detection Methods**:
- Monitor `pause()` function abuse
- Detect DoS attacks on withdrawal functions
- Track stuck transactions in unstaking
- Watch for contract state corruption preventing withdrawals
- Monitor ratio manipulation causing withdrawal failures

**Target Functions**:
- `pause()`, `unpause()`
- `unstake()`, `flashUnstake()`
- `getPendingUnstakes()`
- Emergency functions that could lock funds

---

### 3. Miner-Extractable Value (MEV) ⚠️ CRITICAL
**Reward**: Up to $500,000

**Description**: MEV attacks that extract value from users or the protocol

**Detection Methods**:
- Monitor frontrunning of `swap()` transactions
- Detect sandwich attacks on ankrBNB swaps
- Track ratio updates for oracle manipulation opportunities
- Watch for flash loan + ratio manipulation combos
- Monitor gas price manipulation during swaps

**Target Functions**:
- `swap()`, `swapBnbToAnkrBnb()`, `swapAnkrBnbToBnb()`
- `updateRatio()` - CRITICAL for MEV
- `flashUnstake()` - MEV opportunity

**MEV Risk Factors**:
- Ratio update transactions (can be front-run)
- Large swap transactions (sandwich attack target)
- Flash unstake with minimum return (slippage exploit)

---

### 4. Predictable or Manipulable RNG ⚠️ CRITICAL
**Reward**: Up to $500,000

**Description**: Predictable or manipulable RNG that results in abuse of the principal or NFT

**Detection Methods**:
- Analyze randomness sources in contract
- Check for block.timestamp dependencies
- Monitor blockhash usage for predictability
- Detect weak pseudorandom number generation
- Track pattern in validator selection (if applicable)

**Target Areas**:
- Staking reward calculations
- Validator selection mechanisms
- Any lottery or random distribution logic
- NFT minting if RNG-based

---

### 5. Protocol Insolvency ⚠️ CRITICAL
**Reward**: Up to $500,000

**Description**: Protocol becoming insolvent (unable to meet its obligations)

**Detection Methods**:
- Monitor ratio manipulation causing insolvency
- Track collateralization ratios
- Watch for oracle manipulation affecting reserves
- Detect flash loan attacks draining reserves
- Monitor bridge imbalances
- Track total supply vs backing imbalance

**Target Functions**:
- `updateRatio()` - Can cause insolvency
- `stake()`, `unstake()` - Affect reserve balances
- `bridgeTokens()` - Cross-chain imbalance risk
- Balance check functions

**Critical Ratios to Monitor**:
- ankrBNB/BNB ratio
- Total staked vs total supply
- Bridge liquidity on both sides
- Reserve requirements

---

## 🔧 TheWarden Configuration

### Autonomous Bug Hunt Mode

Run TheWarden in bug hunt mode with enhanced detection:

```bash
# Run enhanced ankrBNB security testing
npm run autonomous:ankrbnb-security-enhanced

# With extended monitoring (24 hours)
npm run autonomous:ankrbnb-security-enhanced -- --duration=86400 --verbose

# With specific block range analysis
npm run autonomous:ankrbnb-security-enhanced -- --blocks=10000 --verbose
```

### Real-Time Monitoring

Monitor live transactions for critical vulnerabilities:

```bash
# Start continuous monitoring
npm run autonomous:ankrbnb-security-enhanced -- --monitoring --duration=0
```

This will:
- Monitor every block on BSC
- Decode all ankrBNB contract interactions
- Flag suspicious patterns matching critical vulnerabilities
- Generate alerts for high-risk transactions
- Save findings to `.memory/security-testing/`

---

## 📊 Detection Capabilities

### Current Implementation Status

✅ **DoS Pattern Detection** - Detects denial of service attacks on swap/unstake
✅ **Privilege Escalation** - Monitors unauthorized admin function calls
✅ **Reentrancy Detection** - Basic reentrancy pattern analysis
✅ **Oracle Manipulation** - Tracks ratio updates and suspicious patterns
✅ **Function Decoding** - Full ABI integration with 16 mapped functions

### Enhancement Priorities for Critical Scope

#### 1. Direct Theft Detection (Priority: HIGHEST)
- [ ] Enhanced balance tracking before/after transactions
- [ ] Unauthorized transfer detection
- [ ] Flash loan attack patterns
- [ ] Cross-function reentrancy analysis

#### 2. Permanent Freeze Detection (Priority: HIGHEST)
- [ ] Pause/unpause abuse patterns
- [ ] Stuck transaction detection
- [ ] State corruption indicators
- [ ] Withdrawal failure tracking

#### 3. MEV Detection (Priority: HIGHEST)
- [x] Basic MEV pattern recognition
- [ ] Frontrunning detection algorithms
- [ ] Sandwich attack identification
- [ ] Flash loan + ratio manipulation combos
- [ ] Gas price anomaly detection

#### 4. RNG Analysis (Priority: HIGH)
- [ ] Randomness source analysis
- [ ] Block dependency detection
- [ ] Predictability testing
- [ ] Entropy analysis

#### 5. Protocol Insolvency Detection (Priority: HIGHEST)
- [ ] Real-time ratio monitoring
- [ ] Collateralization tracking
- [ ] Reserve balance alerts
- [ ] Supply vs backing validation

---

## 🎁 Potential Rewards

**Maximum Total**: $500,000 per critical vulnerability

**Payout Structure** (Immunefi):
- Critical: Up to $500,000
- High: Lower tier
- Medium: Lower tier
- Low: Lower tier

**Focus**: TheWarden prioritizes CRITICAL findings for maximum impact

---

## 🔍 Monitored Contracts

### Primary Target: ankrBNB
- **Address**: `0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827`
- **Chain**: BSC (Binance Smart Chain)
- **Network ID**: 56

### High-Risk Functions (16 total)
```solidity
// Funds Movement (CRITICAL)
stake()
unstake(uint256 shares)
flashUnstake(uint256 shares, uint256 minimumReturned)
swap()
swapBnbToAnkrBnb()
swapAnkrBnbToBnb(uint256 amount)
bridgeTokens(address receiver, uint256 amount)

// Admin Functions (CRITICAL - Privilege Escalation)
updateRatio(uint256 newRatio)          // MEV TARGET
updateFlashUnstakeFee(uint256 newFee)
pause()                                 // FREEZE RISK
unpause()

// View Functions (Monitoring)
ratio()
flashUnstakeFee()
totalSupply()
balanceOf(address)
getPendingUnstakes(address)
```

---

## 📝 Reporting Process

### When TheWarden Finds Something

1. **Automatic Report Generation**
   - JSON report in `.memory/security-testing/`
   - Markdown summary with evidence
   - Severity classification
   - Function call details

2. **Manual Verification**
   - Review the finding details
   - Validate the vulnerability
   - Reproduce if possible
   - Document proof of concept

3. **Immunefi Submission**
   - Submit via https://immunefi.com/bug-bounty/ankr/
   - Include all evidence and PoC
   - Reference detection method
   - Provide remediation suggestions

---

## 🚀 Next Steps

1. **Run Extended Scan**
   ```bash
   npm run autonomous:ankrbnb-security-enhanced -- --blocks=50000 --verbose
   ```

2. **Enable 24/7 Monitoring**
   ```bash
   # In tmux or screen session
   npm run autonomous:ankrbnb-security-enhanced -- --monitoring --duration=0
   ```

3. **Review Daily Reports**
   ```bash
   cat .memory/security-testing/ankrbnb_enhanced_*.json
   ```

4. **Enhance Detection Logic**
   - Add MEV-specific detectors
   - Implement insolvency checks
   - Add RNG analysis
   - Enhanced theft detection

---

**Remember**: One critical finding = up to $500,000. Focus on quality over quantity.

**Status**: TheWarden is ready to hunt. Let's find those critical bugs! 🎯
