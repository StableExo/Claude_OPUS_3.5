import { ethers } from 'ethers';

const LIQUIDETH_ADDRESS = '0x7e772ed6e4bfeae80f2d58e4254f6b6e96669253';

const ABI = [
  'function exchangeRate() external view returns (uint256)',
  'function oracle() external view returns (address)',
  'function owner() external view returns (address)',
  'function totalSupply() external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)'
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const contract = new ethers.Contract(LIQUIDETH_ADDRESS, ABI, provider);
  
  console.log('Checking LiquidETH contract on mainnet...');
  console.log('Address:', LIQUIDETH_ADDRESS);
  console.log('');
  
  try {
    const [name, symbol, totalSupply, exchangeRate, oracle, owner] = await Promise.all([
      contract.name().catch(() => 'N/A'),
      contract.symbol().catch(() => 'N/A'),
      contract.totalSupply().catch(() => 0n),
      contract.exchangeRate().catch(() => 0n),
      contract.oracle().catch(() => ethers.ZeroAddress),
      contract.owner().catch(() => ethers.ZeroAddress)
    ]);
    
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Supply:', ethers.formatEther(totalSupply), 'tokens');
    console.log('Exchange Rate:', ethers.formatEther(exchangeRate), 'ETH');
    console.log('Oracle:', oracle);
    console.log('Owner:', owner);
    
    if (totalSupply === 0n) {
      console.log('');
      console.log('⚠️  Contract appears to be inactive or paused');
      console.log('   This might affect the PoC demonstration');
    }
  } catch (error: any) {
    console.error('Error reading contract:', error.message);
  }
}

main().catch(console.error);
