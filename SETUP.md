# zkLove Setup Guide

This guide will help you configure zkLove with your own API keys and services for production use.

## 📋 Quick Setup

1. **Copy the configuration file:**
   ```bash
   cp config.example.js config.js
   ```

2. **Edit `config.js`** and add your API keys (see sections below)

3. **Run the app:**
   ```bash
   npm start
   ```

## 🔑 Required API Keys

### Face Detection APIs (Choose One)

#### Option 1: AWS Rekognition
```javascript
ml: {
  faceDetection: {
    endpoint: 'https://rekognition.us-east-1.amazonaws.com',
    apiKey: 'your_aws_access_key',
    // Also set AWS credentials in externalServices.aws
  }
}
```

#### Option 2: Azure Face API
```javascript
ml: {
  faceDetection: {
    endpoint: 'https://your-region.cognitiveservices.azure.com/face/v1.0',
    apiKey: 'your_azure_subscription_key'
  }
}
```

#### Option 3: Google Vision API
```javascript
ml: {
  faceDetection: {
    endpoint: 'https://vision.googleapis.com/v1',
    apiKey: 'your_google_api_key'
  }
}
```

### Document OCR APIs (Choose One)

#### Option 1: AWS Textract
```javascript
ml: {
  documentOcr: {
    endpoint: 'https://textract.us-east-1.amazonaws.com',
    apiKey: 'your_aws_access_key'
  }
}
```

#### Option 2: Azure Form Recognizer
```javascript
ml: {
  documentOcr: {
    endpoint: 'https://your-region.cognitiveservices.azure.com/formrecognizer/v2.1',
    apiKey: 'your_azure_subscription_key'
  }
}
```

#### Option 3: Google Document AI
```javascript
ml: {
  documentOcr: {
    endpoint: 'https://documentai.googleapis.com/v1',
    apiKey: 'your_google_api_key'
  }
}
```

## 🔗 Blockchain Setup

### 1. Get RPC URLs

#### Alchemy (Recommended)
1. Sign up at [alchemy.com](https://alchemy.com)
2. Create an app for your chosen network
3. Copy the RPC URL

```javascript
blockchain: {
  rpcUrls: {
    polygon: {
      mumbai: 'https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY'
    }
  }
}
```

#### Infura (Alternative)
1. Sign up at [infura.io](https://infura.io)
2. Create a project
3. Copy the endpoint URL

### 2. Deploy Smart Contracts

Deploy the contracts from the `contracts/` folder to your chosen network and update the addresses:

```javascript
blockchain: {
  contracts: {
    identityVerification: '0xYourDeployedContractAddress'
  }
}
```

## 📁 IPFS Storage Setup

### Option 1: Pinata (Recommended)
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Get your API key and secret
3. Update config:

```javascript
ipfs: {
  pinata: {
    apiKey: 'your_pinata_api_key',
    secretKey: 'your_pinata_secret_key'
  }
}
```

### Option 2: Infura IPFS
1. Sign up at [infura.io](https://infura.io)
2. Create an IPFS project
3. Update config:

```javascript
ipfs: {
  infura: {
    projectId: 'your_project_id',
    secret: 'your_secret'
  }
}
```

## 🎛️ Configuration Options

### Feature Flags
Enable/disable features based on your needs:

```javascript
features: {
  enableBlockchainSubmission: true,  // Submit proofs to blockchain
  enableIpfsStorage: true,           // Store data on IPFS
  enableBiometricMatching: true,     // Face-to-ID matching
  enableLivenessDetection: true,     // Liveness detection
  enableDocumentVerification: true,  // ID document verification
  enableZkProofs: true,              // Zero-knowledge proofs
  enableWalletIntegration: true      // Web3 wallet features
}
```

### Development Mode
For testing, you can enable mock data:

```javascript
development: {
  debug: {
    enabled: true,
    enableMockData: true  // Falls back to mock data when APIs fail
  }
}
```

## 🚀 Getting API Keys

### AWS Services
1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Create IAM user with Rekognition and Textract permissions
3. Generate access keys

### Azure Cognitive Services
1. Go to [Azure Portal](https://portal.azure.com)
2. Create Cognitive Services resource
3. Copy subscription key and endpoint

### Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Vision API and Document AI API
3. Create service account and download key

### Blockchain RPC
1. **Alchemy**: [alchemy.com](https://alchemy.com) - Create app, copy RPC URL
2. **Infura**: [infura.io](https://infura.io) - Create project, copy endpoint
3. **QuickNode**: [quicknode.com](https://quicknode.com) - Create endpoint

### IPFS Storage
1. **Pinata**: [pinata.cloud](https://pinata.cloud) - Free tier available
2. **Infura IPFS**: [infura.io](https://infura.io) - Create IPFS project

## 🔒 Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** in production
3. **Rotate keys regularly**
4. **Use testnet** for development
5. **Enable rate limiting** for production APIs

## 🛠️ Troubleshooting

### Common Issues

1. **"Network request failed"**
   - Check your API keys are correct
   - Verify endpoint URLs
   - Check network connectivity

2. **"Machine learning configuration missing"**
   - Ensure you've copied and edited `config.js`
   - Check that API keys are not the placeholder values

3. **Blockchain connection fails**
   - Verify RPC URL is correct
   - Check if you're using testnet/mainnet correctly
   - Ensure you have sufficient balance for gas

### Debug Mode
Enable debug logging to troubleshoot:

```javascript
development: {
  debug: {
    enabled: true,
    logLevel: 'debug'
  }
}
```

## 📞 Support

If you need help with setup:
1. Check the console logs for specific error messages
2. Verify all API keys are correctly formatted
3. Test individual services (ML, blockchain, IPFS) separately
4. Use mock data mode for initial testing

## 🎯 Production Checklist

- [ ] All API keys configured
- [ ] Smart contracts deployed
- [ ] IPFS storage configured
- [ ] Testnet testing completed
- [ ] Security review done
- [ ] Rate limits configured
- [ ] Monitoring setup
- [ ] Backup strategies in place
