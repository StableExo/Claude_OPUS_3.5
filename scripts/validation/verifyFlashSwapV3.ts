import hre from "hardhat";
import { ADDRESSES, NetworkKey, requireAddress } from "../../src/config/addresses";

/**
 * Contract Verification Script for FlashSwapV3
 * 
 * This script programmatically verifies the FlashSwapV3 contract on block explorers
 * (Etherscan, BaseScan, etc.) using Hardhat's verify plugin.
 * 
 * FlashSwapV3 includes multi-source flash loan support:
 * - Balancer V2 (0% fee)
 * - dYdX Solo Margin (0% fee, Ethereum only)
 * - Aave V3 (0.09% fee)
 * - Tithe system (70% US debt reduction)
 * 
 * Usage:
 *   npx hardhat run scripts/validation/verifyFlashSwapV3.ts --network base
 *   
 * Environment Variables Required:
 *   - BASESCAN_API_KEY: Your BaseScan API key (get from https://basescan.org/myapikey)
 *   - CONTRACT_ADDRESS or FLASHSWAP_V3_ADDRESS: The deployed contract address
 *   - TITHE_RECIPIENT (optional): Tithe recipient address (defaults to deployer)
 *   - TITHE_BPS (optional): Tithe basis points (default: 7000 = 70%)
 */

async function main() {
  // Connect to network to get NetworkConnection with networkName (Hardhat v3 API)
  const networkConnection = await hre.network.connect();
  const networkName = networkConnection.networkName;
  
  console.log("🔍 FlashSwapV3 Contract Verification Script");
  console.log("============================================");
  console.log(`Network: ${networkName}`);
  
  // Get contract address from environment variable
  const contractAddress = process.env.CONTRACT_ADDRESS || process.env.FLASHSWAP_V3_ADDRESS;
  
  if (!contractAddress) {
    console.error("\n❌ Error: Contract address not provided.");
    console.error("Please set either CONTRACT_ADDRESS or FLASHSWAP_V3_ADDRESS environment variable.");
    console.error("\nExample usage:");
    console.error("  CONTRACT_ADDRESS=0x... npx hardhat run scripts/validation/verifyFlashSwapV3.ts --network base");
    process.exit(1);
  }
  
  console.log(`Contract Address: ${contractAddress}`);
  
  // Validate network is supported
  const supportedNetworks: NetworkKey[] = ["base", "baseSepolia", "arbitrum", "polygon", "mainnet", "goerli"];
  if (!supportedNetworks.includes(networkName as NetworkKey)) {
    console.error(`\n❌ Error: Unsupported network: ${networkName}`);
    console.error(`Supported networks: ${supportedNetworks.join(", ")}`);
    process.exit(1);
  }
  
  // Get network addresses from centralized config
  const netName = networkName as NetworkKey;
  const addresses = ADDRESSES[netName];
  
  if (!addresses) {
    console.error(`\n❌ Error: No address configuration found for network: ${networkName}`);
    console.error("Please add addresses to src/config/addresses.ts for this network.");
    process.exit(1);
  }
  
  // Get constructor arguments from centralized config
  const uniswapV3Router = requireAddress(netName, "uniswapV3Router");
  const sushiRouter = requireAddress(netName, "sushiRouter");
  const balancerVault = requireAddress(netName, "balancerVault");
  const dydxSoloMargin = addresses.dydxSoloMargin || "0x0000000000000000000000000000000000000000";
  const aavePool = requireAddress(netName, "aavePool");
  const aaveAddressesProvider = requireAddress(netName, "aaveAddressesProvider");
  const uniswapV3Factory = requireAddress(netName, "uniswapV3Factory");
  
  // Tithe configuration - must match deployment parameters
  // Default: 7000 bps = 70% to debt reduction, 30% to operator
  const TITHE_BPS = process.env.TITHE_BPS ? parseInt(process.env.TITHE_BPS) : 7000;
  
  // Tithe recipient - try environment variable first, then deployer
  const [deployer] = await hre.ethers.getSigners();
  const titheRecipient = process.env.TITHE_RECIPIENT || deployer.address;
  
  const constructorArgs = [
    uniswapV3Router,
    sushiRouter,
    balancerVault,
    dydxSoloMargin,
    aavePool,
    aaveAddressesProvider,
    uniswapV3Factory,
    titheRecipient,
    TITHE_BPS
  ];
  
  console.log("\n📋 Constructor Arguments:");
  console.log("━".repeat(60));
  console.log(`  1. Uniswap V3 Router:       ${constructorArgs[0]}`);
  console.log(`  2. SushiSwap Router:        ${constructorArgs[1]}`);
  console.log(`  3. Balancer Vault:          ${constructorArgs[2]}`);
  console.log(`  4. dYdX Solo Margin:        ${constructorArgs[3]}`);
  console.log(`  5. Aave Pool:               ${constructorArgs[4]}`);
  console.log(`  6. Aave Provider:           ${constructorArgs[5]}`);
  console.log(`  7. Uniswap V3 Factory:      ${constructorArgs[6]}`);
  console.log(`  8. Tithe Recipient:         ${constructorArgs[7]}`);
  console.log(`  9. Tithe BPS:               ${constructorArgs[8]} (${TITHE_BPS / 100}%)`);
  console.log("━".repeat(60));
  
  // Verify the contract
  console.log("\n📤 Submitting verification request to BaseScan...");
  
  try {
    // Use hre.run to execute the standard Hardhat verify task
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/FlashSwapV3.sol:FlashSwapV3",
    });
    
    console.log("\n✅ Contract verified successfully!");
    console.log(`\nView on block explorer:`);
    
    // Generate block explorer URL based on network
    const explorerUrl = getBlockExplorerUrl(networkName, contractAddress);
    console.log(`  ${explorerUrl}`);
    
  } catch (error: unknown) {
    // Handle already verified contracts gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Already Verified") || errorMessage.includes("already verified") || errorMessage.includes("Already verified")) {
      console.log("\n✅ Contract is already verified!");
      const explorerUrl = getBlockExplorerUrl(networkName, contractAddress);
      console.log(`\nView on block explorer:`);
      console.log(`  ${explorerUrl}`);
    } else {
      console.error("\n❌ Verification failed:");
      console.error(errorMessage);
      
      // Provide helpful debugging information
      console.log("\n📋 Troubleshooting tips:");
      console.log("1. Ensure your API key is correct in hardhat.config.ts");
      console.log("2. Wait a few blocks after deployment before verifying");
      console.log("3. Ensure the contract address is correct");
      console.log("4. Check that constructor arguments match exactly (especially tithe settings)");
      console.log("\nManual verification command:");
      console.log(`npx hardhat verify --network ${networkName} ${contractAddress} \\`);
      console.log(`  ${uniswapV3Router} ${sushiRouter} ${balancerVault} ${dydxSoloMargin} \\`);
      console.log(`  ${aavePool} ${aaveAddressesProvider} ${uniswapV3Factory} \\`);
      console.log(`  ${titheRecipient} ${TITHE_BPS}`);
      
      process.exit(1);
    }
  }
}

/**
 * Block explorer base URLs - shared constant pattern
 */
const BLOCK_EXPLORER_URLS: Record<string, string> = {
  base: "https://basescan.org/address",
  baseSepolia: "https://sepolia.basescan.org/address",
  mainnet: "https://etherscan.io/address",
  goerli: "https://goerli.etherscan.io/address",
  arbitrum: "https://arbiscan.io/address",
  polygon: "https://polygonscan.com/address",
};

/**
 * Get the block explorer URL for a contract based on network
 */
function getBlockExplorerUrl(networkName: string, contractAddress: string): string {
  const baseUrl = BLOCK_EXPLORER_URLS[networkName];
  if (baseUrl) {
    return `${baseUrl}/${contractAddress}#code`;
  }
  return `Contract at ${contractAddress}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
