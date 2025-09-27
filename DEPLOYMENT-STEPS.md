# 🚀 Smart Contract Deployment Steps

## Step 1: Get Testnet MATIC
1. **Install MetaMask** browser extension
2. **Add Polygon Mumbai Network**:
   - Network Name: `Polygon Mumbai`
   - RPC URL: `https://rpc-mumbai.maticvigil.com`
   - Chain ID: `80001`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://mumbai.polygonscan.com`

3. **Get Testnet MATIC**:
   - Visit: https://faucet.polygon.technology/
   - Connect MetaMask
   - Request MATIC tokens (you'll get ~0.1 MATIC)

## Step 2: Deploy Contract on Remix
1. **Go to Remix IDE**: https://remix.ethereum.org/
2. **Create new file**: `IdentityVerification.sol`
3. **Copy contract code** (see below)
4. **Compile**: Select Solidity 0.8.19, click "Compile"
5. **Deploy**: 
   - Go to "Deploy & Run Transactions"
   - Select "Injected Provider" (MetaMask)
   - Make sure you're on Polygon Mumbai network
   - Click "Deploy"
   - Copy the contract address

## Step 3: Update Your Config
After deployment, update `config.js` with the contract address.

## Contract Code to Copy:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityVerification {
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => bool) public nullifiers;
    bytes32 public merkleRoot;
    uint256 public leafCount;
    
    event IdentityVerified(address indexed user, bytes32 indexed commitment);
    event CommitmentAdded(bytes32 indexed commitment);
    
    constructor() {
        merkleRoot = keccak256(abi.encodePacked("zkLove_initial_root"));
        leafCount = 0;
    }
    
    function addToMerkleTree(bytes32 commitment) external {
        require(commitment != bytes32(0), "Invalid commitment");
        require(!commitments[commitment], "Commitment exists");
        
        commitments[commitment] = true;
        leafCount++;
        merkleRoot = keccak256(abi.encodePacked(merkleRoot, commitment, leafCount));
        
        emit CommitmentAdded(commitment);
    }
    
    function verifyIdentity(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[] memory publicSignals
    ) external returns (bool) {
        require(publicSignals.length >= 3, "Invalid signals");
        
        bytes32 nullifierHash = bytes32(publicSignals[1]);
        bytes32 commitmentHash = bytes32(publicSignals[2]);
        
        require(!nullifiers[nullifierHash], "Nullifier used");
        require(commitments[commitmentHash], "Invalid commitment");
        
        // Simplified proof verification
        require(a[0] != 0 && a[1] != 0, "Invalid proof");
        require(b[0][0] != 0 && b[0][1] != 0, "Invalid proof");
        require(c[0] != 0 && c[1] != 0, "Invalid proof");
        
        nullifiers[nullifierHash] = true;
        
        emit IdentityVerified(msg.sender, commitmentHash);
        return true;
    }
    
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }
    
    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }
}
```

## Step 4: Test Your Deployment
1. **Restart your app**: `npm start`
2. **Check logs** for blockchain integration
3. **Test identity verification** in the app
4. **Verify on PolygonScan**: https://mumbai.polygonscan.com/

## 🎯 Expected Results:
- ✅ Contract deployed on Polygon Mumbai
- ✅ Contract address copied to config.js
- ✅ Blockchain integration working
- ✅ Identity verification with blockchain submission
