import { config as defaultConfig } from '../config.example';

export interface MLConfig {
  faceDetectionEndpoint: string;
  documentOcrEndpoint: string;
  apiKeys: {
    faceApi: string;
    documentApi: string;
  };
  timeout: number;
  retryAttempts: 3;
}

export interface BlockchainConfig {
  network: string;
  testnet: boolean;
  rpcUrl: string;
  contractAddress: string;
  gasLimit: string;
  maxGasPrice: string;
}

export interface IPFSConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  gatewayUrl: string;
}

class ConfigService {
  private static instance: ConfigService;
  private config: any;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      // Try to load user config, fallback to example config
      this.config = require('../config.js').default || defaultConfig;
    } catch (error) {
      console.warn('User config not found, using example config:', error);
      this.config = defaultConfig;
    }
  }

  // ML Configuration
  getMLConfig(): MLConfig {
    return {
      faceDetectionEndpoint: this.config.ml.faceDetection.endpoint,
      documentOcrEndpoint: this.config.ml.documentOcr.endpoint,
      apiKeys: {
        faceApi: this.config.ml.faceDetection.apiKey,
        documentApi: this.config.ml.documentOcr.apiKey
      },
      timeout: this.config.ml.faceDetection.timeout,
      retryAttempts: this.config.ml.faceDetection.retryAttempts
    };
  }

  // Blockchain Configuration
  getBlockchainConfig(): BlockchainConfig {
    const network = this.config.blockchain.network;
    const isTestnet = this.config.blockchain.testnet;
    
    let rpcUrl: string;
    if (network === 'ethereum') {
      rpcUrl = isTestnet 
        ? this.config.blockchain.rpcUrls.ethereum.sepolia 
        : this.config.blockchain.rpcUrls.ethereum.mainnet;
    } else if (network === 'polygon') {
      rpcUrl = isTestnet 
        ? this.config.blockchain.rpcUrls.polygon.mumbai 
        : this.config.blockchain.rpcUrls.polygon.mainnet;
    } else if (network === 'arbitrum') {
      rpcUrl = isTestnet 
        ? this.config.blockchain.rpcUrls.arbitrum.sepolia 
        : this.config.blockchain.rpcUrls.arbitrum.mainnet;
    } else {
      rpcUrl = this.config.blockchain.rpcUrls.polygon.mumbai; // default
    }

    return {
      network,
      testnet: isTestnet,
      rpcUrl,
      contractAddress: this.config.blockchain.contracts.identityVerification,
      gasLimit: this.config.blockchain.gas.gasLimit,
      maxGasPrice: this.config.blockchain.gas.maxGasPrice
    };
  }

  // IPFS Configuration
  getIPFSConfig(): IPFSConfig {
    // Prefer Pinata, fallback to Infura, then public
    if (this.config.ipfs.pinata.apiKey && this.config.ipfs.pinata.secretKey) {
      return {
        apiUrl: this.config.ipfs.pinata.apiUrl,
        apiKey: this.config.ipfs.pinata.apiKey,
        secretKey: this.config.ipfs.pinata.secretKey,
        gatewayUrl: this.config.ipfs.pinata.gatewayUrl
      };
    } else if (this.config.ipfs.infura.projectId && this.config.ipfs.infura.secret) {
      return {
        apiUrl: this.config.ipfs.infura.apiUrl,
        apiKey: this.config.ipfs.infura.projectId,
        secretKey: this.config.ipfs.infura.secret,
        gatewayUrl: this.config.ipfs.infura.gatewayUrl
      };
    } else {
      return {
        apiUrl: '',
        apiKey: '',
        secretKey: '',
        gatewayUrl: this.config.ipfs.publicGateway
      };
    }
  }

  // Feature Flags
  isFeatureEnabled(feature: string): boolean {
    return this.config.features[feature] ?? false;
  }

  // Thresholds
  getThresholds() {
    return this.config.ml.thresholds;
  }

  // External Service Configs
  getAWSConfig() {
    return this.config.externalServices.aws;
  }

  getAzureConfig() {
    return this.config.externalServices.azure;
  }

  getGoogleCloudConfig() {
    return this.config.externalServices.googleCloud;
  }

  // Development Settings
  isDevelopment(): boolean {
    return this.config.development.debug.enabled;
  }

  isMockDataEnabled(): boolean {
    return this.config.development.debug.enableMockData;
  }

  // Cache Settings
  getCacheConfig() {
    return this.config.cache;
  }

  // Rate Limits
  getRateLimits() {
    return this.config.rateLimits;
  }

  // ZK Proof Settings
  getZKConfig() {
    return this.config.zkProofs;
  }

  // Security Settings
  getSecurityConfig() {
    return this.config.security;
  }
}

export default ConfigService;
