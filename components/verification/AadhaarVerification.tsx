import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SelfProtocolSDK from '@/services/SelfProtocolSDK';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AadhaarVerificationProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

interface AadhaarQRData {
  uid: string;
  name: string;
  gender: string;
  yob: string;
  co: string;
  vtc: string;
  po: string;
  dist: string;
  state: string;
  pc: string;
}

export default function AadhaarVerification({ onComplete, onCancel }: AadhaarVerificationProps) {
  const [step, setStep] = useState<'intro' | 'scan' | 'processing' | 'result'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [qrData, setQrData] = useState<AadhaarQRData | null>(null);

  const selfProtocolSDK = new SelfProtocolSDK();

  const handleQRCodeScanned = async (qrCodeData: string) => {
    setIsLoading(true);
    setStep('processing');
    
    try {
      // Parse QR demographic payload
      const parsedData = parseAadhaarQR(qrCodeData);
      setQrData(parsedData);
      
      // Normalize fields (name capitalization, DOB format)
      const normalizedData = normalizeAadhaarData(parsedData);
      
      // Derive nullifier using last-4 + name + DOB + gender (per Self spec)
      const nullifier = deriveNullifier(normalizedData);
      
      // Generate zk-proof for requested disclosures (age, nationality, uniqueness, etc.)
      const zkProof = await selfProtocolSDK.generateZKProof({
        demographicData: normalizedData,
        nullifier: nullifier,
        requestedDisclosures: ['age', 'nationality', 'uniqueness']
      });
      
      // Verify proof server-side using Self's backend verifier
      const verificationResult = await selfProtocolSDK.verifyProof(zkProof);
      
      if (verificationResult.verified) {
        setVerificationResult({
          success: true,
          attributes: verificationResult.attributes,
          nullifier: nullifier,
          zkProof: zkProof,
          demographicData: normalizedData
        });
        setStep('result');
      } else {
        Alert.alert('Verification Failed', 'Aadhaar verification failed. Please try again.');
        setStep('intro');
      }
    } catch (error) {
      console.error('Aadhaar QR verification failed:', error);
      Alert.alert('Verification Failed', 'Failed to process Aadhaar QR code. Please try again.');
      setStep('intro');
    } finally {
      setIsLoading(false);
    }
  };

  const parseAadhaarQR = (qrData: string): AadhaarQRData => {
    // Parse mAadhaar QR code or UIDAI PDF QR code
    // This is a simplified parser - in production, use proper QR parsing library
    try {
      const data = JSON.parse(qrData);
      return {
        uid: data.uid || '',
        name: data.name || '',
        gender: data.gender || '',
        yob: data.yob || '',
        co: data.co || '',
        vtc: data.vtc || '',
        po: data.po || '',
        dist: data.dist || '',
        state: data.state || '',
        pc: data.pc || ''
      };
    } catch (error) {
      throw new Error('Invalid Aadhaar QR code format');
    }
  };

  const normalizeAadhaarData = (data: AadhaarQRData) => {
    return {
      ...data,
      name: data.name.toUpperCase().trim(),
      dob: `${data.yob}-01-01`, // Convert year to full date
      gender: data.gender.toUpperCase(),
      address: `${data.co}, ${data.vtc}, ${data.po}, ${data.dist}, ${data.state} - ${data.pc}`
    };
  };

  const deriveNullifier = (data: any): string => {
    // Derive nullifier using last-4 + name + DOB + gender (per Self spec)
    const last4 = data.uid.slice(-4);
    const nullifierInput = `${last4}${data.name}${data.dob}${data.gender}`;
    
    // In production, use proper cryptographic hash
    return btoa(nullifierInput); // Simplified for demo
  };

  const renderIntroScreen = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introHeader}>
          <Ionicons name="qr-code" size={80} color="#007AFF" />
          <ThemedText style={styles.introTitle}>Aadhaar Verification</ThemedText>
          <ThemedText style={styles.introSubtitle}>
            Scan your mAadhaar QR code or UIDAI PDF QR code for instant verification
          </ThemedText>
        </View>

        <View style={styles.howItWorks}>
          <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Scan QR Code</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Use your mAadhaar app or scan UIDAI PDF QR code
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Parse & Normalize</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Extract demographic data and normalize fields
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Generate Proof</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Create zero-knowledge proof for age, nationality, uniqueness
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>4</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Verify & Complete</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Verify proof and get verification result
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.privacyText}>
            Your Aadhaar data is processed locally. Only privacy-preserving proofs are generated and shared.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setStep('scan')}
        >
          <Text style={styles.scanButtonText}>Scan Aadhaar QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderScanScreen = () => (
    <ThemedView style={styles.container}>
      <View style={styles.scanHeader}>
        <Ionicons name="qr-code" size={60} color="#007AFF" />
        <ThemedText style={styles.scanTitle}>Scan Aadhaar QR Code</ThemedText>
        <ThemedText style={styles.scanSubtitle}>
          Point your camera at the QR code from mAadhaar app or UIDAI PDF
        </ThemedText>
      </View>

      <View style={styles.scannerContainer}>
        <View style={styles.scannerPlaceholder}>
          <Ionicons name="camera" size={80} color="#666" />
          <ThemedText style={styles.scannerText}>QR Code Scanner</ThemedText>
          <ThemedText style={styles.scannerSubtext}>
            In production, integrate with react-native-qrcode-scanner
          </ThemedText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => {
            // Demo QR data for testing
            const demoQRData = JSON.stringify({
              uid: "123456789012",
              name: "JOHN DOE",
              gender: "M",
              yob: "1990",
              co: "123 Main Street",
              vtc: "Sample Village",
              po: "Sample Post Office",
              dist: "Sample District",
              state: "Sample State",
              pc: "123456"
            });
            handleQRCodeScanned(demoQRData);
          }}
        >
          <Text style={styles.demoButtonText}>Use Demo QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => setStep('intro')}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderProcessingScreen = () => (
    <ThemedView style={styles.container}>
      <View style={styles.processingContent}>
        <Ionicons name="sync" size={80} color="#007AFF" />
        <ThemedText style={styles.processingTitle}>Processing Aadhaar Data</ThemedText>
        <ThemedText style={styles.processingSubtitle}>
          Parsing QR data, generating nullifier, and creating zero-knowledge proof...
        </ThemedText>
        
        <View style={styles.processingSteps}>
          <View style={styles.processingStep}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.processingStepText}>QR Code Parsed</ThemedText>
          </View>
          <View style={styles.processingStep}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.processingStepText}>Data Normalized</ThemedText>
          </View>
          <View style={styles.processingStep}>
            <Ionicons name="sync" size={20} color="#007AFF" />
            <ThemedText style={styles.processingStepText}>Generating ZK Proof...</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderResultScreen = () => {
    if (!verificationResult) return null;

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultHeader}>
            <Ionicons 
              name="checkmark-circle" 
              size={80} 
              color="#34C759" 
            />
            <ThemedText style={styles.resultTitle}>Aadhaar Verification Successful</ThemedText>
            <ThemedText style={styles.resultSubtitle}>
              Your Aadhaar has been verified through Self Protocol
            </ThemedText>
          </View>

          <View style={styles.resultDetails}>
            <ThemedText style={styles.sectionTitle}>Verification Results</ThemedText>
            
            <View style={styles.resultItem}>
              <Ionicons name="person" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Name: {verificationResult.demographicData.name}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons name="calendar" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Age Verified: {verificationResult.attributes.age ? 'Passed' : 'Failed'}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons name="globe" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Nationality: {verificationResult.attributes.nationality || 'Indian'}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons name="finger-print" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Uniqueness: {verificationResult.attributes.uniqueness ? 'Verified' : 'Failed'}
              </ThemedText>
            </View>

            <View style={styles.nullifierContainer}>
              <ThemedText style={styles.sectionTitle}>Privacy Protection</ThemedText>
              <View style={styles.nullifierItem}>
                <Text style={styles.nullifierLabel}>Nullifier:</Text>
                <Text style={styles.nullifierValue}>
                  {verificationResult.nullifier.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.nullifierItem}>
                <Text style={styles.nullifierLabel}>ZK Proof Hash:</Text>
                <Text style={styles.nullifierValue}>
                  {verificationResult.zkProof.proofHash.substring(0, 20)}...
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(verificationResult)}
          >
            <Text style={styles.completeButtonText}>Complete Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setStep('intro')}
          >
            <Text style={styles.retryButtonText}>Verify Another Aadhaar</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  switch (step) {
    case 'intro':
      return renderIntroScreen();
    case 'scan':
      return renderScanScreen();
    case 'processing':
      return renderProcessingScreen();
    case 'result':
      return renderResultScreen();
    default:
      return renderIntroScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  introSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  howItWorks: {
    marginBottom: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FFF4',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    lineHeight: 16,
    color: '#333333',
  },
  scanHeader: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  scanSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  scannerPlaceholder: {
    width: 300,
    height: 300,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  scannerText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    color: '#666',
  },
  scannerSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    color: '#999',
    paddingHorizontal: 20,
  },
  processingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  processingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 40,
  },
  processingSteps: {
    width: '100%',
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  processingStepText: {
    fontSize: 16,
    marginLeft: 10,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#34C759',
  },
  resultSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  resultDetails: {
    marginBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    marginLeft: 10,
  },
  nullifierContainer: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  nullifierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nullifierLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  nullifierValue: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});