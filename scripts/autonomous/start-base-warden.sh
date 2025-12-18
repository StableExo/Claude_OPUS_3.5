#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TheWarden - Autonomous Base Network Starter
# ═══════════════════════════════════════════════════════════════
# This script configures and starts TheWarden specifically for
# the Base network (Chain ID 8453) with optimized settings.
#
# Usage:
#   ./scripts/autonomous/start-base-warden.sh [OPTIONS]
#
# Options:
#   --dry-run          Run in dry-run mode (no real transactions)
#   --live             Run with real transactions (⚠️ REAL MONEY!)
#   --duration=SECS    Run for specified duration (default: infinite)
#   --help             Show this help message
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# Determine the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
DRY_RUN=true
DURATION=""
SHOW_HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --live)
            DRY_RUN=false
            shift
            ;;
        --duration=*)
            DURATION="${1#*=}"
            shift
            ;;
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
    cat << 'EOF'
═══════════════════════════════════════════════════════════════
  TheWarden - Autonomous Base Network Starter
═══════════════════════════════════════════════════════════════

This script configures and starts TheWarden for the Base network
with optimized settings for arbitrage on Chain ID 8453.

Usage:
  ./scripts/autonomous/start-base-warden.sh [OPTIONS]

Options:
  --dry-run          Run in dry-run mode (no real transactions)
                     This is the DEFAULT and RECOMMENDED for testing

  --live             Run with REAL transactions (⚠️ USES REAL MONEY!)
                     Only use after thorough testing in dry-run mode

  --duration=SECS    Run for specified duration in seconds
                     Example: --duration=3600 (1 hour)
                     If not specified, runs indefinitely

  --help, -h         Show this help message

Examples:
  # Test run (dry-run mode, 10 minutes)
  ./scripts/autonomous/start-base-warden.sh --dry-run --duration=600

  # Production run (REAL transactions, infinite)
  ./scripts/autonomous/start-base-warden.sh --live

Environment Variables (from .env):
  BASE_RPC_URL              Base network RPC endpoint (required)
  WALLET_PRIVATE_KEY        Wallet private key (required)
  SCAN_INTERVAL            Pool scan interval (default: 800ms)
  MIN_PROFIT_THRESHOLD     Minimum profit % (default: 0.15%)

Base Network Optimizations:
  - Chain ID: 8453
  - DEXes: Uniswap V2/V3, Aerodrome, BaseSwap, PancakeSwap V3
  - Lower gas costs than Ethereum
  - Fast block times (~2 seconds)

═══════════════════════════════════════════════════════════════
EOF
    exit 0
fi

# Change to project directory
cd "$PROJECT_ROOT"

# Banner
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  TheWarden - Autonomous Base Network Starter${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please create .env from .env.example and configure it:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo ""
    echo "Required settings for Base network:"
    echo "  CHAIN_ID=8453"
    echo "  BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR-API-KEY"
    echo "  WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    exit 1
fi

# Backup existing .env
cp .env .env.backup

# Override critical settings for Base network
echo -e "${YELLOW}Configuring for Base network...${NC}"

# Create a temporary .env with Base network overrides
cat > .env.base << EOF
# === Base Network Configuration (Auto-generated) ===
# This file is created by start-base-warden.sh
# Original .env is backed up to .env.backup

CHAIN_ID=8453
DRY_RUN=$DRY_RUN
NODE_ENV=production

# === DEX Configuration for Base ===
ENABLE_UNISWAP_V2=true
ENABLE_UNISWAP_V3=true
ENABLE_AERODROME=true
ENABLE_BASESWAP=true
ENABLE_PANCAKESWAP=true

# === Performance Tuning for Base ===
SCAN_INTERVAL=800
MIN_PROFIT_THRESHOLD=0.15
MIN_PROFIT_PERCENT=0.3

# === Safety Systems ===
CIRCUIT_BREAKER_ENABLED=true
EMERGENCY_STOP_ENABLED=true

EOF

# Merge with existing .env (Base settings take priority)
cat .env >> .env.base
mv .env.base .env

# Display configuration
echo -e "${GREEN}Configuration:${NC}"
echo "  Chain ID: 8453 (Base)"
echo "  Dry Run: $DRY_RUN"
echo "  Duration: ${DURATION:-Infinite}"
echo ""

# Warning for live mode
if [ "$DRY_RUN" = "false" ]; then
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ⚠️  WARNING: RUNNING IN LIVE MODE (REAL TRANSACTIONS)${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo "This will execute REAL transactions with REAL money on Base network!"
    echo "Press Ctrl+C within 10 seconds to abort..."
    echo ""
    
    for i in {10..1}; do
        echo -ne "\rStarting in $i seconds... "
        sleep 1
    done
    echo ""
else
    echo -e "${GREEN}Running in DRY RUN mode - no real transactions${NC}"
    echo ""
fi

# Start TheWarden
echo -e "${CYAN}Starting TheWarden on Base network...${NC}"
echo ""

if [ -n "$DURATION" ]; then
    echo "Will run for $DURATION seconds ($(($DURATION / 60)) minutes)"
    timeout ${DURATION}s npm run start || {
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
            echo -e "${GREEN}✅ TheWarden completed scheduled run${NC}"
        else
            echo -e "${RED}⚠️ TheWarden exited with code: $EXIT_CODE${NC}"
            
            # Restore original .env
            mv .env.backup .env
            exit $EXIT_CODE
        fi
    }
else
    echo "Running indefinitely (Ctrl+C to stop)"
    npm run start
fi

# Restore original .env
echo ""
echo -e "${YELLOW}Restoring original .env configuration...${NC}"
mv .env.backup .env

echo -e "${GREEN}✅ Base network run complete${NC}"
