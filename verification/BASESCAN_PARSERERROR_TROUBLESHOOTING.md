# BaseScan Verification ParserError - Troubleshooting Guide

## The Error You're Seeing

```
ParserError: Expected pragma, import directive or contract/interface/library/struct/enum/constant/function/error definition.
    --> myc:1478:1:
     |
1478 | }
     | ^
```

## Most Common Causes

### 1. ❌ Constructor Args in Wrong Field (MOST COMMON)

**Problem:** Constructor arguments were pasted into the "Source Code" field instead of the "Constructor Arguments" field.

**Solution:**
- **Source Code field** should contain the content from `FlashSwapV2_flattened.sol` or `FlashSwapV3_flattened.sol`
- **Constructor Arguments field** should contain the content from `FlashSwapV2_constructor_args.txt` or `FlashSwapV3_constructor_args.txt`

**What it should look like:**

```
┌─────────────────────────────────────────┐
│ Source Code Field:                      │
├─────────────────────────────────────────┤
│ // Sources flattened with hardhat...   │
│                                         │
│ pragma solidity ^0.8.20;               │
│                                         │
│ contract FlashSwapV2 {                 │
│   ...                                   │
│ }                                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Constructor Arguments Field:            │
├─────────────────────────────────────────┤
│ 0000000000000000000000002626664c...    │
└─────────────────────────────────────────┘
```

### 2. Using Gist ID Instead of Manual Paste

**Problem:** If you entered just the Gist ID (like `a4f7f43af2db86b71b25276203fd1e7b`), BaseScan may have trouble fetching it.

**Solutions:**

#### Option A: Use Full Gist URL
Instead of entering just the ID, use the **full raw file URL**:

**FlashSwapV2 Raw URL:**
```
https://gist.githubusercontent.com/StableExo/a4f7f43af2db86b71b25276203fd1e7b/raw/1_FlashSwapV2_flattened.sol
```

**FlashSwapV3 Raw URL:**
```
https://gist.githubusercontent.com/StableExo/573332578ee21083fda7294f6a4e1d69/raw/1_FlashSwapV3_flattened.sol
```

#### Option B: Manual Copy/Paste (Recommended)
1. Open the Gist URL in your browser
2. Click on the `.sol` file
3. Click "Raw" button
4. Select All (Ctrl+A / Cmd+A)
5. Copy (Ctrl+C / Cmd+C)
6. Paste into BaseScan's "Source Code" field

### 3. Verification Settings Don't Match

**Problem:** Compiler settings don't match the deployed contract.

**Correct Settings:**
- **Compiler Type:** Solidity (Single file)
- **Compiler Version:** `v0.8.20+commit.a1b79de6` (exact match required)
- **Optimization:** Yes
- **Runs:** 200
- **EVM Version:** shanghai
- **License:** MIT License (MIT)

## Step-by-Step Verification (Manual Method)

### For FlashSwapV2

1. **Visit:** https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08

2. **Download source from Gist:**
   - Go to: https://gist.github.com/StableExo/a4f7f43af2db86b71b25276203fd1e7b
   - Click on `1_FlashSwapV2_flattened.sol`
   - Click "Raw" button (top right)
   - Select All and Copy

3. **Paste into Source Code field** (the large text box)

4. **Enter Settings:**
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit.a1b79de6
   - License: MIT License (MIT)

5. **Optimization Settings:**
   - Optimization: Yes
   - Runs: 200
   - EVM Version: shanghai

6. **Constructor Arguments:**
   - Go to: https://gist.github.com/StableExo/a4f7f43af2db86b71b25276203fd1e7b
   - Click on `2_FlashSwapV2_constructor_args.txt`
   - Copy the entire hex string:
   ```
   0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d
   ```
   - Paste into "Constructor Arguments ABI-encoded" field

7. **Click "Verify and Publish"**

### For FlashSwapV3

1. **Visit:** https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

2. **Download source from Gist:**
   - Go to: https://gist.github.com/StableExo/573332578ee21083fda7294f6a4e1d69
   - Click on `1_FlashSwapV3_flattened.sol`
   - Click "Raw" button
   - Select All and Copy

3. **Paste into Source Code field**

4. **Enter Settings:** (same as V2)

5. **Constructor Arguments:**
   - Go to: https://gist.github.com/StableExo/573332578ee21083fda7294f6a4e1d69
   - Click on `2_FlashSwapV3_constructor_args.txt`
   - Copy the entire hex string:
   ```
   0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d00000000000000000000000033128a8fc17869897dce68ed026d694621f6fdfd00000000000000000000000048a6e6695a7d3e8c76eb014e648c072db385df6c0000000000000000000000000000000000000000000000000000000000001b58
   ```
   - Paste into "Constructor Arguments ABI-encoded" field

6. **Click "Verify and Publish"**

## Alternative: Regenerate Gists

If the Gists have issues, regenerate them:

```bash
cd /home/runner/work/TheWarden/TheWarden
npm run verify:autonomous  # Regenerate flattened files with correct line endings
npm run verify:upload-gist  # Upload fresh Gists
```

This will create new Gist IDs with properly normalized files.

## Verification Checklist

Before clicking "Verify and Publish":

- [ ] Source Code field contains Solidity code (starts with `// Sources flattened`)
- [ ] Constructor Arguments field contains hex string (starts with `00000000`)
- [ ] Compiler version is exactly: `v0.8.20+commit.a1b79de6`
- [ ] Optimization is: Yes
- [ ] Runs is: 200
- [ ] EVM Version is: shanghai
- [ ] License is: MIT License (MIT)

## Still Having Issues?

If you're still getting ParserError after following this guide:

1. **Double-check you're using Manual Copy/Paste** - Don't rely on Gist ID alone
2. **Verify you copied the FULL source code** - Should be 2000+ lines
3. **Check there's no extra whitespace** before or after the code
4. **Try a different browser** - Sometimes browser extensions interfere
5. **Use the local files directly:**
   ```bash
   cat verification/FlashSwapV2_flattened.sol  # Copy this
   cat verification/FlashSwapV2_constructor_args.txt  # And this
   ```

## Quick Links

**FlashSwapV2:**
- Gist: https://gist.github.com/StableExo/a4f7f43af2db86b71b25276203fd1e7b
- Raw .sol: https://gist.githubusercontent.com/StableExo/a4f7f43af2db86b71b25276203fd1e7b/raw/1_FlashSwapV2_flattened.sol
- Constructor Args: Copy from Gist or use `verification/FlashSwapV2_constructor_args.txt`

**FlashSwapV3:**
- Gist: https://gist.github.com/StableExo/573332578ee21083fda7294f6a4e1d69
- Raw .sol: https://gist.githubusercontent.com/StableExo/573332578ee21083fda7294f6a4e1d69/raw/1_FlashSwapV3_flattened.sol
- Constructor Args: Copy from Gist or use `verification/FlashSwapV3_constructor_args.txt`

---

**Last Updated:** 2025-12-20
