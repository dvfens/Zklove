import { config } from '../config';
import SelfProtocolService from './SelfProtocolService';
import VerificationService from './VerificationService';

/**
 * App Initialization Service
 * Handles initialization of all services with proper configuration
 */
class AppInitializationService {
  private static instance: AppInitializationService;
  private isInitialized = false;

  static getInstance(): AppInitializationService {
    if (!AppInitializationService.instance) {
      AppInitializationService.instance = new AppInitializationService();
    }
    return AppInitializationService.instance;
  }

  /**
   * Initialize all services with configuration
   */
  async initializeAllServices(): Promise<void> {
    if (this.isInitialized) {
      console.log('Services already initialized');
      return;
    }

    console.log('Initializing all services...');

    try {
      // Initialize Self Protocol Service
      await this.initializeSelfProtocol();
      
      // Initialize Verification Service with ML configuration
      await this.initializeVerificationService();
      
      this.isInitialized = true;
      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Initialize Self Protocol Service
   */
  private async initializeSelfProtocol(): Promise<void> {
    try {
      const selfProtocolService = SelfProtocolService.getInstance();
      await selfProtocolService.initialize();
      console.log('Self Protocol service initialized');
    } catch (error) {
      console.warn('Self Protocol initialization failed:', error);
      // Continue without Self Protocol if it fails
    }
  }

  /**
   * Initialize Verification Service with ML configuration
   */
  private async initializeVerificationService(): Promise<void> {
    try {
      const verificationService = VerificationService.getInstance();
      
      // Configure ML services
      const mlConfig = {
        faceDetection: {
          endpoint: config.ml.faceDetection.endpoint,
          apiKey: config.ml.faceDetection.apiKey,
          model: config.ml.faceDetection.model,
          timeout: config.ml.faceDetection.timeout,
          retryAttempts: config.ml.faceDetection.retryAttempts
        },
        documentOcr: {
          endpoint: config.ml.documentOcr.endpoint,
          apiKey: config.ml.documentOcr.apiKey,
          model: config.ml.documentOcr.model,
          timeout: config.ml.documentOcr.timeout,
          retryAttempts: config.ml.documentOcr.retryAttempts
        },
        thresholds: config.ml.thresholds
      };

      verificationService.configureMachineLearning(mlConfig);
      console.log('Verification service initialized with ML configuration');
    } catch (error) {
      console.warn('Verification service initialization failed:', error);
      // Continue without ML configuration if it fails
    }
  }

  /**
   * Check if services are initialized
   */
  isServicesInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): {
    isInitialized: boolean;
    services: {
      selfProtocol: boolean;
      verification: boolean;
    };
  } {
    return {
      isInitialized: this.isInitialized,
      services: {
        selfProtocol: this.isInitialized,
        verification: this.isInitialized
      }
    };
  }
}

export default AppInitializationService;
