const fs = require('fs');
const path = require('path');

console.log('🚀 zkLove Production Setup');
console.log('==========================');

// Mock contract addresses for development/demo
const MOCK_CONTRACTS = {
  polygon_mumbai: {
    identityVerification: '0x742d35Cc6634C0532925a3b8D0C9f2e4cC9a2d15',
    zkDating: '0x8ba1f109551bD432803012645Hac136c8f4c7A6e'
  },
  polygon_mainnet: {
    identityVerification: '0x1234567890123456789012345678901234567890',
    zkDating: '0x2345678901234567890123456789012345678901'
  }
};

function updateConfiguration() {
  console.log('📝 Updating configuration files...');
  
  try {
    // Update config.js with testnet addresses
    const configPath = path.join(__dirname, '../config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    const testnetContracts = MOCK_CONTRACTS.polygon_mumbai;
    
    configContent = configContent.replace(
      /identityVerification: IDENTITY_VERIFICATION_CONTRACT \|\| '[^']*'/,
      `identityVerification: IDENTITY_VERIFICATION_CONTRACT || '${testnetContracts.identityVerification}'`
    );
    
    configContent = configContent.replace(
      /zkDating: process\.env\.ZK_DATING_CONTRACT \|\| '[^']*'/,
      `zkDating: process.env.ZK_DATING_CONTRACT || '${testnetContracts.zkDating}'`
    );
    
    fs.writeFileSync(configPath, configContent);
    
    // Create production deployment record
    const deploymentRecord = {
      version: '1.0.0',
      network: 'Polygon Mumbai Testnet',
      chainId: 80001,
      timestamp: new Date().toISOString(),
      deployer: 'Demo Deployment',
      contracts: {
        identityVerification: {
          address: testnetContracts.identityVerification,
          explorer: `https://mumbai.polygonscan.com/address/${testnetContracts.identityVerification}`,
          status: 'mock_for_development'
        },
        zkDating: {
          address: testnetContracts.zkDating,
          explorer: `https://mumbai.polygonscan.com/address/${testnetContracts.zkDating}`,
          status: 'mock_for_development'
        }
      },
      features: {
        identityVerification: 'enabled',
        zkProofs: 'enabled',
        auraSystem: 'enabled',
        anonymousMatching: 'enabled',
        progressiveReveal: 'enabled'
      },
      status: 'configured_for_development',
      note: 'Using mock contracts for development. Deploy real contracts for production.'
    };
    
    // Save deployment record
    const deploymentPath = path.join(__dirname, '../production-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentRecord, null, 2));
    
    console.log('✅ Configuration updated successfully');
    console.log(`📄 Deployment record: production-deployment.json`);
    
    return deploymentRecord;
  } catch (error) {
    console.error('❌ Configuration update failed:', error.message);
    throw error;
  }
}

function createEnvironmentFiles() {
  console.log('🔧 Creating environment files...');
  
  const envProduction = `# zkLove Production Environment
NODE_ENV=production
DEBUG=false

# Network Configuration
NETWORK_NAME=polygon_mumbai
CHAIN_ID=80001

# Contract Addresses (Mock for development)
IDENTITY_VERIFICATION_CONTRACT=${MOCK_CONTRACTS.polygon_mumbai.identityVerification}
ZK_DATING_CONTRACT=${MOCK_CONTRACTS.polygon_mumbai.zkDating}

# Production Features
ENABLE_BLOCKCHAIN_SUBMISSION=true
ENABLE_IPFS_STORAGE=false
ENABLE_ZK_PROOFS=true
ENABLE_MOCK_DATA=true

# App Configuration
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
`;
  
  fs.writeFileSync(path.join(__dirname, '../.env.production'), envProduction);
  console.log('✅ .env.production created');
}

function setupProductionBuild() {
  console.log('📦 Setting up production build configuration...');
  
  // Update package.json version
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = '1.0.0';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Package version updated to 1.0.0');
}

function generateProductionSummary(deploymentRecord) {
  console.log('\n🎉 Production Setup Complete!');
  console.log('==============================');
  console.log('📋 Configuration Summary:');
  console.log(`   App Version: 1.0.0`);
  console.log(`   Network: ${deploymentRecord.network}`);
  console.log(`   Identity Contract: ${deploymentRecord.contracts.identityVerification.address}`);
  console.log(`   Dating Contract: ${deploymentRecord.contracts.zkDating.address}`);
  console.log(`   Status: ${deploymentRecord.status}`);
  
  console.log('\n🚀 Ready Features:');
  Object.entries(deploymentRecord.features).forEach(([feature, status]) => {
    console.log(`   ✅ ${feature}: ${status}`);
  });
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Test the app: npm start');
  console.log('2. Build for production: npm run build:production');
  console.log('3. Deploy real contracts: npm run deploy:mumbai (with real private key)');
  console.log('4. Build mobile apps: npm run build:android');
  
  console.log('\n📱 Available Commands:');
  console.log('   npm start                 - Start development server');
  console.log('   npm run preview:production - Test production build');
  console.log('   npm run build:android     - Build Android APK');
  console.log('   npm run deploy:mumbai     - Deploy to Mumbai testnet');
}

async function main() {
  try {
    const deploymentRecord = updateConfiguration();
    createEnvironmentFiles();
    setupProductionBuild();
    generateProductionSummary(deploymentRecord);
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateConfiguration, MOCK_CONTRACTS };
