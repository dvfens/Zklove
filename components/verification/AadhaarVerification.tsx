import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SelfProtocolProduction from '@/services/SelfProtocolProduction';
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
import AadhaarQRScanner from './AadhaarQRScanner';
import AadhaarTestQRScanner from './AadhaarTestQRScanner';

interface AadhaarVerificationProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

export default function AadhaarVerification({ onComplete, onCancel }: AadhaarVerificationProps) {
  const [step, setStep] = useState<'intro' | 'scan' | 'test' | 'processing' | 'result'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const selfProtocolService = new SelfProtocolProduction();

  const handleQRCodeScanned = async (qrData: string) => {
    setIsLoading(true);
    setStep('processing');
    
    try {
      console.log('Starting Aadhaar verification with QR data...');
      
      // Complete Aadhaar verification using Self Protocol
      const result = await selfProtocolService.verifyAadhaar(qrData, [
        'age', 
        'nationality', 
        'uniqueness'
      ]);
      
      console.log('Verification result:', result);
      
      if (result.success) {
        // Store verification result
        await selfProtocolService.storeVerificationResult(result);
        
        setVerificationResult(result);
        setStep('result');
      } else {
        Alert.alert('Verification Failed', 'Aadhaar verification failed. Please try again.');
        setStep('intro');
      }
    } catch (error) {
      console.error('Aadhaar verification error:', error);
      
      // More specific error messages
      let errorMessage = 'Aadhaar verification failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('parse') || error.message.includes('Invalid')) {
          errorMessage = 'Invalid QR code format. Please scan a valid Aadhaar QR code from your mAadhaar app or UIDAI PDF.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('verification failed')) {
          errorMessage = 'Aadhaar verification failed. Please ensure you\'re using a valid Aadhaar QR code.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Verification Error', errorMessage);
      setStep('intro');
    } finally {
      setIsLoading(false);
    }
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
              <ThemedText style={styles.stepTitle}>Generate ZK Proof</ThemedText>
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
                Verify proof with Self Protocol backend
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.privacyText}>
            Your Aadhaar data is processed locally. Only privacy-preserving proofs are generated and shared with Self Protocol.
          </Text>
        </View>

        <View style={styles.securityFeatures}>
          <ThemedText style={styles.sectionTitle}>Security Features</ThemedText>
          
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Zero-knowledge proofs - no private data exposed
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="finger-print" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Nullifier-based uniqueness verification
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Self Protocol backend verification
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setStep('scan')}
        >
          <Text style={styles.scanButtonText}>Scan Aadhaar QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => setStep('test')}
        >
          <Text style={styles.testButtonText}>Test QR Codes (Development)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderScanScreen = () => (
    <AadhaarQRScanner
      onQRCodeScanned={handleQRCodeScanned}
      onCancel={() => setStep('intro')}
    />
  );

  const renderTestScreen = () => (
    <AadhaarTestQRScanner
      onQRCodeScanned={handleQRCodeScanned}
      onCancel={() => setStep('intro')}
    />
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
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.processingStepText}>Nullifier Generated</ThemedText>
          </View>
          <View style={styles.processingStep}>
            <Ionicons name="sync" size={20} color="#007AFF" />
            <ThemedText style={styles.processingStepText}>Generating ZK Proof...</ThemedText>
          </View>
          <View style={styles.processingStep}>
            <Ionicons name="hourglass" size={20} color="#FF9500" />
            <ThemedText style={styles.processingStepText}>Verifying with Self Protocol...</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderResultScreen = () => {
    if (!verificationResult) return null;

    const { demographicData, nullifier, zkProof, verificationResult: verification } = verificationResult;

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
                Name: {demographicData.name}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons name="calendar" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Age Verified: {verification.attributes.age ? 'Passed' : 'Failed'}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons name="globe" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Nationality: {verification.attributes.nationality}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons name="finger-print" size={20} color="#34C759" />
              <ThemedText style={styles.resultText}>
                Uniqueness: {verification.attributes.uniqueness ? 'Verified' : 'Failed'}
              </ThemedText>
            </View>

            <View style={styles.confidenceContainer}>
              <ThemedText style={styles.confidenceLabel}>Confidence Score</ThemedText>
              <ThemedText style={styles.confidenceValue}>
                {Math.round(verification.confidence * 100)}%
              </ThemedText>
            </View>

            <View style={styles.nullifierContainer}>
              <ThemedText style={styles.sectionTitle}>Privacy Protection</ThemedText>
              <View style={styles.nullifierItem}>
                <Text style={styles.nullifierLabel}>Nullifier:</Text>
                <Text style={styles.nullifierValue}>
                  {nullifier.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.nullifierItem}>
                <Text style={styles.nullifierLabel}>ZK Proof Hash:</Text>
                <Text style={styles.nullifierValue}>
                  {zkProof.proofHash.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.nullifierItem}>
                <Text style={styles.nullifierLabel}>Identity Commitment:</Text>
                <Text style={styles.nullifierValue}>
                  {zkProof.identityCommitment.substring(0, 20)}...
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
    case 'test':
      return renderTestScreen();
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
    marginBottom: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    lineHeight: 16,
    color: '#333333',
  },
  securityFeatures: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
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
  confidenceContainer: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  confidenceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  nullifierContainer: {
    backgroundColor: '#F0FFF4',
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

  testButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButtonText: {
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
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});