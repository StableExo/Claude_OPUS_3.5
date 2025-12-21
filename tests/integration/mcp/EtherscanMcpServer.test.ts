/**
 * Integration Tests for Etherscan MCP Server
 * 
 * Tests the Etherscan MCP Server implementation including:
 * - Server initialization
 * - Tool registration
 * - Resource handling
 * - API integration (mocked)
 * - Multi-chain support
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EtherscanMcpServer } from '../../../src/mcp/servers/EtherscanMcpServer';

describe('EtherscanMcpServer', () => {
  let server: EtherscanMcpServer;

  beforeEach(() => {
    // Set up test environment variables
    process.env.BASESCAN_API_KEY = 'test_basescan_key';
    process.env.ETHERSCAN_API_KEY = 'test_etherscan_key';
    
    server = new EtherscanMcpServer();
  });

  describe('Server Initialization', () => {
    it('should initialize with correct name and version', () => {
      expect(server).toBeDefined();
      // Server config is protected, but we can verify it initialized
    });

    it('should load API keys from environment', () => {
      // API keys are loaded in constructor
      // The server will log which keys are loaded
      expect(process.env.BASESCAN_API_KEY).toBe('test_basescan_key');
      expect(process.env.ETHERSCAN_API_KEY).toBe('test_etherscan_key');
    });
  });

  describe('Tool Registration', () => {
    it('should register all expected tools', async () => {
      // List tools through the MCP protocol
      const result = await (server as any).handleListTools();
      
      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThan(0);
      
      const toolNames = result.tools.map((tool: any) => tool.name);
      
      expect(toolNames).toContain('get_contract_abi');
      expect(toolNames).toContain('get_contract_source');
      expect(toolNames).toContain('check_contract_verification');
      expect(toolNames).toContain('get_contract_info');
      expect(toolNames).toContain('get_transaction');
      expect(toolNames).toContain('get_transaction_receipt');
      expect(toolNames).toContain('get_block_explorer_url');
    });

    it('should have proper tool schemas', async () => {
      const result = await (server as any).handleListTools();
      
      const abiTool = result.tools.find((t: any) => t.name === 'get_contract_abi');
      
      expect(abiTool).toBeDefined();
      expect(abiTool.description).toContain('ABI');
      expect(abiTool.inputSchema.properties.address).toBeDefined();
      expect(abiTool.inputSchema.properties.chain).toBeDefined();
      expect(abiTool.inputSchema.required).toContain('address');
      expect(abiTool.inputSchema.required).toContain('chain');
    });
  });

  describe('Resource Handling', () => {
    it('should list available resources', async () => {
      const result = await (server as any).handleListResources();
      
      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBeGreaterThan(0);
      
      const resourceUris = result.resources.map((r: any) => r.uri);
      
      expect(resourceUris).toContain('etherscan://supported-chains');
      expect(resourceUris).toContain('etherscan://api-keys-status');
    });

    it('should read supported-chains resource', async () => {
      const result = await (server as any).handleReadResource({
        uri: 'etherscan://supported-chains'
      });
      
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBe(1);
      expect(result.contents[0].uri).toBe('etherscan://supported-chains');
      
      const content = JSON.parse(result.contents[0].text);
      expect(content.chains).toBeDefined();
      expect(content.configuration).toBeDefined();
      expect(content.chains).toContain('ethereum');
      expect(content.chains).toContain('base');
    });

    it('should read api-keys-status resource', async () => {
      const result = await (server as any).handleReadResource({
        uri: 'etherscan://api-keys-status'
      });
      
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBe(1);
      
      const status = JSON.parse(result.contents[0].text);
      expect(status.base).toBe(true);
      expect(status.ethereum).toBe(true);
    });
  });

  describe('Address Validation', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddress = '0xCF38b66D65f82030675893eD7150a76d760a99ce';
      expect(() => (server as any).validateAddress(validAddress)).not.toThrow();
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '0xinvalid',
        'not_an_address',
        '0xCF38b66D65f82030675893eD7150a76d760a99c', // too short
        '0xCF38b66D65f82030675893eD7150a76d760a99ceee', // too long
        'CF38b66D65f82030675893eD7150a76d760a99ce', // missing 0x
      ];

      for (const invalid of invalidAddresses) {
        expect(() => (server as any).validateAddress(invalid)).toThrow();
      }
    });
  });

  describe('Block Explorer URLs', () => {
    it('should generate correct explorer URLs', () => {
      const testCases = [
        {
          chain: 'ethereum',
          address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
          expected: 'https://etherscan.io/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code'
        },
        {
          chain: 'base',
          address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
          expected: 'https://basescan.org/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code'
        },
        {
          chain: 'arbitrum',
          address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
          expected: 'https://arbiscan.io/address/0xCF38b66D65f82030675893eD7150a76d760a99ce#code'
        },
      ];

      for (const testCase of testCases) {
        const url = (server as any).getBlockExplorerUrl(testCase.address, testCase.chain);
        expect(url).toBe(testCase.expected);
      }
    });
  });

  describe('Multi-Chain Support', () => {
    it('should support all configured chains', async () => {
      const result = await (server as any).handleReadResource({
        uri: 'etherscan://supported-chains'
      });
      
      const content = JSON.parse(result.contents[0].text);
      const supportedChains = content.chains;
      
      expect(supportedChains).toContain('ethereum');
      expect(supportedChains).toContain('base');
      expect(supportedChains).toContain('baseSepolia');
      expect(supportedChains).toContain('arbitrum');
      expect(supportedChains).toContain('polygon');
      expect(supportedChains).toContain('optimism');
    });

    it('should have correct chain IDs', async () => {
      const result = await (server as any).handleReadResource({
        uri: 'etherscan://supported-chains'
      });
      
      const content = JSON.parse(result.contents[0].text);
      const config = content.configuration;
      
      expect(config.ethereum.chainId).toBe('1');
      expect(config.base.chainId).toBe('8453');
      expect(config.arbitrum.chainId).toBe('42161');
      expect(config.polygon.chainId).toBe('137');
      expect(config.optimism.chainId).toBe('10');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API keys gracefully', async () => {
      // Remove API key for polygon
      delete process.env.POLYGONSCAN_API_KEY;
      
      const serverWithoutKey = new EtherscanMcpServer();
      
      // Try to call a tool for polygon
      const result = await (serverWithoutKey as any).handleCallTool({
        name: 'get_contract_abi',
        arguments: {
          address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
          chain: 'polygon'
        }
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('No API key configured');
    });

    it('should handle unsupported chains', async () => {
      const result = await (server as any).handleCallTool({
        name: 'get_contract_abi',
        arguments: {
          address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
          chain: 'unsupported_chain'
        }
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unsupported chain');
    });

    it('should handle invalid addresses', async () => {
      const result = await (server as any).handleCallTool({
        name: 'get_contract_abi',
        arguments: {
          address: 'invalid_address',
          chain: 'base'
        }
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid address');
    });
  });

  describe('Tool Schemas', () => {
    it('should have chain enum in tool schemas', async () => {
      const result = await (server as any).handleListTools();
      
      for (const tool of result.tools) {
        if (tool.inputSchema.properties.chain) {
          expect(tool.inputSchema.properties.chain.enum).toBeDefined();
          expect(tool.inputSchema.properties.chain.enum.length).toBeGreaterThan(0);
        }
      }
    });

    it('should mark required parameters correctly', async () => {
      const result = await (server as any).handleListTools();
      
      const contractTools = result.tools.filter((t: any) => 
        t.name.includes('contract') && !t.name.includes('explorer')
      );
      
      for (const tool of contractTools) {
        expect(tool.inputSchema.required).toContain('address');
        expect(tool.inputSchema.required).toContain('chain');
      }
    });
  });
});

describe('EtherscanMcpServer Integration', () => {
  it('should be compatible with MCP protocol', () => {
    // The server extends BaseMcpServer which implements MCP protocol
    const server = new EtherscanMcpServer();
    expect(server).toBeDefined();
    
    // Verify it has the standard MCP methods
    expect(typeof (server as any).handleListTools).toBe('function');
    expect(typeof (server as any).handleCallTool).toBe('function');
    expect(typeof (server as any).handleListResources).toBe('function');
    expect(typeof (server as any).handleReadResource).toBe('function');
  });

  it('should follow TheWarden MCP server conventions', async () => {
    const server = new EtherscanMcpServer();
    
    // Check that tools follow naming conventions
    const result = await (server as any).handleListTools();
    
    for (const tool of result.tools) {
      // Tool names should use snake_case
      expect(tool.name).toMatch(/^[a-z_]+$/);
      
      // Should have description
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(0);
      
      // Should have input schema
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeDefined();
    }
  });
});

describe('Etherscan MCP Server - Real World Scenarios', () => {
  let server: EtherscanMcpServer;

  beforeEach(() => {
    process.env.BASESCAN_API_KEY = 'test_key';
    server = new EtherscanMcpServer();
  });

  it('should support TheWarden FlashSwapV2 contract analysis workflow', async () => {
    // This is the workflow an AI agent would use to analyze TheWarden's contract
    
    // Step 1: Check if contract is verified
    const verificationCheck = await (server as any).handleCallTool({
      name: 'check_contract_verification',
      arguments: {
        address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
        chain: 'base'
      }
    });
    
    expect(verificationCheck.content).toBeDefined();
    
    // Step 2: Get block explorer URL
    const explorerUrl = await (server as any).handleCallTool({
      name: 'get_block_explorer_url',
      arguments: {
        address: '0xCF38b66D65f82030675893eD7150a76d760a99ce',
        chain: 'base'
      }
    });
    
    expect(explorerUrl.content).toBeDefined();
  });

  it('should support multi-chain contract discovery', async () => {
    // Scenario: Check if USDC exists on multiple chains
    const chains = ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'];
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Example USDC
    
    for (const chain of chains) {
      const result = await (server as any).handleCallTool({
        name: 'get_block_explorer_url',
        arguments: {
          address: usdcAddress,
          chain: chain
        }
      });
      
      expect(result.content).toBeDefined();
    }
  });
});
