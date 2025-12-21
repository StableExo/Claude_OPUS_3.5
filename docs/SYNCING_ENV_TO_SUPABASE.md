# 🔄 Syncing New Environment Variables to Supabase

## When to Sync

Sync your environment variables to Supabase whenever you:
- Add new environment variables to your `.env` file
- Update existing secrets (API keys, passwords, tokens)
- Change configuration values
- Want AI agents to have access to the new variables

## How to Sync

### 1. Update Your .env File

Add or modify variables in your `.env` file:

```bash
# Add a new API key
NEW_API_KEY=your_new_api_key_here

# Update an existing value
WALLET_PRIVATE_KEY=0xYourNewPrivateKey...

# Add new configuration
ENABLE_NEW_FEATURE=true
```

### 2. Run the Sync Command

```bash
npm run env:sync
```

This will:
- ✅ Read all variables from your `.env` file
- ✅ Automatically detect which are secrets (will be encrypted)
- ✅ Upload configs to `environment_configs` table
- ✅ Upload encrypted secrets to `environment_secrets` table
- ✅ Update existing variables if they already exist

### 3. AI Agents Get Updates Automatically

Next time an AI agent (like GitHub Copilot) starts TheWarden:

```bash
npm start
```

The AI will automatically:
- Load the new variables from Supabase
- Decrypt any new secrets
- Use them without any manual intervention

**No need to send new secrets through chat!**

---

## What Gets Encrypted vs Plain Text

### Automatically Encrypted (Secrets)

Variables with these patterns in the name are automatically encrypted:
- `*KEY*` - API keys, encryption keys, private keys
- `*SECRET*` - JWT secrets, encryption secrets
- `*PASSWORD*` - Database passwords, service passwords
- `*PRIVATE*` - Private keys, credentials
- `*TOKEN*` - Auth tokens, API tokens
- `*AUTH*` - Authentication credentials
- `*CREDENTIAL*` - Any credentials

**Examples:**
- `WALLET_PRIVATE_KEY` → encrypted ✅
- `ALCHEMY_API_KEY` → encrypted ✅
- `POSTGRES_PASSWORD` → encrypted ✅
- `JWT_SECRET` → encrypted ✅
- `GITHUB_TOKEN` → encrypted ✅

### Stored as Plain Text (Config)

Non-sensitive configuration values:
- URLs (RPC endpoints, API endpoints)
- Port numbers
- Feature flags (`ENABLE_*`, `USE_*`)
- Chain IDs
- Network names

**Examples:**
- `BASE_RPC_URL` → plain text
- `PORT` → plain text
- `ENABLE_WEBSOCKET_MONITORING` → plain text
- `CHAIN_ID` → plain text

---

## Example Workflow

### Scenario: Adding a New API Key

1. **You add it to .env:**
   ```bash
   echo "COINGECKO_API_KEY=your_api_key_here" >> .env
   ```

2. **Sync to Supabase:**
   ```bash
   npm run env:sync
   ```
   
   Output:
   ```
   🔄 Syncing .env to Supabase...
   ✅ Connected to Supabase
   📊 Processing environment variables...
   
   🔐 Stored secret: COINGECKO_API_KEY (api_key)
   
   ============================================================
   ✨ Sync Complete!
   
   📊 Statistics:
      Total variables:     113
      Configs stored:      81
      Secrets stored:      32
      Errors:              0
   ============================================================
   ```

3. **AI agent uses it automatically:**
   ```typescript
   // Next time AI starts TheWarden:
   npm start
   
   // AI automatically loads from Supabase
   console.log(process.env.COINGECKO_API_KEY);
   // Output: "your_api_key_here" (decrypted automatically)
   ```

---

## Other Useful Commands

### View What's in Supabase

```bash
# Show all non-sensitive configs
npm run env:show

# Show metadata about secrets (not the values)
npm run env:show:secrets
```

### Restore from Supabase

If you lose your `.env` file:

```bash
npm run env:restore
```

This downloads all variables from Supabase back to your `.env` file.

### Create Backup

Before making major changes:

```bash
npm run env:backup
```

Creates a timestamped backup in `.memory/environment/backups/`

---

## Security Notes

✅ **DO:**
- Sync new secrets to Supabase immediately
- Use `npm run env:sync` whenever you update .env
- Keep your `.env` file backed up locally

❌ **DON'T:**
- Don't send secrets through chat
- Don't commit `.env` to version control
- Don't share `SUPABASE_SERVICE_KEY` publicly

---

## Troubleshooting

### "Missing required bootstrap keys"

Make sure these are in your `.env`:
```bash
SUPABASE_URL=https://ydvevgqxcfizualicbom.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
SECRETS_ENCRYPTION_KEY=aa42e55...
```

### "Failed to encrypt secret"

Check that `SECRETS_ENCRYPTION_KEY` is at least 32 characters long.

### "Connection failed"

Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct.

---

## Summary

**You (Human)**: Update `.env` → Run `npm run env:sync`

**AI Agent**: Runs `npm start` → Auto-loads from Supabase

**Result**: No secrets in chat, seamless updates ✅
