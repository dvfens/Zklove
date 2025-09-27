const { ethers } = require('ethers');

// Comprehensive blockchain connectivity test
console.log('🔍 Blockchain Connectivity Investigation');
console.log('=====================================');

// Test multiple RPC endpoints with different configurations
const RPC_ENDPOINTS = [
  // Free public endpoints
  {
    name: 'Ankr Public',
    url: 'https://rpc.ankr.com/polygon_mumbai',
    requiresKey: false
  },
  {
    name: 'BlastAPI Public',
    url: 'https://polygon-testnet.public.blastapi.io',
    requiresKey: false
  },
  {
    name: 'MaticVigil',
    url: 'https://rpc-mumbai.maticvigil.com',
    requiresKey: false
  },
  {
    name: 'Chainstack',
    url: 'https://matic-mumbai.chainstacklabs.com',
    requiresKey: false
  },
  {
    name: 'QuickNode',
    url: 'https://polygon-mumbai.quiknode.pro/',
    requiresKey: true
  },
  // Infura alternatives
  {
    name: 'Infura Alternative 1',
    url: 'https://polygon-mumbai.infura.io/v3/',
    requiresKey: true
  },
  {
    name: 'Infura Alternative 2', 
    url: 'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    requiresKey: true
  },
  // Alchemy alternatives
  {
    name: 'Alchemy Demo',
    url: 'https://polygon-mumbai.g.alchemy.com/v2/demo',
    requiresKey: false
  },
  // Alternative providers
  {
    name: 'Moralis',
    url: 'https://speedy-nodes-nyc.moralis.io/YOUR_API_KEY/polygon/mumbai',
    requiresKey: true
  },
  {
    name: 'GetBlock',
    url: 'https://go.getblock.io/YOUR_API_KEY/polygon-mumbai',
    requiresKey: true
  }
];

async function testRpcEndpoint(endpoint) {
  console.log(`\n📡 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    // Create provider with timeout and retry configuration
    const provider = new ethers.JsonRpcProvider(endpoint.url, {
      name: 'polygon-mumbai',
      chainId: 80001
    });
    
    // Set timeout
    provider._getConnection().timeout = 10000;
    
    // Test basic connectivity
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
    );
    
    const connectionPromise = provider.getBlockNumber();
    const blockNumber = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log(`   ✅ SUCCESS: Connected to block ${blockNumber}`);
    
    // Test wallet operations
    const testWallet = new ethers.Wallet('0x1234567890123456789012345678901234567890123456789012345678901234', provider);
    const balance = await provider.getBalance(testWallet.address);
    console.log(`   ✅ Wallet operations working`);
    
    return {
      success: true,
      endpoint,
      blockNumber,
      details: 'Fully functional'
    };
    
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    
    // Categorize the error
    let errorType = 'Unknown';
    if (error.message.includes('timeout')) errorType = 'Timeout';
    else if (error.message.includes('ENOTFOUND')) errorType = 'DNS Resolution';
    else if (error.message.includes('403')) errorType = 'API Key Required';
    else if (error.message.includes('500')) errorType = 'Server Error';
    else if (error.message.includes('Internal error')) errorType = 'Internal Server Error';
    
    return {
      success: false,
      endpoint,
      error: error.message,
      errorType
    };
  }
}

async function testAllEndpoints() {
  console.log('Starting comprehensive RPC endpoint testing...\n');
  
  const results = [];
  
  for (const endpoint of RPC_ENDPOINTS) {
    const result = await testRpcEndpoint(endpoint);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Analyze results
  console.log('\n📊 RESULTS ANALYSIS');
  console.log('==================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful endpoints: ${successful.length}`);
  console.log(`❌ Failed endpoints: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 WORKING ENDPOINTS:');
    successful.forEach(r => {
      console.log(`   ✅ ${r.endpoint.name}`);
      console.log(`      URL: ${r.endpoint.url}`);
      console.log(`      Block: ${r.blockNumber}`);
      console.log('');
    });
    
    // Recommend the best endpoint
    const bestEndpoint = successful[0];
    console.log(`🏆 RECOMMENDED: ${bestEndpoint.endpoint.name}`);
    console.log(`   Use this URL: ${bestEndpoint.endpoint.url}`);
    
    return bestEndpoint;
  } else {
    console.log('\n❌ NO WORKING ENDPOINTS FOUND');
    console.log('\n🔍 ERROR ANALYSIS:');
    
    const errorTypes = {};
    failed.forEach(r => {
      errorTypes[r.errorType] = (errorTypes[r.errorType] || 0) + 1;
    });
    
    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} endpoints`);
    });
    
    console.log('\n💡 SOLUTIONS:');
    console.log('1. Check your internet connection');
    console.log('2. Try using a VPN');
    console.log('3. Check if your firewall is blocking requests');
    console.log('4. Try different DNS servers (8.8.8.8, 1.1.1.1)');
    console.log('5. Use a local blockchain for development');
    
    return null;
  }
}

async function createWorkingDeploymentScript(workingEndpoint) {
  if (!workingEndpoint) {
    console.log('\n❌ Cannot create deployment script - no working endpoints');
    return;
  }
  
  console.log('\n🚀 Creating working deployment script...');
  
  const deploymentScript = `const { ethers } = require('ethers');

// Working deployment script with tested RPC endpoint
console.log('🚀 zkLove Working Deployment');
console.log('===========================');

const WORKING_RPC = '${workingEndpoint.endpoint.url}';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "50cce90c9d9570b437a62fafbc6cb8bb83f53646f134ffbd5814f95cfa598009";

async function deployContracts() {
  try {
    console.log('📡 Connecting to: ${workingEndpoint.endpoint.name}');
    
    const provider = new ethers.JsonRpcProvider(WORKING_RPC, {
      name: 'polygon-mumbai',
      chainId: 80001
    });
    
    // Test connection
    const blockNumber = await provider.getBlockNumber();
    console.log(\`✅ Connected to block: \${blockNumber}\`);
    
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(\`👤 Deployer: \${wallet.address}\`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(\`💰 Balance: \${balanceEth} MATIC\`);
    
    if (parseFloat(balanceEth) < 0.01) {
      console.log('❌ Insufficient balance. Get test MATIC from: https://faucet.polygon.technology/');
      return;
    }
    
    // Deploy contracts here...
    console.log('🎉 Ready to deploy contracts!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployContracts();`;

  require('fs').writeFileSync('working-deploy.js', deploymentScript);
  console.log('✅ Created working-deploy.js');
  console.log('   Run: node working-deploy.js');
}

// Main execution
async function main() {
  const workingEndpoint = await testAllEndpoints();
  await createWorkingDeploymentScript(workingEndpoint);
}

main().catch(console.error);
