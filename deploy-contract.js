// Simple contract deployment script
// Run with: node deploy-contract.js

const { ethers } = require('ethers');

// Contract ABI (simplified)
const contractABI = [
  "constructor(bytes32 _merkleRoot)",
  "function addToMerkleTree(bytes32 commitment) external",
  "function verifyIdentity(tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) proof, uint256[] publicSignals) external returns (bool)",
  "function getMerkleRoot() external view returns (bytes32)",
  "function isNullifierUsed(bytes32 nullifier) external view returns (bool)",
  "function getVerificationCount(address user) external view returns (uint256)"
];

// Contract bytecode (you'll need to compile the contract first)
const contractBytecode = "0x608060405234801561001057600080fd5b5060405161001d9061002a565b604051809103906000f080158015610039573d6000803e3d6000fd5b505050610037565b6101a0806100466000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063150b7a021461003b5780634e1273f414610055575b600080fd5b61004361006d565b60405161004c91906100d1565b60405180910390f35b61005d610073565b60405161006a91906100d1565b60405180910390f35b60005481565b60008054905090565b6000819050919050565b61008b81610078565b82525050565b60006020820190506100a66000830184610082565b92915050565b6000604051905090565b600080fd5b600080fd5b6100c981610078565b81146100d457600080fd5b50565b6000813590506100e6816100c0565b92915050565b600060208284031215610102576101016100bb565b5b6000610110848285016100d7565b9150509291505056fea2646970667358221220...";

async function deployContract() {
  try {
    // Use the RPC URL from your config
    const provider = new ethers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    
    // Create a random wallet (for testing)
    const wallet = ethers.Wallet.createRandom().connect(provider);
    
    console.log('Deploying contract with wallet:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet balance:', ethers.formatEther(balance), 'MATIC');
    
    if (balance === 0n) {
      console.log('❌ No MATIC in wallet. Get testnet MATIC from:');
      console.log('🔗 https://faucet.polygon.technology/');
      console.log('🔗 https://mumbaifaucet.com/');
      return;
    }
    
    // Deploy contract
    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const initialMerkleRoot = ethers.keccak256(ethers.toUtf8Bytes('zkLove_initial_root'));
    
    console.log('Deploying contract...');
    const contract = await factory.deploy(initialMerkleRoot);
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Contract deployed at:', contractAddress);
    
    // Update your config.js with this address
    console.log('\n📝 Update your config.js:');
    console.log(`identityVerification: '${contractAddress}'`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get testnet MATIC from:');
      console.log('🔗 https://faucet.polygon.technology/');
      console.log('🔗 https://mumbaifaucet.com/');
    }
  }
}

deployContract();
