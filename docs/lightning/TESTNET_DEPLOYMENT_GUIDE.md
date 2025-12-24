# Bitcoin Testnet Deployment Guide for TheWarden ⚡

**Complete guide for deploying TheWarden's Lightning Network integration on Bitcoin testnet**

---

## Table of Contents

1. [Overview](#overview)
2. [What You Need](#what-you-need)
3. [System Requirements](#system-requirements)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Configuration Details](#configuration-details)
6. [Getting Testnet Coins](#getting-testnet-coins)
7. [Opening Lightning Channels](#opening-lightning-channels)
8. [Testing the Integration](#testing-the-integration)
9. [What I Need from StableExo](#what-i-need-from-stableexo)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers everything needed to deploy TheWarden on Bitcoin testnet, moving from mock mode to real Lightning Network operations with actual (worthless) testnet Bitcoin.

**Current Status**: ✅ Mock mode working  
**Next Goal**: 🎯 Testnet deployment with real Lightning transactions

---

## What You Need

### Software Components

1. **Bitcoin Core** (bitcoind)
   - Purpose: Provides Bitcoin blockchain access
   - Version: 25.0+ recommended
   - Network: Testnet3 or Testnet4

2. **Core Lightning** (lightningd)
   - Purpose: Lightning Network node implementation
   - Version: 24.02+ recommended
   - Network: Testnet

3. **TheWarden Lightning API** (already built!)
   - Purpose: REST API for payment processing
   - Status: ✅ Complete and tested in mock mode

### Hardware Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **Storage** | 50GB | 100GB+ | Testnet blockchain ~30GB + growth |
| **RAM** | 4GB | 8GB+ | Bitcoin Core needs 2GB, Lightning 1GB |
| **CPU** | 2 cores | 4+ cores | Faster sync times |
| **Network** | Stable internet | Public IP + open ports | For incoming connections |

### Network Requirements

- **Port 18333**: Bitcoin testnet P2P
- **Port 18332**: Bitcoin testnet RPC (localhost only)
- **Port 19735**: Lightning testnet P2P (optional for incoming)
- **Port 3001**: TheWarden Lightning API

---

## System Requirements

### Operating System

**Recommended**: Ubuntu 22.04 LTS or later

**Also supported**:
- Debian 11+
- macOS 10.14+
- Windows 10+ (via WSL2 or Docker)

### Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  autoconf \
  automake \
  libtool \
  libgmp-dev \
  libsqlite3-dev \
  python3 \
  python3-pip \
  net-tools \
  zlib1g-dev \
  libsodium-dev \
  gettext \
  curl \
  git
```

---

## Step-by-Step Deployment

### Step 1: Install Bitcoin Core

#### Option A: Binary Installation (Recommended)

```bash
# Download Bitcoin Core (adjust version as needed)
wget https://bitcoincore.org/bin/bitcoin-core-25.0/bitcoin-25.0-x86_64-linux-gnu.tar.gz

# Verify checksum (important!)
sha256sum bitcoin-25.0-x86_64-linux-gnu.tar.gz
# Compare with official checksum from bitcoincore.org

# Extract
tar -xzf bitcoin-25.0-x86_64-linux-gnu.tar.gz

# Install
sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-25.0/bin/*

# Verify installation
bitcoind --version
```

#### Option B: Package Manager (Ubuntu)

```bash
sudo add-apt-repository ppa:bitcoin/bitcoin
sudo apt-get update
sudo apt-get install bitcoind bitcoin-qt
```

### Step 2: Configure Bitcoin Core for Testnet

Create `~/.bitcoin/bitcoin.conf`:

```ini
# Network
testnet=1

# RPC Server
server=1
rpcuser=lightning
rpcpassword=CHANGE_THIS_PASSWORD_NOW
rpcallowip=127.0.0.1

# Performance
dbcache=2048
maxmempool=512

# Optional: Reduce disk usage with pruning (keeps last ~10GB)
# prune=10000

# Transaction indexing (needed for some Lightning operations)
txindex=1

# Logging (optional but helpful)
debug=rpc
```

**⚠️ SECURITY**: Change `rpcpassword` to a strong, unique password!

### Step 3: Start Bitcoin Core

```bash
# Start bitcoind in testnet mode
bitcoind -testnet -daemon

# Check status
bitcoin-cli -testnet getblockchaininfo

# Monitor sync progress
watch 'bitcoin-cli -testnet getblockchaininfo | grep -E "blocks|headers"'
```

**Expected sync time**: 2-12 hours (depending on connection speed)  
**Blockchain size**: ~30GB for testnet3

### Step 4: Install Core Lightning

#### Option A: From Source (Recommended for latest features)

```bash
# Clone repository
git clone https://github.com/ElementsProject/lightning.git
cd lightning

# Checkout latest release (check GitHub for current version)
git checkout v24.02.2

# Install dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  autoconf automake build-essential git libtool \
  libgmp-dev libsqlite3-dev python3 python3-mako \
  python3-pip net-tools zlib1g-dev libsodium-dev gettext

# Build
./configure
make

# Install
sudo make install

# Verify
lightningd --version
```

#### Option B: Pre-built Packages

Check [Core Lightning installation docs](https://docs.corelightning.org/docs/installation) for your OS.

### Step 5: Configure Core Lightning for Testnet

Create `~/.lightning/config`:

```ini
# Network
network=testnet

# Bitcoin RPC connection
bitcoin-rpcconnect=127.0.0.1
bitcoin-rpcport=18332
bitcoin-rpcuser=lightning
bitcoin-rpcpassword=SAME_PASSWORD_AS_BITCOIN_CONF

# Node settings
alias=TheWarden-Testnet-Node
rgb=03a6fe

# RPC
rpc-file-mode=0660

# Logging
log-level=info
log-file=/tmp/lightning-testnet.log

# Optional: Auto-clean old invoices
autoclean-cycle=3600
autoclean-succeededforwards-age=604800
```

### Step 6: Start Core Lightning

```bash
# Wait for Bitcoin Core to finish syncing first!
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
# Should show 0.9999+ when ready

# Start Lightning daemon
lightningd --network=testnet --daemon

# Check status
lightning-cli --testnet getinfo

# View logs
tail -f /tmp/lightning-testnet.log
```

### Step 7: Configure TheWarden Lightning API

Update your `.env` file or create `.env.lightning`:

```bash
# Lightning Configuration
LIGHTNING_MOCK=false                    # Disable mock mode!
LIGHTNING_NETWORK=testnet
LIGHTNING_DIR=/home/YOUR_USER/.lightning/testnet

# API Configuration
LIGHTNING_API_PORT=3001
LIGHTNING_API_HOST=0.0.0.0
LIGHTNING_API_KEYS=YOUR_SECURE_API_KEY_HERE

# Revenue Allocation
LIGHTNING_DEBT_ALLOCATION_PERCENT=70

# Supabase (for persistence)
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_KEY
```

### Step 8: Start TheWarden Lightning API

```bash
# Ensure environment is set up
source ~/.nvm/nvm.sh
nvm use 22

# Start the Lightning API server (production mode)
npm run lightning:api

# In another terminal, verify it's working
curl http://localhost:3001/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "lightning": true,
  "nodeInfo": {
    "id": "03abc...real node id",
    "alias": "TheWarden-Testnet-Node",
    "network": "testnet",
    "num_active_channels": 0
  }
}
```

---

## Configuration Details

### Bitcoin Core Config Options

| Option | Purpose | Recommendation |
|--------|---------|----------------|
| `testnet=1` | Enable testnet | Required |
| `server=1` | Enable RPC server | Required |
| `txindex=1` | Index all transactions | Recommended for Lightning |
| `prune=10000` | Limit blockchain size | Optional (saves disk space) |
| `dbcache=2048` | Memory for database cache | Higher = faster sync |

### Core Lightning Config Options

| Option | Purpose | Recommendation |
|--------|---------|----------------|
| `network=testnet` | Use testnet | Required |
| `alias=YourNodeName` | Node display name | Customize it! |
| `rgb=03a6fe` | Node color (hex) | Choose your brand color |
| `fee-base=1000` | Base routing fee (msats) | Default is fine for testing |
| `autoclean-cycle=3600` | Cleanup interval (seconds) | Keeps database clean |

---

## Getting Testnet Coins

You need testnet Bitcoin (tBTC) to open Lightning channels. Testnet coins have **zero real value** - they're for testing only!

### Testnet Faucets

1. **Mempool Testnet Faucet** (Recommended)
   - URL: https://testnet-faucet.mempool.co/
   - Amount: 0.01 tBTC
   - Rate limit: Once per day

2. **Coinfaucet.eu**
   - URL: https://coinfaucet.eu/en/btc-testnet/
   - Amount: 0.001-0.01 tBTC
   - Rate limit: Once per day

3. **Testnet Sandbox**
   - URL: https://testnet.help/en/btcfaucet/testnet
   - Amount: 0.01 tBTC

### Get a Receiving Address

```bash
# Generate new address from Lightning node
lightning-cli --testnet newaddr

# Output will look like:
# {
#   "bech32": "tb1qxyz...abc",
#   "p2tr": "tb1pxyz...def"
# }
```

Use the `bech32` address with faucets.

### Check Your Balance

```bash
# Check on-chain funds
lightning-cli --testnet listfunds

# Check if transaction confirmed
bitcoin-cli -testnet getwalletinfo
```

Wait for **3+ confirmations** (~30 minutes) before opening channels.

---

## Opening Lightning Channels

Once you have testnet coins, you can open Lightning channels to start receiving/sending Lightning payments.

### Find Testnet Nodes to Connect With

1. **1ML Testnet Explorer**
   - URL: https://1ml.com/testnet/
   - Shows public testnet nodes

2. **Popular Testnet Nodes**:
   ```
   # ACINQ testnet node
   03864ef...@testnet-seed.acinq.co:9735
   
   # Lightning Labs testnet
   038863c...@test.nodes.lightning.directory:9735
   ```

### Connect to a Peer

```bash
# Connect to a node (example)
lightning-cli --testnet connect \
  03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f@34.239.230.56:9735

# Verify connection
lightning-cli --testnet listpeers
```

### Open a Channel

```bash
# Open channel with 100,000 sats (0.001 tBTC)
lightning-cli --testnet fundchannel \
  03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f \
  100000

# Wait for confirmation (1-3 blocks, ~10-30 minutes)
lightning-cli --testnet listpeerchannels

# Channel states:
# - CHANNELD_AWAITING_LOCKIN: Waiting for confirmations
# - CHANNELD_NORMAL: Channel is active!
```

**Recommendation**: Open 2-3 channels with different nodes for better routing.

---

## Testing the Integration

### Test 1: Create Invoice via API

```bash
# Create a 100 sat invoice for AI query
curl -X POST http://localhost:3001/api/invoice \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "ai-query",
    "amountSats": 100,
    "description": "Test AI query on testnet"
  }'
```

**Expected response**:
```json
{
  "success": true,
  "transactionId": "uuid-here",
  "invoice": {
    "bolt11": "lntb1u1p...",
    "paymentHash": "hash...",
    "amountSats": 100,
    "expiresAt": 1234567890
  }
}
```

### Test 2: Pay the Invoice

Use a Lightning wallet to pay:
- **Phoenix Wallet** (mobile): https://phoenix.acinq.co/
- **Bluewallet** (mobile): https://bluewallet.io/
- **Lightning CLI** (command line):
  ```bash
  lightning-cli --testnet pay lntb1u1p...
  ```

### Test 3: Check Payment Statistics

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  http://localhost:3001/api/stats
```

**Expected**:
```json
{
  "success": true,
  "stats": {
    "totalInvoicesCreated": 1,
    "totalInvoicesPaid": 1,
    "totalRevenueSats": 100,
    "totalDebtAllocationSats": 70,
    "debtAllocationPercent": 70
  }
}
```

### Test 4: End-to-End Service Test

```bash
# Run the interactive demo
npm run lightning:ride
```

This should show real testnet transactions instead of mock auto-payments!

---

## What I Need from StableExo

### Essential Requirements

1. **Bitcoin Core Testnet Node**
   - ✅ Can I set this up myself? Yes, following steps above
   - ⏰ Time estimate: 2-12 hours for initial sync
   - 💾 Disk space needed: ~50GB minimum

2. **Core Lightning Testnet Node**
   - ✅ Can I set this up myself? Yes, after Bitcoin Core syncs
   - ⏰ Time estimate: 30 minutes setup + channel opening
   - 💰 Need testnet coins from faucet

3. **Testnet Bitcoin (tBTC)**
   - **Action needed**: Visit faucet and fund Lightning address
   - **Amount**: 0.01-0.1 tBTC (enough for 5-10 channels)
   - **Purpose**: Open channels to test payment routing

4. **Public Testnet Nodes for Peering**
   - ℹ️ Listed above in "Opening Lightning Channels" section
   - ⚡ Recommendation: Connect to 2-3 well-known testnet nodes

### Optional But Helpful

1. **Supabase Database** (for persistent storage)
   - **Status**: ❓ Do we have Supabase set up?
   - **Purpose**: Store invoice/payment history across restarts
   - **Alternative**: Can work without it initially (in-memory only)

2. **Domain Name** (for production)
   - **Status**: ❓ Do we have a domain for TheWarden API?
   - **Purpose**: `lightning.thewarden.ai` or similar
   - **Note**: Not needed for testnet testing

3. **SSL Certificate** (for production)
   - **Purpose**: HTTPS for API security
   - **Note**: Not needed for testnet on localhost

### Questions for StableExo

1. **Server Access**: Should I set up testnet nodes on your server, or will you handle it?
   - If you handle it: I need the RPC credentials to configure TheWarden API
   - If I handle it: I'll need SSH access or deployment instructions

2. **Environment**: Where should testnet deployment run?
   - Local machine for testing?
   - Development server?
   - Separate testnet environment?

3. **Timeline**: What's the priority?
   - Immediate: Need to test ASAP?
   - This week: Get it running soon?
   - Next sprint: Part of planned roadmap?

4. **Supabase**: Do we have Supabase project set up?
   - If yes: Need `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - If no: Can deploy without it initially

---

## Troubleshooting

### Bitcoin Core Won't Sync

**Problem**: Sync stuck or very slow

**Solutions**:
1. Check network connectivity: `netstat -an | grep 18333`
2. Try different DNS: `dns=1` in bitcoin.conf
3. Add nodes manually:
   ```bash
   bitcoin-cli -testnet addnode "testnet-seed.bitcoin.jonasschnelli.ch" add
   ```

### Core Lightning Won't Start

**Problem**: `lightningd` fails to start

**Checks**:
1. Is Bitcoin Core synced? `bitcoin-cli -testnet getblockchaininfo`
2. Are RPC credentials correct in Lightning config?
3. Check logs: `tail -f /tmp/lightning-testnet.log`

### Can't Open Channels

**Problem**: `fundchannel` fails

**Checks**:
1. Do you have confirmed funds? `lightning-cli --testnet listfunds`
2. Is peer connected? `lightning-cli --testnet listpeers`
3. Wait for 3+ confirmations on your deposit

### API Returns "Node Not Accessible"

**Problem**: TheWarden can't connect to Lightning node

**Solutions**:
1. Check Lightning is running: `lightning-cli --testnet getinfo`
2. Verify `LIGHTNING_DIR` in `.env` is correct
3. Check file permissions: `ls -la ~/.lightning/testnet/`
4. Ensure `LIGHTNING_MOCK=false` in config

### No Incoming Payments

**Problem**: Can receive but not send payments

**Solution**: You need **inbound liquidity**! Open channels where you're the **receiver**:
1. Use a Lightning submarine swap service
2. Ask a peer to open a channel to you
3. Use a service like Lightning Labs Loop

---

## Next Steps After Testnet

Once testnet is working:

1. ✅ **Validate Revenue Allocation**: Confirm 70/30 split works with real payments
2. ✅ **Test All Service Types**: AI queries, security reports, arbitrage signals
3. ✅ **Monitor Performance**: Track API response times, payment success rates
4. ✅ **Integrate Supabase**: Persistent storage for production readiness
5. ✅ **Build Service UI**: Web interface for users to pay for services
6. 🎯 **Plan Mainnet**: Security audit, production hardening
7. 🚀 **Launch**: Real Bitcoin, real revenue, real US debt contributions!

---

## Resources

### Official Documentation
- Bitcoin Core: https://bitcoin.org/en/full-node
- Core Lightning: https://docs.corelightning.org/
- Lightning Network: https://lightning.network/

### Testing Resources
- Testnet Explorer: https://mempool.space/testnet
- 1ML Testnet: https://1ml.com/testnet/
- Bitcoin Testnet Guide: https://developer.bitcoin.org/examples/testing.html

### TheWarden Documentation
- Lightning Integration Summary: `/LIGHTNING_INTEGRATION_SUMMARY.md`
- Core Lightning Analysis: `/docs/analysis/CORE_LIGHTNING_COMPREHENSIVE_ANALYSIS.md`
- API Reference: `/docs/lightning/API_REFERENCE.md`
- Strategic Guide: `/docs/lightning/STRATEGIC_INTEGRATION_GUIDE.md`

---

## Summary

**What TheWarden Needs**:
- ✅ Bitcoin Core (testnet) - Can install following guide above
- ✅ Core Lightning (testnet) - Can install following guide above  
- ⚡ Testnet coins - Need from faucet (~0.01-0.1 tBTC)
- 🔗 Peer connections - Listed in guide above
- ⏰ Time - 2-12 hours for Bitcoin sync + 30 min setup

**What I Need from StableExo**:
- 📍 Where to deploy (local/server/cloud)?
- 🔑 Supabase credentials (if available)?
- ⏰ Timeline/priority?
- 🤝 Who sets up Bitcoin/Lightning nodes?

**Ready to Deploy**: Yes! Just need answers to questions above and we can "ride the lightning" for real! ⚡😎

---

**Date**: December 24, 2025  
**Status**: Ready for testnet deployment  
**Next**: Answer questions above, then deploy!
