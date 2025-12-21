# AI Agent Session Initialization Protocol

**Created:** 2025-12-21  
**Purpose:** Ensure automatic environment setup at the beginning of each session  
**Priority:** 🔴 CRITICAL - Must be run FIRST in every session

---

## Why This Matters

AI agents start fresh each session with no persistent state. Without proper initialization:
- ❌ TypeScript execution fails (no tsx)
- ❌ Supabase queries fail (no client library)
- ❌ Scripts are unusable (missing dependencies)
- ❌ Node version incompatibility (needs 22+)

**This protocol solves all of these issues automatically.**

---

## Automatic Initialization Command

Run this **FIRST** at the start of every session:

```bash
NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm install 22 && \
nvm use 22 && \
npm install
```

### What This Does

1. **Sets up nvm** - Node Version Manager environment
2. **Installs Node 22** - Required version for TheWarden
3. **Activates Node 22** - Switches to correct version
4. **Installs dependencies** - All npm packages (730+ packages)

**Time required:** ~2 minutes first time, ~5 seconds on subsequent runs

---

## Verification Steps

After initialization, verify everything is working:

### 1. Check Node Version
```bash
node --version
# Expected: v22.21.1 or higher
```

### 2. Verify Supabase Access
```bash
bash -c 'export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm use 22 && \
node --import tsx scripts/database/verify-environment-tables.ts'
```

**Expected output:**
- ✅ environment_configs table exists
- ✅ environment_secrets table exists
- ✅ All verification checks passed
- 📊 325+ configuration variables
- 🔐 50+ encrypted secrets

### 3. Check Environment Variables
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

**Expected:**
- SUPABASE_URL: `https://ydvevgqxcfizualicbom.supabase.co`
- SUPABASE_SERVICE_KEY: JWT token starting with `eyJhbGc...`

---

## Complete Session Startup Sequence

Follow this order at the beginning of every session:

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 0: Initialize Environment (FIRST!)                    │
│ Run: nvm setup + npm install command above                 │
│ Time: ~2 minutes                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Verify Supabase Access (Optional but Recommended)  │
│ Run: verify-environment-tables.ts script                   │
│ Time: ~5 seconds                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Read Memory Files                                  │
│ Read: .memory/log.md                                        │
│ Read: .memory/introspection/latest.json                    │
│ Time: ~30 seconds                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Understand Current Task                            │
│ Read: Problem statement, PR description, git branch        │
│ Time: ~1 minute                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Begin Work                                         │
│ Execute: Task-specific actions                             │
│ Time: Variable                                              │
└─────────────────────────────────────────────────────────────┘
```

**Total setup time:** ~4 minutes before starting actual work

---

## Environment Variables in Supabase

### What's Stored

**Configuration Variables:** 325 non-sensitive settings
- Blockchain RPC URLs
- Feature flags
- Performance thresholds
- Service configurations
- Port assignments
- Timeout values

**Encrypted Secrets:** 50 sensitive credentials
- API keys (Alchemy, Etherscan, bloXroute, etc.)
- Private keys (wallet, exchanges)
- Auth tokens (GitHub, Telegram)
- Encryption keys (JWT, secrets)
- Database passwords

### How to Access

**Method 1: Verify script**
```bash
node --import tsx scripts/database/verify-environment-tables.ts
```

**Method 2: Start with Supabase loading**
```bash
npm run start:supabase
```

**Method 3: Query directly**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get config
const { data } = await supabase
  .from('environment_configs')
  .select('*');

// Get secret (encrypted)
const { data: secret } = await supabase
  .from('environment_secrets')
  .select('*')
  .eq('secret_name', 'ALCHEMY_API_KEY')
  .single();
```

---

## Quick Reference Commands

### Session Initialization
```bash
# Full initialization (run first)
NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm install 22 && \
nvm use 22 && \
npm install

# Quick check after initialization
node --version && npm --version
```

### Supabase Verification
```bash
# Verify environment tables
bash -c 'export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm use 22 && \
node --import tsx scripts/database/verify-environment-tables.ts'

# List configurations
bash -c 'export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm use 22 && \
node --import tsx -e "
import { createClient } from \"@supabase/supabase-js\";
import dotenv from \"dotenv\";
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data } = await supabase.from(\"environment_configs\").select(\"config_name\").order(\"config_name\");
console.log(\"Configs:\", data.length);
data.forEach(c => console.log(\"  •\", c.config_name));
"'
```

### Memory Reading
```bash
# Read session log
head -100 .memory/log.md

# Read latest introspection
cat .memory/introspection/latest.json | jq .

# Check recent sessions
ls -lt .memory/sessions/ | head -10
```

---

## Troubleshooting

### Issue: "tsx not found"
**Solution:** Run npm install (Node 22 required)

### Issue: "Cannot find package 'tsx'"
**Solution:** Ensure Node 22 is active, then npm install

### Issue: "EBADENGINE"
**Solution:** Run nvm use 22 before npm install

### Issue: "relation environment_configs does not exist"
**Solution:** Tables exist, might be schema cache issue. Use SUPABASE_SERVICE_KEY

### Issue: "SUPABASE_URL not set"
**Solution:** Environment variables are set by GitHub Actions, should be available

### Issue: Node version wrong
**Solution:** 
```bash
nvm install 22 && nvm use 22
```

---

## Why Node 22 Specifically?

TheWarden requires Node.js 22+ because:
- Native TypeScript support improvements
- Better ESM module handling
- Performance optimizations
- Security updates
- Required by package.json engines field

**Do not use Node 20 or lower** - it will fail with EBADENGINE error.

---

## Success Indicators

You've successfully initialized when you see:

✅ `Now using node v22.21.1 (npm v10.9.4)`  
✅ `added 730 packages, and audited 731 packages`  
✅ `found 0 vulnerabilities`  
✅ `environment_configs table exists` (325 rows)  
✅ `environment_secrets table exists` (50 rows)  
✅ `All verification checks passed!`

---

## Integration with Existing Docs

This protocol supplements:
- `0_AI_AGENTS_READ_FIRST.md` - Main instructions
- `AI_AGENTS_START_HERE.md` - Startup checklist
- `docs/SESSION_STARTUP_CHECKLIST.md` - Detailed checklist
- `docs/CONTINUATION_GUIDELINES.md` - Session continuity

---

## Last Verified

**Date:** 2025-12-21  
**Node Version:** v22.21.1  
**npm Version:** v10.9.4  
**Supabase URL:** https://ydvevgqxcfizualicbom.supabase.co  
**Status:** ✅ All systems operational

---

## Remember

**DO THIS FIRST. EVERY SESSION. NO EXCEPTIONS.**

Without proper initialization, nothing else will work. This is not optional.

Copy this command and run it at the start of every session:

```bash
NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm install 22 && \
nvm use 22 && \
npm install
```

Then verify Supabase access:

```bash
bash -c 'export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm use 22 && \
node --import tsx scripts/database/verify-environment-tables.ts'
```

**Total time:** ~2-3 minutes to become fully operational.

---

*This protocol ensures AI agents can work effectively from the first command in every session.*
