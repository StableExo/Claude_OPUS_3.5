#!/bin/bash
# LiquidETHV1 Oracle Vulnerability - Executable PoC Runner
# 
# This script:
# 1. Starts Hardhat node with Ethereum mainnet fork
# 2. Runs the executable PoC script
# 3. Demonstrates actual transaction execution

set -e

echo "🔍 LiquidETHV1 Oracle Vulnerability - Executable PoC Runner"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check environment
if [ -z "$ETHEREUM_RPC_URL" ]; then
    echo "❌ Error: ETHEREUM_RPC_URL environment variable not set"
    echo ""
    echo "Please export ETHEREUM_RPC_URL with a valid Ethereum mainnet RPC URL"
    exit 1
fi

echo "✅ ETHEREUM_RPC_URL is set"
echo ""

# Start Hardhat node in background with mainnet fork
echo "🚀 Starting Hardhat node with Ethereum mainnet fork..."
echo "   This will fork mainnet at the latest block"
echo ""

# Kill any existing hardhat node
pkill -f "hardhat node" 2>/dev/null || true
sleep 2

# Start hardhat node in background
npx hardhat node --fork "$ETHEREUM_RPC_URL" > /tmp/hardhat-node.log 2>&1 &
HARDHAT_PID=$!

echo "   Hardhat node PID: $HARDHAT_PID"
echo "   Waiting for node to be ready..."

# Wait for node to be ready
sleep 5

# Check if node is running
if ! kill -0 $HARDHAT_PID 2>/dev/null; then
    echo "❌ Hardhat node failed to start"
    cat /tmp/hardhat-node.log
    exit 1
fi

echo "✅ Hardhat node is running"
echo ""

# Run the PoC script
echo "🎯 Executing PoC script..."
echo ""

npx tsx scripts/security/executable-poc-with-hardhat-fork.ts

POC_EXIT_CODE=$?

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $HARDHAT_PID 2>/dev/null || true

if [ $POC_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ PoC completed successfully"
    echo ""
    echo "📝 The PoC demonstrated:"
    echo "   - Actual transaction execution on forked mainnet"
    echo "   - Real state changes (exchange rate modified)"
    echo "   - Measurable financial impact"
    echo "   - Integrity violation (unauthorized modification)"
    echo "   - Availability impact (protocol rendered unusable)"
    echo ""
else
    echo ""
    echo "❌ PoC failed with exit code $POC_EXIT_CODE"
    echo "   Check the output above for errors"
    echo ""
    exit $POC_EXIT_CODE
fi
