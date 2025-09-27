export interface FaceFeature {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  landmarks?: {
    leftEyePosition?: { x: number; y: number };
    rightEyePosition?: { x: number; y: number };
    noseBasePosition?: { x: number; y: number };
    bottomMouthPosition?: { x: number; y: number };
  };
  rollAngle?: number;
  yawAngle?: number;
  smilingProbability?: number;
}

export interface FaceDetectionResult {
  faces: FaceFeature[];
  imageUri: string;
  confidence: number;
  isLive: boolean;
  landmarksConfidence?: number;
  embedding?: number[];
  livenessScore?: number;
  qualityScore?: number;
}

export interface IDExtractedData {
  name?: string;
  documentNumber?: string;
  expiryDate?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  // Aadhaar-specific fields
  aadhaarNumber?: string;
  fatherName?: string;
  gender?: string;
  pincode?: string;
  // ETHGlobal badge fields
  email?: string;
  githubUsername?: string;
  twitterHandle?: string;
  badgeId?: string;
  participantId?: string;
  eventId?: string;
  rawText?: string;
}

export interface IDVerificationResult {
  documentType: 'passport' | 'license' | 'id_card' | 'aadhaar' | 'ethglobal_badge' | 'unknown';
  extractedData: IDExtractedData;
  confidence: number;
  isValid: boolean;
  faceMatch?: number;
  qualityScore?: number;
  analyzedImageUri?: string;
  rawResponse?: unknown;
  verificationMethod?: 'ocr' | 'nfc' | 'qr' | 'manual';
}

