// zkLove - Decentralized Identity Verification Configuration
// Copy this file to config.js and fill in your actual values

export const config = {
  // =============================================================================
  // MACHINE LEARNING APIs
  // =============================================================================
  ml: {
    // Face Detection API (e.g., AWS Rekognition, Azure Face API, Google Vision)
    faceDetection: {
      endpoint: 'https://api.faceapi.com/detect',
      apiKey: 'your_face_api_key_here',
      model: 'vision-transformer-v1',
      timeout: 30000,
      retryAttempts: 3
    },
    
    // Document OCR API (e.g., AWS Textract, Azure Form Recognizer, Google Document AI)
    documentOcr: {
      endpoint: 'https://api.textract.com/analyze',
      apiKey: 'your_document_api_key_here',
      model: 'document-ocr-v2',
      timeout: 30000,
      retryAttempts: 3
    },
    
    // Thresholds
    thresholds: {
      minFaceConfidence: 0.75,
      minLivenessScore: 0.8,
      minDocumentConfidence: 0.8,
      minOverallScore: 0.8,
      faceMatchThreshold: 0.85
    }
  },

  // =============================================================================
  // BLOCKCHAIN CONFIGURATION
  // =============================================================================
  blockchain: {
    // Network Configuration
    network: 'polygon',
    testnet: true,
    
    // RPC Endpoints
    rpcUrls: {
      ethereum: {
        mainnet: 'https://eth-mainnet.g.alchemy.com/v2/your_api_key',
        sepolia: 'https://eth-sepolia.g.alchemy.com/v2/your_api_key'
      },
      polygon: {
        mainnet: 'https://polygon-mainnet.g.alchemy.com/v2/your_api_key',
        mumbai: 'https://polygon-mumbai.g.alchemy.com/v2/your_api_key'
      },
      arbitrum: {
        mainnet: 'https://arb-mainnet.g.alchemy.com/v2/your_api_key',
        sepolia: 'https://arb-sepolia.g.alchemy.com/v2/your_api_key'
      }
    },
    
    // Smart Contract Addresses
    contracts: {
      identityVerification: '0x1234567890123456789012345678901234567890',
      merkleTree: '0x2345678901234567890123456789012345678901'
    },
    
    // Gas Configuration
    gas: {
      maxGasPrice: '20000000000', // 20 gwei
      gasLimit: '500000'
    }
  },

  // =============================================================================
  // IPFS CONFIGURATION
  // =============================================================================
  ipfs: {
    // Pinata Configuration
    pinata: {
      apiUrl: 'https://api.pinata.cloud',
      apiKey: 'your_pinata_api_key',
      secretKey: 'your_pinata_secret_key',
      gatewayUrl: 'https://gateway.pinata.cloud/ipfs/'
    },
    
    // Infura IPFS Configuration
    infura: {
      projectId: 'your_infura_project_id',
      secret: 'your_infura_secret',
      apiUrl: 'https://ipfs.infura.io:5001',
      gatewayUrl: 'https://ipfs.infura.io/ipfs/'
    },
    
    // Public IPFS Gateway
    publicGateway: 'https://ipfs.io/ipfs/'
  },

  // =============================================================================
  // ZERO-KNOWLEDGE PROOF CONFIGURATION
  // =============================================================================
  zkProofs: {
    // Circuit Files
    circuits: {
      wasmUrl: 'https://your-cdn.com/identity_verification.wasm',
      zkeyUrl: 'https://your-cdn.com/identity_verification_final.zkey',
      verificationKeyUrl: 'https://your-cdn.com/verification_key.json'
    },
    
    // Proof Generation Settings
    generation: {
      timeout: 60000, // 60 seconds
      maxConstraints: 1000000
    }
  },

  // =============================================================================
  // EXTERNAL SERVICES
  // =============================================================================
  externalServices: {
    // AWS Services
    aws: {
      region: 'us-east-1',
      accessKeyId: 'your_aws_access_key',
      secretAccessKey: 'your_aws_secret_key',
      
      // Rekognition
      rekognition: {
        endpoint: 'https://rekognition.us-east-1.amazonaws.com'
      },
      
      // Textract
      textract: {
        endpoint: 'https://textract.us-east-1.amazonaws.com'
      }
    },
    
    // Azure Cognitive Services
    azure: {
      subscriptionKey: 'your_azure_key',
      endpoint: 'https://your-region.cognitiveservices.azure.com/',
      
      // Face API
      faceApi: {
        endpoint: 'https://your-region.cognitiveservices.azure.com/face/v1.0'
      },
      
      // Form Recognizer
      formRecognizer: {
        endpoint: 'https://your-region.cognitiveservices.azure.com/formrecognizer/v2.1'
      }
    },
    
    // Google Cloud Services
    googleCloud: {
      projectId: 'your_project_id',
      apiKey: 'your_google_api_key',
      
      // Vision API
      vision: {
        endpoint: 'https://vision.googleapis.com/v1'
      },
      
      // Document AI
      documentAi: {
        endpoint: 'https://documentai.googleapis.com/v1'
      }
    }
  },

  // =============================================================================
  // SECURITY CONFIGURATION
  // =============================================================================
  security: {
    // Encryption
    encryption: {
      algorithm: 'AES-256-GCM',
      hashAlgorithm: 'SHA256',
      saltRounds: 12
    },
    
    // Wallet Security
    wallet: {
      encryptionEnabled: true,
      backupEnabled: true,
      mnemonicWords: 12
    }
  },

  // =============================================================================
  // DEVELOPMENT CONFIGURATION
  // =============================================================================
  development: {
    // Debug Settings
    debug: {
      enabled: true,
      logLevel: 'debug',
      enableMockData: true
    },
    
    // Local Development URLs
    localUrls: {
      blockchain: 'http://localhost:8545',
      ipfs: 'http://localhost:5001'
    }
  },

  // =============================================================================
  // FEATURE FLAGS
  // =============================================================================
  features: {
    enableBlockchainSubmission: true,
    enableIpfsStorage: true,
    enableBiometricMatching: true,
    enableLivenessDetection: true,
    enableDocumentVerification: true,
    enableZkProofs: true,
    enableWalletIntegration: true
  },

  // =============================================================================
  // CACHE CONFIGURATION
  // =============================================================================
  cache: {
    ml: {
      enabled: true,
      ttl: 3600 // 1 hour
    },
    blockchain: {
      enabled: true,
      ttl: 300 // 5 minutes
    }
  },

  // =============================================================================
  // RATE LIMITING
  // =============================================================================
  rateLimits: {
    faceApi: 100,
    documentApi: 50,
    blockchainApi: 200
  }
};

export default config;
