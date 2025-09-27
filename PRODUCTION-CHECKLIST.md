# zkLove Production Deployment Checklist

## 🚀 Pre-Deployment Setup

### 1. Environment Configuration
- [ ] Copy `env.production.template` to `.env.production`
- [ ] Set `DEPLOYER_PRIVATE_KEY` with funded wallet
- [ ] Configure `PINATA_API_KEY` and `PINATA_SECRET_KEY` for IPFS
- [ ] Set `SENTRY_DSN` for error monitoring
- [ ] Verify `RPC_URL` is working

### 2. Network Preparation
- [ ] Ensure deployer wallet has sufficient funds
  - **Mumbai Testnet**: 0.01 MATIC minimum
  - **Polygon Mainnet**: 0.1 MATIC minimum
- [ ] Test network connectivity: `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://rpc-mumbai.maticvigil.com`

### 3. Code Quality
- [ ] Run linting: `npm run lint`
- [ ] Fix all TypeScript errors
- [ ] Test app in production mode: `npm run preview:production`
- [ ] Verify all features work without network connection

## 📦 Smart Contract Deployment

### 1. Deploy to Testnet (Mumbai)
```bash
# Set environment variable
export DEPLOYER_PRIVATE_KEY="your_private_key_here"

# Deploy to Mumbai testnet
npm run deploy:mumbai
```

### 2. Verify Deployment
- [ ] Check `production-deployment.json` was created
- [ ] Verify contract addresses in block explorer
- [ ] Test contract interactions
- [ ] Verify events are emitted correctly

### 3. Contract Verification (Manual)
- [ ] Go to [Mumbai PolygonScan](https://mumbai.polygonscan.com)
- [ ] Navigate to deployed contract addresses
- [ ] Use "Verify and Publish" with source code
- [ ] Update `production-deployment.json` with `verified: true`

## 📱 Mobile App Build

### 1. Configure EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build profiles
eas build:configure
```

### 2. Build Android APK
```bash
npm run build:android
```

### 3. Build iOS App (if needed)
```bash
npm run build:ios
```

## 🌐 Web App Deployment

### 1. Build Web Version
```bash
npm run build:production
```

### 2. Deploy to Vercel/Netlify
```bash
# Vercel
vercel --prod

# Or Netlify
netlify deploy --prod --dir=dist
```

## 🔍 Testing & Validation

### 1. Smart Contract Testing
- [ ] Create test profile
- [ ] Test matching algorithm
- [ ] Test Aura point system
- [ ] Test chat unlocking
- [ ] Verify all events are logged

### 2. Mobile App Testing
- [ ] Test on Android device/emulator
- [ ] Test on iOS device/simulator
- [ ] Test offline functionality
- [ ] Test error handling
- [ ] Test wallet connection

### 3. Integration Testing
- [ ] End-to-end user flow
- [ ] Identity verification → Profile creation → Matching → Chat
- [ ] Test with multiple users
- [ ] Verify privacy features work

## 📊 Monitoring & Analytics

### 1. Set Up Monitoring
- [ ] Configure Sentry for error tracking
- [ ] Set up blockchain event monitoring
- [ ] Configure analytics dashboard
- [ ] Set up alerts for critical errors

### 2. Performance Monitoring
- [ ] Monitor app load times
- [ ] Track ZK proof generation times
- [ ] Monitor blockchain transaction times
- [ ] Track user engagement metrics

## 🔐 Security Checklist

### 1. Smart Contract Security
- [ ] Contracts deployed from secure environment
- [ ] Private keys stored securely
- [ ] Multi-sig wallet for contract ownership (recommended)
- [ ] Rate limiting implemented
- [ ] Access controls verified

### 2. App Security
- [ ] No private keys in app code
- [ ] Secure key storage implemented
- [ ] Network requests use HTTPS
- [ ] Input validation on all forms
- [ ] XSS protection enabled

## 🎯 Go-Live Checklist

### 1. Final Verification
- [ ] All contracts verified on block explorer
- [ ] App store submissions approved (if applicable)
- [ ] Domain configured and SSL enabled
- [ ] CDN configured for static assets
- [ ] Backup and recovery procedures tested

### 2. Launch Preparation
- [ ] Marketing materials ready
- [ ] User documentation complete
- [ ] Support channels established
- [ ] Legal compliance verified
- [ ] Privacy policy and terms of service published

### 3. Post-Launch Monitoring
- [ ] Monitor error rates
- [ ] Track user adoption
- [ ] Monitor contract gas usage
- [ ] Collect user feedback
- [ ] Plan feature updates

## 🆘 Troubleshooting Common Issues

### Network Connection Issues
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc-mumbai.maticvigil.com
```

### BigInt Serialization Error
- Fixed in `services/ZKProofService.ts`
- Converts BigInt to string before JSON.stringify

### Contract Deployment Failures
- Check deployer wallet balance
- Verify network connectivity
- Increase gas limit if needed
- Check for contract size limits

### App Build Failures
```bash
# Clear cache and rebuild
npm run clear-cache
rm -rf node_modules
npm install
npm run build:production
```

## 📝 Deployment Commands Reference

```bash
# Environment setup
cp env.production.template .env.production
export DEPLOYER_PRIVATE_KEY="your_key_here"

# Deploy contracts
npm run deploy:mumbai      # Testnet
npm run deploy:mainnet     # Mainnet (when ready)

# Build apps
npm run build:production   # Web
npm run build:android      # Android APK
npm run build:ios          # iOS App

# Testing
npm run preview:production # Test production build
npm run lint              # Code quality
```

## 🎉 Success Criteria

Your zkLove app is production-ready when:
- [ ] Smart contracts deployed and verified
- [ ] Mobile apps built and tested
- [ ] Web app deployed and accessible
- [ ] All user flows working end-to-end
- [ ] Monitoring and analytics configured
- [ ] Security measures implemented
- [ ] Documentation complete

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
