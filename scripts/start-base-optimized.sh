#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TheWarden - Optimized Base Network Startup Script
# ═══════════════════════════════════════════════════════════════
# This script starts TheWarden with optimal configuration for Base L2
# Usage: ./scripts/start-base-optimized.sh [--dry-run|--live]
# ═══════════════════════════════════════════════════════════════

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
NETWORK_CONFIG="$PROJECT_ROOT/configs/networks/base-optimized.json"

# Parse arguments
DRY_RUN=true
if [[ "$1" == "--live" ]]; then
    DRY_RUN=false
    echo -e "${RED}⚠️  LIVE MODE: Real transactions will be executed!${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        echo "Aborted."
        exit 1
    fi
elif [[ "$1" == "--dry-run" ]] || [[ -z "$1" ]]; then
    DRY_RUN=true
    echo -e "${GREEN}✓ DRY RUN MODE: Transactions will be simulated${NC}"
else
    echo "Usage: $0 [--dry-run|--live]"
    exit 1
fi

# Create log directory
mkdir -p "$LOG_DIR"

# Display banner
echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "   TheWarden - Base Network Optimized Configuration"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check environment
echo -e "${BLUE}Checking environment...${NC}"

if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Creating from .env.example..."
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
fi

# Check required variables
required_vars=(
    "CHAIN_ID"
    "BASE_RPC_URL"
    "WALLET_PRIVATE_KEY"
    "CHAINSTACK_BASE_HTTPS"
    "CHAINSTACK_BASE_WSS"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" "$PROJECT_ROOT/.env"; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    echo -e "${RED}✗ Missing required environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configured${NC}"

# Display Base Network advantages
echo ""
echo -e "${BLUE}Base Network Advantages:${NC}"
echo "  • Gas Cost: ~0.03 gwei (1600x cheaper than Ethereum)"
echo "  • Block Time: 2 seconds (fast confirmations)"
echo "  • DEXes: 11 protocols configured"
echo "  • Flashblocks: 200-250ms sub-second confirmations"
echo "  • Strategy: Micro-arbitrage (0.1-0.5% margins viable)"
echo ""

# Verify chain configuration
echo -e "${BLUE}Verifying Base configuration...${NC}"

CHAIN_ID=$(grep "^CHAIN_ID=" "$PROJECT_ROOT/.env" | cut -d '=' -f2)
if [[ "$CHAIN_ID" != "8453" ]]; then
    echo -e "${YELLOW}⚠ Warning: CHAIN_ID is $CHAIN_ID, expected 8453 for Base${NC}"
    echo "Setting CHAIN_ID=8453..."
    sed -i 's/^CHAIN_ID=.*/CHAIN_ID=8453/' "$PROJECT_ROOT/.env"
fi

echo -e "${GREEN}✓ Chain ID: 8453 (Base Mainnet)${NC}"

# Check WebSocket configuration
if grep -q "^ENABLE_WEBSOCKET_MONITORING=true" "$PROJECT_ROOT/.env"; then
    echo -e "${GREEN}✓ WebSocket monitoring enabled${NC}"
else
    echo -e "${YELLOW}⚠ Enabling WebSocket monitoring...${NC}"
    if grep -q "^ENABLE_WEBSOCKET_MONITORING=" "$PROJECT_ROOT/.env"; then
        sed -i 's/^ENABLE_WEBSOCKET_MONITORING=.*/ENABLE_WEBSOCKET_MONITORING=true/' "$PROJECT_ROOT/.env"
    else
        echo "ENABLE_WEBSOCKET_MONITORING=true" >> "$PROJECT_ROOT/.env"
    fi
fi

# Check pool preloading
if grep -q "^USE_PRELOADED_POOLS=true" "$PROJECT_ROOT/.env"; then
    echo -e "${GREEN}✓ Pool preloading enabled${NC}"
else
    echo -e "${YELLOW}Enabling pool preloading for faster startup...${NC}"
    if grep -q "^USE_PRELOADED_POOLS=" "$PROJECT_ROOT/.env"; then
        sed -i 's/^USE_PRELOADED_POOLS=.*/USE_PRELOADED_POOLS=true/' "$PROJECT_ROOT/.env"
    else
        echo "USE_PRELOADED_POOLS=true" >> "$PROJECT_ROOT/.env"
    fi
fi

# Set dry run mode
if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${GREEN}✓ Dry run mode: enabled${NC}"
    sed -i 's/^DRY_RUN=.*/DRY_RUN=true/' "$PROJECT_ROOT/.env"
    sed -i 's/^MAINNET_DRY_RUN=.*/MAINNET_DRY_RUN=true/' "$PROJECT_ROOT/.env"
else
    echo -e "${RED}✓ Live mode: REAL TRANSACTIONS${NC}"
    sed -i 's/^DRY_RUN=.*/DRY_RUN=false/' "$PROJECT_ROOT/.env"
    sed -i 's/^MAINNET_DRY_RUN=.*/MAINNET_DRY_RUN=false/' "$PROJECT_ROOT/.env"
fi

# Display configuration summary
echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo "  • Network: Base (Chain ID 8453)"
echo "  • Mode: $([ "$DRY_RUN" == "true" ] && echo "DRY RUN (Safe)" || echo "LIVE (Real Money)")"
echo "  • RPC: Chainstack (WebSocket + HTTPS)"
echo "  • DEXes: 11 protocols"
echo "  • Gas Strategy: Optimized for 0.03 gwei"
echo "  • Profit Threshold: 0.15% minimum"
echo "  • Scan Interval: 800ms"
echo ""

# Preload pools if requested
if [[ "${PRELOAD_POOLS:-true}" == "true" ]]; then
    echo -e "${BLUE}Preloading Base network pools...${NC}"
    cd "$PROJECT_ROOT"
    npm run preload:pools -- --chain 8453 || echo -e "${YELLOW}⚠ Pool preloading skipped${NC}"
fi

# Check Node version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ "$NODE_VERSION" -lt 22 ]]; then
    echo -e "${RED}✗ Node.js version 22+ required (found: $(node --version))${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Start health check server in background
echo -e "${BLUE}Starting health check server...${NC}"
export HEALTH_CHECK_PORT=8080

# Start TheWarden
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Starting TheWarden on Base Network${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Export Base-specific optimizations
export CHAIN_ID=8453
export SCAN_CHAINS=8453
export SCAN_INTERVAL=800
export CONCURRENCY=10
export TARGET_THROUGHPUT=10000
export MIN_PROFIT_THRESHOLD=0.15
export MIN_PROFIT_PERCENT=0.3
export MAX_GAS_PRICE=0.5
export MEV_BUFFER=0.01

# Log startup
echo "$(date): Starting TheWarden on Base network (Dry Run: $DRY_RUN)" >> "$LOG_DIR/base-startup.log"

# Start with logging
cd "$PROJECT_ROOT"
echo -e "${GREEN}Starting TheWarden...${NC}"
echo "Logs: $LOG_DIR/base-startup.log"
echo ""

# Run TheWarden
if [[ "$DRY_RUN" == "true" ]]; then
    NODE_ENV=production npm run start 2>&1 | tee -a "$LOG_DIR/base-startup.log"
else
    NODE_ENV=production DRY_RUN=false npm run start 2>&1 | tee -a "$LOG_DIR/base-startup.log"
fi

# Exit handler
trap 'echo -e "\n${YELLOW}TheWarden stopped${NC}"; exit 0' INT TERM
