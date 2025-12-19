# Contract Verification Files

This directory contains all the materials needed to verify the FlashSwapV2 and FlashSwapV3 contracts on BaseScan.

## Files

### FlashSwapV2
- `FlashSwapV2_flattened.sol` - Flattened contract source code (2,070 lines)
- `FlashSwapV2_constructor_args.txt` - ABI-encoded constructor arguments

### FlashSwapV3
- `FlashSwapV3_flattened.sol` - Flattened contract source code (2,313 lines)
- `FlashSwapV3_constructor_args.txt` - ABI-encoded constructor arguments

## How to Use

### Quick Verification

1. **Visit the verification URL for each contract:**
   - FlashSwapV2: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
   - FlashSwapV3: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

2. **Enter settings:**
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit.a1b79de6
   - License: MIT License (MIT)

3. **Paste the flattened source code:**
   - For V2: Copy contents of `FlashSwapV2_flattened.sol`
   - For V3: Copy contents of `FlashSwapV3_flattened.sol`

4. **Set optimization:**
   - Optimization: Yes
   - Runs: 200
   - EVM Version: shanghai

5. **Paste constructor arguments:**
   - For V2: Copy contents of `FlashSwapV2_constructor_args.txt`
   - For V3: Copy contents of `FlashSwapV3_constructor_args.txt`

6. **Submit** - Click "Verify and Publish"

### Command Line Copy

```bash
# macOS - Copy flattened source to clipboard (one at a time)
cat FlashSwapV2_flattened.sol | pbcopy    # For V2
# OR
cat FlashSwapV3_flattened.sol | pbcopy    # For V3

# Linux - Copy flattened source to clipboard (one at a time)
cat FlashSwapV2_flattened.sol | xclip -selection clipboard    # For V2
# OR
cat FlashSwapV3_flattened.sol | xclip -selection clipboard    # For V3

# View constructor args
cat FlashSwapV2_constructor_args.txt
cat FlashSwapV3_constructor_args.txt
```

## Regenerate Files

If you need to regenerate these files:

```bash
npm run verify:autonomous
```

This will:
- Check verification status
- Flatten contracts again
- Regenerate constructor arguments
- Update all files in this directory

## Verification URLs

- **FlashSwapV2**: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
- **FlashSwapV3**: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

## After Verification

Once verified, contracts will be viewable at:
- **FlashSwapV2**: https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08#code
- **FlashSwapV3**: https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb#code

## Need Help?

See the complete guide: `../docs/CONTRACT_VERIFICATION_GUIDE.md`
