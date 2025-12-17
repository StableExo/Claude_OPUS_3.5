# Ankr Immunefi Bug Bounty - Complete Rules & Scope

**Source**: https://immunefi.com/bug-bounty/ankr/scope/  
**Program**: Ankr Bug Bounty on Immunefi  
**Date Noted**: December 16, 2025

---

## ⚠️ CRITICAL RULES - MUST FOLLOW

### Rules of Engagement

**From Immunefi Scope Page - These are MANDATORY:**

1. **No Testing on Production**
   - DO NOT test on live smart contracts
   - Use testnets or local forks only
   - Any testing on mainnet = DISQUALIFICATION

2. **Proof of Concept Required**
   - Must provide working PoC code
   - PoC should demonstrate the vulnerability
   - Include step-by-step reproduction instructions
   - Code should be well-documented

3. **Responsible Disclosure**
   - Report privately to Immunefi first
   - DO NOT publicly disclose before resolution
   - DO NOT exploit the vulnerability for profit
   - Wait for official disclosure timeline

4. **No Social Engineering**
   - NO phishing attacks
   - NO social engineering of team members
   - NO physical attacks
   - NO attacks on infrastructure not in scope

5. **Known Issues Not Eligible**
   - Check previous audits first
   - Issues already reported = not eligible
   - Issues in audit reports = not eligible
   - Duplicate reports = only first valid submission wins

6. **One Bug = One Report**
   - Each vulnerability gets separate report
   - DO NOT bundle multiple bugs
   - Allows proper severity assessment

---

## 🎯 ASSETS IN SCOPE

### Smart Contracts (Primary Targets)

**Blockchain**: Multiple chains supported by Ankr

**Contract Categories**:
1. **Staking Contracts** - ankrETH, ankrBNB, ankrMATIC, etc.
2. **Bridge Contracts** - Cross-chain token bridges
3. **Reward Contracts** - Staking rewards distribution
4. **Governance Contracts** - DAO and voting mechanisms

**Specific Known Contracts** (from research):
- ankrBNB: `0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827` (BSC)
- (Others to be confirmed from official scope page)

### Severity Classification

#### CRITICAL ($500,000 max)
1. **Direct theft of any user funds**
   - Whether at-rest or in-motion
   - Excluding unclaimed yield
   - Must demonstrate actual fund extraction

2. **Permanent freezing of funds**
   - User funds cannot be withdrawn
   - Must be truly permanent, not temporary
   - Includes DoS on withdrawal functions

3. **Miner-extractable value (MEV)**
   - MEV attacks that extract value
   - Must show economic exploitation
   - Includes frontrunning, sandwich attacks

4. **Predictable or manipulable RNG**
   - Results in abuse of principal or NFT
   - Must show actual impact on funds/assets
   - Theoretical RNG issues = lower severity

5. **Protocol insolvency**
   - Protocol unable to meet obligations
   - Must demonstrate path to insolvency
   - Include economic analysis

#### HIGH Severity
- Theft of unclaimed yield
- Permanent freezing of unclaimed yield
- Temporary freezing of funds (>1 hour)
- Smart contract fails to deliver promised returns

#### MEDIUM Severity
- Smart contract fails to deliver promised returns but doesn't lose value
- Griefing attacks (no profit motive)

#### LOW Severity
- Contract fails to deliver promised returns without loss of value

---

## ❌ OUT OF SCOPE

### NOT Eligible for Rewards

1. **Known Issues**
   - Issues from previous audits
   - Already reported vulnerabilities
   - Public vulnerabilities

2. **Best Practices**
   - Missing best practices (unless critical impact)
   - Code quality issues
   - Gas optimizations

3. **UI/UX Issues**
   - Frontend bugs
   - Display issues
   - Cosmetic problems

4. **Infrastructure**
   - Website vulnerabilities (separate program)
   - API vulnerabilities
   - DNS issues

5. **Theoretical Vulnerabilities**
   - Must have realistic attack path
   - Must demonstrate actual impact
   - No hypothetical scenarios

6. **Oracle Manipulation** (unless specific)
   - General oracle issues not in control of Ankr
   - External price feed manipulation
   - (But oracle manipulation causing protocol insolvency = CRITICAL)

7. **Third-Party Issues**
   - Vulnerabilities in dependencies (unless Ankr's integration is flawed)
   - Issues in external protocols
   - Chainlink, Uniswap, etc.

---

## 📝 PROOF OF CONCEPT REQUIREMENTS

### What Your PoC Must Include

1. **Clear Vulnerability Description**
   - What is the vulnerability?
   - Why does it exist?
   - What is the impact?

2. **Attack Steps**
   - Step-by-step instructions
   - Must be reproducible
   - Include all prerequisites

3. **Working Code**
   - Runnable PoC script
   - Well-commented
   - Uses testnet or fork

4. **Impact Analysis**
   - Economic impact calculation
   - Number of users affected
   - Funds at risk

5. **Remediation Suggestions** (optional but recommended)
   - How to fix the vulnerability
   - Code patches if possible
   - Best practices recommendations

---

## 💰 REWARD STRUCTURE

### Payment Amounts

**Critical**: Up to $500,000
- Based on severity and impact
- Likelihood of exploitation
- Funds at risk

**High**: Lower tier (exact amount varies)
**Medium**: Lower tier
**Low**: Lower tier

### Reward Criteria

1. **Severity** - How bad is the impact?
2. **Likelihood** - How easy to exploit?
3. **Funds at Risk** - How much money could be stolen?
4. **Quality of Report** - How well documented?
5. **Remediation** - Did you provide fix suggestions?

---

## 🚫 PROHIBITED ACTIONS

### Actions That Will Result in DISQUALIFICATION

1. **Testing on Mainnet**
   - Any attack attempts on production = BAN
   - Use testnets/forks ONLY
   - Even read-only testing should be careful

2. **Public Disclosure**
   - Posting vulnerability before resolution
   - Tweeting about findings
   - Writing blog posts early

3. **Exploitation for Profit**
   - Actually stealing funds
   - Front-running users
   - Extracting value

4. **Denial of Service**
   - Spamming contracts
   - Causing outages
   - Network attacks

5. **Social Engineering**
   - Phishing team members
   - Pretexting
   - Physical security breaches

---

## ✅ ALLOWED & RECOMMENDED ACTIONS

### What You CAN and SHOULD Do

1. **Local Fork Testing**
   - Fork mainnet to local environment
   - Test attacks in isolation
   - Use Hardhat, Foundry, Ganache

2. **Testnet Deployment**
   - Deploy test contracts on testnets
   - Simulate attacks safely
   - Gather evidence

3. **Static Analysis**
   - Code review
   - Automated tools
   - Pattern recognition

4. **Economic Analysis**
   - Calculate potential damage
   - Model attack scenarios
   - Assess impact

5. **Communication with Team**
   - Ask clarifying questions via Immunefi
   - Request additional information
   - Coordinate disclosure

---

## 📋 SUBMISSION PROCESS

### How to Submit a Finding

1. **Prepare Your Report**
   - Follow PoC requirements above
   - Include all evidence
   - Write clearly and professionally

2. **Submit via Immunefi**
   - Use the official Immunefi platform
   - https://immunefi.com/bug-bounty/ankr/
   - Fill out all required fields

3. **Initial Response**
   - Ankr team will acknowledge within X days
   - May ask clarifying questions
   - DO NOT disclose publicly during this time

4. **Validation**
   - Team validates the vulnerability
   - May request additional info
   - May ask for remediation help

5. **Reward Decision**
   - Based on severity and impact
   - Communicated via Immunefi
   - Payment processed through platform

6. **Disclosure**
   - Wait for official disclosure timeline
   - Coordinated disclosure preferred
   - May be asked to write joint disclosure

---

## 🎯 ATTACK METHODOLOGY (Compliant)

### How TheWarden Should Operate

1. **Reconnaissance Phase** ✅
   - Read contract source code
   - Analyze previous audits
   - Study documentation
   - **READ-ONLY queries to mainnet OK**

2. **Analysis Phase** ✅
   - Static code analysis
   - Pattern matching
   - Economic modeling
   - Identify attack vectors

3. **Testing Phase** ⚠️ **TESTNET ONLY**
   - Deploy to testnet
   - Fork mainnet locally
   - Execute attack in safe environment
   - Gather evidence

4. **PoC Development** ✅
   - Write attack script
   - Document steps
   - Create reproduction guide
   - Calculate impact

5. **Reporting Phase** ✅
   - Submit to Immunefi
   - Private disclosure
   - Professional communication
   - Wait for validation

6. **Remediation Phase** ✅
   - Suggest fixes
   - Help validate patches
   - Coordinate disclosure

---

## 🔍 SPECIFIC ATTACK VECTORS TO TEST

### Based on Critical Scope

#### 1. Direct Theft of User Funds
**Test For**:
- Reentrancy vulnerabilities
- Access control bypasses
- Integer overflow/underflow
- Unchecked external calls
- Flash loan attacks
- Price manipulation

**PoC Must Show**:
- Actual fund extraction
- Before/after balances
- Transaction logs

#### 2. Permanent Freezing of Funds
**Test For**:
- DoS on withdrawal functions
- Stuck states
- Governance attacks
- Pause mechanism abuse
- Self-destruct vulnerabilities

**PoC Must Show**:
- Funds become permanently inaccessible
- No recovery mechanism exists
- All users affected

#### 3. MEV Attacks
**Test For**:
- Frontrunning opportunities
- Sandwich attacks
- Time-bandit attacks
- Oracle manipulation for MEV
- Cross-function MEV

**PoC Must Show**:
- Economic extraction
- Victim transaction
- Attacker profit calculation
- Gas cost vs profit

#### 4. RNG Manipulation
**Test For**:
- Block timestamp dependencies
- Blockhash usage
- Weak PRNG
- Predictable patterns
- Miner manipulation

**PoC Must Show**:
- Predicted random values
- Exploitation for profit
- Impact on users/protocol

#### 5. Protocol Insolvency
**Test For**:
- Collateralization issues
- Reserve depletion
- Ratio manipulation
- Mint/burn imbalances
- Bridge draining

**PoC Must Show**:
- Path to insolvency
- Economic calculations
- Timeline to failure
- Funds at risk

---

## ⚡ THEWARDEN CONFIGURATION

### Compliant Attack Mode

```bash
# DO NOT run on mainnet with actual attacks
DRY_RUN=true  # MUST be true for mainnet reads

# Use forked mainnet for testing
HARDHAT_FORK_ENABLED=true
HARDHAT_FORK_URL=$BSC_RPC_URL

# Or use testnet
CHAIN_ID=97  # BSC Testnet
```

### Attack Script Usage

```bash
# Reconnaissance ONLY (safe - read-only)
npm run ankr:recon

# Attack testing on LOCAL FORK (safe)
npm run ankr:attack:fork

# Attack testing on TESTNET (safe)
npm run ankr:attack:testnet

# NEVER run this:
# npm run ankr:attack:mainnet ❌ BANNED
```

---

## 📊 CHECKLIST FOR EACH ATTACK

Before submitting, verify:

- [ ] Tested on testnet or local fork ONLY
- [ ] Have working PoC code
- [ ] Documented step-by-step reproduction
- [ ] Calculated economic impact
- [ ] Not a known issue from audits
- [ ] Not a duplicate report
- [ ] Follows responsible disclosure
- [ ] Have before/after evidence
- [ ] Included remediation suggestions
- [ ] Wrote professional report
- [ ] Ready to submit via Immunefi

---

## 🎁 SUCCESS CRITERIA

### What Makes a $500k Report

1. **Critical Severity** - One of the 5 critical categories
2. **High Impact** - Significant funds at risk
3. **Easy Exploitation** - Realistic attack path
4. **Quality PoC** - Working, well-documented code
5. **Professionalism** - Clear, detailed report
6. **Uniqueness** - First to report this specific issue
7. **Remediation Help** - Suggested fixes included

---

## 🚨 FINAL WARNINGS

**DO NOT**:
- ❌ Test on mainnet with real attacks
- ❌ Actually steal funds
- ❌ Publicly disclose before resolution
- ❌ Submit duplicate reports
- ❌ Bundle multiple bugs in one report
- ❌ Social engineer the team
- ❌ Cause DoS or disruption

**DO**:
- ✅ Test on testnets or local forks
- ✅ Provide working PoC
- ✅ Communicate professionally
- ✅ Suggest remediations
- ✅ Wait for coordinated disclosure
- ✅ Follow Immunefi process
- ✅ Be patient during validation

---

**Remember**: The goal is to FIND vulnerabilities and REPORT them responsibly to help secure the protocol and earn rewards. NOT to exploit them for personal gain.

**Violation of these rules = Permanent ban from Immunefi + Potential legal action**

---

**Status**: Rules documented and noted to memory ✅  
**TheWarden Mode**: Compliant bug bounty hunting (testnet/fork only)  
**Next Step**: Configure autonomous attack testing on FORK/TESTNET
