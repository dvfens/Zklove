// Test different RPC endpoints to find one that works
const { ethers } = require('ethers');

const RPC_ENDPOINTS = [
  'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  'https://rpc.ankr.com/polygon_mumbai',
  'https://polygon-testnet.public.blastapi.io',
  'https://matic-mumbai.chainstacklabs.com',
  'https://rpc-mumbai.maticvigil.com',
  'https://polygon-mumbai.g.alchemy.com/v2/demo',
  'https://polygon-mumbai.chainstacklabs.com',
  'https://polygon-mumbai.quiknode.pro/',
  'https://polygon-mumbai.infura.io/v3/',
  'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
];

async function testEndpoint(rpcUrl) {
  try {
    console.log(`Testing: ${rpcUrl}`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    const connectionPromise = provider.getBlockNumber();
    const blockNumber = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log(`✅ SUCCESS: Block ${blockNumber}`);
    return { success: true, rpcUrl, blockNumber };
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return { success: false, rpcUrl, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log('🔍 Testing RPC endpoints...\n');
  
  const results = [];
  for (const rpcUrl of RPC_ENDPOINTS) {
    const result = await testEndpoint(rpcUrl);
    results.push(result);
    console.log(''); // Empty line for readability
  }
  
  const workingEndpoints = results.filter(r => r.success);
  
  if (workingEndpoints.length > 0) {
    console.log('🎉 Working endpoints found:');
    workingEndpoints.forEach(r => {
      console.log(`✅ ${r.rpcUrl} (Block: ${r.blockNumber})`);
    });
  } else {
    console.log('❌ No working endpoints found.');
    console.log('\n💡 Possible solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Try using a VPN');
    console.log('3. Check if your firewall is blocking requests');
    console.log('4. Use mock mode for development');
  }
}

testAllEndpoints();
