# 🚨 SECURITY INCIDENT REPORT - ETH Theft on Base Network

## Incident Summary

**Date:** 2025-12-21  
**Status:** ⚠️ ACTIVE SECURITY INCIDENT  
**Severity:** HIGH  
**Impact:** Wallet gas funds stolen, operations halted

## Incident Details

### Stolen Funds
- **Victim Wallet:** TheWarden operational wallet on Base network
- **Attacker Address:** `0xac49c575454b9cb91890a89bef3589a270ad2ad1`
- **Network:** Base (Chain ID: 8453)
- **Amount Stolen:** ETH gas funds (exact amount TBD)

### Timeline
- Previous sessions: Wallet had ~0.000215 ETH for gas
- Recent: ETH stolen by attacker address
- Current: Wallet has insufficient/zero balance for operations

### Attacker Information
- **Address:** `0xac49c575454b9cb91890a89bef3589a270ad2ad1`
- **BaseScan:** https://basescan.org/address/0xac49c575454b9cb91890a89bef3589a270ad2ad1
- **Analysis:** Check transaction history for attack pattern

## Root Cause Analysis

### Likely Attack Vectors

1. **Private Key Exposure**
   - Most common cause of wallet drainage
   - Key may have been exposed in logs, chat, or environment variables
   - Previous incident: Keys exposed through chat communications (documented in MISSION_COMPLETE_SECURE_ENV.md)

2. **Compromised Environment**
   - .env file leaked or accessed
   - Credentials stored insecurely
   - GitHub secrets exposed

3. **Phishing/Social Engineering**
   - Wallet connected to malicious dApp
   - Approval granted to malicious contract
   - Transaction signed unknowingly

4. **Smart Contract Vulnerability**
   - If funds were in contract, exploit may have occurred
   - Check if FlashSwapV2/V3 contracts were compromised

## Immediate Actions Required

### 1. Secure Current Wallet ⚠️

**DO NOT add more funds to compromised wallet!**

```bash
# Check if wallet is still compromised
npm run check:balance

# If balance shows transactions to 0xac49c575454b9cb91890a89bef3589a270ad2ad1
# The wallet IS compromised
```

### 2. Investigate Attacker

**Analyze attacker's address:**

```bash
# Check attacker's transactions
curl "https://api.basescan.org/api?module=account&action=txlist&address=0xac49c575454b9cb91890a89bef3589a270ad2ad1&startblock=0&endblock=99999999&sort=desc&apikey=YOUR_API_KEY"

# Check if attacker is known/flagged
# Visit: https://basescan.org/address/0xac49c575454b9cb91890a89bef3589a270ad2ad1
```

### 3. Create New Secure Wallet

**Generate fresh wallet with proper security:**

```bash
# Option 1: Use hardware wallet (Ledger/Trezor) - MOST SECURE
# Option 2: Generate new key offline
# Option 3: Use MetaMask with new seed phrase

# NEVER reuse compromised private key
```

### 4. Review Security Practices

**Check these critical areas:**

- [ ] Is WALLET_PRIVATE_KEY in .env?
- [ ] Is .env in .gitignore?
- [ ] Was key ever committed to git?
- [ ] Was key shared in chat/logs?
- [ ] Are GitHub secrets properly configured?
- [ ] Is Supabase vault being used for secrets?

## Security Recommendations

### Immediate (Before Re-funding)

1. **Generate New Wallet**
   - Use hardware wallet OR
   - Generate offline with air-gapped device OR
   - Use reputable wallet software (MetaMask, etc.)

2. **Secure Private Key Storage**
   - Use Supabase Vault for production
   - Use GitHub Secrets for CI/CD
   - NEVER store in .env for production
   - Keep backup in encrypted password manager

3. **Audit Environment Variables**
   ```bash
   # Check what's in .env
   cat .env | grep -i "private\|key\|secret"
   
   # Ensure .env is in .gitignore
   cat .gitignore | grep ".env"
   
   # Check git history for leaks
   git log --all --full-history -- .env
   ```

4. **Review Access Logs**
   - Check who has accessed repository
   - Review Supabase access logs
   - Check GitHub Actions logs
   - Review any third-party integrations

### Medium-term (Operational Security)

1. **Implement Multi-sig**
   - Use Gnosis Safe for operational wallet
   - Require 2-of-3 signatures for transactions
   - Separate hot wallet (small amounts) from cold storage

2. **Use Hardware Wallet**
   - Ledger or Trezor for production funds
   - Keep private keys offline
   - Sign transactions on device

3. **Enable Monitoring**
   - Set up balance alerts
   - Monitor suspicious transactions
   - Use transaction allowlists
   - Implement rate limiting

4. **Rotate Keys Regularly**
   - Change wallet quarterly
   - Migrate funds to fresh addresses
   - Keep audit trail

### Long-term (Infrastructure Security)

1. **Zero-Trust Architecture**
   - No secrets in environment variables
   - All credentials in secure vaults
   - Principle of least privilege

2. **Automated Security Scanning**
   - Run Bloodhound scanner regularly
   - Check for exposed secrets
   - Audit access patterns

3. **Incident Response Plan**
   - Document procedures
   - Have emergency contacts
   - Practice recovery drills

## Recovery Steps

### Step 1: Secure New Wallet

```bash
# Generate new wallet (example with ethers)
node --import tsx -e "
import { ethers } from 'ethers';
const wallet = ethers.Wallet.createRandom();
console.log('New Wallet Address:', wallet.address);
console.log('Private Key (KEEP SECURE!):', wallet.privateKey);
console.log('');
console.log('⚠️  CRITICAL: Store private key securely!');
console.log('✅ Use password manager or hardware wallet');
console.log('❌ NEVER commit to git or share in chat');
"
```

### Step 2: Update Configuration

```bash
# Update .env with NEW wallet (not compromised one)
nano .env
# Set: WALLET_PRIVATE_KEY=0x... (new key)

# Verify new wallet
npm run check:balance
```

### Step 3: Fund New Wallet

```bash
# Fund with minimal amount first (0.001 ETH)
# Test with one transaction
# If successful, add operational funds (0.01 ETH)
```

### Step 4: Monitor Closely

```bash
# Watch for any suspicious activity
npm run check:balance

# Check BaseScan frequently
# Set up alerts for transactions
```

## Lessons Learned

### What Went Wrong

1. **Key Exposure:** Private key was accessible to attacker
2. **Insufficient Monitoring:** Theft not detected immediately
3. **Single Point of Failure:** One key controls all funds

### What to Improve

1. **Key Management:** Use hardware wallet or Supabase Vault
2. **Monitoring:** Real-time alerts for wallet activity
3. **Architecture:** Implement multi-sig for operational funds
4. **Procedures:** Regular security audits and key rotation

## Related Documentation

- `MISSION_COMPLETE_SECURE_ENV.md` - Previous key exposure incident
- `SECURE_ENVIRONMENT_MANAGEMENT.md` - Security best practices
- `WALLET_FUNDING_GUIDE.md` - How to fund new wallet
- `.env.example` - Template with proper security notes

## Investigation Checklist

- [ ] Analyze attacker's transaction history on BaseScan
- [ ] Check if attacker is known/flagged address
- [ ] Review git history for key exposure
- [ ] Audit all environment variable access
- [ ] Check GitHub Actions logs
- [ ] Review Supabase access logs
- [ ] Identify exact timing of theft
- [ ] Determine attack vector
- [ ] Document findings
- [ ] Implement preventive measures

## Status Updates

**2025-12-21:**
- Incident discovered: Wallet has no gas on Base network
- Attacker identified: 0xac49c575454b9cb91890a89bef3589a270ad2ad1
- Investigation ongoing
- Operations halted until new secure wallet is deployed

---

**⚠️ CRITICAL REMINDER:**

**DO NOT FUND THE COMPROMISED WALLET!**

Generate a new wallet first, then fund that one. The compromised private key should be considered permanently burned.

**Next Steps:**
1. Investigate attacker on BaseScan
2. Generate new secure wallet
3. Update all configurations
4. Fund new wallet (start with 0.001 ETH test)
5. Monitor closely for 24 hours
6. If secure, add operational funds (0.01 ETH)
