# Contract Verification with GitHub Gist

## Overview

This guide explains how to verify TheWarden's FlashSwap contracts on BaseScan using GitHub Gist. This method solves the problem of source code files being too large (2000+ lines) to paste directly into BaseScan's verification form.

## The Problem

- **FlashSwapV2** flattened contract: 2,069 lines
- **FlashSwapV3** flattened contract: 2,312 lines
- BaseScan's direct paste has character/size limitations
- Manual copy/paste of large files is error-prone

## The Solution

BaseScan supports fetching Solidity code directly from GitHub Gist by entering a **GistID**. Our automated script:

1. Creates separate public Gists for each contract
2. Ensures the `.sol` file is the **first file** in each Gist (required by BaseScan)
3. Generates GistIDs that can be used in BaseScan's verification form
4. Creates comprehensive documentation with step-by-step instructions

## Quick Start

### Step 1: Install Dependencies

Ensure you have the correct Node.js version and dependencies installed:

```bash
# Install and use Node.js 22
nvm install 22 && nvm use 22

# Install npm dependencies
npm install
```

### Step 2: Setup GitHub Token

Create a GitHub Personal Access Token with `gist` scope:

1. Visit: https://github.com/settings/tokens/new
2. Select scope: **gist** (Create gists)
3. Generate token
4. Add to `.env`:

```bash
# Option 1: Use existing token (add gist scope)
GH_PAT_COPILOT=ghp_your_token_here

# Option 2: Create separate token for Gists
GITHUB_TOKEN=ghp_your_token_here
```

### Step 3: Run Upload Script

```bash
npm run verify:upload-gist
```

**Output:**
```
╔════════════════════════════════════════════════════════════════════╗
║   GitHub Gist Upload for BaseScan Contract Verification          ║
╚════════════════════════════════════════════════════════════════════╝

📁 Creating separate Gists for each contract...

🔹 FlashSwapV2:
  ✓ FlashSwapV2_flattened.sol (123456 chars)
  ✓ FlashSwapV2_constructor_args.txt (192 chars)
   ID: abc123def456
   URL: https://gist.github.com/abc123def456

🔹 FlashSwapV3:
  ✓ FlashSwapV3_flattened.sol (145678 chars)
  ✓ FlashSwapV3_constructor_args.txt (256 chars)
   ID: xyz789uvw012
   URL: https://gist.github.com/xyz789uvw012

📝 Documentation generated: verification/GIST_URLS.md

╔════════════════════════════════════════════════════════════════════╗
║                        SUCCESS! 🎉                                 ║
╚════════════════════════════════════════════════════════════════════╝

📋 Summary:

   FlashSwapV2 Gist:  https://gist.github.com/abc123def456
   FlashSwapV2 ID:    abc123def456
   FlashSwapV3 Gist:  https://gist.github.com/xyz789uvw012
   FlashSwapV3 ID:    xyz789uvw012
   Documentation:     verification/GIST_URLS.md

📖 Next Steps:

   1. Open verification/GIST_URLS.md for detailed instructions
   2. Visit BaseScan verification page for each contract
   3. Enter GistID in BaseScan form:

      FlashSwapV2 GistID: abc123def456
      FlashSwapV3 GistID: xyz789uvw012
```

### Step 3: Verify on BaseScan

#### Option A: Using GistID (Recommended)

1. Visit verification URL:
   - **FlashSwapV2**: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
   - **FlashSwapV3**: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

2. In the "Enter the Solidity Contract Code below" field:
   - **Enter the GistID** (e.g., `abc123def456`)
   - Or paste the full Gist URL (e.g., `https://gist.github.com/abc123def456`)

3. Set compiler options:
   - Compiler Version: `v0.8.20+commit.a1b79de6`
   - License: MIT License (3)
   - Optimization: **Yes**
   - Runs: **200**
   - EVM Version: **shanghai**

4. Paste constructor arguments from `GIST_URLS.md`

5. Click "Verify and Publish"

#### Option B: Using Raw Gist URL

If entering the GistID doesn't work, use the raw URL:

1. Visit verification URL (same as above)
2. Paste the **raw** Gist URL in the source code field
3. Example: `https://gist.githubusercontent.com/username/abc123def456/raw/FlashSwapV2_flattened.sol`
4. Complete remaining steps as above

## How BaseScan Fetches from Gist

When you enter a GistID in BaseScan:

1. BaseScan calls GitHub's Gist API
2. Fetches the **FIRST file** in the Gist
3. Uses that content for verification

**Important:** Our script ensures the `.sol` file is always the first file in each Gist.

## Files Structure

After running the script, you'll have:

```
verification/
├── FlashSwapV2_flattened.sol          # Original flattened contract
├── FlashSwapV2_constructor_args.txt   # Constructor arguments
├── FlashSwapV3_flattened.sol          # Original flattened contract
├── FlashSwapV3_constructor_args.txt   # Constructor arguments
├── GIST_URLS.md                       # Generated - Contains GistIDs and instructions
└── README.md                          # This guide
```

## Why Separate Gists?

We create **separate Gists** for each contract because:

1. **BaseScan limitation**: Fetches only the FIRST file
2. **Clean organization**: Each contract has its own dedicated Gist
3. **Easy updates**: Update one contract without affecting the other
4. **Clear documentation**: Distinct GistIDs avoid confusion

## Troubleshooting

### Error: GitHub token not found

```bash
❌ Error: GitHub token not found

Please set one of:
  - GITHUB_TOKEN environment variable
  - GH_PAT_COPILOT environment variable

Generate a token at: https://github.com/settings/tokens/new
Required scope: gist
```

**Solution:** Add a GitHub token with `gist` scope to your `.env` file.

### Error: File not found

```bash
❌ Error: File not found: /path/to/verification/FlashSwapV2_flattened.sol
```

**Solution:** Ensure flattened contracts exist. Regenerate them:

```bash
npm run verify:autonomous
```

### BaseScan can't fetch from Gist

**Possible causes:**
1. Gist is private (must be public)
2. GistID is incorrect
3. Network issues between BaseScan and GitHub

**Solution:**
- Verify Gist is public
- Double-check the GistID
- Try using the raw URL instead

### Verification fails with "compilation error"

**Possible causes:**
1. Wrong compiler version
2. Wrong optimization settings
3. Incorrect constructor arguments

**Solution:**
- Use exact compiler version: `v0.8.20+commit.a1b79de6`
- Enable optimization with 200 runs
- Use EVM version: `shanghai`
- Copy constructor args from `GIST_URLS.md` exactly

## Advanced Usage

### Update Existing Gists

If you need to update contracts and regenerate Gists:

```bash
# 1. Update and flatten contracts
npm run verify:autonomous

# 2. Upload new Gists (creates new Gists)
npm run verify:upload-gist
```

**Note:** This creates NEW Gists. The old ones remain on your GitHub account.

### Manual Gist Creation

If the automated script doesn't work, create Gists manually:

1. Go to https://gist.github.com
2. Create a new public Gist
3. **Important:** Add the `.sol` file FIRST
4. Add the constructor args file second
5. Save and copy the GistID
6. Use in BaseScan verification

### Using Gist API Directly

The script uses GitHub's Gist API:

```typescript
// Create Gist
POST https://api.github.com/gists
Authorization: Bearer YOUR_TOKEN

{
  "description": "FlashSwapV2 Verification",
  "public": true,
  "files": {
    "FlashSwapV2_flattened.sol": {
      "content": "... contract code ..."
    }
  }
}

// Response includes:
// - id: GistID
// - html_url: Gist URL
// - files.*.raw_url: Raw file URLs
```

## Security Considerations

### Public Gists

**Warning:** Gists created by this script are **PUBLIC**.

- Contract code is already deployed on-chain (public)
- Constructor arguments may contain addresses (public)
- No private keys or secrets are uploaded

### GitHub Token Security

**Best practices:**
- Use a dedicated token with ONLY `gist` scope
- Never commit tokens to git
- Store in `.env` (already in `.gitignore`)
- Rotate tokens periodically

## Additional Resources

- **BaseScan Verification Guide**: https://docs.basescan.org/verifying-contracts
- **GitHub Gist API**: https://docs.github.com/en/rest/gists
- **Solidity Compiler Versions**: https://etherscan.io/solcversions
- **TheWarden Documentation**: `../README.md`

## Support

If you encounter issues:

1. Check `verification/GIST_URLS.md` for detailed instructions
2. Review troubleshooting section above
3. Verify GitHub token has `gist` scope
4. Ensure flattened contracts are up-to-date
5. Open an issue on GitHub

## Script Implementation

The upload script is located at:
- `scripts/verification/upload-to-gist.ts`

Key features:
- Creates separate Gists for V2 and V3
- Ensures `.sol` file is first in each Gist
- Generates comprehensive documentation
- Provides GistIDs and raw URLs
- Includes step-by-step verification instructions

## Example GIST_URLS.md

After running the script, `verification/GIST_URLS.md` contains:

```markdown
# GitHub Gist URLs for Contract Verification

## FlashSwapV2

**GistID:** abc123def456
**Gist URL:** https://gist.github.com/abc123def456

Steps:
1. Visit: https://basescan.org/verifyContract?a=0x6e...
2. Enter GistID: abc123def456
3. Set compiler: v0.8.20+commit.a1b79de6
4. Optimization: Yes (200 runs)
5. Constructor args: 0x00000...
6. Verify!

[... complete instructions for both contracts ...]
```

## Conclusion

Using GitHub Gist for contract verification:

✅ **Solves size limitations** - No character limits
✅ **Automated workflow** - One command to upload
✅ **Easy to use** - Just enter GistID in BaseScan
✅ **Version controlled** - Gists track changes
✅ **Reliable** - GitHub's infrastructure
✅ **Professional** - Standard practice for large contracts

---

*Generated by TheWarden Contract Verification System*
