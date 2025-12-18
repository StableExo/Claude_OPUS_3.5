import { JsonRpcProvider, Wallet, formatEther } from 'ethers';

async function checkWallet() {
  const rpcUrl = 'https://base-mainnet.core.chainstack.com/684bfe8c4e2198682d391a2d1d24ed08';
  const privateKey = '0x34240829e275219b8b32b0b53cb10bf83c5f0cbc44f887af61f1114e4401849b';
  const flashSwapAddress = '0xCF38b66D65f82030675893eD7150a76d760a99ce';
  
  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`✅ Connected to Base (Chain ID: ${network.chainId})`);
    
    // Check block
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Current Block: ${blockNumber}`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = parseFloat(formatEther(balance));
    console.log(`\n💰 Wallet Address: ${wallet.address}`);
    console.log(`💰 Balance: ${balanceEth.toFixed(6)} ETH`);
    
    if (balanceEth === 0) {
      console.log('❌ CRITICAL: Wallet has ZERO balance!');
      console.log('   → Send ETH to wallet on Base network');
    } else if (balanceEth < 0.01) {
      console.log('⚠️  WARNING: Low balance (recommend 0.1+ ETH)');
    } else {
      console.log('✅ Balance sufficient for execution');
    }
    
    // Check FlashSwap contract
    const code = await provider.getCode(flashSwapAddress);
    if (code === '0x') {
      console.log(`\n❌ No contract at FlashSwap address: ${flashSwapAddress}`);
      console.log('   → Need to deploy FlashSwapV2 contract');
    } else {
      console.log(`\n✅ FlashSwapV2 deployed at: ${flashSwapAddress}`);
      console.log(`   Code size: ${(code.length / 2 - 1)} bytes`);
    }
    
    // Check gas price
    const feeData = await provider.getFeeData();
    const gasPriceGwei = parseFloat(formatEther(feeData.gasPrice || 0n)) * 1e9;
    console.log(`\n⛽ Gas Price: ${gasPriceGwei.toFixed(4)} Gwei`);
    console.log('   (Base is super cheap! 🎉)');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkWallet();
