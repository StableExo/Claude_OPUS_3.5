#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Migrate Environment Variables to Hardhat Configuration Variables
# ═══════════════════════════════════════════════════════════════
# This script helps migrate secrets from .env to Hardhat's encrypted
# Configuration Variables for enhanced security.
#
# Based on: https://hardhat.org/docs/guides/configuration-variables
# ═══════════════════════════════════════════════════════════════

set -e

echo "🔐 Hardhat Configuration Variables Migration"
echo "════════════════════════════════════════════"
echo ""
echo "This script will migrate your secrets from .env to Hardhat's"
echo "encrypted Configuration Variables for enhanced security."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create .env from .env.example first"
    exit 1
fi

# Source .env file
echo "📂 Loading .env file..."
export $(cat .env | grep -v '^#' | xargs)
echo "✓ Environment variables loaded"
echo ""

# List of variables to migrate
VARIABLES=(
    "BASESCAN_API_KEY"
    "ETHERSCAN_API_KEY"
    "ARBISCAN_API_KEY"
    "POLYGONSCAN_API_KEY"
    "OPTIMISTIC_ETHERSCAN_API_KEY"
    "BASE_RPC_URL"
    "ETHEREUM_RPC_URL"
    "ARBITRUM_RPC_URL"
    "POLYGON_RPC_URL"
    "BASE_SEPOLIA_RPC_URL"
    "WALLET_PRIVATE_KEY"
)

echo "📋 Variables to migrate:"
for var in "${VARIABLES[@]}"; do
    if [ -n "${!var}" ]; then
        echo "   ✓ $var (set)"
    else
        echo "   ○ $var (not set)"
    fi
done
echo ""

# Confirm migration
read -p "Continue with migration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🔑 Starting migration..."
echo "You will be prompted for your Hardhat vars password for each variable."
echo ""

# Counter for migrated variables
MIGRATED=0
SKIPPED=0

# Migrate each variable
for var in "${VARIABLES[@]}"; do
    if [ -n "${!var}" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Migrating: $var"
        
        # Check if already exists in Hardhat vars
        if npx hardhat vars has "$var" 2>/dev/null; then
            echo "⚠️  Variable already exists in Hardhat vars"
            read -p "   Overwrite? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "   ○ Skipped"
                ((SKIPPED++))
                continue
            fi
        fi
        
        # Set the variable
        if echo "${!var}" | npx hardhat vars set "$var"; then
            echo "   ✓ Migrated successfully"
            ((MIGRATED++))
        else
            echo "   ✗ Migration failed"
        fi
    else
        echo "○ Skipping $var (not set in .env)"
        ((SKIPPED++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Migration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Migrated: $MIGRATED variables"
echo "   Skipped:  $SKIPPED variables"
echo ""

# Verify migration
echo "📊 Verifying migration..."
echo ""
echo "Current Hardhat Configuration Variables:"
npx hardhat vars list
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Test your configuration:"
echo "   npx hardhat compile"
echo ""
echo "2. Verify a contract:"
echo "   npx hardhat verify --network base <address>"
echo ""
echo "3. IMPORTANT: Backup your keystore file:"
echo "   cp ~/.hardhat-vars.json ~/.hardhat-vars.backup.json"
echo ""
echo "4. Optional: Clean up .env file:"
echo "   # Remove migrated secrets from .env (keep non-sensitive vars)"
echo "   # NEVER commit .env to git!"
echo ""
echo "5. Remember your password:"
echo "   Store your Hardhat vars password in a password manager"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
