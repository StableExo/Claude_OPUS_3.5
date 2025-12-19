# 🔨 Foundry Contract Verification for Base Network

Complete guide for verifying FlashSwapV2 and FlashSwapV3 contracts on BaseScan using Foundry's `forge verify-contract` command.

## 📚 Reference

Based on official Base documentation:
- [Verify Contract with BaseScan](https://docs.base.org/learn/foundry/verify-contract-with-basescan)

## 🚀 Quick Start

### One-Command Verification

```bash
./scripts/verification/verify-contracts-foundry.sh
```

This script will:
1. ✅ Load configuration from `.env`
2. ✅ Verify FlashSwapV2 on BaseScan
3. ✅ Verify FlashSwapV3 on BaseScan
4. ✅ Provide direct links to verified contracts

## 📋 Prerequisites

### 1. Install Foundry

If you don't have Foundry installed:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify installation:
```bash
forge --version
# Should output: forge 0.2.0 (or later)
```

### 2. Environment Variables

Ensure your `.env` file has:

```bash
# Required
BASESCAN_API_KEY=your_basescan_api_key

# Contract addresses (already set)
FLASHSWAP_V2_ADDRESS=0x6e2473E4BEFb66618962f8c332706F8f8d339c08
FLASHSWAP_V3_ADDRESS=0x4926E08c0aF3307Ea7840855515b22596D39F7eb
```

Get BaseScan API key: https://basescan.org/myapikey

### 3. Verification Files

The following files are already prepared in `verification/`:

- `FlashSwapV2_flattened.sol` - Flattened V2 contract
- `FlashSwapV2_constructor_args.txt` - ABI-encoded constructor arguments
- `FlashSwapV3_flattened.sol` - Flattened V3 contract  
- `FlashSwapV3_constructor_args.txt` - ABI-encoded constructor arguments

## 🔍 Manual Verification (Individual Contracts)

### FlashSwapV2

```bash
forge verify-contract \
    --chain-id 8453 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cat verification/FlashSwapV2_constructor_args.txt) \
    --etherscan-api-key $BASESCAN_API_KEY \
    --compiler-version v0.8.20+commit.a1b79de6 \
    0x6e2473E4BEFb66618962f8c332706F8f8d339c08 \
    contracts/FlashSwapV2.sol:FlashSwapV2
```

### FlashSwapV3

```bash
forge verify-contract \
    --chain-id 8453 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cat verification/FlashSwapV3_constructor_args.txt) \
    --etherscan-api-key $BASESCAN_API_KEY \
    --compiler-version v0.8.20+commit.a1b79de6 \
    0x4926E08c0aF3307Ea7840855515b22596D39F7eb \
    contracts/FlashSwapV3.sol:FlashSwapV3
```

## 🔧 Compiler Settings

| Setting | Value |
|---------|-------|
| Compiler Version | `v0.8.20+commit.a1b79de6` |
| Optimization | Enabled |
| Optimization Runs | 200 |
| EVM Version | shanghai |
| Chain ID | 8453 (Base Mainnet) |
| License | MIT |

## 📊 Verification Status

After running the script, check verification status:

### FlashSwapV2
- **Address**: `0x6e2473E4BEFb66618962f8c332706F8f8d339c08`
- **Verified Code**: https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08#code
- **Manual Verification**: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08

### FlashSwapV3
- **Address**: `0x4926E08c0aF3307Ea7840855515b22596D39F7eb`
- **Verified Code**: https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb#code
- **Manual Verification**: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb

## 🛠️ Troubleshooting

### Error: "Foundry not found"

**Solution**: Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Error: "BASESCAN_API_KEY not set"

**Solution**: Add API key to `.env`
```bash
echo "BASESCAN_API_KEY=your_key_here" >> .env
```

Get key: https://basescan.org/myapikey

### Error: "Contract already verified"

**Solution**: This is actually success! Contract is already on BaseScan.
Check: https://basescan.org/address/[CONTRACT_ADDRESS]#code

### Error: "Compilation failed"

**Possible causes**:
1. Compiler version mismatch - check `foundry.toml`
2. Source code mismatch - ensure contracts haven't changed

**Solution**: Regenerate flattened contracts
```bash
npm run verify:autonomous
```

### Error: "Constructor arguments invalid"

**Causes**:
- Incorrect ABI encoding in constructor args file
- Constructor parameters changed since deployment

**Solution**: Regenerate constructor args
```bash
# The deployment script should have saved them
# Check deployment logs or regenerate from deployment transaction
```

## 📖 Understanding the Verification Process

### 1. What `forge verify-contract` Does

The command:
- Compiles the contract locally with specified settings
- Compares bytecode with on-chain deployed bytecode
- Submits source code to BaseScan if bytecode matches
- Marks contract as verified on BaseScan

### 2. Why Constructor Arguments Matter

Constructor arguments are:
- Encoded in the deployment transaction
- Part of the contract's initialization
- Required for BaseScan to verify the contract properly
- Stored in `*_constructor_args.txt` files

### 3. Compiler Settings Must Match

For verification to succeed:
- ✅ Compiler version must match deployment
- ✅ Optimization settings must match deployment
- ✅ EVM version must match deployment
- ✅ Constructor args must match deployment

## 🎯 Verification Benefits

Once verified:

### Security
- ✅ Anyone can read the contract source code
- ✅ Users can verify contract behavior before interacting
- ✅ Security researchers can audit the code

### Transparency  
- ✅ Full visibility into contract logic
- ✅ Constructor parameters visible
- ✅ Comments and documentation accessible

### Integration
- ✅ Etherscan UI for reading/writing contract
- ✅ Better integration with block explorers
- ✅ Easier debugging and interaction

## 🔄 Alternative Verification Methods

If Foundry verification fails, you can use:

### 1. Gist Upload Method
```bash
npm run verify:upload-gist
```
See: `CONTRACT_VERIFICATION_WITH_GIST.md`

### 2. Manual Paste Method
See: `verification/README.md`

### 3. Hardhat Verification
```bash
npx hardhat verify --network base [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
```

## 📝 Script Output Example

```
╔════════════════════════════════════════════════════════════╗
║   FlashSwap Contract Verification (Foundry Method)       ║
╚════════════════════════════════════════════════════════════╝

Configuration:
  Chain ID: 8453 (Base Mainnet)
  FlashSwapV2: 0x6e2473E4BEFb66618962f8c332706F8f8d339c08
  FlashSwapV3: 0x4926E08c0aF3307Ea7840855515b22596D39F7eb
  Compiler: v0.8.20+commit.a1b79de6
  Optimization: Yes (200 runs)
  EVM Version: shanghai

═══════════════════════════════════════════════════════════
Verifying FlashSwapV2...
═══════════════════════════════════════════════════════════
  Address: 0x6e2473E4BEFb66618962f8c332706F8f8d339c08
  ...
  
✅ FlashSwapV2 verified successfully!
   View at: https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08#code

═══════════════════════════════════════════════════════════
Verifying FlashSwapV3...
═══════════════════════════════════════════════════════════
  Address: 0x4926E08c0aF3307Ea7840855515b22596D39F7eb
  ...
  
✅ FlashSwapV3 verified successfully!
   View at: https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb#code

╔════════════════════════════════════════════════════════════╗
║                  VERIFICATION SUMMARY                      ║
╚════════════════════════════════════════════════════════════╝

✅ FlashSwapV2: VERIFIED
   https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08#code

✅ FlashSwapV3: VERIFIED
   https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb#code

🎉 All contracts verified successfully!
```

## 🔗 Related Documentation

- [Contract Verification Guide](CONTRACT_VERIFICATION_GUIDE.md) - General verification guide
- [Gist-based Verification](CONTRACT_VERIFICATION_WITH_GIST.md) - Alternative method
- [Quick Reference](../verification/QUICK_REFERENCE.md) - Quick commands
- [Base Foundry Docs](https://docs.base.org/learn/foundry/verify-contract-with-basescan) - Official docs

## 📞 Support

If you encounter issues:

1. Check troubleshooting section above
2. Verify all prerequisites are met
3. Try alternative verification methods
4. Check deployment logs for constructor args

---

**Last Updated**: 2025-12-19  
**Contracts**: FlashSwapV2, FlashSwapV3  
**Network**: Base Mainnet (Chain ID: 8453)
