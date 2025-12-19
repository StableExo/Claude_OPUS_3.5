# 🚨 BaseScan Verification Fix - Constructor Args Error

## The Problem

You're getting this error:
```
ParserError: Expected pragma, import directive or contract/interface/library/struct/enum/constant/function/error definition.
 --> myc:1:1:
  |
1 | 0000000000000000000000002626664c2603 ...
```

**Root Cause**: The constructor arguments were pasted into the **source code field** instead of being used correctly with the GistID.

## ✅ Correct Verification Steps

### Method 1: Using GistID (Recommended)

1. **Visit the verification page:**
   - FlashSwapV2: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
   - FlashSwapV3: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

2. **Select "Via Gist" option:**
   - Look for "Please select Compiler Type" dropdown
   - Select: **"Solidity (Single file via GitHub Gist)"**

3. **Enter the GistID:**
   - For FlashSwapV2: `75e3ee731ba36de1a45d39754a5d38eb`
   - For FlashSwapV3: `5f7a0f35601ab031c2c25cb61fe98a7b`
   
   **Note**: Enter ONLY the GistID, not the full URL!

4. **Compiler Settings:**
   - Compiler: `v0.8.20+commit.a1b79de6`
   - Optimization: **Yes**
   - Runs: **200**
   - EVM Version: **shanghai**

5. **Constructor Arguments:**
   
   **FlashSwapV2**:
   ```
   0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d
   ```
   
   **FlashSwapV3**:
   ```
   0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d00000000000000000000000033128a8fc17869897dce68ed026d694621f6fdfd00000000000000000000000048a6e6695a7d3e8c76eb014e648c072db385df6c0000000000000000000000000000000000000000000000000000000000001b58
   ```

6. **Click "Verify and Publish"**

### Method 2: Using Direct URL (Alternative)

If GistID doesn't work, try the raw URL:

**FlashSwapV2 Raw URL**:
```
https://gist.githubusercontent.com/StableExo/75e3ee731ba36de1a45d39754a5d38eb/raw/52d6f5665fb632431d9213b16a4dbf45f19ca3c3/FlashSwapV2_flattened.sol
```

**FlashSwapV3 Raw URL**:
```
https://gist.githubusercontent.com/StableExo/5f7a0f35601ab031c2c25cb61fe98a7b/raw/d683a2782ee93a0d4d26f4a41affb8c3a9d596af/FlashSwapV3_flattened.sol
```

### Method 3: Manual Upload (Last Resort)

If both GistID and URL fail:

1. **Download the flattened source:**
   - FlashSwapV2: `verification/FlashSwapV2_flattened.sol`
   - FlashSwapV3: `verification/FlashSwapV3_flattened.sol`

2. **Select "Solidity (Single file)"** as compiler type

3. **Copy and paste the entire flattened contract** into the source code field

4. **Use same compiler settings and constructor args as above**

## 🔍 What Went Wrong

The error shows BaseScan tried to compile the constructor args as Solidity code:
```
1 | 0000000000000000000000002626664c2603 ...
```

This means the constructor arguments were put in the **source code field** instead of:
1. Using the GistID in the Gist source field, OR
2. Pasting the actual Solidity source code

## ✅ Checklist Before Verifying

- [ ] Selected correct compiler type (Gist or Single file)
- [ ] Entered GistID (not full URL, not constructor args)
- [ ] Set compiler to `v0.8.20+commit.a1b79de6`
- [ ] Enabled optimization with 200 runs
- [ ] Set EVM version to `shanghai`
- [ ] Pasted constructor args in the **Constructor Arguments** field (not source code)
- [ ] License set to MIT (3)

## 📝 Quick Reference

### FlashSwapV2
```
Contract: 0x6e2473E4BEFb66618962f8c332706F8f8d339c08
GistID: 75e3ee731ba36de1a45d39754a5d38eb
Constructor Args: 0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d
```

### FlashSwapV3
```
Contract: 0x4926E08c0aF3307Ea7840855515b22596D39F7eb
GistID: 5f7a0f35601ab031c2c25cb61fe98a7b
Constructor Args: 0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d00000000000000000000000033128a8fc17869897dce68ed026d694621f6fdfd00000000000000000000000048a6e6695a7d3e8c76eb014e648c072db385df6c0000000000000000000000000000000000000000000000000000000000001b58
```

## 🆘 Still Having Issues?

If verification continues to fail:

1. **Check the Gist is public:**
   - V2: https://gist.github.com/StableExo/75e3ee731ba36de1a45d39754a5d38eb
   - V3: https://gist.github.com/StableExo/5f7a0f35601ab031c2c25cb61fe98a7b

2. **Try waiting 5-10 minutes** - sometimes BaseScan's cache needs time

3. **Use Method 3 (manual upload)** - copy/paste the entire flattened contract

4. **Verify compiler version matches exactly** - must be `v0.8.20+commit.a1b79de6`

5. **Double-check EVM version** - must be `shanghai` for Base network

---

**The key fix**: Make sure you're selecting "Via Gist" option and entering ONLY the GistID, not the constructor args!
