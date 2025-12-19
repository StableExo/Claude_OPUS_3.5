#!/bin/bash

# Foundry-based Contract Verification Script for Base Network
# Based on: https://docs.base.org/learn/foundry/verify-contract-with-basescan

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FlashSwap Contract Verification (Foundry Method)       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Check for required environment variables
if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${RED}Error: BASESCAN_API_KEY not set in .env${NC}"
    exit 1
fi

# Contract addresses from .env
V2_ADDRESS="${FLASHSWAP_V2_ADDRESS}"
V3_ADDRESS="${FLASHSWAP_V3_ADDRESS}"

# Verification settings
CHAIN_ID="8453"
COMPILER_VERSION="v0.8.20+commit.a1b79de6"
OPTIMIZATION_RUNS="200"
EVM_VERSION="shanghai"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Chain ID: $CHAIN_ID (Base Mainnet)"
echo "  FlashSwapV2: $V2_ADDRESS"
echo "  FlashSwapV3: $V3_ADDRESS"
echo "  Compiler: $COMPILER_VERSION"
echo "  Optimization: Yes (200 runs)"
echo "  EVM Version: $EVM_VERSION"
echo ""

# Function to verify a contract using forge verify-contract
verify_contract() {
    local CONTRACT_NAME=$1
    local CONTRACT_ADDRESS=$2
    local CONSTRUCTOR_ARGS_FILE=$3
    local CONTRACT_PATH=$4
    
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Verifying ${CONTRACT_NAME}...${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "  Address: $CONTRACT_ADDRESS"
    echo "  Contract Path: $CONTRACT_PATH"
    echo "  Constructor Args: $CONSTRUCTOR_ARGS_FILE"
    echo ""
    
    # Read constructor arguments
    if [ -f "$CONSTRUCTOR_ARGS_FILE" ]; then
        CONSTRUCTOR_ARGS=$(cat "$CONSTRUCTOR_ARGS_FILE")
        echo "  Constructor Args (ABI-encoded): ${CONSTRUCTOR_ARGS:0:60}..."
    else
        echo -e "${RED}  Error: Constructor args file not found: $CONSTRUCTOR_ARGS_FILE${NC}"
        return 1
    fi
    
    # Run forge verify-contract
    echo ""
    echo -e "${YELLOW}Running forge verify-contract...${NC}"
    
    forge verify-contract \
        --chain-id "$CHAIN_ID" \
        --num-of-optimizations "$OPTIMIZATION_RUNS" \
        --watch \
        --constructor-args "$CONSTRUCTOR_ARGS" \
        --etherscan-api-key "$BASESCAN_API_KEY" \
        --compiler-version "$COMPILER_VERSION" \
        "$CONTRACT_ADDRESS" \
        "$CONTRACT_PATH"
    
    local EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ ${CONTRACT_NAME} verified successfully!${NC}"
        echo -e "${GREEN}   View at: https://basescan.org/address/${CONTRACT_ADDRESS}#code${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}❌ ${CONTRACT_NAME} verification failed${NC}"
        echo -e "${YELLOW}   You can verify manually at: https://basescan.org/verifyContract?a=${CONTRACT_ADDRESS}${NC}"
        return 1
    fi
}

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo -e "${RED}Error: Foundry (forge) not found${NC}"
    echo -e "${YELLOW}Install Foundry: https://getfoundry.sh/${NC}"
    echo ""
    echo "Quick install:"
    echo "  curl -L https://foundry.paradigm.xyz | bash"
    echo "  foundryup"
    exit 1
fi

echo -e "${GREEN}Foundry version:${NC}"
forge --version
echo ""

# Verify FlashSwapV2
echo ""
verify_contract \
    "FlashSwapV2" \
    "$V2_ADDRESS" \
    "verification/FlashSwapV2_constructor_args.txt" \
    "contracts/FlashSwapV2.sol:FlashSwapV2"

V2_RESULT=$?

echo ""
echo ""

# Verify FlashSwapV3
verify_contract \
    "FlashSwapV3" \
    "$V3_ADDRESS" \
    "verification/FlashSwapV3_constructor_args.txt" \
    "contracts/FlashSwapV3.sol:FlashSwapV3"

V3_RESULT=$?

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  VERIFICATION SUMMARY                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $V2_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ FlashSwapV2: VERIFIED${NC}"
    echo "   https://basescan.org/address/${V2_ADDRESS}#code"
else
    echo -e "${RED}❌ FlashSwapV2: FAILED${NC}"
    echo "   Manual verification: https://basescan.org/verifyContract?a=${V2_ADDRESS}"
fi

echo ""

if [ $V3_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ FlashSwapV3: VERIFIED${NC}"
    echo "   https://basescan.org/address/${V3_ADDRESS}#code"
else
    echo -e "${RED}❌ FlashSwapV3: FAILED${NC}"
    echo "   Manual verification: https://basescan.org/verifyContract?a=${V3_ADDRESS}"
fi

echo ""

# Exit with error if either verification failed
if [ $V2_RESULT -ne 0 ] || [ $V3_RESULT -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some verifications failed. Check errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All contracts verified successfully!${NC}"
echo ""
