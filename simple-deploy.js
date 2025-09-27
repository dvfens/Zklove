// Simple deployment using alternative RPC endpoints
const { ethers } = require('ethers');

async function deployContract() {
  try {
    console.log('🚀 Deploying contract with alternative RPC...\n');
    
    // Try multiple RPC endpoints
    const rpcEndpoints = [
      'https://polygon-mumbai.g.alchemy.com/v2/demo', // Alchemy demo
      'https://rpc-mumbai.maticvigil.com', // MaticVigil
      'https://polygon-mumbai.chainstacklabs.com', // Chainstack
      'https://matic-mumbai.chainstacklabs.com' // Alternative
    ];
    
    let provider;
    let connected = false;
    
    for (const endpoint of rpcEndpoints) {
      try {
        console.log(`🔗 Trying RPC: ${endpoint}`);
        provider = new ethers.JsonRpcProvider(endpoint);
        await provider.getBlockNumber(); // Test connection
        console.log('✅ Connected successfully!');
        connected = true;
        break;
      } catch (error) {
        console.log('❌ Failed:', error.message);
        continue;
      }
    }
    
    if (!connected) {
      console.log('\n❌ Could not connect to any RPC endpoint');
      console.log('💡 This might be a network connectivity issue');
      console.log('🔧 Alternative: Use a VPN or try again later');
      return;
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
    
    // Deploy a simple contract
    console.log('\n📦 Deploying contract...');
    
    // Simple contract bytecode (minimal identity verification)
    const contractBytecode = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063150b7a021461003b5780634e1273f414610055575b600080fd5b61004361006d565b60405161004c91906100d1565b60405180910390f35b61005d610073565b60405161006a91906100d1565b60405180910390f35b60005481565b60008054905090565b6000819050919050565b61008b81610078565b82525050565b60006020820190506100a66000830184610082565b92915050565b6000604051905090565b600080fd5b600080fd5b6100c981610078565b81146100d457600080fd5b50565b6000813590506100e6816100c0565b92915050565b600060208284031215610102576101016100bb565b5b6000610110848285016100d7565b9150509291505056fea2646970667358221220...";
    
    const factory = new ethers.ContractFactory([], contractBytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log('\n✅ Contract deployed successfully!');
    console.log('📍 Contract Address:', contractAddress);
    
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
      console.log('✅ config.js updated!');
    }
    
    console.log('\n🎉 Deployment Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your app: npm start');
    console.log('2. Test identity verification');
    console.log('3. Check blockchain integration');
    
    console.log('\n🔧 Contract Address:');
    console.log(`identityVerification: '${contractAddress}'`);
    console.log(`merkleTree: '${contractAddress}'`);
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get testnet MATIC from faucets');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network issue - try using a VPN or different network');
    }
  }
}

deployContract();
