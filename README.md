# 🔐 zkLove - Privacy-First Dating with Zero-Knowledge Identity

A revolutionary dating app that combines **privacy-first identity verification** with **anonymous matching** using **Self Protocol** and **zero-knowledge proofs**. Experience meaningful connections without compromising your privacy.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.10-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)

## ✨ Features

### 🔒 Privacy-First Identity Verification
- **Zero-Knowledge Proofs**: Verify identity without exposing personal data
- **Self Protocol Integration**: Industry-leading privacy-preserving verification
- **Sybil Resistance**: Prevent duplicate identities using cryptographic nullifiers
- **Age Verification**: Confirm age requirements without revealing birth date
- **Country Verification**: Check nationality without exposing location
- **Sanctions Screening**: Private screening against sanctions lists

### 💕 Anonymous Dating Experience
- **Aura Point System**: Progressive profile reveal based on compatibility
- **Swipe Deck Interface**: Intuitive matching with privacy protection
- **Compatibility Scoring**: AI-powered matching without data exposure
- **Anonymous Messaging**: Chat before revealing personal information
- **Photo Verification**: Secure image storage with IPFS integration

### 🚀 Technical Excellence
- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type-safe development experience
- **Capacitor Integration**: Native mobile app capabilities
- **Blockchain Ready**: Smart contract integration for verification storage
- **IPFS Storage**: Decentralized image and data storage
- **Local Build Support**: Build without cloud dependencies

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Identity**: Self Protocol, Zero-Knowledge Proofs
- **Storage**: IPFS, AsyncStorage
- **Blockchain**: Ethereum, Polygon, Ethers.js
- **Mobile**: Capacitor, Android Studio
- **Crypto**: SnarkJS, Noble Curves

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zklove.git
   cd zklove
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm start
   ```

### Building for Production

#### Android APK
```bash
# Development build
npm run android

# Production build
npm run build:local:android:release
```

#### iOS App
```bash
# Development build (macOS only)
npm run ios

# Production build
npm run build:local:ios
```

#### Web App
```bash
# Development server
npm run web

# Production build
npm run build:production
```

## 📱 Platform Support

| Platform | Status | Build Command |
|----------|--------|---------------|
| Android | ✅ Supported | `npm run build:local:android` |
| iOS | ✅ Supported | `npm run build:local:ios` |
| Web | ✅ Supported | `npm run build:production` |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Self Protocol Configuration
SELF_PROTOCOL_API_KEY=your_api_key
SELF_PROTOCOL_BASE_URL=https://api.selfprotocol.com

# Blockchain Configuration
BLOCKCHAIN_NETWORK=polygon_mumbai
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your_key
PRIVATE_KEY=your_private_key

# IPFS Configuration
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret

# App Configuration
APP_NAME=zkLove
APP_VERSION=1.0.0
```

### Self Protocol Setup

1. **Get API Key**: Sign up at [Self Protocol](https://selfprotocol.com)
2. **Configure Verification**: Set up your verification requirements
3. **Test Integration**: Use the provided test scripts

## 🏗️ Project Structure

```
zklove/
├── app/                    # Expo Router pages
├── components/             # React components
│   ├── dating/            # Dating-specific components
│   ├── verification/      # Identity verification components
│   └── ui/                # Reusable UI components
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
├── circuits/              # Zero-knowledge proof circuits
├── contracts/             # Smart contracts
├── android/               # Android native project
├── assets/                # Images and static assets
└── scripts/               # Build and deployment scripts
```

## 🔐 Privacy & Security

### Zero-Knowledge Proofs
- **Identity Verification**: Prove identity without revealing personal data
- **Age Verification**: Confirm age without exposing birth date
- **Country Verification**: Verify nationality without location data
- **Sybil Resistance**: Prevent duplicate accounts using nullifier hashes

### Data Protection
- **Local Processing**: Biometric data processed locally
- **Encrypted Storage**: All sensitive data encrypted at rest
- **No Data Collection**: No personal information stored on servers
- **Selective Disclosure**: Users control what information to share

## 🧪 Testing

```bash
# Run linting
npm run lint

# Test verification flow
npm run test-verification

# Clear cache
npm run clear-cache
```

## 📦 Deployment

### Local Builds (No EAS Required)

```bash
# Android APK
npm run build:local:android:release

# iOS App
npm run build:local:ios

# Web App
npm run build:production
```

### Cloud Deployment

```bash
# Deploy to EAS (optional)
npm run build:android
npm run build:ios
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Self Protocol](https://selfprotocol.com) for privacy-first identity verification
- [Expo](https://expo.dev) for the amazing development platform
- [React Native](https://reactnative.dev) for cross-platform mobile development
- [IPFS](https://ipfs.io) for decentralized storage

## 📞 Support

- 📧 Email: support@zklove.app
- 💬 Discord: [Join our community](https://discord.gg/zklove)
- 📖 Documentation: [docs.zklove.app](https://docs.zklove.app)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/zklove/issues)

---

Made with ❤️ for privacy-first connections on Web3.

**zkLove** - Where privacy meets passion 💕
