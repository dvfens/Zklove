const { ethers } = require('ethers');

// Test script to check if existing contracts are working
console.log('🔍 Testing existing contract addresses...');

const NETWORKS = {
  polygon_mumbai: {
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chainId: 80001,
    currency: 'MATIC',
    blockExplorer: 'https://mumbai.polygonscan.com'
  }
};

async function testContracts() {
  try {
    const network = NETWORKS.polygon_mumbai;
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    
    // Test network connection
    console.log('📡 Testing network connection...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected to block: ${blockNumber}`);
    
    // Test existing contract addresses
    const identityAddress = '0x742d35Cc6634C0532925a3b8D0C9f2e4cC9a2d15';
    const datingAddress = '0x8ba1f109551bD432803012645Hac136c8f4c7A6e';
    
    console.log('\n🔍 Testing contract addresses...');
    
    // Check if contracts exist
    const identityCode = await provider.getCode(identityAddress);
    const datingCode = await provider.getCode(datingAddress);
    
    if (identityCode === '0x') {
      console.log('❌ IdentityVerification contract not found at:', identityAddress);
    } else {
      console.log('✅ IdentityVerification contract found at:', identityAddress);
    }
    
    if (datingCode === '0x') {
      console.log('❌ ZKDatingContract not found at:', datingAddress);
    } else {
      console.log('✅ ZKDatingContract found at:', datingAddress);
    }
    
    // If contracts don't exist, we need to deploy them
    if (identityCode === '0x' || datingCode === '0x') {
      console.log('\n🚀 Contracts need to be deployed. Let\'s deploy them...');
      return false;
    }
    
    console.log('\n✅ All contracts are already deployed and working!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing contracts:', error.message);
    return false;
  }
}

testContracts().then(success => {
  if (!success) {
    console.log('\n💡 Next steps:');
    console.log('1. Get some test MATIC from: https://faucet.polygon.technology/');
    console.log('2. Try deploying with a different RPC endpoint');
    console.log('3. Or use the existing addresses if they work');
  }
});
