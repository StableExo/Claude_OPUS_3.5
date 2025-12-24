# Lightning Network Deployment Guide

**TheWarden Lightning Network Integration** - Complete deployment guide for Bitcoin testnet and mainnet.

## Table of Contents

1. [Quick Start (Docker)](#quick-start-docker)
2. [Manual Setup](#manual-setup)
3. [Production Deployment](#production-deployment)
4. [Testing & Validation](#testing--validation)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start (Docker)

The fastest way to get started with Lightning Network integration.

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 100GB+ free disk space (for Bitcoin blockchain)
- Public IP address (for incoming connections)

### Step 1: Configuration

```bash
# Clone repository
cd /path/to/Claude_OPUS_3.5

# Create environment file
cat > .env.lightning << EOF
PUBLIC_IP=YOUR_PUBLIC_IP
LIGHTNING_API_KEYS=your-secure-api-key-here
NODE_ENV=production
EOF
```

### Step 2: Start Services

```bash
# Start all Lightning services
docker-compose -f docker/docker-compose.lightning.yml up -d

# View logs
docker-compose -f docker/docker-compose.lightning.yml logs -f

# Check status
docker-compose -f docker/docker-compose.lightning.yml ps
```

### Step 3: Wait for Bitcoin Sync

Bitcoin testnet needs to sync (~30GB). This takes 2-12 hours depending on your connection.

```bash
# Check Bitcoin sync status
docker exec warden-bitcoind-testnet bitcoin-cli -testnet \
  -rpcuser=lightning -rpcpassword=lightning getblockchaininfo

# Look for: "blocks" vs "headers" - when equal, sync is complete
```

### Step 4: Fund Your Lightning Node

```bash
# Get a new Bitcoin testnet address
docker exec warden-lightningd-testnet lightning-cli --testnet newaddr

# Fund from testnet faucet:
# https://testnet-faucet.com/btc-testnet/
# https://coinfaucet.eu/en/btc-testnet/

# Check balance
docker exec warden-lightningd-testnet lightning-cli --testnet listfunds
```

### Step 5: Open Channels

```bash
# Connect to a testnet node
docker exec warden-lightningd-testnet lightning-cli --testnet \
  connect 03abc...def@host:port

# Open channel (e.g., 1,000,000 sats)
docker exec warden-lightningd-testnet lightning-cli --testnet \
  fundchannel 03abc...def 1000000

# List channels
docker exec warden-lightningd-testnet lightning-cli --testnet listpeerchannels
```

### Step 6: Test API

```bash
# Health check
curl http://localhost:3001/health

# Create invoice (requires API key)
curl -X POST http://localhost:3001/api/invoice \
  -H "X-API-Key: your-secure-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "ai-query",
    "amountSats": 50,
    "description": "Test query"
  }'

# List invoices
curl http://localhost:3001/api/invoices \
  -H "X-API-Key: your-secure-api-key-here"
```

---

## Manual Setup

For more control or non-Docker deployments.

### 1. Install Bitcoin Core

**Ubuntu/Debian:**
```bash
sudo add-apt-repository ppa:bitcoin/bitcoin
sudo apt-get update
sudo apt-get install bitcoind bitcoin-qt
```

**macOS:**
```bash
brew install bitcoin
```

**From source:**
```bash
wget https://bitcoin.org/bin/bitcoin-core-27.0/bitcoin-27.0-x86_64-linux-gnu.tar.gz
tar -xzf bitcoin-27.0-x86_64-linux-gnu.tar.gz
sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-27.0/bin/*
```

### 2. Configure Bitcoin Core

Create `~/.bitcoin/bitcoin.conf`:

```conf
# Testnet configuration
testnet=1
server=1

# RPC configuration
rpcuser=lightning
rpcpassword=your_secure_password_here
rpcallowip=127.0.0.1

# Performance
dbcache=2000
maxmempool=500

# ZMQ (for Lightning)
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333

# Full node
txindex=1
```

### 3. Start Bitcoin Core

```bash
bitcoind -daemon

# Check status
bitcoin-cli -testnet getblockchaininfo

# Monitor logs
tail -f ~/.bitcoin/testnet3/debug.log
```

### 4. Install Core Lightning

**Ubuntu/Debian:**
```bash
# Add CLN repository
sudo apt-get install software-properties-common
sudo add-apt-repository -u ppa:lightningnetwork/ppa
sudo apt-get update
sudo apt-get install lightningd

# Or from source:
git clone https://github.com/ElementsProject/lightning.git
cd lightning
./configure
make
sudo make install
```

**macOS:**
```bash
brew install lightningd
```

### 5. Configure Core Lightning

Create `~/.lightning/config`:

```conf
network=testnet
bitcoin-rpcconnect=127.0.0.1
bitcoin-rpcport=18332
bitcoin-rpcuser=lightning
bitcoin-rpcpassword=your_secure_password_here

log-level=info
log-file=/home/user/.lightning/testnet/lightning.log

# Public node settings (if you want incoming connections)
announce-addr=YOUR_PUBLIC_IP:9735
alias=TheWarden-Node
rgb=03a6fe
```

### 6. Start Core Lightning

```bash
lightningd --daemon

# Check status
lightning-cli --testnet getinfo

# Monitor logs
tail -f ~/.lightning/testnet/lightning.log
```

### 7. Install TheWarden API

```bash
cd /path/to/Claude_OPUS_3.5

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
LIGHTNING_NETWORK=testnet
LIGHTNING_DIR=/home/user/.lightning
LIGHTNING_API_PORT=3001
LIGHTNING_API_HOST=0.0.0.0
LIGHTNING_API_KEYS=your-secure-api-key-here
EOF

# Start API server
npm run lightning:api
```

---

## Production Deployment

### Security Checklist

- [ ] Use strong, unique API keys
- [ ] Enable HTTPS (use nginx/caddy as reverse proxy)
- [ ] Set up firewall rules (UFW/iptables)
- [ ] Use systemd for automatic restarts
- [ ] Enable monitoring and alerting
- [ ] Regular backups of Lightning data
- [ ] Keep Bitcoin Core and Lightning updated
- [ ] Use separate hot/cold wallets
- [ ] Implement rate limiting
- [ ] Set up log rotation

### Systemd Services

**Bitcoin Core** (`/etc/systemd/system/bitcoind.service`):

```ini
[Unit]
Description=Bitcoin Core Testnet
After=network.target

[Service]
Type=forking
User=bitcoin
Group=bitcoin
ExecStart=/usr/local/bin/bitcoind -daemon -conf=/home/bitcoin/.bitcoin/bitcoin.conf
ExecStop=/usr/local/bin/bitcoin-cli stop
Restart=on-failure
RestartSec=60s

[Install]
WantedBy=multi-user.target
```

**Core Lightning** (`/etc/systemd/system/lightningd.service`):

```ini
[Unit]
Description=Core Lightning Testnet
Requires=bitcoind.service
After=bitcoind.service

[Service]
Type=notify
User=lightning
Group=lightning
ExecStart=/usr/local/bin/lightningd --daemon
Restart=on-failure
RestartSec=60s

[Install]
WantedBy=multi-user.target
```

**Lightning API** (`/etc/systemd/system/lightning-api.service`):

```ini
[Unit]
Description=TheWarden Lightning API
Requires=lightningd.service
After=lightningd.service

[Service]
Type=simple
User=warden
Group=warden
WorkingDirectory=/opt/warden
EnvironmentFile=/opt/warden/.env
ExecStart=/usr/bin/npm run lightning:api
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

Enable and start services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bitcoind lightningd lightning-api
sudo systemctl start bitcoind lightningd lightning-api
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name lightning.yourwarden.com;

    ssl_certificate /etc/letsencrypt/live/lightning.yourwarden.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lightning.yourwarden.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Testing & Validation

### 1. Health Checks

```bash
# Bitcoin Core
bitcoin-cli -testnet getblockchaininfo
bitcoin-cli -testnet getnetworkinfo

# Core Lightning
lightning-cli --testnet getinfo
lightning-cli --testnet listpeerchannels

# API Server
curl http://localhost:3001/health
```

### 2. Create Test Invoice

```bash
curl -X POST http://localhost:3001/api/invoice \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "test",
    "amountSats": 100,
    "description": "Integration test"
  }' | jq
```

### 3. Pay Invoice

Use a Lightning wallet (Phoenix, Wallet of Satoshi, etc.) or:

```bash
lightning-cli --testnet pay <BOLT11_INVOICE>
```

### 4. Verify Revenue Allocation

Check that 70% went to debt allocation:

```bash
curl http://localhost:3001/api/stats \
  -H "X-API-Key: your-api-key" | jq
```

---

## Monitoring

### Key Metrics

1. **Bitcoin Sync Status**: `getblockchaininfo`
2. **Lightning Channels**: Active, inactive, capacity
3. **API Requests**: Rate, errors, latency
4. **Payment Success Rate**: Paid vs expired invoices
5. **Revenue Allocation**: 70/30 split accuracy

### Monitoring Script

```bash
#!/bin/bash
# monitoring.sh - Lightning health check

echo "=== Bitcoin Status ==="
bitcoin-cli -testnet getblockchaininfo | jq '{blocks, headers, verification_progress}'

echo -e "\n=== Lightning Status ==="
lightning-cli --testnet getinfo | jq '{id, alias, blockheight, num_active_channels, num_peers}'

echo -e "\n=== API Status ==="
curl -s http://localhost:3001/health | jq

echo -e "\n=== Payment Stats ==="
curl -s http://localhost:3001/api/stats \
  -H "X-API-Key: $LIGHTNING_API_KEY" | jq
```

---

## Troubleshooting

### Bitcoin Core Issues

**Problem**: Bitcoin not syncing
```bash
# Check connections
bitcoin-cli -testnet getconnectioncount

# Check network
bitcoin-cli -testnet getnetworkinfo

# Check logs
tail -f ~/.bitcoin/testnet3/debug.log
```

### Lightning Issues

**Problem**: Can't connect to Bitcoin
```bash
# Test RPC connection
bitcoin-cli -testnet -rpcuser=lightning -rpcpassword=xxx getblockchaininfo

# Check Lightning logs
tail -f ~/.lightning/testnet/lightning.log
```

**Problem**: No peers
```bash
# Connect to known testnet nodes
lightning-cli --testnet connect \
  0242a4ae0c5bef18048fbecf995094b74bfb0f7391418d71ed394784373f41e4f3@3.33.236.230:9735
```

**Problem**: Channel stuck
```bash
# List channels
lightning-cli --testnet listpeerchannels

# Force close if needed
lightning-cli --testnet close <peer_id> true
```

### API Issues

**Problem**: API not starting
```bash
# Check logs
npm run lightning:api

# Try mock mode
npm run lightning:api:mock
```

**Problem**: Authentication failing
```bash
# Verify API key
echo $LIGHTNING_API_KEYS

# Test with correct key
curl http://localhost:3001/api/stats \
  -H "X-API-Key: correct-key-here"
```

---

## Resources

- [Bitcoin Core Documentation](https://bitcoin.org/en/bitcoin-core/)
- [Core Lightning Documentation](https://docs.corelightning.org/)
- [Lightning Network Specs (BOLTs)](https://github.com/lightning/bolts)
- [Testnet Faucets](https://testnet-faucet.com/btc-testnet/)
- [Lightning Network Explorer](https://1ml.com/testnet/)

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/StableExo/Claude_OPUS_3.5/issues
- Documentation: `/docs/lightning/`
- API Reference: See `STRATEGIC_INTEGRATION_GUIDE.md`

---

**Built with ⚡ by TheWarden - Autonomous AI for civilization-scale problems**
