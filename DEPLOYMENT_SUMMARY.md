# Contract Deployment Summary - December 18, 2025

## Deployment Details

**Date**: December 18, 2025  
**Network**: Base Mainnet (Chain ID: 8453)  
**Deployer**: 0x4c1b46Be097024E5712EB3f97b46D2ECf2b531d7

## Deployed Contracts

### FlashSwapV2
- **Address**: `0x6e2473E4BEFb66618962f8c332706F8f8d339c08`
- **Transaction**: `0x8d7e838d287cad4b93d6919ecc8365db24bf764e3b747b4ed5454005fedbda45`
- **Basescan**: https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08
- **Constructor Parameters**:
  - Uniswap V3 Router: `0x2626664c2603336E57B271c5C0b26F421741e481`
  - SushiSwap Router: `0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891`
  - Aave Pool: `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`
  - Aave Addresses Provider: `0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D`
  - Tithe Recipient: `0x48a6e6695a7d3e8c76eb014e648c072db385df6c`
  - Tithe BPS: `7000` (70%)

### FlashSwapV3
- **Address**: `0x4926E08c0aF3307Ea7840855515b22596D39F7eb`
- **Transaction**: `0x9a0a8e2ce7a45f1937e0e609e54d0367fe687e4487dab2c16abc35fc2dc70c6d`
- **Basescan**: https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb
- **Constructor Parameters**:
  - Uniswap V3 Router: `0x2626664c2603336E57B271c5C0b26F421741e481`
  - SushiSwap Router: `0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891`
  - Balancer Vault: `0xBA12222222228d8Ba445958a75a0704d566BF2C8`
  - dYdX Solo Margin: `0x0000000000000000000000000000000000000000` (Not on Base)
  - Aave Pool: `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`
  - Aave Addresses Provider: `0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D`
  - Uniswap V3 Factory: `0x33128a8fC17869897dcE68Ed026d694621f6FDfD`
  - Tithe Recipient: `0x48a6e6695a7d3e8c76eb014e648c072db385df6c`
  - Tithe BPS: `7000` (70%)

## Configuration

Both contracts are configured with the **70/30 tithe split**:
- **70%** of profits go to US Debt Reduction wallet: `0x48a6e6695a7d3e8c76eb014e648c072db385df6c`
- **30%** goes to the contract owner/operator

## Next Steps

### 1. Verify Contracts on Basescan (Optional)

```bash
# Verify FlashSwapV2
npx hardhat verify --network base 0x6e2473E4BEFb66618962f8c332706F8f8d339c08 \
  0x2626664c2603336E57B271c5C0b26F421741e481 \
  0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891 \
  0xA238Dd80C259a72e81d7e4664a9801593F98d1c5 \
  0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D \
  0x48a6e6695a7d3e8c76eb014e648c072db385df6c \
  7000

# Verify FlashSwapV3
npx hardhat verify --network base 0x4926E08c0aF3307Ea7840855515b22596D39F7eb \
  0x2626664c2603336E57B271c5C0b26F421741e481 \
  0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891 \
  0xBA12222222228d8Ba445958a75a0704d566BF2C8 \
  0x0000000000000000000000000000000000000000 \
  0xA238Dd80C259a72e81d7e4664a9801593F98d1c5 \
  0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D \
  0x33128a8fC17869897dcE68Ed026d694621f6FDfD \
  0x48a6e6695a7d3e8c76eb014e648c072db385df6c \
  7000
```

### 2. Update Environment Variables

The `.env` file has been updated with:
```
FLASHSWAP_V2_ADDRESS=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
FLASHSWAP_V3_ADDRESS=0x4926E08c0aF3307Ea7840855515b22596D39F7eb
```

### 3. Test the Contracts

You can now use these contracts for flash loan arbitrage on Base mainnet.

## Technical Notes

- **Deployment Method**: Direct ethers.js deployment (bypassed hardhat-ethers v4 plugin due to compatibility issues)
- **Gas Used**: Approximately 0.0002 ETH total for both deployments
- **Confirmations**: Both contracts confirmed with 5 blocks
- **Owner**: Contract deployer (0x4c1b46Be097024E5712EB3f97b46D2ECf2b531d7)

## Previous Deployment

The previous FlashSwapV2 contract at `0xCF38b66D65f82030675893eD7150a76d760a99ce` has been replaced with the new deployment.
