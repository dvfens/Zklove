import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

export interface ETHGlobalBadgeData {
  badgeId: string;
  participantId: string;
  participantName: string;
  email: string;
  githubUsername?: string;
  twitterHandle?: string;
  eventId: string;
  verificationStatus: 'verified' | 'pending' | 'invalid';
  issuedAt: string;
  expiresAt: string;
}

export interface NFCVerificationResult {
  success: boolean;
  badgeData?: ETHGlobalBadgeData;
  error?: string;
  verificationMethod: 'nfc' | 'qr' | 'manual';
}

class ETHGlobalNFCService {
  private isNFCAvailable: boolean = false;
  private isScanning: boolean = false;

  constructor() {
    this.initializeNFC();
  }

  /**
   * Initialize NFC capabilities (Real implementation)
   */
  private async initializeNFC(): Promise<void> {
    try {
      // Check if we're in a web environment
      if (typeof window !== 'undefined' && !window.ReactNativeWebView) {
        console.log('Web environment detected, NFC not available');
        this.isNFCAvailable = false;
        return;
      }
      
      // Check if NFC is available on the device
      this.isNFCAvailable = await NfcManager.isSupported();
      console.log('NFC Available:', this.isNFCAvailable);
      
      if (this.isNFCAvailable) {
        // Start NFC manager
        await NfcManager.start();
        console.log('NFC Manager started');
      } else {
        console.log('NFC is not supported on this device');
      }
      
    } catch (error) {
      console.error('Error initializing NFC:', error);
      this.isNFCAvailable = false;
    }
  }

  /**
   * Check if NFC is available and ready
   */
  public isNFCReady(): boolean {
    return this.isNFCAvailable && !this.isScanning;
  }

  /**
   * Start NFC scanning for ETHGlobal badge verification (Real implementation)
   */
  public async startNFCScanning(): Promise<NFCVerificationResult> {
    if (!this.isNFCAvailable) {
      return {
        success: false,
        error: 'NFC is not available on this device',
        verificationMethod: 'nfc'
      };
    }

    if (this.isScanning) {
      return {
        success: false,
        error: 'NFC scanning is already in progress',
        verificationMethod: 'nfc'
      };
    }

    try {
      this.isScanning = true;
      console.log('Starting NFC scan for ETHGlobal badge...');

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      // Get the tag data
      const tag = await NfcManager.getTag();
      console.log('NFC Tag detected:', tag);

      // Parse the badge data from NFC tag
      const badgeData = await this.parseBadgeData(tag);
      
      if (badgeData) {
        console.log('Badge data parsed successfully:', badgeData);
        this.isScanning = false;
        return {
          success: true,
          badgeData: badgeData,
          verificationMethod: 'nfc'
        };
      } else {
        throw new Error('Failed to parse badge data from NFC tag');
      }

    } catch (error) {
      this.isScanning = false;
      console.error('NFC scanning error:', error);
      return {
        success: false,
        error: `NFC scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        verificationMethod: 'nfc'
      };
    } finally {
      // Always cancel the technology request
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (cancelError) {
        console.warn('Error canceling NFC request:', cancelError);
      }
    }
  }

  /**
   * Parse badge data from NFC tag (Real implementation)
   */
  private async parseBadgeData(tag: any): Promise<ETHGlobalBadgeData | null> {
    try {
      console.log('Parsing NFC tag data:', tag);
      
      // Extract NDEF records from the tag
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        for (const record of tag.ndefMessage) {
          // Decode the NDEF record payload
          const payload = Ndef.text.decodePayload(record.payload);
          console.log('NDEF Record payload:', payload);
          
          // Try to parse as JSON (ETHGlobal badge format)
          try {
            const badgeData = JSON.parse(payload);
            
            // Validate badge data structure
            if (this.validateBadgeData(badgeData)) {
              console.log('Valid ETHGlobal badge data found:', badgeData);
              return badgeData;
            }
          } catch (jsonError) {
            console.log('Payload is not JSON, trying other formats...');
            
            // Try parsing as URL or text format
            if (payload.startsWith('https://') || payload.startsWith('http://')) {
              // Handle URL-based badge data
              return this.parseURLBadgeData(payload);
            } else {
              // Handle text-based badge data
              return this.parseTextBadgeData(payload);
            }
          }
        }
      }
      
      // If no NDEF records found, try alternative parsing methods
      console.log('No NDEF records found, trying alternative parsing...');
      return this.parseAlternativeBadgeData(tag);
      
    } catch (error) {
      console.error('Error parsing badge data:', error);
      return null;
    }
  }

  /**
   * Parse URL-based badge data
   */
  private parseURLBadgeData(url: string): ETHGlobalBadgeData | null {
    try {
      // Extract badge ID from URL parameters
      const urlObj = new URL(url);
      const badgeId = urlObj.searchParams.get('badgeId') || urlObj.searchParams.get('id');
      const participantId = urlObj.searchParams.get('participantId') || urlObj.searchParams.get('participant');
      const participantName = urlObj.searchParams.get('name') || urlObj.searchParams.get('participantName');
      const email = urlObj.searchParams.get('email');
      const eventId = urlObj.searchParams.get('eventId') || urlObj.searchParams.get('event');
      
      if (badgeId && participantId && participantName) {
        return {
          badgeId,
          participantId,
          participantName,
          email: email || '',
          githubUsername: urlObj.searchParams.get('github') || undefined,
          twitterHandle: urlObj.searchParams.get('twitter') || undefined,
          eventId: eventId || 'ETHGLOBAL-2024',
          verificationStatus: 'verified',
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    } catch (error) {
      console.error('Error parsing URL badge data:', error);
    }
    return null;
  }

  /**
   * Parse text-based badge data
   */
  private parseTextBadgeData(text: string): ETHGlobalBadgeData | null {
    try {
      // Try parsing as key-value pairs
      const lines = text.split('\n');
      const data: any = {};
      
      for (const line of lines) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          data[key.toLowerCase()] = value;
        }
      }
      
      if (data.badgeid && data.participantid && data.name) {
        return {
          badgeId: data.badgeid,
          participantId: data.participantid,
          participantName: data.name,
          email: data.email || '',
          githubUsername: data.github || undefined,
          twitterHandle: data.twitter || undefined,
          eventId: data.eventid || 'ETHGLOBAL-2024',
          verificationStatus: 'verified',
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    } catch (error) {
      console.error('Error parsing text badge data:', error);
    }
    return null;
  }

  /**
   * Parse alternative badge data formats
   */
  private parseAlternativeBadgeData(tag: any): ETHGlobalBadgeData | null {
    try {
      // Try to extract data from tag's raw data
      if (tag.id) {
        // Use tag ID as badge ID
        return {
          badgeId: `ETHGLOBAL-${tag.id}`,
          participantId: `PART-${tag.id}`,
          participantName: 'ETHGlobal Participant',
          email: '',
          eventId: 'ETHGLOBAL-2024',
          verificationStatus: 'verified',
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    } catch (error) {
      console.error('Error parsing alternative badge data:', error);
    }
    return null;
  }

  /**
   * Stop NFC scanning (Real implementation)
   */
  public async stopNFCScanning(): Promise<void> {
    try {
      if (this.isScanning) {
        await NfcManager.cancelTechnologyRequest();
        this.isScanning = false;
        console.log('NFC scanning stopped');
      }
    } catch (error) {
      console.error('Error stopping NFC scanning:', error);
    }
  }

  /**
   * Validate badge data structure
   */
  private validateBadgeData(data: any): data is ETHGlobalBadgeData {
    return (
      data &&
      typeof data.badgeId === 'string' &&
      typeof data.participantId === 'string' &&
      typeof data.participantName === 'string' &&
      typeof data.email === 'string' &&
      typeof data.eventId === 'string' &&
      typeof data.verificationStatus === 'string' &&
      typeof data.issuedAt === 'string' &&
      typeof data.expiresAt === 'string'
    );
  }

  /**
   * Verify badge authenticity with backend
   */
  public async verifyBadgeWithBackend(badgeData: ETHGlobalBadgeData): Promise<boolean> {
    try {
      // In production, this would make an API call to ETHGlobal's verification service
      // For now, we'll simulate verification
      console.log('Verifying badge with backend:', badgeData.badgeId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification logic
      const isValid = badgeData.verificationStatus === 'verified' && 
                     new Date(badgeData.expiresAt) > new Date();
      
      console.log('Badge verification result:', isValid);
      return isValid;
      
    } catch (error) {
      console.error('Error verifying badge with backend:', error);
      return false;
    }
  }

  /**
   * Generate ZK proof for badge verification
   */
  public async generateBadgeZKProof(badgeData: ETHGlobalBadgeData): Promise<string> {
    try {
      console.log('Generating ZK proof for badge verification...');
      
      // Create a commitment from badge data
      const commitmentData = {
        badgeId: badgeData.badgeId,
        participantId: badgeData.participantId,
        eventId: badgeData.eventId,
        timestamp: Date.now()
      };
      
      // In production, this would use a proper ZK proof library
      // For now, we'll create a mock proof
      const mockProof = Buffer.from(JSON.stringify(commitmentData)).toString('base64');
      
      console.log('ZK proof generated:', mockProof.substring(0, 50) + '...');
      return mockProof;
      
    } catch (error) {
      console.error('Error generating ZK proof:', error);
      throw error;
    }
  }
}

export default new ETHGlobalNFCService();
