# 🚀 Quick Reference: Contract Verification via Gist

## Setup (First Time Only)

```bash
# Install Node.js 22 and dependencies
nvm install 22 && nvm use 22 && npm install

# Add GitHub token to .env (choose one):
GITHUB_TOKEN=ghp_your_token_here
# OR
GH_PAT_COPILOT=ghp_your_token_here
```

Generate token at: https://github.com/settings/tokens/new (needs `gist` scope)

## One-Command Upload

```bash
npm run verify:upload-gist
```

## Output Files

After running:
- `verification/GIST_URLS.md` - Contains GistIDs and verification instructions

## BaseScan Verification (3 Steps)

### 1. Get GistID
Open `verification/GIST_URLS.md` and copy the GistID (e.g., `abc123def456`)

### 2. Visit Verification Page
- **FlashSwapV2**: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
- **FlashSwapV3**: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

### 3. Fill Form
| Field | Value |
|-------|-------|
| Source Code | **Enter GistID** (paste from GIST_URLS.md) |
| Compiler | `v0.8.20+commit.a1b79de6` |
| License | MIT License (3) |
| Optimization | Yes |
| Runs | 200 |
| EVM Version | shanghai |
| Constructor Args | Copy from GIST_URLS.md |

Click "Verify and Publish" ✅

## Contract Addresses

- **FlashSwapV2**: `0x6e2473E4BEFb66618962f8c332706F8f8d339c08`
- **FlashSwapV3**: `0x4926E08c0aF3307Ea7840855515b22596D39F7eb`

## Compiler Settings

```
Version: v0.8.20+commit.a1b79de6
Optimization: Enabled
Runs: 200
EVM Version: shanghai
License: MIT
```

## Why Gist?

✅ Contracts too large (2000+ lines) to paste directly  
✅ BaseScan supports GistID entry  
✅ Automatic fetch of first file  
✅ No manual copy/paste errors  

## Troubleshooting

**Error: GitHub token not found**
- Add GITHUB_TOKEN or GH_PAT_COPILOT to .env

**Error: File not found**
- Run `npm run verify:autonomous` to regenerate flattened contracts

**BaseScan can't fetch Gist**
- Ensure Gist is public
- Try using raw URL instead of GistID
- Check GistID is correct

## Full Documentation

📖 See `docs/CONTRACT_VERIFICATION_WITH_GIST.md` for complete guide

## Script Location

`scripts/verification/upload-to-gist.ts`

---

*Quick reference for TheWarden contract verification via GitHub Gist*
