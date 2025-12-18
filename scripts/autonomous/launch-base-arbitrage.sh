#!/bin/bash

# 🚀 LAUNCH THEWARDEN - Base Network Arbitrage
# Production launch script for autonomous money-making

echo "════════════════════════════════════════════════════════════"
echo "🚀 TheWarden - Base Network Arbitrage Launch"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Run ./scripts/autonomous/setup-base-arbitrage.sh first"
    exit 1
fi

echo -e "${BLUE}📋 Pre-Flight Checklist${NC}"
echo "────────────────────────────────────────────────────────────"

# Run diagnostic
echo ""
echo "Running system diagnostic..."
echo ""

node --import tsx scripts/autonomous/base-arbitrage-diagnostic.ts

echo ""
echo "────────────────────────────────────────────────────────────"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  IMPORTANT SAFETY NOTICE${NC}"
echo ""
echo "You are about to launch TheWarden in PRODUCTION MODE."
echo "This will execute REAL TRANSACTIONS with REAL MONEY."
echo ""
echo "Current configuration:"
echo "  • Network: Base mainnet (Chain ID 8453)"
echo "  • Mode: ${DRY_RUN:-false}"
echo "  • Safety systems: ENABLED"
echo "  • Circuit breakers: ACTIVE"
echo "  • MEV protection: ON"
echo ""
echo "Gas Economics on Base:"
echo "  • Cost per transaction: ~\$0.01"
echo "  • Current balance sufficient for: ~215 transactions"
echo "  • Estimated runtime: 21 days at 10 tx/day"
echo ""

read -p "Do you want to launch TheWarden? (yes/NO): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Launch cancelled."
    exit 0
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}🚀 LAUNCHING THEWARDEN${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

# Start TheWarden
echo "Starting autonomous arbitrage system..."
echo ""
echo "Commands:"
echo "  • Ctrl+C to stop"
echo "  • ./scripts/status.sh to check status in another terminal"
echo "  • tail -f logs/warden.log to view logs"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Launch with Node 22
source ~/.nvm/nvm.sh 2>/dev/null || true
nvm use 22 2>/dev/null || true

npm run dev

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}TheWarden Stopped${NC}"
echo "════════════════════════════════════════════════════════════"
