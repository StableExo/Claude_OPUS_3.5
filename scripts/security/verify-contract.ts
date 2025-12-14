import { ethers } from 'ethers';

const LIQUIDETH_ADDRESS = '0x7e772ed6e4bfeae80f2d58e4254f6b6e96669253';
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

async function main() {
  console.log('Verifying contract at:', LIQUIDETH_ADDRESS);
  console.log('');
  
  // Check if contract exists
  const code = await provider.getCode(LIQUIDETH_ADDRESS);
  console.log('Contract code length:', code.length);
  console.log('Has code:', code !== '0x');
  
  if (code === '0x') {
    console.log('');
    console.log('⚠️  No contract deployed at this address on mainnet');
    console.log('   This might be a testnet address or the address is incorrect');
  }
}

main().catch(console.error);
