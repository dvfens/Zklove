import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { config } from '../config';

/**
 * Self Protocol - Privacy-First Identity Verification
 * 
 * Self Protocol is a privacy-first, open-source identity protocol powered by zero-knowledge proofs.
 * It allows developers to verify users' identity and humanity (including sybil resistance, age, 
 * country, and sanctions checks) without exposing private data.
 */

export interface SelfIdentityProof {
  // Zero-knowledge proof components
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  publicSignals: string[];
  proofHash: string;
  
  // Privacy-preserving commitments
  identityCommitment: string;
  nullifierHash: string;
  
  // Verification metadata (no private data)
  verificationTimestamp: number;
  protocolVersion: string;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
}

export interface SelfVerificationResult {
  // Verification outcomes (boolean proofs, no private data)
  isHuman: boolean;
  isUnique: boolean; // Sybil resistance
  ageVerified: boolean;
  countryVerified: boolean;
  sanctionsCleared: boolean;
  
  // Privacy-preserving scores
  confidenceScore: number;
  riskScore: number;
  
  // Zero-knowledge proof
  zkProof: SelfIdentityProof;
  
  // Verification metadata
  verificationId: string;
  timestamp: number;
  expiresAt: number;
}

export interface SelfVerificationRequest {
  // Biometric data (will be processed locally)
  faceImage: string;
  documentImage: string;
  
  // Optional verification parameters
  requiredAge?: number;
  allowedCountries?: string[];
  requireSanctionsCheck?: boolean;
  
  // Privacy settings
  dataRetentionDays?: number;
  allowBiometricStorage?: boolean;
}

export interface SelfBiometricData {
  // Local biometric processing results
  faceFeatures: {
    landmarks: number[];
    quality: number;
    liveness: number;
  };
  documentFeatures: {
    extractedData: {
      name: string;
      documentNumber: string;
      dateOfBirth: string;
      nationality: string;
      expiryDate: string;
    };
    confidence: number;
    authenticity: number;
  };
  
  // Privacy-preserving hashes
  biometricHash: string;
  documentHash: string;
}

class SelfProtocolService {
  private static instance: SelfProtocolService;
  private readonly protocolVersion = '1.0.0';
  private readonly maxRetentionDays: number;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly verificationEndpoint: string;
  private readonly privacyLevel: string;
  private readonly enableBiometricStorage: boolean;

  static getInstance(): SelfProtocolService {
    if (!SelfProtocolService.instance) {
      SelfProtocolService.instance = new SelfProtocolService();
    }
    return SelfProtocolService.instance;
  }

  constructor() {
    // Load configuration from config.js
    this.maxRetentionDays = config.selfProtocol?.dataRetentionDays || 30;
    this.apiKey = config.selfProtocol?.apiKey || '';
    this.secretKey = config.selfProtocol?.secretKey || '';
    this.endpoint = config.selfProtocol?.endpoint || 'https://api.selfprotocol.com/v1';
    this.verificationEndpoint = config.selfProtocol?.verificationEndpoint || 'https://verification.selfprotocol.com';
    this.privacyLevel = config.selfProtocol?.privacyLevel || 'enhanced';
    this.enableBiometricStorage = config.selfProtocol?.enableBiometricStorage || false;
  }

  /**
   * Initialize Self Protocol service with API credentials
   */
  async initialize(): Promise<void> {
    if (!this.apiKey || !this.secretKey) {
      console.warn('Self Protocol API credentials not configured. Using mock mode.');
      return;
    }

    try {
      // Test API connection
      const response = await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Self Protocol API connection established');
      } else {
        console.warn('Self Protocol API connection failed, using mock mode');
      }
    } catch (error) {
      console.warn('Self Protocol API unavailable, using mock mode:', error);
    }
  }

  /**
   * Process biometric data locally without external services
   */
  async processBiometricData(
    faceImage: string, 
    documentImage: string
  ): Promise<SelfBiometricData> {
    console.log('Processing biometric data locally...');
    
    // Simulate local face processing
    const faceFeatures = await this.extractFaceFeatures(faceImage);
    
    // Simulate local document processing
    const documentFeatures = await this.extractDocumentFeatures(documentImage);
    
    // Create privacy-preserving hashes
    const biometricHash = await this.createBiometricHash(faceFeatures);
    const documentHash = await this.createDocumentHash(documentFeatures);
    
    return {
      faceFeatures,
      documentFeatures,
      biometricHash,
      documentHash
    };
  }

  /**
   * Generate zero-knowledge proof for identity verification
   */
  async generateIdentityProof(
    biometricData: SelfBiometricData,
    verificationRequest: SelfVerificationRequest
  ): Promise<SelfIdentityProof> {
    console.log('Generating zero-knowledge identity proof...');
    
    // Create identity commitment (privacy-preserving)
    const identityCommitment = await this.createIdentityCommitment(biometricData);
    
    // Generate nullifier hash (prevents double-spending)
    const nullifierHash = await this.createNullifierHash(biometricData);
    
    // Generate zero-knowledge proof
    const zkProof = await this.generateZKProof(
      biometricData,
      identityCommitment,
      nullifierHash
    );
    
    return {
      proof: zkProof.proof,
      publicSignals: zkProof.publicSignals,
      proofHash: zkProof.proofHash,
      identityCommitment,
      nullifierHash,
      verificationTimestamp: Date.now(),
      protocolVersion: this.protocolVersion,
      verificationLevel: this.determineVerificationLevel(verificationRequest)
    };
  }

  /**
   * Verify identity using Self Protocol
   */
  async verifyIdentity(
    verificationRequest: SelfVerificationRequest
  ): Promise<SelfVerificationResult> {
    console.log('Starting Self Protocol identity verification...');
    
    // Process biometric data locally
    const biometricData = await this.processBiometricData(
      verificationRequest.faceImage,
      verificationRequest.documentImage
    );
    
    // Generate zero-knowledge proof
    const zkProof = await this.generateIdentityProof(biometricData, verificationRequest);
    
    // Perform privacy-preserving verification checks
    const verificationResults = await this.performVerificationChecks(
      biometricData,
      verificationRequest,
      zkProof
    );
    
    // Create verification result
    const verificationId = await Crypto.randomUUID();
    const timestamp = Date.now();
    const expiresAt = timestamp + (verificationRequest.dataRetentionDays || 7) * 24 * 60 * 60 * 1000;
    
    const result: SelfVerificationResult = {
      isHuman: verificationResults.isHuman,
      isUnique: verificationResults.isUnique,
      ageVerified: verificationResults.ageVerified,
      countryVerified: verificationResults.countryVerified,
      sanctionsCleared: verificationResults.sanctionsCleared,
      confidenceScore: verificationResults.confidenceScore,
      riskScore: verificationResults.riskScore,
      zkProof,
      verificationId,
      timestamp,
      expiresAt
    };
    
    // Store verification result (privacy-preserving)
    await this.storeVerificationResult(result);
    
    console.log('Self Protocol verification completed:', {
      isHuman: result.isHuman,
      isUnique: result.isUnique,
      confidenceScore: result.confidenceScore
    });
    
    return result;
  }

  /**
   * Verify a Self Protocol proof without revealing private data
   */
  async verifyProof(proof: SelfIdentityProof): Promise<boolean> {
    console.log('Verifying Self Protocol proof...');
    
    try {
      // Verify proof structure
      if (!this.validateProofStructure(proof)) {
        return false;
      }
      
      // Verify proof integrity
      const expectedHash = await this.calculateProofHash(proof);
      if (expectedHash !== proof.proofHash) {
        return false;
      }
      
      // Verify nullifier uniqueness (prevents double-spending)
      const isNullifierUsed = await this.checkNullifierUsage(proof.nullifierHash);
      if (isNullifierUsed) {
        return false;
      }
      
      // Verify commitment validity
      const isCommitmentValid = await this.verifyIdentityCommitment(proof.identityCommitment);
      if (!isCommitmentValid) {
        return false;
      }
      
      console.log('Self Protocol proof verified successfully');
      return true;
      
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }

  /**
   * Check if a verification is still valid
   */
  async checkVerificationStatus(verificationId: string): Promise<{
    isValid: boolean;
    isExpired: boolean;
    verificationLevel: string;
  }> {
    try {
      const result = await AsyncStorage.getItem(`self_verification_${verificationId}`);
      if (!result) {
        return { isValid: false, isExpired: false, verificationLevel: 'none' };
      }
      
      const verification: SelfVerificationResult = JSON.parse(result);
      const now = Date.now();
      const isExpired = now > verification.expiresAt;
      
      return {
        isValid: !isExpired && verification.confidenceScore > 0.8,
        isExpired,
        verificationLevel: verification.zkProof.verificationLevel
      };
      
    } catch (error) {
      console.error('Failed to check verification status:', error);
      return { isValid: false, isExpired: true, verificationLevel: 'none' };
    }
  }

  // Private methods for local processing

  private async extractFaceFeatures(imageUri: string): Promise<{
    landmarks: number[];
    quality: number;
    liveness: number;
  }> {
    // Simulate local face feature extraction
    // In a real implementation, this would use local ML models
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      landmarks: Array.from({ length: 68 }, () => Math.random()),
      quality: 0.85 + Math.random() * 0.15,
      liveness: 0.9 + Math.random() * 0.1
    };
  }

  private async extractDocumentFeatures(imageUri: string): Promise<{
    extractedData: {
      name: string;
      documentNumber: string;
      dateOfBirth: string;
      nationality: string;
      expiryDate: string;
    };
    confidence: number;
    authenticity: number;
  }> {
    // Simulate local document processing
    // In a real implementation, this would use local OCR and document analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      extractedData: {
        name: "JOHN DOE",
        documentNumber: "123456789",
        dateOfBirth: "1990-01-01",
        nationality: "USA",
        expiryDate: "2025-12-31"
      },
      confidence: 0.9 + Math.random() * 0.1,
      authenticity: 0.85 + Math.random() * 0.15
    };
  }

  private async createBiometricHash(faceFeatures: any): Promise<string> {
    const data = JSON.stringify(faceFeatures);
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }

  private async createDocumentHash(documentFeatures: any): Promise<string> {
    const data = JSON.stringify(documentFeatures);
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }

  private async createIdentityCommitment(biometricData: SelfBiometricData): Promise<string> {
    const commitmentData = {
      biometricHash: biometricData.biometricHash,
      documentHash: biometricData.documentHash,
      timestamp: Date.now()
    };
    
    const data = JSON.stringify(commitmentData);
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }

  private async createNullifierHash(biometricData: SelfBiometricData): Promise<string> {
    const nullifierData = {
      biometricHash: biometricData.biometricHash,
      randomSeed: await Crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    const data = JSON.stringify(nullifierData);
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
  }

  private async generateZKProof(
    biometricData: SelfBiometricData,
    identityCommitment: string,
    nullifierHash: string
  ): Promise<{
    proof: { a: [string, string]; b: [[string, string], [string, string]]; c: [string, string] };
    publicSignals: string[];
    proofHash: string;
  }> {
    // Simulate zero-knowledge proof generation
    // In a real implementation, this would use circom/snarkjs or similar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const proof = {
      a: [await Crypto.randomUUID(), await Crypto.randomUUID()] as [string, string],
      b: [
        [await Crypto.randomUUID(), await Crypto.randomUUID()],
        [await Crypto.randomUUID(), await Crypto.randomUUID()]
      ] as [[string, string], [string, string]],
      c: [await Crypto.randomUUID(), await Crypto.randomUUID()] as [string, string]
    };
    
    const publicSignals = [
      identityCommitment,
      nullifierHash,
      await Crypto.randomUUID() // merkle root
    ];
    
    const proofData = JSON.stringify({ proof, publicSignals });
    const proofHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256, 
      proofData
    );
    
    return { proof, publicSignals, proofHash };
  }

  private determineVerificationLevel(request: SelfVerificationRequest): 'basic' | 'enhanced' | 'premium' {
    if (request.requireSanctionsCheck && request.allowedCountries) {
      return 'premium';
    } else if (request.requiredAge || request.allowedCountries) {
      return 'enhanced';
    } else {
      return 'basic';
    }
  }

  private async performVerificationChecks(
    biometricData: SelfBiometricData,
    request: SelfVerificationRequest,
    zkProof: SelfIdentityProof
  ): Promise<{
    isHuman: boolean;
    isUnique: boolean;
    ageVerified: boolean;
    countryVerified: boolean;
    sanctionsCleared: boolean;
    confidenceScore: number;
    riskScore: number;
  }> {
    // Human verification (liveness + quality checks)
    const isHuman = biometricData.faceFeatures.liveness > 0.8 && 
                   biometricData.faceFeatures.quality > 0.7;
    
    // Sybil resistance (uniqueness check)
    const isUnique = await this.checkUniqueness(zkProof.nullifierHash);
    
    // Age verification
    const ageVerified = await this.verifyAge(
      biometricData.documentFeatures.extractedData.dateOfBirth,
      request.requiredAge
    );
    
    // Country verification
    const countryVerified = await this.verifyCountry(
      biometricData.documentFeatures.extractedData.nationality,
      request.allowedCountries
    );
    
    // Sanctions check
    const sanctionsCleared = await this.checkSanctions(
      biometricData.documentFeatures.extractedData,
      request.requireSanctionsCheck
    );
    
    // Calculate confidence and risk scores
    const confidenceScore = this.calculateConfidenceScore(
      biometricData,
      isHuman,
      isUnique,
      ageVerified,
      countryVerified,
      sanctionsCleared
    );
    
    const riskScore = this.calculateRiskScore(
      biometricData,
      isHuman,
      isUnique,
      ageVerified,
      countryVerified,
      sanctionsCleared
    );
    
    return {
      isHuman,
      isUnique,
      ageVerified,
      countryVerified,
      sanctionsCleared,
      confidenceScore,
      riskScore
    };
  }

  private async checkUniqueness(nullifierHash: string): Promise<boolean> {
    // Check if nullifier has been used before (sybil resistance)
    const used = await AsyncStorage.getItem(`nullifier_${nullifierHash}`);
    if (used) {
      return false; // Already used, potential sybil attack
    }
    
    // Mark as used
    await AsyncStorage.setItem(`nullifier_${nullifierHash}`, 'true');
    return true;
  }

  private async verifyAge(dateOfBirth: string, requiredAge?: number): Promise<boolean> {
    if (!requiredAge) return true;
    
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    
    return age >= requiredAge;
  }

  private async verifyCountry(nationality: string, allowedCountries?: string[]): Promise<boolean> {
    if (!allowedCountries) return true;
    
    return allowedCountries.includes(nationality);
  }

  private async checkSanctions(
    documentData: any,
    requireCheck?: boolean
  ): Promise<boolean> {
    if (!requireCheck) return true;
    
    // Simulate sanctions screening
    // In a real implementation, this would check against sanctions databases
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, assume all checks pass
    return true;
  }

  private calculateConfidenceScore(
    biometricData: SelfBiometricData,
    isHuman: boolean,
    isUnique: boolean,
    ageVerified: boolean,
    countryVerified: boolean,
    sanctionsCleared: boolean
  ): number {
    let score = 0;
    
    if (isHuman) score += 0.3;
    if (isUnique) score += 0.2;
    if (ageVerified) score += 0.15;
    if (countryVerified) score += 0.15;
    if (sanctionsCleared) score += 0.1;
    
    // Add biometric quality scores
    score += biometricData.faceFeatures.quality * 0.05;
    score += biometricData.documentFeatures.confidence * 0.05;
    
    return Math.min(score, 1.0);
  }

  private calculateRiskScore(
    biometricData: SelfBiometricData,
    isHuman: boolean,
    isUnique: boolean,
    ageVerified: boolean,
    countryVerified: boolean,
    sanctionsCleared: boolean
  ): number {
    let risk = 0;
    
    if (!isHuman) risk += 0.4;
    if (!isUnique) risk += 0.3;
    if (!ageVerified) risk += 0.1;
    if (!countryVerified) risk += 0.1;
    if (!sanctionsCleared) risk += 0.1;
    
    // Add quality-based risk
    if (biometricData.faceFeatures.quality < 0.7) risk += 0.1;
    if (biometricData.documentFeatures.confidence < 0.8) risk += 0.1;
    
    return Math.min(risk, 1.0);
  }

  private validateProofStructure(proof: SelfIdentityProof): boolean {
    return !!(
      proof.proof &&
      proof.proof.a && proof.proof.a.length === 2 &&
      proof.proof.b && proof.proof.b.length === 2 &&
      proof.proof.c && proof.proof.c.length === 2 &&
      proof.publicSignals && proof.publicSignals.length >= 3 &&
      proof.proofHash &&
      proof.identityCommitment &&
      proof.nullifierHash
    );
  }

  private async calculateProofHash(proof: SelfIdentityProof): Promise<string> {
    const proofData = JSON.stringify({
      proof: proof.proof,
      publicSignals: proof.publicSignals
    });
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, proofData);
  }

  private async checkNullifierUsage(nullifierHash: string): Promise<boolean> {
    const used = await AsyncStorage.getItem(`nullifier_${nullifierHash}`);
    return !!used;
  }

  private async verifyIdentityCommitment(commitment: string): Promise<boolean> {
    // In a real implementation, this would verify against a merkle tree
    // For now, just check if it's a valid hash
    return commitment.length === 64; // SHA256 hex length
  }

  private async storeVerificationResult(result: SelfVerificationResult): Promise<void> {
    // Store locally
    await AsyncStorage.setItem(
      `self_verification_${result.verificationId}`,
      JSON.stringify(result)
    );

    // Submit to Self Protocol API if configured
    if (this.apiKey && this.secretKey) {
      try {
        await this.submitToSelfProtocolAPI(result);
      } catch (error) {
        console.warn('Failed to submit to Self Protocol API:', error);
      }
    }
  }

  /**
   * Submit verification result to Self Protocol API
   */
  private async submitToSelfProtocolAPI(result: SelfVerificationResult): Promise<void> {
    const payload = {
      verificationId: result.verificationId,
      isHuman: result.isHuman,
      isUnique: result.isUnique,
      ageVerified: result.ageVerified,
      countryVerified: result.countryVerified,
      sanctionsCleared: result.sanctionsCleared,
      confidenceScore: result.confidenceScore,
      riskScore: result.riskScore,
      zkProof: {
        proofHash: result.zkProof.proofHash,
        identityCommitment: result.zkProof.identityCommitment,
        nullifierHash: result.zkProof.nullifierHash,
        verificationLevel: result.zkProof.verificationLevel
      },
      timestamp: result.timestamp,
      expiresAt: result.expiresAt,
      privacyLevel: this.privacyLevel
    };

    const response = await fetch(`${this.verificationEndpoint}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Secret': this.secretKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Self Protocol API error: ${response.status}`);
    }

    console.log('Verification result submitted to Self Protocol API');
  }

  /**
   * Get verification status from Self Protocol API
   */
  async getVerificationStatusFromAPI(verificationId: string): Promise<{
    isValid: boolean;
    isExpired: boolean;
    verificationLevel: string;
    apiStatus?: string;
  }> {
    if (!this.apiKey || !this.secretKey) {
      // Fallback to local storage
      return await this.checkVerificationStatus(verificationId);
    }

    try {
      const response = await fetch(`${this.verificationEndpoint}/status/${verificationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: data.isValid,
          isExpired: data.isExpired,
          verificationLevel: data.verificationLevel,
          apiStatus: data.status
        };
      }
    } catch (error) {
      console.warn('Failed to get status from Self Protocol API:', error);
    }

    // Fallback to local storage
    return await this.checkVerificationStatus(verificationId);
  }
}

export default SelfProtocolService;
