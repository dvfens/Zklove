import * as FaceDetector from 'expo-face-detector';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FaceDetectionResult {
  faces: FaceDetector.FaceFeature[];
  imageUri: string;
  confidence: number;
  isLive: boolean;
}

export interface IDVerificationResult {
  documentType: 'passport' | 'license' | 'id_card' | 'unknown';
  extractedData: {
    name?: string;
    documentNumber?: string;
    expiryDate?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  confidence: number;
  isValid: boolean;
  faceMatch?: number;
}

export interface VerificationSession {
  id: string;
  timestamp: number;
  faceData: FaceDetectionResult | null;
  idData: IDVerificationResult | null;
  status: 'pending' | 'face_captured' | 'id_captured' | 'completed' | 'failed';
  overallScore: number;
}

class VerificationService {
  private static instance: VerificationService;
  private currentSession: VerificationSession | null = null;

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
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

  async detectFaces(imageUri: string): Promise<FaceDetectionResult> {
    try {
      const result = await FaceDetector.detectFacesAsync(imageUri, {
        mode: FaceDetector.FaceDetectorMode.accurate,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.all,
      });

      const faces = result.faces;
      const confidence = faces.length > 0 ? this.calculateFaceConfidence(faces[0]) : 0;
      const isLive = await this.performLivenessCheck(faces, imageUri);

      const faceResult: FaceDetectionResult = {
        faces,
        imageUri,
        confidence,
        isLive,
      };

      if (this.currentSession) {
        this.currentSession.faceData = faceResult;
        this.currentSession.status = 'face_captured';
        await this.saveSession();
      }

      return faceResult;
    } catch (error) {
      throw new Error(`Face detection failed: ${error}`);
    }
  }

  async verifyIDDocument(imageUri: string): Promise<IDVerificationResult> {
    try {
      // Simulate advanced OCR and document verification
      const extractedData = await this.performOCR(imageUri);
      const documentType = this.detectDocumentType(extractedData);
      const confidence = this.calculateDocumentConfidence(extractedData);
      const isValid = this.validateDocument(extractedData, documentType);
      
      let faceMatch = 0;
      if (this.currentSession?.faceData) {
        faceMatch = await this.compareFaces(
          this.currentSession.faceData.imageUri,
          imageUri
        );
      }

      const idResult: IDVerificationResult = {
        documentType,
        extractedData,
        confidence,
        isValid,
        faceMatch,
      };

      if (this.currentSession) {
        this.currentSession.idData = idResult;
        this.currentSession.status = 'id_captured';
        await this.saveSession();
      }

      return idResult;
    } catch (error) {
      throw new Error(`ID verification failed: ${error}`);
    }
  }

  async completeVerification(): Promise<VerificationSession> {
    if (!this.currentSession) {
      throw new Error('No active verification session');
    }

    const overallScore = this.calculateOverallScore();
    this.currentSession.overallScore = overallScore;
    this.currentSession.status = overallScore >= 0.8 ? 'completed' : 'failed';
    
    await this.saveSession();
    return this.currentSession;
  }

  private calculateFaceConfidence(face: FaceDetector.FaceFeature): number {
    // Calculate confidence based on face detection quality
    const sizeScore = Math.min(face.bounds.size.width * face.bounds.size.height / 10000, 1);
    const landmarkScore = face.landmarks ? 0.3 : 0;
    const classificationScore = face.smilingProbability !== undefined ? 0.2 : 0;
    
    return Math.min(sizeScore + landmarkScore + classificationScore, 1);
  }

  private async performLivenessCheck(
    faces: FaceDetector.FaceFeature[],
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
    if (data.name && data.documentNumber && data.expiryDate) {
      if (data.documentNumber.length === 9) return 'license';
      if (data.nationality) return 'passport';
      return 'id_card';
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
      // Extract face features from both images
      const faceResult = await FaceDetector.detectFacesAsync(faceImageUri);
      const idResult = await FaceDetector.detectFacesAsync(idImageUri);
      
      if (faceResult.faces.length === 0 || idResult.faces.length === 0) {
        return 0;
      }
      
      // Simple similarity calculation based on face bounds and landmarks
      const face1 = faceResult.faces[0];
      const face2 = idResult.faces[0];
      
      // Compare face proportions
      const ratio1 = face1.bounds.size.width / face1.bounds.size.height;
      const ratio2 = face2.bounds.size.width / face2.bounds.size.height;
      const ratioSimilarity = 1 - Math.abs(ratio1 - ratio2);
      
      // Add some randomization to simulate real face matching
      const baseScore = ratioSimilarity * 0.6 + Math.random() * 0.4;
      
      return Math.max(0, Math.min(1, baseScore));
    } catch (error) {
      return 0;
    }
  }

  private calculateOverallScore(): number {
    if (!this.currentSession?.faceData || !this.currentSession?.idData) {
      return 0;
    }
    
    const faceScore = this.currentSession.faceData.confidence * 0.3;
    const livenessScore = this.currentSession.faceData.isLive ? 0.2 : 0;
    const idScore = this.currentSession.idData.confidence * 0.3;
    const faceMatchScore = (this.currentSession.idData.faceMatch || 0) * 0.2;
    
    return faceScore + livenessScore + idScore + faceMatchScore;
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
