# zkLove - Zero-Knowledge Dating App Deployment Guide

## 🚀 Overview

zkLove is a privacy-first dating application that uses zero-knowledge proofs to enable anonymous matching while verifying compatibility on-chain. This guide covers deployment and setup of the complete system.

## 🏗️ Architecture

### Smart Contracts
- **IdentityVerification.sol**: Handles identity verification using ZK proofs
- **ZKDatingContract.sol**: Manages dating profiles, matching, and aura system

### Zero-Knowledge Circuits
- **profile_commitment.circom**: Creates commitments to profile data
- **compatibility_check.circom**: Proves compatibility without revealing data

### Services
- **ZKDatingService**: Blockchain interaction layer
- **ZKProofService**: ZK proof generation and verification

## 📋 Prerequisites

### System Requirements
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Expo CLI >= 6.0.0
```

### Development Tools
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install dependencies
npm install

# For contract development (optional)
npm install -g hardhat
```

### Testnet Setup
1. **Get Testnet Tokens**:
   - Polygon Mumbai: [Faucet](https://faucet.polygon.technology/)
   - Ethereum Sepolia: [Faucet](https://sepoliafaucet.com/)

2. **Create Wallet**:
   ```bash
   # Generate new wallet or use existing
   export DEPLOYER_PRIVATE_KEY="your_private_key_here"
   ```

## 🔧 Installation & Setup

### 1. Clone and Install
```bash
git clone <your-repo>
cd zkLove
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
# Blockchain Configuration
DEPLOYER_PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
ZK_DATING_CONTRACT=will_be_set_after_deployment
IDENTITY_VERIFICATION_CONTRACT=will_be_set_after_deployment

# IPFS Configuration (optional)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Self Protocol (for identity verification)
SELF_PROTOCOL_API_KEY=your_self_protocol_key
SELF_PROTOCOL_SECRET_KEY=your_self_protocol_secret
```

### 3. Deploy Smart Contracts

#### Option A: Using Deployment Script
```bash
# Deploy to Polygon Mumbai (recommended for testing)
node scripts/deploy-contracts.js polygon_mumbai

# Deploy to Ethereum Sepolia
node scripts/deploy-contracts.js ethereum_sepolia
```

#### Option B: Manual Deployment
```bash
# Compile contracts (requires Hardhat setup)
npx hardhat compile

# Deploy identity verification first
npx hardhat run scripts/deploy-identity.js --network mumbai

# Deploy dating contract
npx hardhat run scripts/deploy-dating.js --network mumbai
```

### 4. Verify Deployment
Check `deployment.json` for contract addresses:
```json
{
  "network": "Polygon Mumbai Testnet",
  "chainId": 80001,
  "contracts": {
    "identityVerification": "0x...",
    "zkDating": "0x..."
  }
}
```

## 🧪 Testing

### 1. Run Unit Tests
```bash
npm test
```

### 2. Test Contract Interactions
```bash
# Test identity verification
node test-verification-flow.js

# Test dating functionality
node test-dating-flow.js
```

### 3. Test Mobile App
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 🎯 Usage Guide

### For Users

#### 1. Identity Verification
- Open zkLove app
- Tap "Start Verification"
- Complete face and ID verification
- ZK proofs are generated locally

#### 2. Create Dating Profile
- Tap "Zero-Knowledge Dating"
- Set up anonymous profile
- Select city and hobbies
- Commitments created with ZK proofs

#### 3. Find Matches
- Swipe through anonymous cards
- Compatibility verified via ZK proofs
- Earn Aura points for mutual matches

#### 4. Unlock Details
- Spend Aura to unlock match details
- Progressive reveal: name → bio → photo → chat
- All transactions recorded on-chain

### For Developers

#### 1. Contract Interaction
```typescript
import ZKDatingService from './services/ZKDatingService';

const service = ZKDatingService.getInstance();
await service.initialize();
await service.connectWallet();

// Create profile
const profile = await service.createProfile(profileData);

// Swipe on users
await service.swipeUser({
  targetUser: '0x...',
  isLike: true,
  compatibilityProof: proof
});
```

#### 2. ZK Proof Generation
```typescript
import ZKProofService from './services/ZKProofService';

const zkService = ZKProofService.getInstance();

// Generate profile commitment
const { commitment, proof } = await zkService.generateProfileCommitmentProof(
  name, bio, avatar, age, salt
);

// Generate compatibility proof
const compatProof = await zkService.generateCompatibilityProof(
  myProfile, targetProfile
);
```

## 🔐 Security Features

### Zero-Knowledge Proofs
- **Profile Commitments**: Hide personal data behind cryptographic commitments
- **Compatibility Proofs**: Verify same city + shared hobbies without revealing them
- **Nullifier Hashes**: Prevent duplicate profiles while maintaining privacy

### On-Chain Security
- **Immutable Records**: All interactions recorded on blockchain
- **Transparent Aura System**: Fair point allocation visible to all
- **Decentralized Matching**: No central authority controls matches

### Privacy Protection
- **Anonymous Profiles**: Identity hidden until both users unlock
- **Progressive Revelation**: Gradual unlock of personal details
- **Local Proof Generation**: ZK proofs created on-device

## 🛠️ Advanced Configuration

### Custom Network Setup
```javascript
// config.js
const customNetwork = {
  name: 'Custom Network',
  rpcUrl: 'https://your-rpc-url.com',
  chainId: 12345,
  contracts: {
    identityVerification: '0x...',
    zkDating: '0x...'
  }
};
```

### IPFS Configuration
```javascript
// For decentralized image storage
const ipfsConfig = {
  pinata: {
    apiKey: 'your_key',
    secretKey: 'your_secret',
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/'
  }
};
```

### Circuit Customization
```bash
# Compile custom circuits
circom circuits/custom_circuit.circom --r1cs --wasm --sym

# Generate trusted setup
snarkjs powersoftau new bn128 12 pot12_0000.ptau
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails
```bash
# Check network connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc-mumbai.maticvigil.com

# Verify account balance
# Ensure sufficient testnet tokens for gas
```

#### 2. ZK Proof Generation Fails
```bash
# Check circuit files
ls -la circuits/
# Ensure .wasm and .zkey files are present

# Test with mock proofs in development
export NODE_ENV=development
```

#### 3. Mobile App Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset project
npm run reset-project

# Check platform-specific issues
npx expo doctor
```

### Debug Mode
```javascript
// Enable debug logging
const config = {
  development: {
    debug: {
      enabled: true,
      logLevel: 'debug',
      enableMockData: true
    }
  }
};
```

## 📊 Monitoring

### Contract Events
Monitor key events on blockchain explorer:
- `ProfileCreated`: New user registrations
- `MatchCreated`: Successful mutual matches
- `AuraEarned`: Point allocations
- `ChatUnlocked`: Revenue events

### Analytics Dashboard
```bash
# Run analytics server
node analytics/server.js

# View at http://localhost:3000/analytics
```

### Performance Metrics
- ZK proof generation time
- Contract interaction latency
- User engagement rates
- Aura economy balance

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

### Code Standards
```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Testing Requirements
- Unit tests for all services
- Integration tests for contract interactions
- E2E tests for user flows
- ZK proof verification tests

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🔗 Resources

- [Zero-Knowledge Proofs Guide](https://ethereum.org/en/zero-knowledge-proofs/)
- [Circom Documentation](https://docs.circom.io/)
- [Polygon Developer Docs](https://docs.polygon.technology/)
- [Expo Documentation](https://docs.expo.dev/)
- [Self Protocol](https://www.self.id/)

## 💬 Support

For questions and support:
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)
- Discord: [Join Community](https://discord.gg/your-invite)
- Email: support@zklove.app

---

Built with ❤️ for privacy-first digital relationships
