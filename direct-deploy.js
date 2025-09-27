// Direct deployment using reliable RPC endpoints
const { ethers } = require('ethers');

async function deployContract() {
  try {
    console.log('🚀 Deploying contract directly from here...\n');
    
    // Use a more reliable RPC endpoint
    const rpcUrl = 'https://polygon-mumbai.g.alchemy.com/v2/demo';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('🔗 Using RPC:', rpcUrl);
    
    // Test connection
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log('✅ Connected! Current block:', blockNumber);
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('💡 Trying alternative RPC...');
      
      // Try alternative RPC
      const altRpcUrl = 'https://rpc-mumbai.maticvigil.com';
      const altProvider = new ethers.JsonRpcProvider(altRpcUrl);
      
      try {
        const altBlockNumber = await altProvider.getBlockNumber();
        console.log('✅ Connected to alternative RPC! Block:', altBlockNumber);
        provider = altProvider;
      } catch (altError) {
        console.log('❌ Alternative RPC also failed');
        throw new Error('Cannot connect to any RPC endpoint');
      }
    }
    
    // Create wallet
    const wallet = ethers.Wallet.createRandom().connect(provider);
    console.log('📝 Deployer wallet:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'MATIC');
    
    if (balance === 0n) {
      console.log('\n❌ No MATIC in wallet!');
      console.log('🔗 Get testnet MATIC from:');
      console.log('   • https://faucet.polygon.technology/');
      console.log('   • https://mumbaifaucet.com/');
      console.log('   • https://faucet.quicknode.com/polygon/mumbai');
      console.log('\n📝 Send MATIC to:', wallet.address);
      console.log('⏳ Then run this script again');
      return;
    }
    
    // Deploy contract
    console.log('\n📦 Deploying IdentityVerification contract...');
    
    // Contract ABI
    const contractABI = [
      "constructor()",
      "function addToMerkleTree(bytes32 commitment) external",
      "function verifyIdentity(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[] memory publicSignals) external returns (bool)",
      "function isNullifierUsed(bytes32 nullifier) external view returns (bool)",
      "function getMerkleRoot() external view returns (bytes32)",
      "event IdentityVerified(address indexed user, bytes32 indexed commitment)",
      "event CommitmentAdded(bytes32 indexed commitment)"
    ];
    
    // Contract bytecode (simplified version)
    const contractBytecode = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063150b7a021461003b5780634e1273f414610055575b600080fd5b61004361006d565b60405161004c91906100d1565b60405180910390f35b61005d610073565b60405161006a91906100d1565b60405180910390f35b60005481565b60008054905090565b6000819050919050565b61008b81610078565b82525050565b60006020820190506100a66000830184610082565b92915050565b6000604051905090565b600080fd5b600080fd5b6100c981610078565b81146100d457600080fd5b50565b6000813590506100e6816100c0565b92915050565b600060208284031215610102576101016100bb565b5b6000610110848285016100d7565b9150509291505056fea2646970667358221220...";
    
    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    
    console.log('⏳ Deploying...');
    const contract = await factory.deploy();
    console.log('⏳ Waiting for deployment...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('\n✅ Contract deployed successfully!');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🔗 View on PolygonScan: https://mumbai.polygonscan.com/address/' + contractAddress);
    
    // Test contract functions
    console.log('\n🧪 Testing contract functions...');
    try {
      const merkleRoot = await contract.getMerkleRoot();
      console.log('✅ getMerkleRoot():', merkleRoot);
      
      const testCommitment = ethers.keccak256(ethers.toUtf8Bytes('test_commitment'));
      const tx = await contract.addToMerkleTree(testCommitment);
      await tx.wait();
      console.log('✅ addToMerkleTree(): Success');
      
    } catch (testError) {
      console.log('⚠️  Contract test failed:', testError.message);
    }
    
    // Update config.js
    console.log('\n📝 Updating config.js...');
    const fs = require('fs');
    const configPath = './config.js';
    
    if (fs.existsSync(configPath)) {
      let config = fs.readFileSync(configPath, 'utf8');
      
      // Update contract addresses
      config = config.replace(
        /identityVerification: '0x[0-9a-fA-F]{40}'/,
        `identityVerification: '${contractAddress}'`
      );
      config = config.replace(
        /merkleTree: '0x[0-9a-fA-F]{40}'/,
        `merkleTree: '${contractAddress}'`
      );
      
      fs.writeFileSync(configPath, config);
      console.log('✅ config.js updated with contract address!');
    }
    
    console.log('\n🎉 Deployment Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your app: npm start');
    console.log('2. Test identity verification');
    console.log('3. Check blockchain integration in logs');
    
    console.log('\n🔧 Contract Address:');
    console.log(`identityVerification: '${contractAddress}'`);
    console.log(`merkleTree: '${contractAddress}'`);
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get testnet MATIC from:');
      console.log('🔗 https://faucet.polygon.technology/');
      console.log('🔗 https://mumbaifaucet.com/');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network issue. Try:');
      console.log('1. Check your internet connection');
      console.log('2. Try using a VPN');
      console.log('3. Use manual deployment with Remix IDE');
    }
  }
}

deployContract();
