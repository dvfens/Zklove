import * as FileSystem from 'expo-file-system/legacy';

export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AWSFaceDetectionResult {
  faces: {
    confidence: number;
    boundingBox: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
    landmarks?: {
      x: number;
      y: number;
    }[];
  }[];
}

export interface AWSTextractResult {
  blocks: {
    blockType: string;
    confidence: number;
    text?: string;
    geometry: {
      boundingBox: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
    };
  }[];
}

class AWSService {
  private static instance: AWSService;
  private config: AWSConfig | null = null;

  static getInstance(): AWSService {
    if (!AWSService.instance) {
      AWSService.instance = new AWSService();
    }
    return AWSService.instance;
  }

  initialize(config: AWSConfig): void {
    this.config = config;
  }

  private async createAWSRequest(
    service: string,
    action: string,
    payload: any
  ): Promise<any> {
    if (!this.config) {
      throw new Error('AWS service not initialized');
    }

    const endpoint = `https://${service}.${this.config.region}.amazonaws.com/`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    // const dateStamp = amzDate.substr(0, 8); // Reserved for future AWS signature implementation

    // For simplicity, we'll use a mock implementation
    // In production, you'd implement proper AWS Signature Version 4
    console.log(`AWS ${service} ${action} request:`, {
      endpoint,
      region: this.config.region,
      payload: Object.keys(payload)
    });

    // Mock response for development
    if (service === 'rekognition') {
      return this.mockFaceDetectionResponse();
    } else if (service === 'textract') {
      return this.mockTextractResponse();
    }

    throw new Error(`Unsupported AWS service: ${service}`);
  }

  private async sha256(data: string): Promise<string> {
    try {
      // Use crypto-js as fallback since expo-crypto might not be working
      const CryptoJS = require('crypto-js');
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('SHA256 digest failed:', error);
      // Return a mock hash for development
      return 'mock-hash-for-development';
    }
  }

  private async createCanonicalRequest(
    method: string,
    uri: string,
    queryString: string,
    headers: Record<string, string>,
    payload: string
  ): Promise<string> {
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n') + '\n';

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = await this.sha256(payload);

    return [
      method,
      uri,
      queryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
  }

  private async generateAWS4Signature(
    stringToSign: string,
    signingKey: string
  ): Promise<string> {
    // For development, return a mock signature
    // In production, implement proper HMAC-SHA256
    return 'mock-signature-for-development';
  }

  private mockFaceDetectionResponse(): AWSFaceDetectionResult {
    return {
      faces: [
        {
          confidence: 0.95,
          boundingBox: {
            left: 0.1,
            top: 0.1,
            width: 0.3,
            height: 0.4
          },
          landmarks: [
            { x: 0.2, y: 0.25 },
            { x: 0.25, y: 0.3 },
            { x: 0.3, y: 0.35 }
          ]
        }
      ]
    };
  }

  private mockTextractResponse(): AWSTextractResult {
    return {
      blocks: [
        {
          blockType: 'LINE',
          confidence: 0.98,
          text: 'JOHN DOE',
          geometry: {
            boundingBox: {
              left: 0.1,
              top: 0.2,
              width: 0.3,
              height: 0.05
            }
          }
        },
        {
          blockType: 'LINE',
          confidence: 0.95,
          text: '123456789',
          geometry: {
            boundingBox: {
              left: 0.1,
              top: 0.3,
              width: 0.4,
              height: 0.05
            }
          }
        }
      ]
    };
  }

  async detectFaces(imageUri: string): Promise<AWSFaceDetectionResult> {
    try {
      const localUri = await this.downloadFile(imageUri);
      const imageBase64 = await FileSystem.readAsStringAsync(localUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      const payload = {
        Image: {
          Bytes: imageBase64
        },
        Attributes: ['ALL']
      };

      return await this.createAWSRequest('rekognition', 'DetectFaces', payload);
    } catch (error) {
      console.error('AWS face detection failed:', error);
      // Return mock data as fallback
      return this.mockFaceDetectionResponse();
    }
  }

  async extractText(imageUri: string): Promise<AWSTextractResult> {
    try {
      const localUri = await this.downloadFile(imageUri);
      const imageBase64 = await FileSystem.readAsStringAsync(localUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      const payload = {
        Document: {
          Bytes: imageBase64
        }
      };

      return await this.createAWSRequest('textract', 'DetectDocumentText', payload);
    } catch (error) {
      console.error('AWS text extraction failed:', error);
      // Return mock data as fallback
      return this.mockTextractResponse();
    }
  }

  private async downloadFile(uri: string): Promise<string> {
    if (uri.startsWith('file://')) {
      return uri;
    }

    const filename = `temp_${Date.now()}.jpg`;
    const localUri = `${FileSystem.cacheDirectory}${filename}`;
    
    try {
      const result = await FileSystem.downloadAsync(uri, localUri);
      return result.uri;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }
}

export default AWSService;
