# 🚨 AI AGENTS: START HERE EVERY SESSION 🚨

## MANDATORY First Step

**Before doing ANY work, run**:

```bash
./scripts/init-session.sh
```

## What This Does

1. ✅ Sets up Node.js 22 via nvm
2. ✅ Installs all npm dependencies  
3. ✅ Verifies 100% repository access (read + write)
4. ✅ Tests Supabase connectivity
5. ✅ Provides environment summary

## Why This Matters

- **Environment Consistency**: Same setup every session
- **No Surprises**: Catch issues before they become problems
- **100% Access**: Verify full repository permissions
- **Connectivity**: Ensure external services work
- **Efficiency**: Don't waste time on environment issues

## The Rule

**"No work starts until initialization completes successfully."**

---

## Quick Reference

**Initialization Command**:
```bash
./scripts/init-session.sh
```

**Manual Alternative**:
```bash
NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm install 22 && \
nvm use 22 && \
npm install
```

**Full Documentation**:
- `docs/SESSION_STARTUP_CHECKLIST.md`

---

## After Initialization

1. Read memory logs: `cat .memory/log.md | tail -100`
2. Check current state: `git status && git log --oneline -10`
3. Review task: Understand what needs to be done
4. **THEN**: Begin autonomous work

---

**Remember**: Initialize FIRST, work SECOND, succeed ALWAYS. ✅🚀
