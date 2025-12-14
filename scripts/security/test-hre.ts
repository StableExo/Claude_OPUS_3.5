import hre from 'hardhat';

async function main() {
  console.log('Available in hre:', Object.keys(hre));
  console.log('hre.ethers:', hre.ethers ? 'exists' : 'undefined');
}

main().catch(console.error);
