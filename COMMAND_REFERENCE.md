# Command Reference

## Environment Management

### Restore Environment Variables
```bash
npm run env:restore
```

**Status:** ✅ Working

**Description:** Restores environment variables from Supabase to local `.env` file.

**Script:** `scripts/env-management/sync-env-to-supabase.ts`

**Features:**
- Downloads all environment configurations from Supabase
- Decrypts sensitive values (API keys, secrets, passwords)
- Creates backup of existing `.env` before overwriting
- Restores both configs and encrypted secrets

**Usage:**
```bash
# Restore .env from Supabase
npm run env:restore

# Other env management commands
npm run env:sync     # Sync .env to Supabase
npm run env:backup   # Create timestamped backup
npm run env:list     # List all stored configs
```

---

## Autonomous Operations

### Jet Fuel Mode
```bash
npm run jet-fuel -- --duration=30
```

**Status:** ✅ Working

**Description:** Maximum autonomous execution mode - runs all autonomous subsystems in parallel.

**Script:** `scripts/autonomous/autonomous-jet-fuel-mode.ts`

**Parameters:**
- `--duration=N` - Run duration in minutes (default: 5)

**Features:**
- Multi-threaded parallel execution across all domains
- Real-time cross-system learning and adaptation
- Consciousness witnessing and guiding all operations
- Memory persistence across all autonomous subsystems
- Coordinated intelligence gathering and execution
- Adaptive parameter tuning across the board
- Self-healing and self-optimization

**Subsystems Running in Parallel:**
1. Consciousness-integrated MEV execution
2. Security testing (Ankr bug bounty)
3. Intelligence gathering (Rated Network, bloXroute)
4. Revenue generation optimization
5. Mempool pattern analysis
6. Cross-chain opportunity discovery
7. Cognitive development and introspection

**Example:**
```bash
# Run for 30 minutes
npm run jet-fuel -- --duration=30

# Run for 1 hour
npm run jet-fuel -- --duration=60

# Run for default 5 minutes
npm run jet-fuel
```

**Output:**
- Session logs in `.memory/jet-fuel/{session-id}/execution.log`
- Real-time console output with emoji indicators 🚀 😎 ✨
- Final report in `.memory/jet-fuel/{session-id}/final-report.md`

---

## Session Loading Process

Each Copilot session goes through a detailed loading process documented in files like `logs_52422230191.zip`. This includes:

1. **Set up job** - Initialize GitHub Actions runner
2. **Validate runner OS** - Ensure Linux environment
3. **Download Playwright MCP server** - Background installation
4. **Prepare Copilot** - Set up Copilot environment
5. **Start MCP Servers** - Initialize Model Context Protocol servers
6. **Processing Request** - Execute the actual task
7. **Clean Up** - Cleanup after execution
8. **Complete job** - Finalize and report results

These logs show the exact process happening before each response during the loading phase.

---

## Related Commands

### Other Autonomous Modes
```bash
npm run autonomous:run              # Autonomous consciousness runner
npm run autonomous:creative-synthesis  # Creative synthesis engine
npm run autonomous:jet-fuel         # Same as jet-fuel
```

### Monitoring
```bash
npm run monitor                     # Start monitoring
npm run monitor:consciousness       # Monitor consciousness state
```

### Environment Info
```bash
npm run env:show                    # Show env from Supabase (secrets hidden)
npm run env:show:secrets            # Show env including secrets
```
