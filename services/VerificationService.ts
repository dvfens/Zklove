import type {
  FaceDetectionResult,
  FaceFeature,
  IDVerificationResult,
} from '@/types/verification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';
import BlockchainService from './BlockchainService';
import MoproZKService, {
  BiometricWitness,
  DecentralizedIdentity,
  DocumentInferenceResult,
  ExternalInferenceOptions,
  FaceInferenceResult,
  MLConfig,
  ZKProof,
} from './MoproZKService';


export interface VerificationSession {
  id: string;
  timestamp: number;
  faceData: FaceDetectionResult | null;
  idData: IDVerificationResult | null;
  status: 'pending' | 'face_captured' | 'id_captured' | 'generating_proof' | 'proof_generated' | 'blockchain_submitted' | 'completed' | 'failed';
  overallScore: number;
  zkProof?: ZKProof;
  decentralizedIdentity?: DecentralizedIdentity;
  blockchainTxHash?: string;
  biometricWitness?: BiometricWitness;
}

class VerificationService {
  private static instance: VerificationService;
  private currentSession: VerificationSession | null = null;
  private moproService: MoproZKService;
  private blockchainService: BlockchainService;
  private mlConfig: MLConfig | null = null;

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  constructor() {
    this.moproService = MoproZKService.getInstance();
    this.blockchainService = BlockchainService.getInstance();
    // Don't initialize blockchain services immediately - do it on-demand
  }

  configureMachineLearning(config: MLConfig) {
    this.mlConfig = config;
    this.moproService.configureMachineLearning(config);
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize with testnet configuration for development
      const blockchainConfig = {
        rpcUrl: 'https://rpc-mumbai.maticvigil.com', // Polygon Mumbai testnet (free)
        chainId: 80001, // Polygon Mumbai testnet
        contractAddress: '0x1234567890123456789012345678901234567890', // Demo contract address
        gasPrice: '20000000000', // 20 gwei
        gasLimit: '1000000'
      };
      
      console.log('Initializing blockchain services with testnet...');
      await this.blockchainService.initialize(blockchainConfig);
      this.blockchainService.setupEventListeners();
      
      console.log('Mopro ZK services initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize blockchain services (continuing in demo mode):', error);
      // Continue without blockchain functionality for demo
    }
  }

  // Initialize blockchain services on-demand
  private async ensureBlockchainInitialized(): Promise<void> {
    if (!this.blockchainService.isInitialized) {
      await this.initializeServices();
    }
  }

  async startVerificationSession(): Promise<string> {
    const sessionId = await Crypto.randomUUID();
    this.currentSession = {
      id: sessionId,
      timestamp: Date.now(),
      faceData: null,
      idData: null,
      status: 'pending',
      overallScore: 0,
    };
    
    await AsyncStorage.setItem(`verification_${sessionId}`, JSON.stringify(this.currentSession));
    return sessionId;
  }

  async detectFaces(imageUri: string, options: ExternalInferenceOptions = {}): Promise<FaceDetectionResult> {
    try {
      if (!this.mlConfig) {
        throw new Error('Machine learning configuration missing. Call configureMachineLearning first.');
      }

      const faceResult: FaceInferenceResult = await this.moproService.runFaceInference(imageUri, options);

      if (this.currentSession) {
        this.currentSession.faceData = faceResult;
        this.currentSession.status = 'face_captured';
        await this.saveSession();
      }

      return faceResult;
    } catch (error) {
      console.error('Face detection error:', error);
      
      // Provide a more helpful error message
      if (error instanceof Error && error.message.includes('digest')) {
        throw new Error('Face detection failed: Crypto digest function not available. Please ensure polyfills are loaded correctly.');
      }
      
      throw new Error(`Face detection failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  async verifyIDDocument(imageUri: string, options: ExternalInferenceOptions = {}): Promise<IDVerificationResult> {
    try {
      if (!this.mlConfig) {
        throw new Error('Machine learning configuration missing. Call configureMachineLearning first.');
      }

      const documentResult: DocumentInferenceResult = await this.moproService.runDocumentInference(imageUri, options);

      let faceMatch = 0;
      if (options.compareWithDocument && this.currentSession?.faceData && documentResult.rawResponse) {
        const response = documentResult.rawResponse as { faceImage?: string };
        if (response.faceImage) {
          const tempFile = `${FileSystem.cacheDirectory}doc-face-${Date.now()}.jpg`;
          await FileSystem.writeAsStringAsync(tempFile, response.faceImage, { encoding: FileSystem.EncodingType.Base64 });
          const comparison = await this.compareFaces(this.currentSession.faceData.imageUri, tempFile);
          faceMatch = comparison;
        }
      }

      const idResult: IDVerificationResult = {
        documentType: documentResult.documentType,
        extractedData: documentResult.extractedData,
        confidence: documentResult.confidence,
        isValid: documentResult.isValid,
        faceMatch,
        qualityScore: documentResult.qualityScore,
      };

      if (this.currentSession) {
        this.currentSession.idData = idResult;
        this.currentSession.status = 'id_captured';
        await this.saveSession();
      }

      return idResult;
    } catch (error) {
      throw new Error(`ID verification failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  async completeVerification(): Promise<VerificationSession> {
    if (!this.currentSession) {
      throw new Error('No active verification session');
    }

    if (!this.currentSession.faceData || !this.currentSession.idData) {
      throw new Error('Incomplete verification data');
    }

    try {
      // Update status to generating proof
      this.currentSession.status = 'generating_proof';
      await this.saveSession();

      // Generate biometric witness for ZK proof
      console.log('Generating biometric witness...');
      const biometricWitness = await this.moproService.generateBiometricWitness(
        this.currentSession.faceData.imageUri,
        this.currentSession.idData.extractedData
      );
      
      this.currentSession.biometricWitness = biometricWitness;

      // Create identity commitment
      console.log('Creating identity commitment...');
      const identityCommitment = await this.moproService.createIdentityCommitment(biometricWitness);

      // Generate zero-knowledge proof
      console.log('Generating zero-knowledge proof...');
      const zkProof = await this.moproService.generateZKProof(biometricWitness, identityCommitment);
      
      this.currentSession.zkProof = zkProof;
      this.currentSession.status = 'proof_generated';
      await this.saveSession();

      // Verify the proof locally first
      console.log('Verifying ZK proof locally...');
      const isProofValid = await this.moproService.verifyZKProof(zkProof);
      
      if (!isProofValid) {
        this.currentSession.status = 'failed';
        await this.saveSession();
        throw new Error('Generated proof is invalid');
      }

      // Try to initialize and submit to blockchain
      try {
        console.log('Attempting blockchain initialization...');
        await this.ensureBlockchainInitialized();
        
        if (this.blockchainService.isInitialized) {
          console.log('Submitting to blockchain...');
          this.currentSession.status = 'blockchain_submitted';
          await this.saveSession();

          // Submit identity commitment
          const commitmentTx = await this.blockchainService.submitIdentityCommitment(
            identityCommitment.commitment
          );
          
          // Verify identity on blockchain
          const verificationTx = await this.blockchainService.verifyIdentityOnChain(zkProof);
          
          this.currentSession.blockchainTxHash = verificationTx.hash;
          
          // Create decentralized identity
          const decentralizedIdentity = await this.moproService.createDecentralizedIdentity(zkProof);
          this.currentSession.decentralizedIdentity = decentralizedIdentity;
          
          console.log('Blockchain submission successful:', verificationTx.hash);
        } else {
          console.log('Blockchain not available, proceeding with local verification only');
        }
      } catch (blockchainError) {
        console.warn('Blockchain operations failed, continuing with local verification:', blockchainError);
        // Continue with local verification even if blockchain fails
      }

      // Calculate final score including ZK proof quality
      const traditionalScore = this.calculateOverallScore();
      const zkScore = await this.calculateZKScore(zkProof, biometricWitness);
      const finalScore = (traditionalScore + zkScore) / 2;
      
      this.currentSession.overallScore = finalScore;
      this.currentSession.status = finalScore >= 0.8 ? 'completed' : 'failed';
      
      await this.saveSession();
      
      console.log('Verification completed with ZK proof. Final score:', finalScore);
      return this.currentSession;
      
    } catch (error) {
      console.error('Verification failed:', error);
      this.currentSession.status = 'failed';
      await this.saveSession();
      throw error;
    }
  }

  private async analyzeImage(imageUri: string): Promise<{ width: number; height: number; size: number }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      return new Promise((resolve) => {
        Image.getSize(imageUri, (width, height) => {
          resolve({
            width,
            height,
            size: fileInfo.exists ? fileInfo.size || 0 : 0
          });
        }, () => {
          // Fallback dimensions
          resolve({ width: 640, height: 480, size: 100000 });
        });
      });
    } catch (error) {
      // Return default values on error
      return { width: 640, height: 480, size: 100000 };
    }
  }

  private async simulateFaceDetection(imageUri: string, imageInfo: { width: number; height: number }): Promise<FaceFeature[]> {
    // Simulate realistic face detection results
    // In a real implementation, you would use ML models or cloud APIs
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Generate realistic face detection result
    const faceWidth = Math.floor(imageInfo.width * 0.3); // Face is ~30% of image width
    const faceHeight = Math.floor(faceWidth * 1.3); // Face height is slightly more than width
    
    const centerX = imageInfo.width / 2;
    const centerY = imageInfo.height / 2;
    
    const face: FaceFeature = {
      bounds: {
        origin: {
          x: centerX - faceWidth / 2,
          y: centerY - faceHeight / 2
        },
        size: {
          width: faceWidth,
          height: faceHeight
        }
      },
      landmarks: {
        leftEyePosition: { x: centerX - faceWidth * 0.15, y: centerY - faceHeight * 0.1 },
        rightEyePosition: { x: centerX + faceWidth * 0.15, y: centerY - faceHeight * 0.1 },
        noseBasePosition: { x: centerX, y: centerY },
        bottomMouthPosition: { x: centerX, y: centerY + faceHeight * 0.15 }
      },
      rollAngle: (Math.random() - 0.5) * 10, // Small random rotation
      yawAngle: (Math.random() - 0.5) * 15,  // Small random yaw
      smilingProbability: Math.random() * 0.3 + 0.1 // Low to moderate smile
    };
    
    // 90% chance of detecting a face (simulating real-world conditions)
    return Math.random() > 0.1 ? [face] : [];
  }

  private calculateFaceConfidence(face: FaceFeature): number {
    // Calculate confidence based on face detection quality
    const sizeScore = Math.min(face.bounds.size.width * face.bounds.size.height / 10000, 1);
    const landmarkScore = face.landmarks ? 0.3 : 0;
    const classificationScore = face.smilingProbability !== undefined ? 0.2 : 0;
    
    return Math.min(sizeScore + landmarkScore + classificationScore, 1);
  }

  private async performLivenessCheck(
    faces: FaceFeature[],
    imageUri: string
  ): Promise<boolean> {
    if (faces.length !== 1) return false;
    
    const face = faces[0];
    
    // Check for basic liveness indicators
    const hasEyes = face.landmarks?.leftEyePosition && face.landmarks?.rightEyePosition;
    const hasNose = face.landmarks?.noseBasePosition;
    const hasMouth = face.landmarks?.bottomMouthPosition;
    
    // Check face angle (not too tilted)
    const rollAngle = Math.abs(face.rollAngle || 0);
    const yawAngle = Math.abs(face.yawAngle || 0);
    const isWellPositioned = rollAngle < 15 && yawAngle < 20;
    
    return !!(hasEyes && hasNose && hasMouth && isWellPositioned);
  }

  private async performOCR(imageUri: string): Promise<any> {
    // Simulate OCR extraction - in real implementation, you would use
    // Google Vision API, AWS Textract, or similar service
    
    // Mock data extraction based on common ID document patterns
    const mockData = {
      name: "JOHN DOE",
      documentNumber: "123456789",
      expiryDate: "2025-12-31",
      dateOfBirth: "1990-01-01",
      nationality: "USA",
    };
    
    // Add some randomization to simulate real OCR confidence
    const confidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    
    return { ...mockData, _confidence: confidence };
  }

  private detectDocumentType(data: any): IDVerificationResult['documentType'] {
    // Simple document type detection based on extracted data patterns
    
    // Check for Aadhaar card (12-digit number, specific patterns)
    if (data.aadhaarNumber || (data.documentNumber && data.documentNumber.length === 12 && /^\d{12}$/.test(data.documentNumber))) {
      return 'aadhaar';
    }
    
    // Check for other document types
    if (data.name && data.documentNumber && data.expiryDate) {
      if (data.documentNumber.length === 9) return 'license';
      if (data.nationality) return 'passport';
      return 'id_card';
    }
    
    // Check for Aadhaar-specific fields even without documentNumber
    if (data.name && (data.fatherName || data.gender) && data.address) {
      return 'aadhaar';
    }
    
    return 'unknown';
  }

  private calculateDocumentConfidence(data: any): number {
    let score = 0;
    const fields = ['name', 'documentNumber', 'expiryDate', 'dateOfBirth'];
    
    fields.forEach(field => {
      if (data[field] && data[field].length > 0) {
        score += 0.25;
      }
    });
    
    return Math.min(score * (data._confidence || 0.8), 1);
  }

  private validateDocument(data: any, type: string): boolean {
    // Basic validation rules
    if (!data.name || !data.documentNumber) return false;
    
    // Check expiry date
    if (data.expiryDate) {
      const expiryDate = new Date(data.expiryDate);
      if (expiryDate < new Date()) return false;
    }
    
    // Document number format validation
    if (type === 'license' && data.documentNumber.length !== 9) return false;
    
    return true;
  }

  private async compareFaces(faceImageUri: string, idImageUri: string): Promise<number> {
    // Simulate face comparison - in real implementation, you would use
    // advanced face recognition algorithms or cloud services
    
    try {
      // Analyze both images
      const faceImageInfo = await this.analyzeImage(faceImageUri);
      const idImageInfo = await this.analyzeImage(idImageUri);
      
      // Extract face features from both images
      const faceResult = await this.simulateFaceDetection(faceImageUri, faceImageInfo);
      const idResult = await this.simulateFaceDetection(idImageUri, idImageInfo);
      
      if (faceResult.length === 0 || idResult.length === 0) {
        return 0;
      }
      
      // Simple similarity calculation based on face bounds and landmarks
      const face1 = faceResult[0];
      const face2 = idResult[0];
      
      // Compare face proportions
      const ratio1 = face1.bounds.size.width / face1.bounds.size.height;
      const ratio2 = face2.bounds.size.width / face2.bounds.size.height;
      const ratioSimilarity = 1 - Math.abs(ratio1 - ratio2);
      
      // Compare landmark positions if available
      let landmarkSimilarity = 0.5; // Default similarity
      if (face1.landmarks && face2.landmarks) {
        // Simple landmark comparison (in reality, this would be much more sophisticated)
        landmarkSimilarity = 0.7 + Math.random() * 0.3; // Simulate 70-100% similarity
      }
      
      // Combine scores with some randomization to simulate real face matching
      const baseScore = (ratioSimilarity * 0.4 + landmarkSimilarity * 0.6) * (0.8 + Math.random() * 0.2);
      
      return Math.max(0, Math.min(1, baseScore));
    } catch (error) {
      return 0;
    }
  }

  private calculateOverallScore(): number {
    if (!this.currentSession?.faceData || !this.currentSession?.idData) {
      return 0;
    }
    
    const faceScore = this.currentSession.faceData.confidence * 0.25;
    const livenessScore = (this.currentSession.faceData.isLive ? 1 : 0) * 0.2;
    const qualityScore = (this.currentSession.faceData.qualityScore ?? 0.8) * 0.15;
    const idScore = this.currentSession.idData.confidence * 0.25;
    const faceMatchScore = (this.currentSession.idData.faceMatch || 0) * 0.15;
    
    return faceScore + livenessScore + qualityScore + idScore + faceMatchScore;
  }

  private async calculateZKScore(zkProof: ZKProof, biometricWitness: BiometricWitness): Promise<number> {
    // Calculate score based on ZK proof quality and biometric data
    let score = 0;
    
    // Proof structure validation (20%)
    if (zkProof.proof && zkProof.publicSignals && zkProof.proofHash) {
      score += 0.2;
    }
    
    // Biometric quality score (30%)
    score += (biometricWitness.qualityScore ?? 0.8) * 0.3;
    
    // Liveness score (25%)
    score += (biometricWitness.livenessScore ?? 0.5) * 0.25;
    
    // Proof hash integrity (15%)
    const expectedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256, 
      JSON.stringify(zkProof.proof)
    );
    if (expectedHash === zkProof.proofHash) {
      score += 0.15;
    }
    
    // Nullifier uniqueness (10%)
    // This would be checked against blockchain in real implementation
    score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private async saveSession(): Promise<void> {
    if (this.currentSession) {
      await AsyncStorage.setItem(
        `verification_${this.currentSession.id}`,
        JSON.stringify(this.currentSession)
      );
    }
  }

  async getSession(sessionId: string): Promise<VerificationSession | null> {
    try {
      const data = await AsyncStorage.getItem(`verification_${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  getCurrentSession(): VerificationSession | null {
    return this.currentSession;
  }
}

export default VerificationService;
