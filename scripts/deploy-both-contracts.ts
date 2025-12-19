import hre from "hardhat";
import { ADDRESSES, NetworkKey, requireAddress } from "../src/config/addresses";

async function main() {
  console.log("Deploying FlashSwapV2 and FlashSwapV3 to Base mainnet");
  
  const { ethers } = await import("hardhat");
  
  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name as NetworkKey;
  
  console.log("Deployer:", deployer.address);
  console.log("Network:", networkName);
  
  const uniswapV3Router = requireAddress(networkName, "uniswapV3Router");
  const sushiRouter = requireAddress(networkName, "sushiRouter");
  const aavePool = requireAddress(networkName, "aavePool");
  const aaveAddressesProvider = requireAddress(networkName, "aaveAddressesProvider");
  const balancerVault = requireAddress(networkName, "balancerVault");
  const uniswapV3Factory = requireAddress(networkName, "uniswapV3Factory");
  const dydxSoloMargin = "0x0000000000000000000000000000000000000000";
  const titheRecipient = process.env.TITHE_WALLET_ADDRESS || deployer.address;
  const titheBps = parseInt(process.env.TITHE_BPS || "7000");
  
  console.log("\nDeploying FlashSwapV2...");
  const FlashSwapV2 = await ethers.getContractFactory("FlashSwapV2");
  const flashSwapV2 = await FlashSwapV2.deploy(
    uniswapV3Router, sushiRouter, aavePool, aaveAddressesProvider
  );
  await flashSwapV2.waitForDeployment();
  const v2Address = await flashSwapV2.getAddress();
  console.log("✅ FlashSwapV2:", v2Address);
  
  console.log("\nDeploying FlashSwapV3...");
  const FlashSwapV3 = await ethers.getContractFactory("FlashSwapV3");
  const flashSwapV3 = await FlashSwapV3.deploy(
    uniswapV3Router, sushiRouter, balancerVault, dydxSoloMargin,
    aavePool, aaveAddressesProvider, uniswapV3Factory, titheRecipient, titheBps
  );
  await flashSwapV3.waitForDeployment();
  const v3Address = await flashSwapV3.getAddress();
  console.log("✅ FlashSwapV3:", v3Address);
  
  console.log("\n🎉 DEPLOYMENT COMPLETE");
  console.log("FlashSwapV2:", v2Address);
  console.log("FlashSwapV3:", v3Address);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
