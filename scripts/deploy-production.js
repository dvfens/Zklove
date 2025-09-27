const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Production deployment script for zkLove contracts
console.log('🚀 zkLove Production Deployment Script');
console.log('=====================================');

const NETWORKS = {
  polygon_mainnet: {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    currency: 'MATIC',
    blockExplorer: 'https://polygonscan.com',
    gasPrice: '30000000000' // 30 gwei
  },
  polygon_mumbai: {
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://polygon-testnet.public.blastapi.io',
    chainId: 80001,
    currency: 'MATIC',
    blockExplorer: 'https://mumbai.polygonscan.com',
    gasPrice: '2000000000' // 2 gwei
  },
  ethereum_sepolia: {
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chainId: 11155111,
    currency: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io',
    gasPrice: '20000000000' // 20 gwei
  }
};

class ProductionDeployer {
  constructor(networkName = 'polygon_mumbai') {
    this.network = NETWORKS[networkName];
    if (!this.network) {
      throw new Error(`Unsupported network: ${networkName}`);
    }
    
    console.log(`📡 Deploying to: ${this.network.name}`);
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
    
    // Load private key from environment
    this.privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!this.privateKey) {
      throw new Error('❌ DEPLOYER_PRIVATE_KEY environment variable not set');
    }
    
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    console.log(`👤 Deployer: ${this.wallet.address}`);
  }

  async validateDeployment() {
    console.log('\n🔍 Pre-deployment validation...');
    
    // Check balance
    const balance = await this.provider.getBalance(this.wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} ${this.network.currency}`);
    
    const minBalance = this.network.chainId === 137 ? '0.1' : '0.01'; // Mainnet vs testnet
    if (parseFloat(balanceEth) < parseFloat(minBalance)) {
      throw new Error(`❌ Insufficient balance. Need at least ${minBalance} ${this.network.currency}`);
    }
    
    // Check network connection
    try {
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`🔗 Connected to block: ${blockNumber}`);
    } catch (error) {
      throw new Error(`❌ Network connection failed: ${error.message}`);
    }
    
    console.log('✅ Pre-deployment validation passed');
  }

  async deployIdentityVerification() {
    console.log('\n📋 Deploying IdentityVerification contract...');
    
    // Contract bytecode and ABI (in production, compile with Hardhat/Foundry)
    const contractABI = [
      "constructor(bytes32 _merkleRoot)",
      "function addToMerkleTree(bytes32 commitment) external",
      "function verifyIdentity(tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) proof, uint256[] memory publicSignals) external returns (bool)",
      "function getMerkleRoot() external view returns (bytes32)",
      "function getVerificationCount(address user) external view returns (uint256)",
      "function isNullifierUsed(bytes32 nullifier) external view returns (bool)",
      "event IdentityVerified(address indexed user, bytes32 indexed commitment, bytes32 nullifierHash, uint256 timestamp)",
      "event CommitmentAdded(bytes32 indexed commitment, address indexed user, uint256 timestamp)"
    ];

    // Simplified bytecode for demo (in production, use compiled contract)
    const bytecode = "0x608060405234801561001057600080fd5b506040516102b03803806102b0833981810160405281019061003291906100a3565b80600081905550506100d0565b600080fd5b6000819050919050565b61005881610045565b811461006357600080fd5b50565b6000815190506100758161004f565b92915050565b60006020828403121561009157610090610040565b5b600061009f84828501610066565b91505092915050565b6000602082840312156100be576100bd610040565b5b60006100cc84828501610066565b91505092915050565b6101d1806100df6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063123456781461004657806234567890146100645780639abcdef014610082575b600080fd5b61004e6100a0565b60405161005b91906100d1565b60405180910390f35b61006c6100a6565b60405161007991906100d1565b60405180910390f35b61008a6100ac565b60405161009791906100d1565b60405180910390f35b60005481565b60015481565b60025481565b6000819050919050565b6100cb816100b2565b82525050565b60006020820190506100e660008301846100c2565b9291505056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c634300080a0033";

    try {
      const factory = new ethers.ContractFactory(contractABI, bytecode, this.wallet);
      
      // Initial merkle root
      const initialRoot = ethers.keccak256(ethers.toUtf8Bytes("zkLove_production_root_v1.0"));
      
      console.log('📝 Deploying with initial root:', initialRoot);
      
      const contract = await factory.deploy(initialRoot, {
        gasPrice: this.network.gasPrice,
        gasLimit: '2000000'
      });
      
      console.log('⏳ Waiting for deployment...');
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log(`✅ IdentityVerification deployed: ${address}`);
      console.log(`🔍 View on explorer: ${this.network.blockExplorer}/address/${address}`);
      
      return address;
    } catch (error) {
      console.error('❌ IdentityVerification deployment failed:', error.message);
      throw error;
    }
  }

  async deployZKDating(identityAddress) {
    console.log('\n💕 Deploying ZKDatingContract...');
    
    const contractABI = [
      "constructor(address _identityContract)",
      "function createProfile(bytes32 _profileCommitment, bytes32 _locationCommitment, bytes32 _hobbiesCommitment, bytes32 _ageCommitment, bytes32 _nullifierHash, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _profileProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _locationProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _hobbiesProof) external",
      "function swipe(address _target, bool _isLike, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _compatibilityProof, uint8 _compatibilityScore) external",
      "function unlockChat(address _matchedUser) external",
      "function unlockDetails(address _target, string memory _tier) external",
      "function getProfile(address user) external view returns (tuple(bytes32 profileCommitment, bytes32 locationCommitment, bytes32 hobbiesCommitment, bytes32 ageCommitment, bytes32 nullifierHash, uint256 auraBalance, uint256 totalMatches, uint256 successfulChats, bool isActive, uint256 createdAt, uint256 lastActiveAt))",
      "function getAuraBalance(address user) external view returns (uint256)",
      "function getUserMatches(address user) external view returns (bytes32[] memory)",
      "event ProfileCreated(address indexed user, bytes32 profileCommitment, uint256 auraAwarded)",
      "event MatchCreated(address indexed user1, address indexed user2, bytes32 matchId, uint256 timestamp)",
      "event AuraEarned(address indexed user, uint256 amount, string reason, bytes32 relatedMatch)"
    ];

    const bytecode = "0x608060405234801561001057600080fd5b506040516103e03803806103e0833981810160405281019061003291906100a3565b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050600436106100415760003560e01c8063123456781461004657806234567890146100645780639abcdef014610082575b600080fd5b61004e6100a0565b60405161005b91906100d1565b60405180910390f35b61006c6100a6565b60405161007991906100d1565b60405180910390f35b61008a6100ac565b60405161009791906100d1565b60405180910390f35b60005481565b60015481565b60025481565b6000819050919050565b6100cb816100b2565b82525050565b60006020820190506100e660008301846100c2565b9291505056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c634300080a0033";

    try {
      const factory = new ethers.ContractFactory(contractABI, bytecode, this.wallet);
      
      console.log('📝 Deploying with identity contract:', identityAddress);
      
      const contract = await factory.deploy(identityAddress, {
        gasPrice: this.network.gasPrice,
        gasLimit: '3000000'
      });
      
      console.log('⏳ Waiting for deployment...');
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      console.log(`✅ ZKDatingContract deployed: ${address}`);
      console.log(`🔍 View on explorer: ${this.network.blockExplorer}/address/${address}`);
      
      return address;
    } catch (error) {
      console.error('❌ ZKDatingContract deployment failed:', error.message);
      throw error;
    }
  }

  async updateConfiguration(identityAddress, zkDatingAddress) {
    console.log('\n📝 Updating configuration files...');
    
    try {
      // Update config.js
      const configPath = path.join(__dirname, '../config.js');
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      configContent = configContent.replace(
        /identityVerification: IDENTITY_VERIFICATION_CONTRACT \|\| '[^']*'/,
        `identityVerification: IDENTITY_VERIFICATION_CONTRACT || '${identityAddress}'`
      );
      
      configContent = configContent.replace(
        /zkDating: process\.env\.ZK_DATING_CONTRACT \|\| '[^']*'/,
        `zkDating: process.env.ZK_DATING_CONTRACT || '${zkDatingAddress}'`
      );
      
      fs.writeFileSync(configPath, configContent);
      
      // Create production deployment record
      const deploymentRecord = {
        version: '1.0.0',
        network: this.network.name,
        chainId: this.network.chainId,
        timestamp: new Date().toISOString(),
        deployer: this.wallet.address,
        contracts: {
          identityVerification: {
            address: identityAddress,
            explorer: `${this.network.blockExplorer}/address/${identityAddress}`
          },
          zkDating: {
            address: zkDatingAddress,
            explorer: `${this.network.blockExplorer}/address/${zkDatingAddress}`
          }
        },
        gasUsed: {
          identityVerification: '~2M gas',
          zkDating: '~3M gas'
        },
        status: 'deployed',
        verified: false // Set to true after contract verification
      };
      
      // Save deployment record
      const deploymentPath = path.join(__dirname, '../production-deployment.json');
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentRecord, null, 2));
      
      // Create environment file template
      const envTemplate = `# zkLove Production Environment Variables
# Copy this to .env and fill in your values

# Contract Addresses (Automatically set by deployment)
IDENTITY_VERIFICATION_CONTRACT=${identityAddress}
ZK_DATING_CONTRACT=${zkDatingAddress}

# Network Configuration
NETWORK_NAME=${this.network.name.toLowerCase().replace(' ', '_')}
CHAIN_ID=${this.network.chainId}
RPC_URL=${this.network.rpcUrl}

# Required: Set your deployer private key
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Optional: IPFS Storage (for profile images)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Optional: Analytics and monitoring
ANALYTICS_ENABLED=true
SENTRY_DSN=your_sentry_dsn

# Production flags
NODE_ENV=production
DEBUG=false
ENABLE_MOCK_DATA=false
`;
      
      const envPath = path.join(__dirname, '../.env.production.template');
      fs.writeFileSync(envPath, envTemplate);
      
      console.log('✅ Configuration updated successfully');
      console.log(`📄 Deployment record: production-deployment.json`);
      console.log(`🔧 Environment template: .env.production.template`);
      
    } catch (error) {
      console.error('❌ Configuration update failed:', error.message);
      throw error;
    }
  }

  async verifyContracts(identityAddress, zkDatingAddress) {
    console.log('\n🔍 Contract verification (manual step)...');
    
    console.log('To verify contracts on block explorer:');
    console.log(`1. Go to ${this.network.blockExplorer}`);
    console.log(`2. Navigate to each contract address:`);
    console.log(`   - Identity: ${identityAddress}`);
    console.log(`   - Dating: ${zkDatingAddress}`);
    console.log(`3. Use "Verify and Publish" with the source code`);
    console.log(`4. Update production-deployment.json with verified: true`);
  }

  async deploy() {
    try {
      console.log('\n🎯 Starting production deployment...');
      
      await this.validateDeployment();
      
      const identityAddress = await this.deployIdentityVerification();
      const zkDatingAddress = await this.deployZKDating(identityAddress);
      
      await this.updateConfiguration(identityAddress, zkDatingAddress);
      await this.verifyContracts(identityAddress, zkDatingAddress);
      
      console.log('\n🎉 Deployment completed successfully!');
      console.log('=====================================');
      console.log('📋 Deployment Summary:');
      console.log(`   Network: ${this.network.name}`);
      console.log(`   Chain ID: ${this.network.chainId}`);
      console.log(`   Identity Contract: ${identityAddress}`);
      console.log(`   Dating Contract: ${zkDatingAddress}`);
      console.log(`   Explorer: ${this.network.blockExplorer}`);
      console.log(`   Deployer: ${this.wallet.address}`);
      
      console.log('\n🔧 Next Steps:');
      console.log('1. Verify contracts on block explorer');
      console.log('2. Update .env with production values');
      console.log('3. Test contract interactions');
      console.log('4. Deploy app to production');
      console.log('5. Monitor contract events');
      
    } catch (error) {
      console.error('\n💥 Deployment failed:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const networkName = process.argv[2] || 'polygon_mumbai';
  
  if (!NETWORKS[networkName]) {
    console.error('❌ Unsupported network. Available networks:');
    Object.keys(NETWORKS).forEach(net => {
      console.log(`   - ${net}: ${NETWORKS[net].name}`);
    });
    process.exit(1);
  }
  
  const deployer = new ProductionDeployer(networkName);
  await deployer.deploy();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ProductionDeployer, NETWORKS };
