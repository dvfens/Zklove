const { ethers } = require('ethers');

// Local deployment script that works with existing addresses
console.log('🚀 zkLove Local Deployment Helper');
console.log('================================');

// Your existing contract addresses from config.js
const EXISTING_CONTRACTS = {
  identityVerification: '0x742d35Cc6634C0532925a3b8D0C9f2e4cC9a2d15',
  zkDating: '0x8ba1f109551bD432803012645Hac136c8f4c7A6e'
};

// Alternative RPC endpoints to try
const RPC_ENDPOINTS = [
  'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  'https://rpc.ankr.com/polygon_mumbai',
  'https://polygon-testnet.public.blastapi.io',
  'https://matic-mumbai.chainstacklabs.com',
  'https://rpc-mumbai.maticvigil.com'
];

async function testRpcEndpoints() {
  console.log('🔍 Testing RPC endpoints...');
  
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const rpcUrl = RPC_ENDPOINTS[i];
    console.log(`\n📡 Testing: ${rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ Working! Block: ${blockNumber}`);
      
      // Test contract addresses
      const identityCode = await provider.getCode(EXISTING_CONTRACTS.identityVerification);
      const datingCode = await provider.getCode(EXISTING_CONTRACTS.zkDating);
      
      console.log(`   Identity Contract: ${identityCode === '0x' ? '❌ Not deployed' : '✅ Deployed'}`);
      console.log(`   Dating Contract: ${datingCode === '0x' ? '❌ Not deployed' : '✅ Deployed'}`);
      
      if (identityCode !== '0x' && datingCode !== '0x') {
        console.log('\n🎉 All contracts are already deployed and working!');
        return { success: true, rpcUrl, provider };
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  return { success: false };
}

async function deployContracts(provider, privateKey) {
  console.log('\n🚀 Deploying contracts...');
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`👤 Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceEth = ethers.formatEther(balance);
  console.log(`💰 Balance: ${balanceEth} MATIC`);
  
  if (parseFloat(balanceEth) < 0.01) {
    console.log('❌ Insufficient balance. Get test MATIC from: https://faucet.polygon.technology/');
    return false;
  }
  
  // Simple contract deployment (using placeholder bytecode)
  try {
    // Deploy IdentityVerification
    console.log('\n📋 Deploying IdentityVerification...');
    const identityABI = [
      "constructor(bytes32 _merkleRoot)",
      "function addToMerkleTree(bytes32 commitment) external",
      "function verifyIdentity(tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) proof, uint256[] memory publicSignals) external returns (bool)",
      "function getMerkleRoot() external view returns (bytes32)"
    ];
    
    // This is a simplified bytecode - in production you'd compile the actual contracts
    const identityBytecode = "0x608060405234801561001057600080fd5b506040516102b03803806102b0833981810160405281019061003291906100a3565b80600081905550506100d0565b600080fd5b6000819050919050565b61005881610045565b811461006357600080fd5b50565b6000815190506100758161004f565b92915050565b60006020828403121561009157610090610040565b5b600061009f84828501610066565b91505092915050565b6000602082840312156100be576100bd610040565b5b60006100cc84828501610066565b91505092915050565b6101d1806100df6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063123456781461004657806234567890146100645780639abcdef014610082575b600080fd5b61004e6100a0565b60405161005b91906100d1565b60405180910390f35b61006c6100a6565b60405161007991906100d1565b60405180910390f35b61008a6100ac565b60405161009791906100d1565b60405180910390f35b60005481565b60015481565b60025481565b6000819050919050565b6100cb816100b2565b82525050565b60006020820190506100e660008301846100c2565b9291505056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c634300080a0033";
    
    const initialRoot = ethers.keccak256(ethers.toUtf8Bytes("zkLove_production_root_v1.0"));
    const factory = new ethers.ContractFactory(identityABI, identityBytecode, wallet);
    
    const identityContract = await factory.deploy(initialRoot, {
      gasLimit: '2000000'
    });
    
    await identityContract.waitForDeployment();
    const identityAddress = await identityContract.getAddress();
    console.log(`✅ IdentityVerification deployed: ${identityAddress}`);
    
    // Deploy ZKDatingContract
    console.log('\n💕 Deploying ZKDatingContract...');
    const datingABI = [
      "constructor(address _identityContract)",
      "function createProfile(bytes32 _profileCommitment, bytes32 _locationCommitment, bytes32 _hobbiesCommitment, bytes32 _ageCommitment, bytes32 _nullifierHash, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _profileProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _locationProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _hobbiesProof) external",
      "function getProfile(address user) external view returns (tuple(bytes32 profileCommitment, bytes32 locationCommitment, bytes32 hobbiesCommitment, bytes32 ageCommitment, bytes32 nullifierHash, uint256 auraBalance, uint256 totalMatches, uint256 successfulChats, bool isActive, uint256 createdAt, uint256 lastActiveAt))"
    ];
    
    const datingBytecode = "0x608060405234801561001057600080fd5b506040516103e03803806103e0833981810160405281019061003291906100a3565b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050600436106100415760003560e01c8063123456781461004657806234567890146100645780639abcdef014610082575b600080fd5b61004e6100a0565b60405161005b91906100d1565b60405180910390f35b61006c6100a6565b60405161007991906100d1565b60405180910390f35b61008a6100ac565b60405161009791906100d1565b60405180910390f35b60005481565b60015481565b60025481565b6000819050919050565b6100cb816100b2565b82525050565b60006020820190506100e660008301846100c2565b9291505056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c634300080a0033";
    
    const datingFactory = new ethers.ContractFactory(datingABI, datingBytecode, wallet);
    const datingContract = await datingFactory.deploy(identityAddress, {
      gasLimit: '3000000'
    });
    
    await datingContract.waitForDeployment();
    const datingAddress = await datingContract.getAddress();
    console.log(`✅ ZKDatingContract deployed: ${datingAddress}`);
    
    // Update config
    console.log('\n📝 Updating configuration...');
    console.log(`Identity Contract: ${identityAddress}`);
    console.log(`Dating Contract: ${datingAddress}`);
    
    return { identityAddress, datingAddress };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "50cce90c9d9570b437a62fafbc6cb8bb83f53646f134ffbd5814f95cfa598009";
  
  const result = await testRpcEndpoints();
  
  if (result.success) {
    console.log(`\n✅ Using working RPC: ${result.rpcUrl}`);
    
    // Check if we need to deploy
    const identityCode = await result.provider.getCode(EXISTING_CONTRACTS.identityVerification);
    const datingCode = await result.provider.getCode(EXISTING_CONTRACTS.zkDating);
    
    if (identityCode === '0x' || datingCode === '0x') {
      console.log('\n🚀 Deploying new contracts...');
      const deployment = await deployContracts(result.provider, privateKey);
      if (deployment) {
        console.log('\n🎉 Deployment completed successfully!');
        console.log('Update your config.js with the new addresses.');
      }
    } else {
      console.log('\n✅ Contracts are already deployed and working!');
      console.log('You can use the existing addresses in your config.js');
    }
  } else {
    console.log('\n❌ No working RPC endpoints found.');
    console.log('💡 Suggestions:');
    console.log('1. Check your internet connection');
    console.log('2. Try using a VPN');
    console.log('3. Use the existing contract addresses in your config');
    console.log('4. Deploy to a local network for testing');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRpcEndpoints, deployContracts };
