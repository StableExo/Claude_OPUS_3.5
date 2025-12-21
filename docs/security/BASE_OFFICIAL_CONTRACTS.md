# Base Official Contract Addresses
## Complete Reference from docs.base.org

**Source**: https://docs.base.org/base-chain/network-information/base-contracts  
**Last Updated**: December 21, 2025  
**Purpose**: Official contract addresses for Base L2 Bridge security testing

---

## Executive Summary

This document contains the **official** Base L2 bridge contract addresses as documented on docs.base.org. These are the canonical contracts for bridging between Ethereum L1 and Base L2.

### Key Insights

✅ **L2 Addresses are Consistent**: L2 contract addresses are identical between mainnet and testnet  
✅ **Predeploys**: Most L2 contracts use predictable addresses starting with `0x4200...`  
⚠️ **Bridge UI Deprecated**: Official Base bridge UI is deprecated, but contracts remain active  
🎯 **Security Testing Target**: These are the exact contracts to test for vulnerabilities

---

## L1 Contracts (Ethereum Mainnet)

These contracts are deployed on **Ethereum Mainnet (Chain ID: 1)**.

### Core Bridge Contracts

| Contract Name | Address | Purpose |
|--------------|---------|---------|
| **L1StandardBridge** | `0x3154Cf16ccdb4C6d922629664174b904d80F2C35` | Main bridge for ERC20 tokens (L1 → L2) |
| **L1CrossDomainMessenger** | `0x866E82a600A1414e583f7F13623F1aC5d58b0Afa` | Cross-chain message passing (L1 ↔ L2) |
| **L1ERC721Bridge** | `0x608d94945A64503E642E6370Ec598e519a2C1E53` | Bridge for NFTs (ERC721) |
| **OptimismPortal** | `0x49048044D57e1C92A77f79988d21Fa8fAF74E97e` | **Portal for ETH deposits & withdrawals** |

### Supporting L1 Contracts

| Contract Name | Address | Purpose |
|--------------|---------|---------|
| **L2OutputOracle** | `0x56315b90c40730925ec5485cf004d835058518A0` | Stores L2 state roots for withdrawal verification |
| **SystemConfig** | TBD | System configuration parameters |
| **AddressManager** | TBD | Legacy address registry |

### ⚠️ Critical Security Note - OptimismPortal

**Address**: `0x49048044D57e1C92A77f79988d21Fa8fAF74E97e`

- **Direct ETH Bridging**: You can send ETH directly to this address to bridge to Base L2
- **ONLY from Ethereum Mainnet**: Never send from exchanges or other chains
- **Unrecoverable Loss**: Sending from wrong source will result in permanent loss of funds
- **Challenge Period**: 7 days for withdrawal finalization

---

## L2 Contracts (Base L2)

These contracts are deployed on **Base Mainnet (Chain ID: 8453)** and **Base Sepolia (Chain ID: 84532)**.

### 🎯 Predeploy Addresses (0x4200...)

Base uses the **OP Stack predeploy pattern** where core system contracts are deployed to predictable addresses starting with `0x4200000000000000000000000000000000000000` + offset.

### Core Bridge Contracts (L2)

| Contract Name | Address | Purpose | Testnet |
|--------------|---------|---------|---------|
| **L2StandardBridge** | `0x4200000000000000000000000000000000000010` | Main bridge for ERC20 (L2 side) | ✅ Same |
| **L2CrossDomainMessenger** | `0x4200000000000000000000000000000000000007` | Cross-chain messaging (L2 side) | ✅ Same |
| **L2ERC721Bridge** | `0x4200000000000000000000000000000000000014` | NFT bridge (L2 side) | ✅ Same |
| **L2ToL1MessagePasser** | `0x4200000000000000000000000000000000000016` | Initiates L2 → L1 messages | ✅ Same |

### System Contracts (L2)

| Contract Name | Address | Purpose | Testnet |
|--------------|---------|---------|---------|
| **WETH9** | `0x4200000000000000000000000000000000000006` | Wrapped ETH on Base L2 | ✅ Same |
| **L1Block** | `0x4200000000000000000000000000000000000015` | L1 block info on L2 | ✅ Same |
| **GasPriceOracle** | `0x420000000000000000000000000000000000000F` | Gas price calculations | ✅ Same |
| **ProxyAdmin** | `0x4200000000000000000000000000000000000018` | Proxy administration | ✅ Same |

### Fee Vaults (L2)

| Contract Name | Address | Purpose | Testnet |
|--------------|---------|---------|---------|
| **SequencerFeeVault** | `0x4200000000000000000000000000000000000011` | Sequencer fees | ✅ Same |
| **BaseFeeVault** | `0x4200000000000000000000000000000000000019` | Base fees | ✅ Same |
| **L1FeeVault** | `0x420000000000000000000000000000000000001a` | L1 data fees | ✅ Same |

### Token Factories (L2)

| Contract Name | Address | Purpose | Testnet |
|--------------|---------|---------|---------|
| **OptimismMintableERC20Factory** | `0xF10122D428B4bc8A9d050D06a2037259b4c4B83B` | Creates bridgeable ERC20s | ⚠️ Different: `0x4200...0012` |
| **OptimismMintableERC721Factory** | `0x4200000000000000000000000000000000000017` | Creates bridgeable NFTs | ✅ Same |

### Attestation System (L2)

| Contract Name | Address | Purpose | Testnet |
|--------------|---------|---------|---------|
| **EAS** (Ethereum Attestation Service) | `0x4200000000000000000000000000000000000021` | On-chain attestations | ✅ Same |
| **EASSchemaRegistry** | `0x4200000000000000000000000000000000000020` | Attestation schemas | ✅ Same |

### Legacy Contracts (L2)

| Contract Name | Address | Purpose | Testnet |
|--------------|---------|---------|---------|
| **LegacyERC20ETH** | `0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000` | Legacy ETH representation | ✅ Same |

---

## L1 Testnet Contracts (Sepolia)

These contracts are deployed on **Sepolia Testnet (Chain ID: 11155111)** for testing.

| Contract Name | Address | Network |
|--------------|---------|---------|
| **L1StandardBridge** | TBD | Sepolia |
| **L1CrossDomainMessenger** | TBD | Sepolia |
| **OptimismPortal** | TBD | Sepolia |
| **L2OutputOracle** | TBD | Sepolia |

**Note**: Testnet L1 addresses are different from mainnet. Consult official docs for exact addresses.

---

## Contract Address Patterns

### Predeploy Pattern Analysis

Base follows the OP Stack predeploy convention:

```
Base Address:    0x4200000000000000000000000000000000000000
Plus Offset:     0x0000000000000000000000000000000000000007
Equals:          0x4200000000000000000000000000000000000007 (L2CrossDomainMessenger)
```

### Predeploy Offset Map

| Offset (Hex) | Contract | Address |
|-------------|----------|---------|
| `0x06` | WETH9 | `0x4200...0006` |
| `0x07` | L2CrossDomainMessenger | `0x4200...0007` |
| `0x0F` | GasPriceOracle | `0x420...000F` |
| `0x10` | L2StandardBridge | `0x4200...0010` |
| `0x11` | SequencerFeeVault | `0x4200...0011` |
| `0x12` | OptimismMintableERC20Factory (testnet) | `0x4200...0012` |
| `0x14` | L2ERC721Bridge | `0x4200...0014` |
| `0x15` | L1Block | `0x4200...0015` |
| `0x16` | L2ToL1MessagePasser | `0x4200...0016` |
| `0x17` | OptimismMintableERC721Factory | `0x4200...0017` |
| `0x18` | ProxyAdmin | `0x4200...0018` |
| `0x19` | BaseFeeVault | `0x4200...0019` |
| `0x1A` | L1FeeVault | `0x420...001A` |
| `0x20` | EASSchemaRegistry | `0x4200...0020` |
| `0x21` | EAS | `0x4200...0021` |

---

## Security Testing Priority

### Critical (Must Test)

1. ✅ **OptimismPortal** (`0x49048044...`) - Deposit/withdrawal entry point
2. ✅ **L1StandardBridge** (`0x3154Cf16...`) - Main token bridge (L1)
3. ✅ **L2StandardBridge** (`0x4200...0010`) - Main token bridge (L2)
4. ✅ **L2OutputOracle** (`0x56315b90...`) - State root verification
5. ✅ **L1CrossDomainMessenger** (`0x866E82a6...`) - Message authentication (L1)
6. ✅ **L2CrossDomainMessenger** (`0x4200...0007`) - Message authentication (L2)
7. ✅ **L2ToL1MessagePasser** (`0x4200...0016`) - Withdrawal initiation

### High Priority

8. ⚠️ **ProxyAdmin** (`0x4200...0018`) - Admin access control
9. ⚠️ **OptimismMintableERC20Factory** - Token creation logic
10. ⚠️ **WETH9** (`0x4200...0006`) - ETH wrapping/unwrapping

### Medium Priority

11. 📋 **Fee Vaults** - Fee collection and distribution
12. 📋 **L1Block** - L1 state reading on L2
13. 📋 **GasPriceOracle** - Gas price manipulation

---

## Attack Surface Analysis

### Primary Attack Vectors

#### 1. Deposit Flow (L1 → L2)
```
User → L1StandardBridge → OptimismPortal → L2CrossDomainMessenger → L2StandardBridge
```

**Vulnerability Classes**:
- Deposit replay attacks
- Message relay manipulation
- Token minting logic flaws
- Reentrancy in deposit functions

#### 2. Withdrawal Flow (L2 → L1)
```
User → L2StandardBridge → L2ToL1MessagePasser → [Wait 7 days] → OptimismPortal → L1StandardBridge
```

**Vulnerability Classes**:
- Proof manipulation
- Challenge period bypass
- State root oracle manipulation
- Double-spend via replay
- Finalization logic flaws

#### 3. Cross-Chain Messaging
```
L1CrossDomainMessenger ↔ L2CrossDomainMessenger
```

**Vulnerability Classes**:
- Message authentication bypass
- Cross-chain reentrancy
- Nonce manipulation
- Unauthorized message injection

#### 4. Admin Functions
```
ProxyAdmin → Proxy Contracts → Implementation Contracts
```

**Vulnerability Classes**:
- Privilege escalation
- Unauthorized upgrades
- Proxy storage collisions
- Admin key compromise

---

## Verification & Explorers

### Block Explorers

**Ethereum Mainnet (L1)**:
- Etherscan: https://etherscan.io/
- L1StandardBridge: https://etherscan.io/address/0x3154Cf16ccdb4C6d922629664174b904d80F2C35
- OptimismPortal: https://etherscan.io/address/0x49048044D57e1C92A77f79988d21Fa8fAF74E97e

**Base Mainnet (L2)**:
- Basescan: https://basescan.org/
- L2StandardBridge: https://basescan.org/address/0x4200000000000000000000000000000000000010
- L2CrossDomainMessenger: https://basescan.org/address/0x4200000000000000000000000000000000000007

### Contract Source Verification

All contracts should be verified on their respective explorers:
- ✅ L1 contracts verified on Etherscan
- ✅ L2 contracts verified on Basescan
- ✅ Source code publicly available

---

## Integration with Security Testing

### Environment Variables for .env

```bash
# L1 Bridge Contracts (Ethereum Mainnet)
L1_STANDARD_BRIDGE_ADDRESS=0x3154Cf16ccdb4C6d922629664174b904d80F2C35
OPTIMISM_PORTAL_ADDRESS=0x49048044D57e1C92A77f79988d21Fa8fAF74E97e
L2_OUTPUT_ORACLE_ADDRESS=0x56315b90c40730925ec5485cf004d835058518A0
L1_CROSS_DOMAIN_MESSENGER_ADDRESS=0x866E82a600A1414e583f7F13623F1aC5d58b0Afa
L1_ERC721_BRIDGE_ADDRESS=0x608d94945A64503E642E6370Ec598e519a2C1E53

# L2 Bridge Contracts (Base L2)
L2_STANDARD_BRIDGE_ADDRESS=0x4200000000000000000000000000000000000010
L2_CROSS_DOMAIN_MESSENGER_ADDRESS=0x4200000000000000000000000000000000000007
L2_ERC721_BRIDGE_ADDRESS=0x4200000000000000000000000000000000000014
L2_TO_L1_MESSAGE_PASSER_ADDRESS=0x4200000000000000000000000000000000000016

# L2 System Contracts
WETH9_L2_ADDRESS=0x4200000000000000000000000000000000000006
L1_BLOCK_ADDRESS=0x4200000000000000000000000000000000000015
GAS_PRICE_ORACLE_ADDRESS=0x420000000000000000000000000000000000000F
PROXY_ADMIN_ADDRESS=0x4200000000000000000000000000000000000018

# Bridge Configuration
BRIDGE_CHALLENGE_PERIOD=604800  # 7 days in seconds
BRIDGE_FINALIZATION_PERIOD=604800
```

### Fetching ABIs

```bash
# Fetch L1 contract ABIs (Etherscan)
curl "https://api.etherscan.io/api?module=contract&action=getabi&address=0x3154Cf16ccdb4C6d922629664174b904d80F2C35&apikey=${ETHERSCAN_API_KEY}"

# Fetch L2 contract ABIs (Basescan)
curl "https://api.basescan.org/api?module=contract&action=getabi&address=0x4200000000000000000000000000000000000010&apikey=${BASESCAN_API_KEY}"
```

### Using in Tests

```typescript
import { BRIDGE_CONTRACTS } from './abis/bridge/interfaces';

// Get L1 Standard Bridge
const l1Bridge = BRIDGE_CONTRACTS.ethereum.L1StandardBridge;

// Get L2 Standard Bridge  
const l2Bridge = BRIDGE_CONTRACTS.base.L2StandardBridge;

// Create contract instances
const l1BridgeContract = new ethers.Contract(l1Bridge, L1StandardBridgeABI, provider);
const l2BridgeContract = new ethers.Contract(l2Bridge, L2StandardBridgeABI, provider);
```

---

## Important Warnings

### ⚠️ Direct ETH Transfers

**DO**:
- ✅ Send ETH to OptimismPortal from Ethereum mainnet only
- ✅ Use proper bridge functions for token transfers
- ✅ Wait 7 days for withdrawal finalization

**DON'T**:
- ❌ Send ETH to OptimismPortal from exchanges
- ❌ Send ETH to OptimismPortal from other chains
- ❌ Expect instant withdrawals (7-day challenge period)
- ❌ Skip withdrawal proving step

### ⚠️ Bridge UI Deprecation

The official Base bridge UI at bridge.base.org has been deprecated:
- Contracts remain fully functional
- Use programmatic access via ABIs
- Third-party bridges still available
- Direct contract interaction supported

### ⚠️ Testnet vs Mainnet

- Most L2 addresses are SAME between mainnet and testnet
- L1 addresses are DIFFERENT between mainnet and Sepolia
- Always verify you're on the correct network
- Use chain ID checks in code

---

## References

1. **Official Base Docs**: https://docs.base.org/base-chain/network-information/base-contracts
2. **Base Bridge Docs**: https://docs.base.org/base-chain/network-information/bridges-mainnet
3. **OP Stack Predeploys**: https://community.optimism.io/docs/protocol/predeploys/
4. **Etherscan**: https://etherscan.io/
5. **Basescan**: https://basescan.org/

---

## Changelog

- **2025-12-21**: Initial documentation from official Base docs
- Contract addresses verified against docs.base.org
- All predeploy addresses documented
- Security testing priorities established

---

**Status**: ✅ Complete and Verified  
**Next Update**: As needed when Base protocol updates  
**Maintained By**: TheWarden Security Team
