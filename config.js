// zkLove Configuration
// Fill in your actual API keys and endpoints here

// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const INFURA_IPFS_PROJECT_ID = process.env.INFURA_IPFS_PROJECT_ID;
const INFURA_IPFS_SECRET = process.env.INFURA_IPFS_SECRET;
const AZURE_SUBSCRIPTION_KEY = process.env.AZURE_SUBSCRIPTION_KEY;
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const IDENTITY_VERIFICATION_CONTRACT = process.env.IDENTITY_VERIFICATION_CONTRACT;
const MERKLE_TREE_CONTRACT = process.env.MERKLE_TREE_CONTRACT;

// Self Protocol Configuration
const SELF_PROTOCOL_API_KEY = process.env.SELF_PROTOCOL_API_KEY;
const SELF_PROTOCOL_SECRET_KEY = process.env.SELF_PROTOCOL_SECRET_KEY;
const SELF_PROTOCOL_ENDPOINT = process.env.SELF_PROTOCOL_ENDPOINT || 'https://api.selfprotocol.com/v1';
const SELF_PROTOCOL_VERIFICATION_ENDPOINT = process.env.SELF_PROTOCOL_VERIFICATION_ENDPOINT || 'https://verification.selfprotocol.com';
const SELF_PROTOCOL_DATA_RETENTION_DAYS = process.env.SELF_PROTOCOL_DATA_RETENTION_DAYS || 7;
const SELF_PROTOCOL_ENABLE_BIOMETRIC_STORAGE = process.env.SELF_PROTOCOL_ENABLE_BIOMETRIC_STORAGE === 'true';
const SELF_PROTOCOL_PRIVACY_LEVEL = process.env.SELF_PROTOCOL_PRIVACY_LEVEL || 'enhanced';

export const config = {
  // =============================================================================
  // MACHINE LEARNING APIs - AWS Rekognition & Textract Configuration
  // =============================================================================
  ml: {
    faceDetection: {
      // AWS Rekognition for face detection
      endpoint: 'https://rekognition.us-east-1.amazonaws.com',
      apiKey: AWS_ACCESS_KEY_ID,
      model: 'aws-rekognition',
      timeout: 30000,
      retryAttempts: 3
    },
    
    documentOcr: {
      // AWS Textract for document OCR
      endpoint: 'https://textract.us-east-1.amazonaws.com',
      apiKey: AWS_ACCESS_KEY_ID,
      model: 'aws-textract',
      timeout: 30000,
      retryAttempts: 3
    },
    
    thresholds: {
      minFaceConfidence: 0.75,
      minLivenessScore: 0.8,
      minDocumentConfidence: 0.8,
      minOverallScore: 0.8,
      faceMatchThreshold: 0.85
    }
  },

  // =============================================================================
  // BLOCKCHAIN CONFIGURATION - Configure your blockchain network
  // =============================================================================
  blockchain: {
    network: 'polygon', // ethereum, polygon, arbitrum
    testnet: true, // Set to false for mainnet
    
    rpcUrls: {
      ethereum: {
        mainnet: 'https://eth.llamarpc.com',
        sepolia: 'https://sepolia.infura.io/v3/' + INFURA_PROJECT_ID
      },
      polygon: {
        mainnet: 'https://polygon.llamarpc.com',
        mumbai: 'https://polygon-mumbai.infura.io/v3/' + INFURA_PROJECT_ID
      },
      arbitrum: {
        mainnet: 'https://arbitrum.llamarpc.com',
        sepolia: 'https://arbitrum-sepolia.infura.io/v3/' + INFURA_PROJECT_ID
      }
    },
    
    contracts: {
      identityVerification: IDENTITY_VERIFICATION_CONTRACT || '0x742d35Cc6634C0532925a3b8D0C9f2e4cC9a2d15',
      merkleTree: MERKLE_TREE_CONTRACT || '0x1234567890123456789012345678901234567890',
      zkDating: process.env.ZK_DATING_CONTRACT || '0x8ba1f109551bD432803012645Hac136c8f4c7A6e'
    },
    
    // Use mock mode when blockchain is unavailable
    useMockBlockchain: true,
    
    gas: {
      maxGasPrice: '20000000000', // 20 gwei
      gasLimit: '500000'
    }
  },

  // =============================================================================
  // IPFS STORAGE - Configure decentralized storage
  // =============================================================================
  ipfs: {
    // Pinata (Recommended for production)
    pinata: {
      apiUrl: 'https://api.pinata.cloud',
      apiKey: PINATA_API_KEY,
      secretKey: PINATA_SECRET_KEY,
      gatewayUrl: 'https://gateway.pinata.cloud/ipfs/'
    },
    
    // Infura IPFS (Alternative)
    infura: {
      projectId: INFURA_IPFS_PROJECT_ID,
      secret: INFURA_IPFS_SECRET,
      apiUrl: 'https://ipfs.infura.io:5001',
      gatewayUrl: 'https://ipfs.infura.io/ipfs/'
    },
    
    publicGateway: 'https://ipfs.io/ipfs/'
  },

  // =============================================================================
  // EXTERNAL SERVICES - Configure your cloud ML providers
  // =============================================================================
  externalServices: {
    // AWS Services
    aws: {
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      rekognition: {
        endpoint: 'https://rekognition.us-east-1.amazonaws.com'
      },
      textract: {
        endpoint: 'https://textract.us-east-1.amazonaws.com'
      }
    },
    
    // Azure Cognitive Services
    azure: {
      subscriptionKey: AZURE_SUBSCRIPTION_KEY,
      endpoint: AZURE_ENDPOINT,
      faceApi: {
        endpoint: AZURE_ENDPOINT + 'face/v1.0'
      },
      formRecognizer: {
        endpoint: AZURE_ENDPOINT + 'formrecognizer/v2.1'
      }
    },
    
    // Google Cloud Services
    googleCloud: {
      projectId: GOOGLE_PROJECT_ID,
      apiKey: GOOGLE_API_KEY,
      vision: {
        endpoint: 'https://vision.googleapis.com/v1'
      },
      documentAi: {
        endpoint: 'https://documentai.googleapis.com/v1'
      }
    }
  },


  // =============================================================================
  // SELF PROTOCOL CONFIGURATION - Privacy-First Identity Verification
  // =============================================================================
  selfProtocol: {
    // SDK Configuration
    appId: SELF_PROTOCOL_API_KEY,
    appSecret: SELF_PROTOCOL_SECRET_KEY,
    baseUrl: SELF_PROTOCOL_ENDPOINT,
    verificationEndpoint: SELF_PROTOCOL_VERIFICATION_ENDPOINT,
    qrCodeEndpoint: process.env.SELF_PROTOCOL_QR_ENDPOINT || 'https://qr.selfprotocol.com',
    proofEndpoint: process.env.SELF_PROTOCOL_PROOF_ENDPOINT || 'https://api.self.xyz/v1/proof',
    
    // Privacy Settings
    dataRetentionDays: parseInt(SELF_PROTOCOL_DATA_RETENTION_DAYS),
    enableBiometricStorage: SELF_PROTOCOL_ENABLE_BIOMETRIC_STORAGE,
    privacyLevel: SELF_PROTOCOL_PRIVACY_LEVEL,
    
    // Zero-Knowledge Proof Configuration
    circuits: {
      wasmUrl: process.env.SELF_PROTOCOL_CIRCUIT_URL || 'https://circuits.selfprotocol.com/identity_verification.wasm',
      zkeyUrl: process.env.SELF_PROTOCOL_ZKEY_URL || 'https://circuits.selfprotocol.com/identity_verification_final.zkey',
      verificationKeyUrl: process.env.SELF_PROTOCOL_VERIFICATION_KEY_URL || 'https://circuits.selfprotocol.com/verification_key.json'
    },
    
    // Verification Settings
    verification: {
      timeout: 60000, // 60 seconds
      maxRetries: 3,
      confidenceThreshold: 0.8,
      riskThreshold: 0.3
    },
    
    // Privacy-Preserving Features
    privacy: {
      enableSybilResistance: true,
      enableAgeVerification: true,
      enableCountryVerification: true,
      enableSanctionsCheck: true,
      enableLivenessDetection: true
    }
  },

  // =============================================================================
  // FEATURE FLAGS - Enable/disable features
  // =============================================================================
  features: {
    enableBlockchainSubmission: true,
    enableIpfsStorage: true,
    enableBiometricMatching: true,
    enableLivenessDetection: true,
    enableDocumentVerification: true,
    enableZkProofs: true,
    enableWalletIntegration: true,
    enableSelfProtocol: true
  },

  // =============================================================================
  // DEVELOPMENT SETTINGS
  // =============================================================================
  development: {
    debug: {
      enabled: true, // Set to false in production
      logLevel: 'debug',
      enableMockData: true // Falls back to mock data when APIs fail
    }
  },

  // =============================================================================
  // OTHER SETTINGS
  // =============================================================================
  zkProofs: {
    circuits: {
      wasmUrl: 'https://your-cdn.com/identity_verification.wasm',
      zkeyUrl: 'https://your-cdn.com/identity_verification_final.zkey',
      verificationKeyUrl: 'https://your-cdn.com/verification_key.json'
    },
    generation: {
      timeout: 60000,
      maxConstraints: 1000000
    }
  },

  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      hashAlgorithm: 'SHA256',
      saltRounds: 12
    },
    wallet: {
      encryptionEnabled: true,
      backupEnabled: true,
      mnemonicWords: 12
    }
  },

  cache: {
    ml: {
      enabled: true,
      ttl: 3600
    },
    blockchain: {
      enabled: true,
      ttl: 300
    }
  },

  rateLimits: {
    faceApi: 100,
    documentApi: 50,
    blockchainApi: 200
  },

};

export default config;
