#!/usr/bin/env node --import tsx
/**
 * Direct deployment script using ethers.js v6 without hardhat-ethers plugin
 * Deploys both FlashSwapV2 and FlashSwapV3 contracts to Base mainnet
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

// Network configuration
const BASE_RPC_URL = process.env.BASE_RPC_URL;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const TITHE_WALLET_ADDRESS = process.env.TITHE_WALLET_ADDRESS;
const TITHE_BPS = parseInt(process.env.TITHE_BPS || "7000");

// Base mainnet addresses
const ADDRESSES = {
  uniswapV3Router: "0x2626664c2603336E57B271c5C0b26F421741e481",
  sushiRouter: "0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891",
  aavePool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
  aaveAddressesProvider: "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D",
  balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
  uniswapV3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  dydxSoloMargin: "0x0000000000000000000000000000000000000000" // Not available on Base
};

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Deploying FlashSwapV2 and FlashSwapV3 to Base");
  console.log("═══════════════════════════════════════════════════════\n");

  if (!BASE_RPC_URL || !WALLET_PRIVATE_KEY) {
    throw new Error("BASE_RPC_URL and WALLET_PRIVATE_KEY must be set in .env");
  }

  // Connect to Base network
  const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
  
  console.log("Deployer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  const network = await provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  console.log("");

  const titheRecipient = TITHE_WALLET_ADDRESS || wallet.address;
  console.log("Configuration:");
  console.log("  Tithe Recipient:", titheRecipient);
  console.log("  Tithe BPS:", TITHE_BPS, `(${TITHE_BPS/100}%)`);
  console.log("");

  // Load contract artifacts
  const artifactsPath = path.join(process.cwd(), "artifacts", "contracts");
  
  const flashSwapV2Artifact = JSON.parse(
    fs.readFileSync(path.join(artifactsPath, "FlashSwapV2.sol", "FlashSwapV2.json"), "utf8")
  );
  
  const flashSwapV3Artifact = JSON.parse(
    fs.readFileSync(path.join(artifactsPath, "FlashSwapV3.sol", "FlashSwapV3.json"), "utf8")
  );

  // Deploy FlashSwapV2
  console.log("━".repeat(60));
  console.log("📦 Deploying FlashSwapV2...");
  console.log("━".repeat(60));

  const FlashSwapV2Factory = new ethers.ContractFactory(
    flashSwapV2Artifact.abi,
    flashSwapV2Artifact.bytecode,
    wallet
  );

  const flashSwapV2 = await FlashSwapV2Factory.deploy(
    ADDRESSES.uniswapV3Router,
    ADDRESSES.sushiRouter,
    ADDRESSES.aavePool,
    ADDRESSES.aaveAddressesProvider,
    titheRecipient,
    TITHE_BPS
  );

  await flashSwapV2.waitForDeployment();
  const flashSwapV2Address = await flashSwapV2.getAddress();

  console.log("✅ FlashSwapV2 deployed!");
  console.log("   Address:", flashSwapV2Address);
  console.log("   Transaction:", flashSwapV2.deploymentTransaction()?.hash);

  // Wait for confirmations
  console.log("\n⏳ Waiting for 5 confirmations...");
  const deployTxV2 = flashSwapV2.deploymentTransaction();
  if (deployTxV2) {
    await deployTxV2.wait(5);
    console.log("✅ Confirmations complete");
  }

  // Deploy FlashSwapV3
  console.log("\n" + "━".repeat(60));
  console.log("📦 Deploying FlashSwapV3...");
  console.log("━".repeat(60));

  const FlashSwapV3Factory = new ethers.ContractFactory(
    flashSwapV3Artifact.abi,
    flashSwapV3Artifact.bytecode,
    wallet
  );

  const flashSwapV3 = await FlashSwapV3Factory.deploy(
    ADDRESSES.uniswapV3Router,
    ADDRESSES.sushiRouter,
    ADDRESSES.balancerVault,
    ADDRESSES.dydxSoloMargin,
    ADDRESSES.aavePool,
    ADDRESSES.aaveAddressesProvider,
    ADDRESSES.uniswapV3Factory,
    titheRecipient,
    TITHE_BPS
  );

  await flashSwapV3.waitForDeployment();
  const flashSwapV3Address = await flashSwapV3.getAddress();

  console.log("✅ FlashSwapV3 deployed!");
  console.log("   Address:", flashSwapV3Address);
  console.log("   Transaction:", flashSwapV3.deploymentTransaction()?.hash);

  // Wait for confirmations
  console.log("\n⏳ Waiting for 5 confirmations...");
  const deployTxV3 = flashSwapV3.deploymentTransaction();
  if (deployTxV3) {
    await deployTxV3.wait(5);
    console.log("✅ Confirmations complete");
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("═".repeat(60));
  console.log("\nDeployed Contracts:");
  console.log("  FlashSwapV2:", flashSwapV2Address);
  console.log("  FlashSwapV3:", flashSwapV3Address);
  console.log("\nAdd these to your .env file:");
  console.log(`  FLASHSWAP_V2_ADDRESS=${flashSwapV2Address}`);
  console.log(`  FLASHSWAP_V3_ADDRESS=${flashSwapV3Address}`);
  console.log("\nBasescan URLs:");
  console.log(`  FlashSwapV2: https://basescan.org/address/${flashSwapV2Address}`);
  console.log(`  FlashSwapV3: https://basescan.org/address/${flashSwapV3Address}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
