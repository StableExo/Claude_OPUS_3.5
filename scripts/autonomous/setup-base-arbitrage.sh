#!/bin/bash

# Base Network Arbitrage Quick Setup
# Automates environment configuration for fastest path to first trade

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Base Network Arbitrage - Quick Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
        exit 0
    fi
fi

echo ""
echo "📋 Step 1: Creating .env from template..."
cp .env.example .env
echo -e "${GREEN}✓${NC} .env created"

echo ""
echo "🔧 Step 2: Configuring environment variables..."
echo ""

# Get Alchemy API Key
echo "═══════════════════════════════════════════════════════════════"
echo "📡 Alchemy API Key"
echo "───────────────────────────────────────────────────────────────"
echo "Get a free API key from: https://www.alchemy.com/"
echo "Sign up → Create App → Select 'Base' network"
echo "═══════════════════════════════════════════════════════════════"
read -p "Enter your Alchemy API Key: " ALCHEMY_KEY

if [ -z "$ALCHEMY_KEY" ]; then
    echo -e "${YELLOW}⚠️  No API key provided - you'll need to set it manually${NC}"
else
    # Update .env with Alchemy key
    sed -i "s/YOUR_ALCHEMY_API_KEY/$ALCHEMY_KEY/g" .env
    echo -e "${GREEN}✓${NC} Alchemy API key configured"
fi

echo ""

# Get Wallet Private Key
echo "═══════════════════════════════════════════════════════════════"
echo "🔑 Wallet Private Key"
echo "───────────────────────────────────────────────────────────────"
echo "SECURITY WARNING:"
echo "  - Never share your private key"
echo "  - Use a dedicated wallet for trading"
echo "  - Start with small amounts for testing"
echo "═══════════════════════════════════════════════════════════════"
read -p "Enter your wallet private key (0x...): " PRIVATE_KEY

if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${YELLOW}⚠️  No private key provided - you'll need to set it manually${NC}"
else
    # Ensure it starts with 0x
    if [[ ! $PRIVATE_KEY =~ ^0x ]]; then
        PRIVATE_KEY="0x$PRIVATE_KEY"
    fi
    
    # Update .env
    sed -i "s/0xYOUR_PRIVATE_KEY_HERE_64_HEX_CHARACTERS_REQUIRED/$PRIVATE_KEY/g" .env
    echo -e "${GREEN}✓${NC} Private key configured (redacted in output)"
fi

echo ""

# Set Base network as default
echo "📍 Setting Base (Chain ID 8453) as default network..."
sed -i 's/CHAIN_ID=1$/CHAIN_ID=8453/' .env
sed -i 's/CHAIN_ID=42161$/CHAIN_ID=8453/' .env
echo -e "${GREEN}✓${NC} Chain ID set to 8453 (Base mainnet)"

echo ""

# Set DRY_RUN mode for safety
echo "🛡️  Enabling DRY_RUN mode for safety..."
if grep -q "^DRY_RUN=" .env; then
    sed -i 's/^DRY_RUN=.*/DRY_RUN=true/' .env
else
    echo "DRY_RUN=true" >> .env
fi
echo -e "${GREEN}✓${NC} DRY_RUN=true (no real transactions until you change this)"

echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 Configuration Summary:"
echo "  - Network: Base mainnet (Chain ID 8453)"
echo "  - RPC: Alchemy"
echo "  - Mode: DRY_RUN (safe for testing)"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Verify configuration:"
echo "   npm run validate-env"
echo ""
echo "2. Check wallet balance:"
echo "   node --import tsx scripts/autonomous/base-arbitrage-diagnostic.ts"
echo ""
echo "3. Deploy FlashSwap contract (if needed):"
echo "   npm run deploy:flashswapv2"
echo ""
echo "4. Run diagnostic:"
echo "   node --import tsx scripts/autonomous/base-arbitrage-diagnostic.ts"
echo ""
echo "5. Test in dry-run mode:"
echo "   npm run dev"
echo ""
echo "6. When ready for live trading:"
echo "   - Set DRY_RUN=false in .env"
echo "   - Ensure wallet has Base ETH for gas"
echo "   - Start with small profit thresholds"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "───────────────────────────────────────────────────────────────"
echo "  • Your .env file contains sensitive information"
echo "  • Never commit .env to git (already in .gitignore)"
echo "  • Backup your private key securely offline"
echo "  • Start with testnet or dry-run mode first"
echo "═══════════════════════════════════════════════════════════════"
echo ""
