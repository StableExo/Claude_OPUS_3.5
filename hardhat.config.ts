// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Helper function to get config value from Hardhat vars or environment
 * Prioritizes Hardhat Configuration Variables for security, falls back to env vars
 * 
 * Note: Hardhat vars is available in Hardhat 3.x via dynamic import
 */
function getConfigValue(varName: string, defaultValue: string = ""): string {
  try {
    // Try Hardhat Configuration Variables first (secure, encrypted)
    // Using dynamic require for optional dependency
    const { vars } = require("hardhat");
    if (vars && vars.has(varName)) {
      return vars.get(varName, defaultValue);
    }
  } catch (error) {
    // Hardhat vars not available or password not provided
    // Fall through to environment variable
  }
  
  // Fallback to environment variable (backward compatibility)
  return process.env[varName] || defaultValue;
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
    overrides: {
      "contracts/interfaces/IUniswapV2Router02.sol": {
        version: "0.7.6"
      },
      "contracts/interfaces/IDODOV1V2Pool.sol": {
        version: "0.7.6"
      }
    }
  },
  paths: {
    sources: "./contracts"
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      type: "edr-simulated" as const,
      // Hardhat 3.x uses EDR (Ethereum Development Runtime) by default
      // If forking is needed, configure it with proper URL check
      ...(getConfigValue("FORKING") === "true" && getConfigValue("BASE_RPC_URL") && {
        forking: {
          url: getConfigValue("BASE_RPC_URL"),
          enabled: true
        }
      }),
      // Support Ethereum mainnet forking for PoC
      ...(getConfigValue("ETHEREUM_RPC_URL") && {
        forking: {
          url: getConfigValue("ETHEREUM_RPC_URL"),
          enabled: true
        }
      })
    },
    // Network configurations using secure config values
    ...(getConfigValue("GOERLI_RPC_URL") && {
      goerli: {
        type: "http" as const,
        url: getConfigValue("GOERLI_RPC_URL"),
        accounts: getConfigValue("WALLET_PRIVATE_KEY") ? [getConfigValue("WALLET_PRIVATE_KEY")] : []
      }
    }),
    ...(getConfigValue("BASE_RPC_URL") && {
      mainnet: {
        type: "http" as const,
        url: getConfigValue("BASE_RPC_URL"),
        accounts: getConfigValue("WALLET_PRIVATE_KEY") ? [getConfigValue("WALLET_PRIVATE_KEY")] : []
      }
    }),
    ...(getConfigValue("ARBITRUM_RPC_URL") && {
      arbitrum: {
        type: "http" as const,
        url: getConfigValue("ARBITRUM_RPC_URL"),
        accounts: getConfigValue("WALLET_PRIVATE_KEY") ? [getConfigValue("WALLET_PRIVATE_KEY")] : []
      }
    }),
    ...(getConfigValue("POLYGON_RPC_URL") && {
      polygon: {
        type: "http" as const,
        url: getConfigValue("POLYGON_RPC_URL"),
        accounts: getConfigValue("WALLET_PRIVATE_KEY") ? [getConfigValue("WALLET_PRIVATE_KEY")] : []
      }
    }),
    ...(getConfigValue("BASE_RPC_URL") && {
      base: {
        type: "http" as const,
        url: getConfigValue("BASE_RPC_URL"),
        accounts: getConfigValue("WALLET_PRIVATE_KEY") ? [getConfigValue("WALLET_PRIVATE_KEY")] : []
      }
    }),
    baseSepolia: {
      type: "http" as const,
      url: getConfigValue("BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org"),
      accounts: getConfigValue("WALLET_PRIVATE_KEY") ? [getConfigValue("WALLET_PRIVATE_KEY")] : []
    }
  },
  etherscan: {
    apiKey: {
      mainnet: getConfigValue("ETHERSCAN_API_KEY"),
      goerli: getConfigValue("ETHERSCAN_API_KEY"),
      arbitrum: getConfigValue("ARBISCAN_API_KEY"),
      polygon: getConfigValue("POLYGONSCAN_API_KEY"),
      base: getConfigValue("BASESCAN_API_KEY"),
      baseSepolia: getConfigValue("BASESCAN_API_KEY")
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=8453",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=84532",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};

export default config;
