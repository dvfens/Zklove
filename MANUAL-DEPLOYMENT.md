# Manual Contract Deployment Guide

Since there are network connectivity issues with automated deployment, here's how to deploy manually:

## 🚀 Option 1: Use Remix IDE (Recommended)

1. **Go to Remix IDE**: <https://remix.ethereum.org/>
2. **Create new file**: `IdentityVerification.sol`
3. **Copy the contract code** from `contracts/IdentityVerification.sol`
4. **Compile the contract** (Solidity 0.8.19)
5. **Deploy to Polygon Mumbai**:
   - Select "Injected Provider" (MetaMask)
   - Switch to Polygon Mumbai network
   - Get testnet MATIC from faucet
   - Deploy contract
   - Copy the contract address

## 🔗 Option 2: Use Polygon Faucet & MetaMask

1. **Install MetaMask** browser extension
2. **Add Polygon Mumbai network**:
   - Network Name: Polygon Mumbai
   - RPC URL: <https://rpc-mumbai.maticvigil.com>
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: <https://mumbai.polygonscan.com>

3. **Get testnet MATIC**:
   - Visit: <https://faucet.polygon.technology/>
   - Connect MetaMask
   - Request MATIC tokens

4. **Deploy using Remix**:
   - Connect MetaMask to Remix
   - Deploy the contract
   - Copy contract address

## 📝 Option 3: Use Hardhat (If network works)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Create hardhat.config.js
# Deploy with: npx hardhat run scripts/deploy.js --network mumbai
```

## 🔧 Update Your Config

After deployment, update `config.js`:

```javascript
contracts: {
  identityVerification: '0xYourDeployedContractAddress',
  merkleTree: '0xYourDeployedContractAddress'
}
```

## 🧪 Test Your Deployment

1. **Restart your app**: `npm start`
2. **Check logs** for blockchain integration
3. **Test identity verification** in the app
4. **Verify on PolygonScan**: <https://mumbai.polygonscan.com/>

## 🆘 If You Can't Deploy

Your app will still work with:

- ✅ AWS face detection and text extraction
- ✅ ZK proof generation and verification
- ✅ Local verification and scoring
- ⚠️ Blockchain submission will fail (but app continues)

The core identity verification works without blockchain integration!
