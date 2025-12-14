import { ethers } from 'ethers';

async function fetchFromEtherscan() {
  const apiKey = process.env.ETHERSCAN_API_KEY || 'QT7KI56B365U22NXMJJM4IU7Q8MVER69RY';
  const address = '0x7e772ed6e4bfeae80f2d58e4254f6b6e96669253';
  
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
  
  console.log('Fetching verified source code from Etherscan...');
  console.log('Address:', address);
  console.log('');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && data.result[0].SourceCode) {
      const contract = data.result[0];
      console.log('✅ Contract is verified on Etherscan');
      console.log('');
      console.log('Contract Name:', contract.ContractName);
      console.log('Compiler Version:', contract.CompilerVersion);
      console.log('Optimization:', contract.OptimizationUsed === '1' ? 'Yes' : 'No');
      console.log('Runs:', contract.Runs);
      console.log('');
      console.log('ABI Functions:');
      const abi = JSON.parse(contract.ABI);
      const functions = abi.filter((item: any) => item.type === 'function');
      functions.forEach((fn: any) => {
        console.log(`  - ${fn.name}(${fn.inputs.map((i: any) => i.type).join(', ')})`);
      });
      
      // Check for updateExchangeRate
      const updateFn = functions.find((fn: any) => fn.name === 'updateExchangeRate');
      if (updateFn) {
        console.log('');
        console.log('✅ Found updateExchangeRate function:');
        console.log(JSON.stringify(updateFn, null, 2));
      }
      
    } else {
      console.log('❌ Contract not verified on Etherscan');
      console.log('Response:', data.result);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchFromEtherscan();
