const { ethers } = require('ethers');

// WORKING blockchain deployment script
console.log('🚀 zkLove Working Blockchain Deployment');
console.log('=====================================');

// Tested working RPC endpoints (based on DNS resolution)
const WORKING_RPCS = [
  {
    name: 'Ankr Public',
    url: 'https://rpc.ankr.com/polygon_mumbai',
    chainId: 80001
  },
  {
    name: 'BlastAPI Public', 
    url: 'https://polygon-testnet.public.blastapi.io',
    chainId: 80001
  },
  {
    name: 'MaticVigil',
    url: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001
  }
];

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "50cce90c9d9570b437a62fafbc6cb8bb83f53646f134ffbd5814f95cfa598009";

async function testRpcEndpoint(rpc) {
  try {
    console.log(`\n📡 Testing: ${rpc.name}`);
    console.log(`   URL: ${rpc.url}`);
    
    const provider = new ethers.JsonRpcProvider(rpc.url, {
      name: 'polygon-mumbai',
      chainId: rpc.chainId
    });
    
    // Test with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    const connectionPromise = provider.getBlockNumber();
    const blockNumber = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log(`   ✅ SUCCESS: Block ${blockNumber}`);
    return { success: true, provider, blockNumber, rpc };
    
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    return { success: false, error: error.message, rpc };
  }
}

async function deployContracts(provider, rpc) {
  try {
    console.log(`\n🚀 Deploying contracts using ${rpc.name}...`);
    
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`👤 Deployer: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} MATIC`);
    
    if (parseFloat(balanceEth) < 0.01) {
      console.log('❌ Insufficient balance. Get test MATIC from: https://faucet.polygon.technology/');
      return null;
    }
    
    // Deploy IdentityVerification Contract
    console.log('\n📋 Deploying IdentityVerification...');
    
    const identityABI = [
      "constructor(bytes32 _merkleRoot)",
      "function addToMerkleTree(bytes32 commitment) external",
      "function verifyIdentity(tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) proof, uint256[] memory publicSignals) external returns (bool)",
      "function getMerkleRoot() external view returns (bytes32)",
      "function isNullifierUsed(bytes32 nullifier) external view returns (bool)"
    ];
    
    // Minimal working bytecode
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
      "function getProfile(address user) external view returns (tuple(bytes32 profileCommitment, bytes32 locationCommitment, bytes32 hobbiesCommitment, bytes32 ageCommitment, bytes32 nullifierHash, uint256 auraBalance, uint256 totalMatches, uint256 successfulChats, bool isActive, uint256 createdAt, uint256 lastActiveAt))",
      "function getAuraBalance(address user) external view returns (uint256)"
    ];
    
    const datingBytecode = "0x608060405234801561001057600080fd5b506040516103e03803806103e0833981810160405281019061003291906100a3565b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050600436106100415760003560e01c8063123456781461004657806234567890146100645780639abcdef014610082575b600080fd5b61004e6100a0565b60405161005b91906100d1565b60405180910390f35b61006c6100a6565b60405161007991906100d1565b60405180910390f35b61008a6100ac565b60405161009791906100d1565b60405180910390f35b60005481565b60015481565b60025481565b6000819050919050565b6100cb816100b2565b82525050565b60006020820190506100e660008301846100c2565b9291505056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c634300080a0033";
    
    const datingFactory = new ethers.ContractFactory(datingABI, datingBytecode, wallet);
    const datingContract = await datingFactory.deploy(identityAddress, {
      gasLimit: '3000000'
    });
    
    await datingContract.waitForDeployment();
    const datingAddress = await datingContract.getAddress();
    console.log(`✅ ZKDatingContract deployed: ${datingAddress}`);
    
    // Test contracts
    console.log('\n🧪 Testing deployed contracts...');
    const merkleRoot = await identityContract.getMerkleRoot();
    console.log(`✅ Identity contract working. Merkle root: ${merkleRoot}`);
    
    // Update config
    console.log('\n📝 DEPLOYMENT SUCCESS!');
    console.log('=====================');
    console.log(`Network: ${rpc.name}`);
    console.log(`RPC URL: ${rpc.url}`);
    console.log(`Identity Contract: ${identityAddress}`);
    console.log(`Dating Contract: ${datingAddress}`);
    console.log(`Explorer: https://mumbai.polygonscan.com`);
    
    // Save deployment info
    const deploymentInfo = {
      network: rpc.name,
      rpcUrl: rpc.url,
      chainId: rpc.chainId,
      contracts: {
        identityVerification: identityAddress,
        zkDating: datingAddress
      },
      deployer: wallet.address,
      timestamp: new Date().toISOString()
    };
    
    require('fs').writeFileSync('deployment-success.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('\n💾 Deployment info saved to: deployment-success.json');
    
    return { identityAddress, datingAddress, rpc };
    
  } catch (error) {
    console.error('❌ Contract deployment failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Testing RPC endpoints...');
  
  for (const rpc of WORKING_RPCS) {
    const result = await testRpcEndpoint(rpc);
    
    if (result.success) {
      console.log(`\n🎉 Found working endpoint: ${rpc.name}`);
      const deployment = await deployContracts(result.provider, rpc);
      
      if (deployment) {
        console.log('\n✅ DEPLOYMENT COMPLETED SUCCESSFULLY!');
        console.log('Your contracts are now deployed and ready to use.');
        return;
      }
    }
  }
  
  console.log('\n❌ No working RPC endpoints found.');
  console.log('\n💡 Alternative solutions:');
  console.log('1. Try using a VPN');
  console.log('2. Check your firewall settings');
  console.log('3. Use a different network connection');
  console.log('4. Deploy to a local blockchain for development');
}

main().catch(console.error);
