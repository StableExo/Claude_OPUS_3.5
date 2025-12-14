import { ethers } from 'ethers';

const address = '0x7e772ed6e4bfeae80f2d58e4254f6b6e96669253';

const networks = [
  { name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2/3wG3PLWyPu2DliGQLVa8G' },
  { name: 'Cronos', rpc: 'https://evm.cronos.org' },
  { name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  { name: 'BSC', rpc: 'https://bsc-dataseed.binance.org' },
];

async function checkNetwork(name: string, rpc: string) {
  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const code = await provider.getCode(address);
    const hasCode = code !== '0x';
    
    console.log(`${name}: ${hasCode ? '✅ Contract exists' : '❌ No contract'}`);
    
    if (hasCode) {
      console.log(`  Code length: ${code.length} bytes`);
      
      // Try to read some data
      const abi = [
        'function exchangeRate() external view returns (uint256)',
        'function name() view returns (string)',
      ];
      const contract = new ethers.Contract(address, abi, provider);
      
      try {
        const rate = await contract.exchangeRate();
        console.log(`  Exchange Rate: ${ethers.formatEther(rate)} ETH`);
      } catch (e) {
        console.log(`  Could not read exchange rate`);
      }
    }
  } catch (error: any) {
    console.log(`${name}: ❌ Error - ${error.message}`);
  }
  console.log('');
}

async function main() {
  console.log('Checking for LiquidETH contract across networks...');
  console.log('Address:', address);
  console.log('');
  
  for (const network of networks) {
    await checkNetwork(network.name, network.rpc);
  }
}

main();
