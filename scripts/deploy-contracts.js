const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract deployment script for zkLove Dating App
// This script deploys the IdentityVerification and ZKDatingContract to testnet

const NETWORK_CONFIG = {
  polygon_mumbai: {
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    currency: 'MATIC',
    blockExplorer: 'https://mumbai.polygonscan.com'
  },
  ethereum_sepolia: {
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    chainId: 11155111,
    currency: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  }
};

class ContractDeployer {
  constructor(network = 'polygon_mumbai') {
    this.network = NETWORK_CONFIG[network];
    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
    
    // Load private key from environment or prompt user
    this.privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!this.privateKey) {
      throw new Error('Please set DEPLOYER_PRIVATE_KEY environment variable');
    }
    
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    console.log(`🚀 Deploying to ${this.network.name}`);
    console.log(`📝 Deployer address: ${this.wallet.address}`);
  }

  async checkBalance() {
    const balance = await this.provider.getBalance(this.wallet.address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log(`💰 Balance: ${balanceEth} ${this.network.currency}`);
    
    if (parseFloat(balanceEth) < 0.01) {
      throw new Error(`Insufficient balance. Need at least 0.01 ${this.network.currency} for deployment.`);
    }
  }

  async deployIdentityVerification() {
    console.log('\n📋 Deploying IdentityVerification contract...');
    
    // Read contract source
    const contractPath = path.join(__dirname, '../contracts/IdentityVerification.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    
    // For this demo, we'll use a simplified deployment
    // In production, you'd compile with Hardhat or Foundry
    
    // Mock contract bytecode and ABI (in production, get from compilation)
    const contractFactory = new ethers.ContractFactory(
      [
        "constructor(bytes32 _merkleRoot)",
        "function addToMerkleTree(bytes32 commitment) external",
        "function verifyIdentity(tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) proof, uint256[] memory publicSignals) external returns (bool)",
        "function getMerkleRoot() external view returns (bytes32)",
        "event IdentityVerified(address indexed user, bytes32 indexed commitment, bytes32 nullifierHash, uint256 timestamp)"
      ],
      "0x608060405234801561001057600080fd5b50", // Mock bytecode
      this.wallet
    );

    try {
      // Deploy with initial merkle root
      const initialRoot = ethers.keccak256(ethers.toUtf8Bytes("zkLove_initial_root"));
      const contract = await contractFactory.deploy(initialRoot);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log(`✅ IdentityVerification deployed at: ${address}`);
      console.log(`🔍 View on explorer: ${this.network.blockExplorer}/address/${address}`);
      
      return address;
    } catch (error) {
      console.error('❌ Failed to deploy IdentityVerification:', error);
      throw error;
    }
  }

  async deployZKDating(identityContractAddress) {
    console.log('\n💕 Deploying ZKDatingContract...');
    
    // Mock ZKDating contract factory
    const contractFactory = new ethers.ContractFactory(
      [
        "constructor(address _identityContract)",
        "function createProfile(bytes32 _profileCommitment, bytes32 _locationCommitment, bytes32 _hobbiesCommitment, bytes32 _ageCommitment, bytes32 _nullifierHash, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _profileProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _locationProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _hobbiesProof) external",
        "function swipe(address _target, bool _isLike, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _compatibilityProof, uint8 _compatibilityScore) external",
        "function unlockChat(address _matchedUser) external",
        "function getProfile(address user) external view returns (tuple(bytes32 profileCommitment, bytes32 locationCommitment, bytes32 hobbiesCommitment, bytes32 ageCommitment, bytes32 nullifierHash, uint256 auraBalance, uint256 totalMatches, uint256 successfulChats, bool isActive, uint256 createdAt, uint256 lastActiveAt))",
        "event ProfileCreated(address indexed user, bytes32 profileCommitment, uint256 auraAwarded)",
        "event MatchCreated(address indexed user1, address indexed user2, bytes32 matchId, uint256 timestamp)"
      ],
      "0x608060405234801561001057600080fd5b50", // Mock bytecode
      this.wallet
    );

    try {
      const contract = await contractFactory.deploy(identityContractAddress);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log(`✅ ZKDatingContract deployed at: ${address}`);
      console.log(`🔍 View on explorer: ${this.network.blockExplorer}/address/${address}`);
      
      return address;
    } catch (error) {
      console.error('❌ Failed to deploy ZKDatingContract:', error);
      throw error;
    }
  }

  async updateConfig(identityAddress, zkDatingAddress) {
    console.log('\n📝 Updating configuration files...');
    
    try {
      // Update config.js
      const configPath = path.join(__dirname, '../config.js');
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      // Replace contract addresses
      configContent = configContent.replace(
        /identityVerification: IDENTITY_VERIFICATION_CONTRACT \|\| '[^']*'/,
        `identityVerification: IDENTITY_VERIFICATION_CONTRACT || '${identityAddress}'`
      );
      
      configContent = configContent.replace(
        /zkDating: process\.env\.ZK_DATING_CONTRACT \|\| '[^']*'/,
        `zkDating: process.env.ZK_DATING_CONTRACT || '${zkDatingAddress}'`
      );
      
      fs.writeFileSync(configPath, configContent);
      
      // Create deployment info file
      const deploymentInfo = {
        network: this.network.name,
        chainId: this.network.chainId,
        timestamp: new Date().toISOString(),
        contracts: {
          identityVerification: identityAddress,
          zkDating: zkDatingAddress
        },
        explorer: this.network.blockExplorer,
        deployer: this.wallet.address
      };
      
      const deploymentPath = path.join(__dirname, '../deployment.json');
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
      
      console.log('✅ Configuration updated successfully!');
      console.log('📄 Deployment info saved to deployment.json');
      
    } catch (error) {
      console.error('❌ Failed to update configuration:', error);
      throw error;
    }
  }

  async deploy() {
    try {
      console.log('🎯 Starting zkLove contract deployment...\n');
      
      // Check deployer balance
      await this.checkBalance();
      
      // Deploy contracts
      const identityAddress = await this.deployIdentityVerification();
      const zkDatingAddress = await this.deployZKDating(identityAddress);
      
      // Update configuration
      await this.updateConfig(identityAddress, zkDatingAddress);
      
      console.log('\n🎉 Deployment completed successfully!');
      console.log('📋 Summary:');
      console.log(`   Network: ${this.network.name}`);
      console.log(`   Identity Contract: ${identityAddress}`);
      console.log(`   Dating Contract: ${zkDatingAddress}`);
      console.log(`   Explorer: ${this.network.blockExplorer}`);
      
      console.log('\n🔧 Next steps:');
      console.log('1. Fund some test accounts with testnet tokens');
      console.log('2. Test the identity verification flow');
      console.log('3. Create dating profiles and test matching');
      console.log('4. Monitor contract interactions on the explorer');
      
    } catch (error) {
      console.error('\n💥 Deployment failed:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const network = process.argv[2] || 'polygon_mumbai';
  
  if (!NETWORK_CONFIG[network]) {
    console.error('❌ Unsupported network. Available networks:');
    Object.keys(NETWORK_CONFIG).forEach(net => {
      console.log(`   - ${net}: ${NETWORK_CONFIG[net].name}`);
    });
    process.exit(1);
  }
  
  const deployer = new ContractDeployer(network);
  await deployer.deploy();
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ContractDeployer, NETWORK_CONFIG };
