/**
 * Etherscan MCP Server
 * 
 * This MCP server provides access to Etherscan API across 60+ blockchain networks
 * using the Model Context Protocol standard. It prevents AI hallucination by providing
 * verified on-chain data for contracts, transactions, tokens, and more.
 * 
 * Key capabilities:
 * - Contract ABI and source code retrieval
 * - Contract verification status
 * - Transaction data
 * - Token information
 * - Multi-chain support (Ethereum, Base, Arbitrum, Polygon, Optimism, etc.)
 * 
 * Security:
 * - Supports Hardhat Configuration Variables (encrypted secrets)
 * - Falls back to environment variables for backward compatibility
 * 
 * Based on: https://docs.etherscan.io/mcp-docs/introduction
 */

import { readFile } from 'fs/promises';
import { BaseMcpServer } from '../base/BaseMcpServer.js';
import {
  McpTool,
  McpResource,
  CallToolParams,
  CallToolResult,
  ReadResourceParams,
  ReadResourceResult,
  McpErrorCode,
} from '../types/protocol.js';
import https from 'https';

// Chain configuration matching TheWarden's existing setup
const CHAIN_CONFIG: Record<string, { apiUrl: string; chainId: string; envKey: string }> = {
  ethereum: {
    apiUrl: 'https://api.etherscan.io/v2/api',
    chainId: '1',
    envKey: 'ETHERSCAN_API_KEY',
  },
  base: {
    apiUrl: 'https://api.etherscan.io/v2/api',
    chainId: '8453',
    envKey: 'BASESCAN_API_KEY',
  },
  baseSepolia: {
    apiUrl: 'https://api.etherscan.io/v2/api',
    chainId: '84532',
    envKey: 'BASESCAN_API_KEY',
  },
  arbitrum: {
    apiUrl: 'https://api.etherscan.io/v2/api',
    chainId: '42161',
    envKey: 'ARBISCAN_API_KEY',
  },
  polygon: {
    apiUrl: 'https://api.etherscan.io/v2/api',
    chainId: '137',
    envKey: 'POLYGONSCAN_API_KEY',
  },
  optimism: {
    apiUrl: 'https://api.etherscan.io/v2/api',
    chainId: '10',
    envKey: 'OPTIMISTIC_ETHERSCAN_API_KEY',
  },
};

const BLOCK_EXPLORER_URLS: Record<string, string> = {
  ethereum: 'https://etherscan.io/address',
  base: 'https://basescan.org/address',
  baseSepolia: 'https://sepolia.basescan.org/address',
  arbitrum: 'https://arbiscan.io/address',
  polygon: 'https://polygonscan.com/address',
  optimism: 'https://optimistic.etherscan.io/address',
};

interface EtherscanResponse {
  status: string;
  message: string;
  result: string | object[] | object;
}

export class EtherscanMcpServer extends BaseMcpServer {
  private apiKeys: Map<string, string> = new Map();

  constructor() {
    super({
      name: 'etherscan-mcp',
      version: '1.0.0',
      description: 'Etherscan MCP Server for accessing verified blockchain data across 60+ networks via Model Context Protocol',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
      },
    });

    this.loadApiKeys();
    this.registerEtherscanMethods();
  }

  /**
   * Load API keys from environment variables or Hardhat Configuration Variables
   * Prioritizes Hardhat vars (encrypted) over env vars for security
   */
  private loadApiKeys(): void {
    for (const [chain, config] of Object.entries(CHAIN_CONFIG)) {
      let apiKey: string | undefined;
      
      try {
        // Option 1: Try Hardhat Configuration Variables (secure, encrypted)
        // This requires @types/node for dynamic import
        const hardhatConfig = this.tryLoadHardhatVars();
        if (hardhatConfig && hardhatConfig.has(config.envKey)) {
          apiKey = hardhatConfig.get(config.envKey, undefined);
          if (apiKey) {
            this.log(`✓ Loaded ${chain} API key from Hardhat vars (encrypted)`);
          }
        }
      } catch (error) {
        // Hardhat vars not available, password not provided, or not in Hardhat environment
        // Fall through to environment variable
      }
      
      // Option 2: Fallback to environment variables (backward compatibility)
      if (!apiKey) {
        apiKey = process.env[config.envKey];
        if (apiKey) {
          this.log(`✓ Loaded ${chain} API key from environment variable`);
        }
      }
      
      if (apiKey) {
        this.apiKeys.set(chain, apiKey);
      } else {
        this.log(`ℹ No API key for ${chain} (${config.envKey})`);
      }
    }

    if (this.apiKeys.size === 0) {
      this.log('⚠️  Warning: No Etherscan API keys found');
      this.log('   Set keys via: npx hardhat vars set BASESCAN_API_KEY');
      this.log('   Or use .env file for development');
    }
  }

  /**
   * Try to load Hardhat Configuration Variables
   * Returns vars object if available, undefined otherwise
   */
  private tryLoadHardhatVars(): any {
    try {
      // Try to import Hardhat config (only works in Hardhat environment)
      const hardhat = require('hardhat');
      if (hardhat && hardhat.vars) {
        return hardhat.vars;
      }
    } catch (error) {
      // Not in Hardhat environment or hardhat not installed
      // This is fine - we'll use env vars instead
    }
    return undefined;
  }

  /**
   * Register Etherscan-specific MCP methods
   */
  private registerEtherscanMethods(): void {
    // MCP standard methods
    this.registerMethod('tools/list', this.handleListTools.bind(this));
    this.registerMethod('tools/call', this.handleCallTool.bind(this));
    this.registerMethod('resources/list', this.handleListResources.bind(this));
    this.registerMethod('resources/read', this.handleReadResource.bind(this));
  }

  /**
   * Called after initialization
   */
  protected async onInitialized(): Promise<void> {
    this.log('Etherscan MCP Server initialized');
    this.log(`Supported chains: ${Array.from(this.apiKeys.keys()).join(', ')}`);
  }

  // ============================================================================
  // MCP Tools Implementation
  // ============================================================================

  /**
   * List available Etherscan tools
   */
  private async handleListTools(): Promise<{ tools: McpTool[] }> {
    const tools: McpTool[] = [
      {
        name: 'get_contract_abi',
        description: 'Get the ABI (Application Binary Interface) for a verified smart contract',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Contract address (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_contract_source',
        description: 'Get the source code for a verified smart contract',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Contract address (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'check_contract_verification',
        description: 'Check if a smart contract is verified on the block explorer',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Contract address (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_contract_info',
        description: 'Get comprehensive information about a verified contract including name, compiler version, optimization settings',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Contract address (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_transaction',
        description: 'Get transaction details by transaction hash',
        inputSchema: {
          type: 'object',
          properties: {
            txhash: {
              type: 'string',
              description: 'Transaction hash (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['txhash', 'chain'],
        },
      },
      {
        name: 'get_transaction_receipt',
        description: 'Get transaction receipt by transaction hash',
        inputSchema: {
          type: 'object',
          properties: {
            txhash: {
              type: 'string',
              description: 'Transaction hash (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['txhash', 'chain'],
        },
      },
      {
        name: 'get_block_explorer_url',
        description: 'Get the block explorer URL for a contract address',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Contract address (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_token_info',
        description: 'Get token metadata including name, symbol, decimals, and total supply',
        inputSchema: {
          type: 'object',
          properties: {
            contractaddress: {
              type: 'string',
              description: 'Token contract address (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['contractaddress', 'chain'],
        },
      },
      {
        name: 'get_token_balance',
        description: 'Get token balance for an address',
        inputSchema: {
          type: 'object',
          properties: {
            contractaddress: {
              type: 'string',
              description: 'Token contract address (0x...)',
            },
            address: {
              type: 'string',
              description: 'Wallet address to check balance (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['contractaddress', 'address', 'chain'],
        },
      },
      {
        name: 'get_token_transfers',
        description: 'Get ERC20 token transfer events for an address',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Address to get token transfers for (0x...)',
            },
            contractaddress: {
              type: 'string',
              description: 'Optional: Filter by specific token contract (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
            startblock: {
              type: 'number',
              description: 'Optional: Starting block number',
            },
            endblock: {
              type: 'number',
              description: 'Optional: Ending block number',
            },
            page: {
              type: 'number',
              description: 'Optional: Page number for pagination (default: 1)',
            },
            offset: {
              type: 'number',
              description: 'Optional: Number of results per page (max 10000, default: 100)',
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_nft_transfers',
        description: 'Get ERC721/ERC1155 NFT transfer events for an address',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Address to get NFT transfers for (0x...)',
            },
            contractaddress: {
              type: 'string',
              description: 'Optional: Filter by specific NFT contract (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
            startblock: {
              type: 'number',
              description: 'Optional: Starting block number',
            },
            endblock: {
              type: 'number',
              description: 'Optional: Ending block number',
            },
            page: {
              type: 'number',
              description: 'Optional: Page number for pagination (default: 1)',
            },
            offset: {
              type: 'number',
              description: 'Optional: Number of results per page (max 10000, default: 100)',
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_eth_balance',
        description: 'Get ETH balance for an address',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Address to check balance (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
            tag: {
              type: 'string',
              description: 'Optional: Block parameter (latest, earliest, pending)',
              enum: ['latest', 'earliest', 'pending'],
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'get_multi_eth_balance',
        description: 'Get ETH balance for multiple addresses (up to 20)',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of addresses to check (max 20)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
            tag: {
              type: 'string',
              description: 'Optional: Block parameter (latest, earliest, pending)',
              enum: ['latest', 'earliest', 'pending'],
            },
          },
          required: ['addresses', 'chain'],
        },
      },
      {
        name: 'get_address_transactions',
        description: 'Get transaction list for an address',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Address to get transactions for (0x...)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
            startblock: {
              type: 'number',
              description: 'Optional: Starting block number',
            },
            endblock: {
              type: 'number',
              description: 'Optional: Ending block number',
            },
            page: {
              type: 'number',
              description: 'Optional: Page number for pagination (default: 1)',
            },
            offset: {
              type: 'number',
              description: 'Optional: Number of results per page (max 10000, default: 100)',
            },
            sort: {
              type: 'string',
              description: 'Optional: Sort order (asc or desc)',
              enum: ['asc', 'desc'],
            },
          },
          required: ['address', 'chain'],
        },
      },
      {
        name: 'verify_contract',
        description: 'Verify and publish contract source code on Etherscan. Use this to make your contract source code publicly verifiable.',
        inputSchema: {
          type: 'object',
          properties: {
            contractaddress: {
              type: 'string',
              description: 'Contract address to verify (0x...)',
            },
            sourceCode: {
              type: 'string',
              description: 'Contract source code (can be flattened or Standard JSON Input)',
            },
            codeformat: {
              type: 'string',
              description: 'Source code format',
              enum: ['solidity-single-file', 'solidity-standard-json-input'],
            },
            contractname: {
              type: 'string',
              description: 'Contract name (e.g., MyToken or contracts/MyToken.sol:MyToken)',
            },
            compilerversion: {
              type: 'string',
              description: 'Compiler version (e.g., v0.8.26+commit.8a97fa7a)',
            },
            optimizationUsed: {
              type: 'number',
              description: 'Optimization enabled (0=No, 1=Yes)',
              enum: [0, 1],
            },
            runs: {
              type: 'number',
              description: 'Optimization runs (e.g., 200)',
            },
            constructorArguments: {
              type: 'string',
              description: 'Constructor arguments (ABI-encoded hex string without 0x prefix)',
            },
            evmversion: {
              type: 'string',
              description: 'EVM version (e.g., paris, london, istanbul)',
            },
            licenseType: {
              type: 'number',
              description: 'SPDX license type (1=No License, 3=MIT, 11=Apache-2.0, etc.)',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: [
            'contractaddress',
            'sourceCode',
            'codeformat',
            'contractname',
            'compilerversion',
            'optimizationUsed',
            'runs',
            'chain',
          ],
        },
      },
      {
        name: 'check_verification_status',
        description: 'Check the status of a contract verification submission using the GUID returned from verify_contract',
        inputSchema: {
          type: 'object',
          properties: {
            guid: {
              type: 'string',
              description: 'Verification GUID returned from verify_contract',
            },
            chain: {
              type: 'string',
              description: 'Blockchain network',
              enum: Object.keys(CHAIN_CONFIG),
            },
          },
          required: ['guid', 'chain'],
        },
      },
    ];

    return { tools };
  }

  /**
   * Handle tool calls
   */
  private async handleCallTool(params: CallToolParams): Promise<CallToolResult> {
    const { name, arguments: args } = params;

    try {
      let result: any;

      switch (name) {
        case 'get_contract_abi':
          result = await this.getContractABI(args.address, args.chain);
          break;

        case 'get_contract_source':
          result = await this.getContractSource(args.address, args.chain);
          break;

        case 'check_contract_verification':
          result = await this.checkContractVerification(args.address, args.chain);
          break;

        case 'get_contract_info':
          result = await this.getContractInfo(args.address, args.chain);
          break;

        case 'get_transaction':
          result = await this.getTransaction(args.txhash, args.chain);
          break;

        case 'get_transaction_receipt':
          result = await this.getTransactionReceipt(args.txhash, args.chain);
          break;

        case 'get_block_explorer_url':
          result = this.getBlockExplorerUrl(args.address, args.chain);
          break;

        case 'get_token_info':
          result = await this.getTokenInfo(args.contractaddress, args.chain);
          break;

        case 'get_token_balance':
          result = await this.getTokenBalance(args.contractaddress, args.address, args.chain);
          break;

        case 'get_token_transfers':
          result = await this.getTokenTransfers(args);
          break;

        case 'get_nft_transfers':
          result = await this.getNftTransfers(args);
          break;

        case 'get_eth_balance':
          result = await this.getEthBalance(args.address, args.chain, args.tag);
          break;

        case 'get_multi_eth_balance':
          result = await this.getMultiEthBalance(args.addresses, args.chain, args.tag);
          break;

        case 'get_address_transactions':
          result = await this.getAddressTransactions(args);
          break;

        case 'verify_contract':
          result = await this.verifyContract(args);
          break;

        case 'check_verification_status':
          result = await this.checkVerificationStatus(args.guid, args.chain);
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // ============================================================================
  // MCP Resources Implementation
  // ============================================================================

  /**
   * List available resources
   */
  private async handleListResources(): Promise<{ resources: McpResource[] }> {
    const resources: McpResource[] = [
      {
        uri: 'etherscan://supported-chains',
        name: 'Supported Blockchain Networks',
        description: 'List of supported blockchain networks and their configuration',
        mimeType: 'application/json',
      },
      {
        uri: 'etherscan://api-keys-status',
        name: 'API Keys Status',
        description: 'Status of loaded API keys for each network',
        mimeType: 'application/json',
      },
    ];

    return { resources };
  }

  /**
   * Read a resource
   */
  private async handleReadResource(params: ReadResourceParams): Promise<ReadResourceResult> {
    const { uri } = params;

    try {
      let content: string;

      if (uri === 'etherscan://supported-chains') {
        content = JSON.stringify(
          {
            chains: Object.keys(CHAIN_CONFIG),
            configuration: CHAIN_CONFIG,
          },
          null,
          2
        );
      } else if (uri === 'etherscan://api-keys-status') {
        const status: Record<string, boolean> = {};
        for (const chain of Object.keys(CHAIN_CONFIG)) {
          status[chain] = this.apiKeys.has(chain);
        }
        content = JSON.stringify(status, null, 2);
      } else {
        throw new Error(`Unknown resource: ${uri}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: content,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to read resource: ${error.message}`);
    }
  }

  // ============================================================================
  // Etherscan API Methods
  // ============================================================================

  /**
   * Make a request to Etherscan API
   */
  private async etherscanRequest(
    chain: string,
    module: string,
    action: string,
    params: Record<string, string> = {}
  ): Promise<EtherscanResponse> {
    const config = CHAIN_CONFIG[chain];
    if (!config) {
      throw new Error(`Unsupported chain: ${chain}. Supported: ${Object.keys(CHAIN_CONFIG).join(', ')}`);
    }

    const apiKey = this.apiKeys.get(chain);
    if (!apiKey) {
      throw new Error(`No API key configured for ${chain}. Set ${config.envKey} in environment.`);
    }

    const queryParams = new URLSearchParams({
      chainid: config.chainId,
      module,
      action,
      apikey: apiKey,
      ...params,
    });

    const url = `${config.apiUrl}?${queryParams.toString()}`;

    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data) as EtherscanResponse;
              resolve(jsonData);
            } catch (parseError) {
              reject(new Error(`Failed to parse response: ${parseError}`));
            }
          });
        })
        .on('error', (err) => {
          reject(new Error(`HTTP request failed: ${err.message}`));
        });
    });
  }

  /**
   * Get contract ABI
   */
  private async getContractABI(address: string, chain: string): Promise<any> {
    this.validateAddress(address);

    const response = await this.etherscanRequest(chain, 'contract', 'getabi', { address });

    if (response.status === '1' && response.message === 'OK') {
      const abi = typeof response.result === 'string' ? JSON.parse(response.result) : response.result;
      return {
        success: true,
        address,
        chain,
        abi,
      };
    } else {
      throw new Error(`Failed to get ABI: ${response.result}`);
    }
  }

  /**
   * Get contract source code
   */
  private async getContractSource(address: string, chain: string): Promise<any> {
    this.validateAddress(address);

    const response = await this.etherscanRequest(chain, 'contract', 'getsourcecode', { address });

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        address,
        chain,
        source: response.result,
      };
    } else {
      throw new Error(`Failed to get source code: ${response.result}`);
    }
  }

  /**
   * Check if contract is verified
   */
  private async checkContractVerification(address: string, chain: string): Promise<any> {
    this.validateAddress(address);

    try {
      const source = await this.getContractSource(address, chain);

      if (Array.isArray(source.source) && source.source.length > 0) {
        const firstEntry = source.source[0] as any;
        const verified = typeof firstEntry.SourceCode === 'string' && firstEntry.SourceCode.length > 0;

        return {
          success: true,
          address,
          chain,
          verified,
          explorerUrl: this.getBlockExplorerUrl(address, chain),
        };
      }

      return {
        success: true,
        address,
        chain,
        verified: false,
        explorerUrl: this.getBlockExplorerUrl(address, chain),
      };
    } catch (error: any) {
      return {
        success: false,
        address,
        chain,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get comprehensive contract information
   */
  private async getContractInfo(address: string, chain: string): Promise<any> {
    this.validateAddress(address);

    const source = await this.getContractSource(address, chain);

    if (Array.isArray(source.source) && source.source.length > 0) {
      const info = source.source[0] as any;

      return {
        success: true,
        address,
        chain,
        contractName: info.ContractName || 'Unknown',
        compilerVersion: info.CompilerVersion || 'Unknown',
        optimizationEnabled: info.OptimizationUsed === '1',
        optimizationRuns: info.Runs || 'N/A',
        license: info.LicenseType || 'None',
        isProxy: info.Proxy === '1',
        verified: typeof info.SourceCode === 'string' && info.SourceCode.length > 0,
        explorerUrl: this.getBlockExplorerUrl(address, chain),
        sourceCode: info.SourceCode,
        abi: info.ABI,
      };
    }

    throw new Error('Contract not found or not verified');
  }

  /**
   * Get transaction by hash
   */
  private async getTransaction(txhash: string, chain: string): Promise<any> {
    const response = await this.etherscanRequest(chain, 'proxy', 'eth_getTransactionByHash', { txhash });

    return {
      success: true,
      txhash,
      chain,
      transaction: response.result,
    };
  }

  /**
   * Get transaction receipt
   */
  private async getTransactionReceipt(txhash: string, chain: string): Promise<any> {
    const response = await this.etherscanRequest(chain, 'proxy', 'eth_getTransactionReceipt', { txhash });

    return {
      success: true,
      txhash,
      chain,
      receipt: response.result,
    };
  }

  /**
   * Get block explorer URL
   */
  private getBlockExplorerUrl(address: string, chain: string): string {
    const baseUrl = BLOCK_EXPLORER_URLS[chain];
    if (baseUrl) {
      return `${baseUrl}/${address}#code`;
    }
    return address;
  }

  /**
   * Get token information (metadata)
   */
  private async getTokenInfo(contractaddress: string, chain: string): Promise<any> {
    this.validateAddress(contractaddress);

    const response = await this.etherscanRequest(chain, 'token', 'tokeninfo', { contractaddress });

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        contractAddress: contractaddress,
        chain,
        tokenInfo: response.result,
      };
    } else {
      throw new Error(`Failed to get token info: ${response.result}`);
    }
  }

  /**
   * Get token balance for an address
   */
  private async getTokenBalance(contractaddress: string, address: string, chain: string): Promise<any> {
    this.validateAddress(contractaddress);
    this.validateAddress(address);

    const response = await this.etherscanRequest(chain, 'account', 'tokenbalance', {
      contractaddress,
      address,
      tag: 'latest',
    });

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        contractAddress: contractaddress,
        address,
        chain,
        balance: response.result,
      };
    } else {
      throw new Error(`Failed to get token balance: ${response.result}`);
    }
  }

  /**
   * Get ERC20 token transfer events
   */
  private async getTokenTransfers(args: any): Promise<any> {
    this.validateAddress(args.address);
    if (args.contractaddress) {
      this.validateAddress(args.contractaddress);
    }

    const params: Record<string, string> = {
      address: args.address,
      page: args.page?.toString() || '1',
      offset: args.offset?.toString() || '100',
      sort: 'desc',
    };

    if (args.contractaddress) params.contractaddress = args.contractaddress;
    if (args.startblock) params.startblock = args.startblock.toString();
    if (args.endblock) params.endblock = args.endblock.toString();

    const response = await this.etherscanRequest(args.chain, 'account', 'tokentx', params);

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        address: args.address,
        chain: args.chain,
        transfers: response.result,
      };
    } else {
      throw new Error(`Failed to get token transfers: ${response.result}`);
    }
  }

  /**
   * Get NFT (ERC721/ERC1155) transfer events
   */
  private async getNftTransfers(args: any): Promise<any> {
    this.validateAddress(args.address);
    if (args.contractaddress) {
      this.validateAddress(args.contractaddress);
    }

    const params: Record<string, string> = {
      address: args.address,
      page: args.page?.toString() || '1',
      offset: args.offset?.toString() || '100',
      sort: 'desc',
    };

    if (args.contractaddress) params.contractaddress = args.contractaddress;
    if (args.startblock) params.startblock = args.startblock.toString();
    if (args.endblock) params.endblock = args.endblock.toString();

    const response = await this.etherscanRequest(args.chain, 'account', 'tokennfttx', params);

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        address: args.address,
        chain: args.chain,
        nftTransfers: response.result,
      };
    } else {
      throw new Error(`Failed to get NFT transfers: ${response.result}`);
    }
  }

  /**
   * Get ETH balance for an address
   */
  private async getEthBalance(address: string, chain: string, tag: string = 'latest'): Promise<any> {
    this.validateAddress(address);

    const response = await this.etherscanRequest(chain, 'account', 'balance', {
      address,
      tag,
    });

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        address,
        chain,
        balance: response.result,
        tag,
      };
    } else {
      throw new Error(`Failed to get ETH balance: ${response.result}`);
    }
  }

  /**
   * Get ETH balance for multiple addresses (up to 20)
   */
  private async getMultiEthBalance(addresses: string[], chain: string, tag: string = 'latest'): Promise<any> {
    if (addresses.length === 0) {
      throw new Error('At least one address is required');
    }
    if (addresses.length > 20) {
      throw new Error('Maximum 20 addresses allowed');
    }

    // Validate all addresses
    for (const address of addresses) {
      this.validateAddress(address);
    }

    const response = await this.etherscanRequest(chain, 'account', 'balancemulti', {
      address: addresses.join(','),
      tag,
    });

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        chain,
        balances: response.result,
        tag,
      };
    } else {
      throw new Error(`Failed to get multi ETH balance: ${response.result}`);
    }
  }

  /**
   * Get transaction list for an address
   */
  private async getAddressTransactions(args: any): Promise<any> {
    this.validateAddress(args.address);

    const params: Record<string, string> = {
      address: args.address,
      page: args.page?.toString() || '1',
      offset: args.offset?.toString() || '100',
      sort: args.sort || 'desc',
    };

    if (args.startblock) params.startblock = args.startblock.toString();
    if (args.endblock) params.endblock = args.endblock.toString();

    const response = await this.etherscanRequest(args.chain, 'account', 'txlist', params);

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        address: args.address,
        chain: args.chain,
        transactions: response.result,
      };
    } else {
      throw new Error(`Failed to get transactions: ${response.result}`);
    }
  }

  /**
   * Get block explorer URL
   */
  private getBlockExplorerUrl(address: string, chain: string): string {
    const baseUrl = BLOCK_EXPLORER_URLS[chain];
    if (baseUrl) {
      return `${baseUrl}/${address}#code`;
    }
    return address;
  }

  /**
   * Verify contract source code on Etherscan
   * Based on: https://docs.etherscan.io/contract-verification/verify-with-hardhat
   */
  private async verifyContract(args: any): Promise<any> {
    this.validateAddress(args.contractaddress);

    const config = CHAIN_CONFIG[args.chain];
    if (!config) {
      throw new Error(`Unsupported chain: ${args.chain}`);
    }

    const apiKey = this.apiKeys.get(args.chain);
    if (!apiKey) {
      throw new Error(`No API key configured for ${args.chain}. Set ${config.envKey} in environment.`);
    }

    // Prepare verification parameters
    const params: Record<string, string> = {
      chainid: config.chainId,
      module: 'contract',
      action: 'verifysourcecode',
      apikey: apiKey,
      contractaddress: args.contractaddress,
      sourceCode: args.sourceCode,
      codeformat: args.codeformat,
      contractname: args.contractname,
      compilerversion: args.compilerversion,
      optimizationUsed: args.optimizationUsed.toString(),
      runs: args.runs.toString(),
    };

    // Optional parameters
    if (args.constructorArguments) params.constructorArguements = args.constructorArguments; // Note: Etherscan typo
    if (args.evmversion) params.evmversion = args.evmversion;
    if (args.licenseType !== undefined) params.licenseType = args.licenseType.toString();

    // Make POST request for verification
    const response = await this.etherscanPostRequest(config.apiUrl, params);

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        contractAddress: args.contractaddress,
        chain: args.chain,
        guid: response.result,
        message: 'Contract verification submitted. Use check_verification_status to check the status.',
      };
    } else {
      throw new Error(`Failed to submit verification: ${response.result}`);
    }
  }

  /**
   * Check contract verification status
   */
  private async checkVerificationStatus(guid: string, chain: string): Promise<any> {
    const response = await this.etherscanRequest(chain, 'contract', 'checkverifystatus', { guid });

    if (response.status === '1' && response.message === 'OK') {
      return {
        success: true,
        guid,
        chain,
        status: 'verified',
        result: response.result,
      };
    } else if (response.message === 'Pending in queue') {
      return {
        success: false,
        guid,
        chain,
        status: 'pending',
        result: response.result,
      };
    } else {
      return {
        success: false,
        guid,
        chain,
        status: 'failed',
        result: response.result,
      };
    }
  }

  /**
   * Make a POST request to Etherscan API (for contract verification)
   */
  private async etherscanPostRequest(apiUrl: string, params: Record<string, string>): Promise<EtherscanResponse> {
    const https = await import('https');
    const querystring = await import('querystring');

    const postData = querystring.stringify(params);

    const urlObj = new URL(apiUrl);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data) as EtherscanResponse;
            resolve(jsonData);
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`HTTP request failed: ${err.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Validate Ethereum address format
   */
  private validateAddress(address: string): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid address format. Must be a 40-character hex string starting with 0x.');
    }
  }

  /**
   * Called on server shutdown
   */
  protected onShutdown(): void {
    this.log('Etherscan MCP Server shutting down');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new EtherscanMcpServer();
  server.start().catch((error) => {
    console.error('Failed to start Etherscan MCP Server:', error);
    process.exit(1);
  });
}
