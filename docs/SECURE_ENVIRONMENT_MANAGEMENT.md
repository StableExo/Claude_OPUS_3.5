# 🔐 Secure Environment Management via Supabase

## 🚨 Security Incident Resolution

**Problem**: Wallet gas ETH was stolen **twice** because environment variables (including private keys) were being sent through chat communications, allowing unauthorized access.

**Solution**: All environment variables are stored in Supabase with encryption for sensitive data. AI agents (like Copilot) can load ALL variables automatically using only 3 bootstrap keys in their environment. **No secrets ever sent through chat again.**

---

## 📊 Environment Variable Categories

### Total: 112 Environment Variables

- **🔒 Secrets (31)**: Encrypted in Supabase
  - Private keys
  - API keys
  - Passwords
  - Tokens
  - Database connection strings
  
- **⚙️ Variables (81)**: Plain configuration
  - URLs
  - Ports
  - Feature flags
  - Network settings

---

## 🔑 Bootstrap Keys (Required in Environment)

Only these 3 keys need to be in your environment:

```bash
# 1. Supabase Project URL
SUPABASE_URL=https://ydvevgqxcfizualicbom.supabase.co

# 2. Supabase Service Role Key (full access)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Encryption Key for Secrets (32+ characters)
SECRETS_ENCRYPTION_KEY=aa42e55372a0730f908fb690faf55d78...
```

**That's it!** All other environment variables are automatically loaded from Supabase.

---

## 📝 How It Works (For AI Agents)

### Environment Variables Already in Supabase ✅

All 112 environment variables are **already uploaded to Supabase** by the human operator:
- 31 secrets encrypted with AES-256-CBC
- 81 configuration variables stored as plain text

### AI Agent Only Needs 3 Bootstrap Keys

The AI agent's environment contains only these 3 keys:

```bash
SUPABASE_URL=https://ydvevgqxcfizualicbom.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SECRETS_ENCRYPTION_KEY=aa42e55372a0730f908fb690faf55d78...
```

### Automatic Loading at Startup

When TheWarden starts:

```bash
npm start
```

TheWarden automatically:
1. Detects the 3 bootstrap keys in environment
2. Connects to Supabase using `SUPABASE_SERVICE_KEY`
3. Loads all 81 configuration variables
4. Decrypts and loads all 31 secrets using `SECRETS_ENCRYPTION_KEY`
5. Initializes with full environment

**No secrets sent through chat. No manual configuration needed. It just works.**

---

## 🛠️ Management Scripts (For Humans)

### Syncing New Variables to Supabase

When you add new environment variables or update existing ones:

```bash
# Sync your .env file to Supabase
npm run env:sync
```

This will:
- ✅ Automatically detect secrets (encrypts them)
- ✅ Upload configs as plain text
- ✅ Update existing variables
- ✅ AI agents get updates on next startup

**See [SYNCING_ENV_TO_SUPABASE.md](./SYNCING_ENV_TO_SUPABASE.md) for detailed guide.**

### Other Management Commands

```bash
# Show all configs (non-sensitive)
npm run env:show

# Show secrets metadata (not decrypted values)
npm run env:show:secrets

# Download from Supabase to .env
npm run env:restore

# Create timestamped backup
npm run env:backup

# List all stored configs
npm run env:list
```

**Note**: AI agents don't need these scripts - they automatically load everything from Supabase at startup.

---

## 🔒 Security Features

### Encryption

- **Algorithm**: AES-256-CBC
- **Key**: 32-byte encryption key from `SECRETS_ENCRYPTION_KEY`
- **IV**: Random 16-byte initialization vector per secret
- **Storage**: Encrypted values stored as `iv:ciphertext` hex strings

### Secret Detection

Automatically identifies secrets based on:
- Key patterns: `KEY`, `SECRET`, `PASSWORD`, `PRIVATE`, `TOKEN`, `AUTH`
- Value patterns: `0x...` (private keys), `postgresql://`, `redis://`, `sk-`, `ghp-`, `xai-`
- JWT tokens: Values starting with `eyJ`

### Access Control

- **Service Role Key**: Full read/write access to environment tables
- **Anon Key**: Limited access (can be restricted with RLS policies)
- **Encryption Key**: Required for decrypting secrets

---

## 📋 What Gets Encrypted (31 Secrets)

### Private Keys & Credentials
- `WALLET_PRIVATE_KEY`
- `JWT_SECRET`
- `SECRETS_ENCRYPTION_KEY`
- `AUDIT_ENCRYPTION_KEY`

### API Keys
- `ALCHEMY_API_KEY`
- `INFURA_API_KEY`
- `ETHERSCAN_API_KEY` (and all scan APIs)
- `XAI_PROD_API_KEY`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `GPT_API_KEY`
- `GH_PAT_COPILOT`
- `GITHUB_TOKEN`

### Passwords
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `RABBITMQ_PASSWORD`
- `TIMESCALEDB_PASSWORD`
- `CHAINSTACK_PASSWORD`

### Supabase Keys
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_API_KEY`
- `SUPABASE_APP_KEY`
- `SUPABASE_PUBLISHABLE_KEY`

### Connection Strings
- `DATABASE_URL`
- `REDIS_URL`
- `RABBITMQ_URL`
- `TIMESERIES_CONNECTION_STRING`

---

## 📋 What Stays as Plain Config (81 Variables)

### Network Configuration
- RPC URLs (all chains)
- WebSocket URLs
- Backup RPC URLs
- Testnet URLs

### Application Settings
- `NODE_ENV`
- `PORT`
- `DRY_RUN`
- `CHAIN_ID`

### Feature Flags
- `ENABLE_WEBSOCKET_MONITORING`
- `BASE_WEBSOCKET_ENABLED`
- `USE_SUPABASE`

### And more... (see full list in upload script)

---

## 🔄 How It Works

### At Startup

1. **Bootstrap Phase**
   ```typescript
   // main.ts loads these 3 keys from .env
   SUPABASE_URL
   SUPABASE_SERVICE_KEY
   SECRETS_ENCRYPTION_KEY
   ```

2. **Environment Loading**
   ```typescript
   // src/utils/loadEnvFromSupabase.ts
   import { loadEnvFromSupabase } from './utils/loadEnvFromSupabase';
   
   await loadEnvFromSupabase({
     loadSecrets: true,
     override: false,
     merge: true,
   });
   ```

3. **Decryption**
   - Configs loaded as plain text
   - Secrets decrypted using `SECRETS_ENCRYPTION_KEY`
   - All values added to `process.env`

4. **Initialization**
   - TheWarden initializes with full environment
   - No secrets sent through chat ✅

---

## 🚫 Security Best Practices

### DO ✅
- Use `.env.supabase` with only 3 bootstrap keys
- Store secrets in Supabase encrypted
- Rotate credentials regularly
- Use Supabase RLS policies for access control
- Monitor access logs in Supabase

### DON'T ❌
- ❌ Never send private keys through chat
- ❌ Never commit `.env` to version control
- ❌ Never store unencrypted secrets
- ❌ Never share `SUPABASE_SERVICE_KEY` publicly
- ❌ Never hardcode credentials in code

---

## 🔄 Credential Rotation

To rotate a credential:

1. **Update in Supabase**:
   ```bash
   # Use the Supabase dashboard or API
   # Or run the upload script again
   npm run env:upload
   ```

2. **Restart TheWarden**:
   ```bash
   npm start
   ```
   
   TheWarden will load the new value automatically.

---

## 🆘 Emergency Recovery

If Supabase is unavailable:

1. **Fallback to .env file**:
   ```bash
   # Set USE_SUPABASE=false in .env
   USE_SUPABASE=false
   ```

2. **Or disable in code**:
   ```typescript
   // main.ts
   // Comment out the Supabase loading
   ```

3. **Restore from backup**:
   ```bash
   # Restore from timestamped backup
   cp .memory/environment/backups/.env.backup.TIMESTAMP .env
   ```

---

## 📚 Related Documentation

- `src/services/SupabaseEnvStorage.ts` - Environment storage service
- `src/utils/supabaseEnvLoader.ts` - Environment loading utility
- `scripts/env-management/upload-env-to-supabase.ts` - Upload script
- `.env.supabase` - Minimal bootstrap configuration

---

## 🎯 Summary

**Before** 🚨:
- 112 environment variables sent through chat
- Private keys exposed in communications
- Wallet compromised twice - gas ETH stolen

**After** ✅:
- AI agents get 3 bootstrap keys in their environment
- 112 variables auto-loaded from Supabase (31 encrypted)
- Zero secrets in chat communications
- Secure, automatic, seamless

**Result**: 🔒 Secure, 🚀 Automatic, 🛡️ Protected

---

## 🤖 For AI Agents (Remember This!)

**You have these 3 keys in your environment:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SECRETS_ENCRYPTION_KEY`

**When TheWarden starts**, it will:
1. Automatically connect to Supabase
2. Load all 112 environment variables
3. Decrypt the 31 secrets
4. Initialize fully configured

**You never need to ask for environment variables through chat.**
**Everything is already in Supabase and loads automatically.**
