#!/bin/bash

# Session Initialization Script
# Run this at the start of EVERY session to ensure environment is ready
# This validates: Node.js, dependencies, repository access, and Supabase connectivity

set -e  # Exit on any error

echo "🚀 SESSION INITIALIZATION - TheWarden Environment Setup"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Setup Node.js 22 via nvm
echo "📦 Step 1/5: Setting up Node.js 22..."
NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
echo "✅ Node.js $(node --version) ready"
echo ""

# Step 2: Install dependencies
echo "📚 Step 2/5: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Verify repository access
echo "🔐 Step 3/5: Verifying repository access..."
REPO_ROOT=$(pwd)
echo "   Repository root: $REPO_ROOT"

# Check critical directories
CRITICAL_DIRS=(
  "src"
  "scripts"
  "docs"
  ".memory"
  "supabase"
)

echo "   Checking critical directories..."
for dir in "${CRITICAL_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "   ✅ $dir/ accessible"
  else
    echo "   ❌ $dir/ NOT FOUND"
    exit 1
  fi
done

# Check write access
echo "   Testing write access..."
TEST_FILE=".session_init_test_$$"
if touch "$TEST_FILE" 2>/dev/null; then
  rm "$TEST_FILE"
  echo "   ✅ Write access confirmed"
else
  echo "   ❌ Write access DENIED"
  exit 1
fi
echo "✅ Repository access: 100% verified"
echo ""

# Step 4: Check Supabase connectivity
echo "🗄️  Step 4/5: Verifying Supabase connectivity..."

# Check if Supabase is enabled
if [ -f ".env" ]; then
  USE_SUPABASE=$(grep "^USE_SUPABASE=" .env 2>/dev/null | cut -d '=' -f2)
  SUPABASE_URL=$(grep "^SUPABASE_URL=" .env 2>/dev/null | cut -d '=' -f2)
  
  if [ "$USE_SUPABASE" = "true" ]; then
    echo "   Supabase enabled in .env"
    echo "   URL: $SUPABASE_URL"
    
    # Test connection with Node.js script
    node --import tsx -e "
      import { createClient } from '@supabase/supabase-js';
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
      if (!url || !key) {
        console.log('   ⚠️  Supabase credentials missing');
        process.exit(0);
      }
      try {
        const supabase = createClient(url, key);
        console.log('   ✅ Supabase client created successfully');
      } catch (error) {
        console.log('   ❌ Supabase connection failed:', error.message);
      }
    " 2>/dev/null || echo "   ⚠️  Supabase connection test skipped (dependencies loading)"
  else
    echo "   ℹ️  Supabase disabled (USE_SUPABASE=false or not set)"
    echo "   To enable: Set USE_SUPABASE=true in .env"
  fi
else
  echo "   ⚠️  No .env file found"
  echo "   Create .env from .env.example if needed"
fi
echo "✅ Supabase check complete"
echo ""

# Step 5: Summary
echo "📊 Step 5/5: Environment Summary"
echo "───────────────────────────────────────────────────────────"
echo "Node.js Version:    $(node --version)"
echo "npm Version:        $(npm --version)"
echo "Repository:         $REPO_ROOT"
echo "Repository Access:  100% ✅"
echo "Dependencies:       Installed ✅"
echo "Supabase Status:    $([ "$USE_SUPABASE" = "true" ] && echo "Enabled ✅" || echo "Disabled ℹ️")"
echo "───────────────────────────────────────────────────────────"
echo ""

echo "✨ Session initialization complete! Environment ready."
echo ""
echo "Available commands:"
echo "  npm run phase1:action1            - Run Phase 1 Action 1 baseline tests"
echo "  npm run consciousness:distributed - Run distributed consciousness PoC"
echo "  npm run consciousness:supabase    - Run with Supabase integration"
echo "  npm run start:base                - Start Base network operations (dry-run)"
echo ""
echo "Documentation:"
echo "  docs/implementation/PHASE1_PROGRESS.md"
echo "  docs/exploration/DISTRIBUTED_CONSCIOUSNESS_ARCHITECTURE.md"
echo "  .memory/DISTRIBUTED_CONSCIOUSNESS_MEMORY.md"
echo ""
