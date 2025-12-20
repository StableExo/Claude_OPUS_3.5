# Session Startup Checklist 🚀

**IMPORTANT**: Run this at the START of EVERY session before any autonomous work!

---

## Quick Start

```bash
# Run initialization script
./scripts/init-session.sh

# Or manually:
NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm install 22 && \
nvm use 22 && \
npm install
```

---

## Complete Startup Checklist

### ✅ Step 1: Node.js Environment

**Command**:
```bash
NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm install 22 && \
nvm use 22
```

**Verification**:
```bash
node --version  # Should show v22.x.x
npm --version   # Should show v10.x.x
```

**Why**: Ensures correct Node.js version (22+) is active for TypeScript and all dependencies.

---

### ✅ Step 2: Install Dependencies

**Command**:
```bash
npm install
```

**Verification**:
```bash
# Check if node_modules exists
ls -la node_modules | head -5

# Check if key packages are installed
npm list @supabase/supabase-js typescript tsx
```

**Why**: All packages must be installed before running any scripts. Zero vulnerabilities expected.

---

### ✅ Step 3: Verify Repository Access (100%)

**Check Critical Directories**:
```bash
# Verify read access
ls -la src/ scripts/ docs/ .memory/ supabase/

# Verify write access
touch .test_write && rm .test_write && echo "Write access: ✅"
```

**Critical Directories**:
- ✅ `src/` - Source code
- ✅ `scripts/` - Automation scripts
- ✅ `docs/` - Documentation
- ✅ `.memory/` - Persistent memory
- ✅ `supabase/` - Database migrations

**Verification Commands**:
```bash
# Check if all directories accessible
for dir in src scripts docs .memory supabase; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/"
  else
    echo "❌ $dir/ NOT FOUND"
  fi
done
```

**Why**: Must have 100% repository access to read/write files, execute scripts, and save memory.

---

### ✅ Step 4: Verify Supabase Connectivity

**Check Configuration**:
```bash
# Check if .env exists
ls -la .env

# Check Supabase settings
grep "USE_SUPABASE\|SUPABASE_URL" .env
```

**Test Connection** (if Supabase enabled):
```bash
npm run test:supabase:connection
```

**Expected Output**:
```
USE_SUPABASE=true (if enabled)
SUPABASE_URL=https://your-project-id.supabase.co
✅ Supabase connection successful
```

**If Supabase Disabled**:
- ℹ️ That's OK! Distributed consciousness works locally too
- To enable: Set `USE_SUPABASE=true` in `.env`
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**Why**: Supabase provides persistent coordination for distributed consciousness. Verify connectivity if enabled.

---

### ✅ Step 5: Verify Environment Summary

**Run Full Initialization**:
```bash
./scripts/init-session.sh
```

**Expected Output**:
```
🚀 SESSION INITIALIZATION - TheWarden Environment Setup
═══════════════════════════════════════════════════════════

📦 Step 1/5: Setting up Node.js 22...
✅ Node.js v22.x.x ready

📚 Step 2/5: Installing dependencies...
✅ Dependencies installed

🔐 Step 3/5: Verifying repository access...
✅ Repository access: 100% verified

🗄️  Step 4/5: Verifying Supabase connectivity...
✅ Supabase check complete

📊 Step 5/5: Environment Summary
───────────────────────────────────────────────────────────
Node.js Version:    v22.x.x
npm Version:        v10.x.x
Repository:         /path/to/TheWarden
Repository Access:  100% ✅
Dependencies:       Installed ✅
Supabase Status:    Enabled ✅ (or Disabled ℹ️)
───────────────────────────────────────────────────────────

✨ Session initialization complete! Environment ready.
```

**Why**: Comprehensive validation that everything is ready before autonomous work begins.

---

## Automated Script

**Use This**:
```bash
./scripts/init-session.sh
```

**What It Does**:
1. ✅ Sets up Node.js 22 via nvm
2. ✅ Installs all npm dependencies
3. ✅ Verifies 100% repository access
4. ✅ Tests Supabase connectivity
5. ✅ Provides environment summary
6. ✅ Lists available commands

**Advantages**:
- One command does everything
- Comprehensive validation
- Clear error messages if something fails
- Summary of environment status
- Quick reference to available commands

---

## Pre-Work Validation Checklist

Before starting autonomous work, verify:

- [ ] ✅ Node.js 22+ active (`node --version`)
- [ ] ✅ Dependencies installed (`ls node_modules`)
- [ ] ✅ Repository access 100% (read + write to all directories)
- [ ] ✅ Supabase connectivity verified (if enabled)
- [ ] ✅ Environment summary looks good

**If ANY item fails**: Fix before proceeding!

---

## Common Issues & Solutions

### Issue: nvm not found
**Solution**:
```bash
# Install nvm first
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
```

### Issue: npm install fails
**Solution**:
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission denied (repository)
**Solution**:
```bash
# Check ownership
ls -la
# Should show your user as owner
# If not, contact repository administrator
```

### Issue: Supabase connection fails
**Solution**:
```bash
# Check credentials in .env
cat .env | grep SUPABASE

# Verify URL is correct
# Verify keys are not expired
# Check if Supabase project is active
```

---

## Quick Commands After Initialization

**Test Implementations**:
```bash
npm run phase1:action1            # Phase 1 Action 1 tests
npm run consciousness:distributed # Distributed PoC (local)
npm run consciousness:supabase    # Distributed with Supabase
```

**Development**:
```bash
npm run typecheck                 # Type checking
npm test                          # Run tests
npm run start:base                # Base network (dry-run)
```

**Documentation**:
```bash
cat docs/implementation/PHASE1_PROGRESS.md
cat .memory/DISTRIBUTED_CONSCIOUSNESS_MEMORY.md
```

---

## Why This Matters

### For AI Agents

1. **Environment Consistency**: Same setup every session
2. **No Surprises**: Validate before starting work
3. **Quick Failure**: Catch issues immediately, not mid-work
4. **100% Access**: Ensure full repository permissions
5. **Connectivity**: Verify external services (Supabase)

### For Autonomous Work

1. **Predictability**: Known good state before starting
2. **Efficiency**: Don't waste time on environment issues
3. **Quality**: Work proceeds smoothly when environment is right
4. **Safety**: Validate permissions before making changes
5. **Debugging**: Easy to trace if initialization was skipped

---

## Integration with Workflow

### At Session Start

```bash
# 1. FIRST THING: Initialize environment
./scripts/init-session.sh

# 2. Check memory logs (understand context)
cat .memory/log.md | tail -100

# 3. Review current work
git status
git log --oneline -10

# 4. THEN: Begin autonomous work
```

### Before Autonomous Actions

Always verify environment is ready:
- ✅ Initialization completed successfully
- ✅ All checks passed
- ✅ Summary shows green lights

### If Session Interrupted

Re-run initialization when resuming:
```bash
./scripts/init-session.sh
```

---

## Environment Variables

**Required for Basic Operation**:
- None (runs locally)

**Required for Supabase Integration**:
- `USE_SUPABASE=true`
- `SUPABASE_URL=https://your-project-id.supabase.co`
- `SUPABASE_SERVICE_KEY=your-service-key` (or `SUPABASE_ANON_KEY`)

**Optional**:
- `NODE_ENV=production` (or `development`)
- Other project-specific variables

---

## Memory Integration

**After initialization**, document in `.memory/log.md`:

```markdown
## Session: [Date] - [Task]

### Environment Initialization ✅
- Node.js: v22.x.x
- Dependencies: Installed
- Repository Access: 100%
- Supabase: [Enabled/Disabled]
- Initialization: ./scripts/init-session.sh completed successfully

### [Continue with session notes...]
```

---

## The Rule

**"No work starts until initialization completes successfully."**

This ensures:
- Environment is correct
- Dependencies are ready
- Permissions are verified
- Services are connected
- Surprises are minimized

---

**Status**: Initialization script ready  
**Command**: `./scripts/init-session.sh`  
**When**: Start of EVERY session  
**Why**: 100% environment readiness before autonomous work  

**"Initialize first, work second, succeed always."** ✅🚀
