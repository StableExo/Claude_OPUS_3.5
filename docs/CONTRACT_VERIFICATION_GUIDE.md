# Contract Verification Guide for BaseScan

**Date**: 2025-12-19  
**Network**: Base Mainnet (Chain ID: 8453)  
**Status**: ✅ Ready for Verification

## Deployed Contracts

### FlashSwapV2
- **Address**: `0x6e2473E4BEFb66618962f8c332706F8f8d339c08`
- **BaseScan URL**: https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08#code
- **Verification URL**: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08

### FlashSwapV3
- **Address**: `0x4926E08c0aF3307Ea7840855515b22596D39F7eb`
- **BaseScan URL**: https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb#code
- **Verification URL**: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

## Automated Verification

### Quick Start

Run the autonomous verification script to prepare all verification materials:

```bash
npm run verify:autonomous
```

This script will:
1. Check if contracts are already verified
2. Flatten contract source code
3. Generate ABI-encoded constructor arguments
4. Save all materials to `verification/` directory
5. Provide detailed manual verification instructions

### Verification Files

After running `npm run verify:autonomous`, you'll find:

```
verification/
├── FlashSwapV2_flattened.sol          # Flattened source code
├── FlashSwapV2_constructor_args.txt   # ABI-encoded constructor arguments
├── FlashSwapV3_flattened.sol          # Flattened source code
└── FlashSwapV3_constructor_args.txt   # ABI-encoded constructor arguments
```

## Manual Verification Instructions

### FlashSwapV2 Verification

1. **Visit BaseScan Verification Page**:
   https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08

2. **Contract Details**:
   - Compiler Type: `Solidity (Single file)`
   - Compiler Version: `v0.8.20+commit.a1b79de6`
   - Open Source License Type: `MIT License (MIT)`

3. **Source Code**:
   - Copy from: `verification/FlashSwapV2_flattened.sol`

4. **Optimization Settings**:
   - Optimization: `Yes`
   - Runs: `200`
   - EVM Version: `shanghai`

5. **Constructor Arguments (ABI-encoded)**:
   ```
   0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d
   ```

6. **Click "Verify and Publish"**

### FlashSwapV3 Verification

1. **Visit BaseScan Verification Page**:
   https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

2. **Contract Details**:
   - Compiler Type: `Solidity (Single file)`
   - Compiler Version: `v0.8.20+commit.a1b79de6`
   - Open Source License Type: `MIT License (MIT)`

3. **Source Code**:
   - Copy from: `verification/FlashSwapV3_flattened.sol`

4. **Optimization Settings**:
   - Optimization: `Yes`
   - Runs: `200`
   - EVM Version: `shanghai`

5. **Constructor Arguments (ABI-encoded)**:
   ```
   0000000000000000000000002626664c2603336e57b271c5c0b26f421741e4810000000000000000000000006bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a238dd80c259a72e81d7e4664a9801593f98d1c5000000000000000000000000e20fcbdbffc4dd138ce8b2e6fbb6cb49777ad64d00000000000000000000000033128a8fc17869897dce68ed026d694621f6fdfd00000000000000000000000048a6e6695a7d3e8c76eb014e648c072db385df6c0000000000000000000000000000000000000000000000000000000000001b58
   ```

6. **Click "Verify and Publish"**

## Constructor Arguments Reference

### FlashSwapV2

| Parameter | Type | Value |
|-----------|------|-------|
| uniswapV3Router | address | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| sushiRouter | address | `0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891` |
| aavePool | address | `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5` |
| aaveAddressesProvider | address | `0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D` |

### FlashSwapV3

| Parameter | Type | Value |
|-----------|------|-------|
| uniswapV3Router | address | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| sushiRouter | address | `0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891` |
| balancerVault | address | `0xBA12222222228d8Ba445958a75a0704d566BF2C8` |
| dydxSoloMargin | address | `0x0000000000000000000000000000000000000000` |
| aavePool | address | `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5` |
| aaveAddressesProvider | address | `0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D` |
| uniswapV3Factory | address | `0x33128a8fC17869897dcE68Ed026d694621f6FDfD` |
| titheRecipient | address | `0x48a6e6695a7d3e8c76eb014e648c072db385df6c` |
| titheBps | uint256 | `7000` (70%) |

## NPM Scripts

The following npm scripts are available for verification:

```bash
# Autonomous verification (recommended)
npm run verify:autonomous

# Individual contract verification (legacy Hardhat method)
npm run verify:flashswapv2
npm run verify:flashswapv3

# Verify both contracts (orchestration script)
npm run verify:both
```

## Troubleshooting

### Common Issues

1. **Contract source doesn't match**
   - Ensure you're using the flattened source from `verification/` directory
   - Verify compiler version is exactly `v0.8.20+commit.a1b79de6`
   - Check optimization settings: Yes, 200 runs, shanghai EVM

2. **Constructor arguments don't match**
   - Use the ABI-encoded arguments from `verification/*_constructor_args.txt`
   - Ensure no extra spaces or line breaks
   - Arguments are case-sensitive

3. **Already verified error**
   - Contract may already be verified
   - Check the contract page on BaseScan
   - Run `npm run verify:autonomous` to check status

### Getting Help

- BaseScan Verification Guide: https://info.basescan.org/how-to-verify-contracts/
- Hardhat Verification Docs: https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify

## Post-Verification

After successful verification:

1. ✅ Contract source code is publicly visible on BaseScan
2. ✅ Users can read and verify contract logic
3. ✅ Users can interact with contracts via BaseScan UI
4. ✅ Contract can be imported into tools like Tenderly, Dune Analytics
5. ✅ Enhanced trust and transparency for users

## Additional Resources

- **BaseScan Contract Verification**: https://basescan.org/verifyContract
- **How to Verify Contracts**: https://info.basescan.org/how-to-verify-contracts/
- **BaseScan API Documentation**: https://docs.basescan.org/

---

**Last Updated**: 2025-12-19  
**Maintained By**: TheWarden Team
