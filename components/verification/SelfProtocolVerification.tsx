import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SelfProtocolService, {
  SelfVerificationRequest,
  SelfVerificationResult,
} from '@/services/SelfProtocolService';
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

// const { width } = Dimensions.get('window');

type SelfVerificationStep = 'intro' | 'qr-code' | 'result';

interface SelfProtocolVerificationProps {
  onComplete: (result: SelfVerificationResult) => void;
  onCancel: () => void;
  verificationLevel?: 'basic' | 'enhanced' | 'premium';
  requiredAge?: number;
  allowedCountries?: string[];
  requireSanctionsCheck?: boolean;
}

export default function SelfProtocolVerification({
  onComplete,
  onCancel,
  verificationLevel = 'basic',
  requiredAge,
  allowedCountries,
  requireSanctionsCheck = false,
}: SelfProtocolVerificationProps) {
  const [currentStep, setCurrentStep] = useState<SelfVerificationStep>('intro');
  const [verificationResult, setVerificationResult] = useState<SelfVerificationResult | null>(null);

  const selfProtocolService = SelfProtocolService.getInstance();

  const handleFaceCapture = async (imageUri: string) => {
    setFaceImage(imageUri);
    setCurrentStep('id');
  };

  const handleIDCapture = async (imageUri: string) => {
    setDocumentImage(imageUri);
    setCurrentStep('processing');
    await processVerification();
  };

  const processVerification = async () => {
    if (!faceImage || !documentImage) {
      Alert.alert('Error', 'Missing required images for verification.');
      return;
    }

    // setIsProcessing(true);

    try {
      const verificationRequest: SelfVerificationRequest = {
        faceImage,
        documentImage,
        requiredAge,
        allowedCountries,
        requireSanctionsCheck,
        dataRetentionDays: 7,
        allowBiometricStorage: false, // Privacy-first approach
      };

      const result = await selfProtocolService.verifyIdentity(verificationRequest);
      setVerificationResult(result);
      setCurrentStep('result');
    } catch (error) {
      console.error('Self Protocol verification failed:', error);
      Alert.alert(
        'Verification Failed',
        'An error occurred during Self Protocol verification. Please try again.',
        [{ text: 'OK', onPress: () => setCurrentStep('intro') }]
      );
    } finally {
      // setIsProcessing(false);
    }
  };

  const renderIntroScreen = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introHeader}>
          <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
          <ThemedText style={styles.introTitle}>Self Protocol Verification</ThemedText>
          <ThemedText style={styles.introSubtitle}>
            Privacy-first identity verification powered by zero-knowledge proofs
          </ThemedText>
        </View>

        <View style={styles.privacyFeatures}>
          <ThemedText style={styles.sectionTitle}>Privacy Features</ThemedText>
          
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Zero-knowledge proofs - no private data exposed
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="eye-off" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Local processing - no external data sharing
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Sybil resistance - prevents duplicate identities
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Age, country, and sanctions verification
            </ThemedText>
          </View>
        </View>

        <View style={styles.verificationLevel}>
          <ThemedText style={styles.sectionTitle}>Verification Level: {verificationLevel.toUpperCase()}</ThemedText>
          
          {verificationLevel === 'basic' && (
            <ThemedText style={styles.levelDescription}>
              Basic identity verification with privacy protection
            </ThemedText>
          )}
          
          {verificationLevel === 'enhanced' && (
            <ThemedText style={styles.levelDescription}>
              Enhanced verification with age and country checks
            </ThemedText>
          )}
          
          {verificationLevel === 'premium' && (
            <ThemedText style={styles.levelDescription}>
              Premium verification with full sanctions screening
            </ThemedText>
          )}
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="camera" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Face Verification</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Take a selfie for liveness detection and face recognition
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>ID Document Scan</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Capture your government-issued ID document
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="key" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Zero-Knowledge Proof</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Generate privacy-preserving verification proof
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.securityText}>
            Your biometric data is processed locally and never leaves your device. 
            Only privacy-preserving proofs are generated and stored.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setCurrentStep('face')}
        >
          <Text style={styles.startButtonText}>Start Self Protocol Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderProcessingScreen = () => (
    <ThemedView style={styles.container}>
      <View style={styles.processingContainer}>
        <View style={styles.processingIcon}>
          <Ionicons name="key" size={60} color="#007AFF" />
        </View>
        <ThemedText style={styles.processingTitle}>
          Self Protocol Processing
        </ThemedText>
        <ThemedText style={styles.processingSubtitle}>
          Generating zero-knowledge proof for privacy-preserving verification...
        </ThemedText>

        <View style={styles.processingSteps}>
          <View style={styles.processingStep}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.processingStepText}>Face captured</ThemedText>
          </View>
          
          <View style={styles.processingStep}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.processingStepText}>Document captured</ThemedText>
          </View>
          
          <View style={styles.processingStep}>
            <Ionicons name="sync" size={20} color="#007AFF" />
            <ThemedText style={styles.processingStepText}>Processing biometric data locally</ThemedText>
          </View>
          
          <View style={styles.processingStep}>
            <Ionicons name="sync" size={20} color="#007AFF" />
            <ThemedText style={styles.processingStepText}>Generating zero-knowledge proof</ThemedText>
          </View>
          
          <View style={styles.processingStep}>
            <Ionicons name="sync" size={20} color="#007AFF" />
            <ThemedText style={styles.processingStepText}>Verifying identity without exposing data</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderResultScreen = () => {
    if (!verificationResult) return null;

    const isSuccess = verificationResult.confidenceScore > 0.8;
    const confidencePercentage = Math.round(verificationResult.confidenceScore * 100);
    const riskPercentage = Math.round(verificationResult.riskScore * 100);

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultHeader}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "close-circle"} 
              size={80} 
              color={isSuccess ? "#34C759" : "#FF3B30"} 
            />
            <ThemedText style={[
              styles.resultTitle,
              { color: isSuccess ? "#34C759" : "#FF3B30" }
            ]}>
              {isSuccess ? "Self Protocol Verification Successful" : "Verification Failed"}
            </ThemedText>
            <ThemedText style={styles.resultScore}>
              Confidence Score: {confidencePercentage}%
            </ThemedText>
            <ThemedText style={styles.resultScore}>
              Risk Score: {riskPercentage}%
            </ThemedText>
          </View>

          <View style={styles.resultDetails}>
            <ThemedText style={styles.resultSectionTitle}>Privacy-Preserving Verification</ThemedText>
            
            <View style={styles.resultItem}>
              <Ionicons 
                name={verificationResult.isHuman ? "checkmark" : "close"} 
                size={20} 
                color={verificationResult.isHuman ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Human Verification: {verificationResult.isHuman ? "Passed" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={verificationResult.isUnique ? "checkmark" : "close"} 
                size={20} 
                color={verificationResult.isUnique ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Sybil Resistance: {verificationResult.isUnique ? "Passed" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={verificationResult.ageVerified ? "checkmark" : "close"} 
                size={20} 
                color={verificationResult.ageVerified ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Age Verification: {verificationResult.ageVerified ? "Passed" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={verificationResult.countryVerified ? "checkmark" : "close"} 
                size={20} 
                color={verificationResult.countryVerified ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Country Verification: {verificationResult.countryVerified ? "Passed" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={verificationResult.sanctionsCleared ? "checkmark" : "close"} 
                size={20} 
                color={verificationResult.sanctionsCleared ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Sanctions Check: {verificationResult.sanctionsCleared ? "Cleared" : "Failed"}
              </ThemedText>
            </View>
          </View>

          {/* Zero-Knowledge Proof Information */}
          <View style={styles.zkProofInfo}>
            <Text style={styles.resultSectionTitle}>Zero-Knowledge Proof</Text>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Proof Hash:</Text>
              <Text style={styles.dataValue} numberOfLines={1}>
                {verificationResult.zkProof.proofHash.substring(0, 20)}...
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Identity Commitment:</Text>
              <Text style={styles.dataValue} numberOfLines={1}>
                {verificationResult.zkProof.identityCommitment.substring(0, 20)}...
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Nullifier Hash:</Text>
              <Text style={styles.dataValue} numberOfLines={1}>
                {verificationResult.zkProof.nullifierHash.substring(0, 20)}...
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Privacy Level:</Text>
              <Text style={styles.dataValue}>
                Maximum - No private data revealed
              </Text>
            </View>
          </View>

          {/* Verification Metadata */}
          <View style={styles.verificationInfo}>
            <Text style={styles.resultSectionTitle}>Verification Details</Text>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Verification ID:</Text>
              <Text style={styles.dataValue} numberOfLines={1}>
                {verificationResult.verificationId}
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Level:</Text>
              <Text style={styles.dataValue}>
                {verificationResult.zkProof.verificationLevel.toUpperCase()}
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Protocol Version:</Text>
              <Text style={styles.dataValue}>
                {verificationResult.zkProof.protocolVersion}
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Expires:</Text>
              <Text style={styles.dataValue}>
                {new Date(verificationResult.expiresAt).toLocaleDateString()}
              </Text>
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
            onPress={() => {
              setCurrentStep('intro');
              setFaceImage(null);
              setDocumentImage(null);
              setVerificationResult(null);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  switch (currentStep) {
    case 'intro':
      return renderIntroScreen();
    case 'face':
      return (
        <FaceCapture
          onFaceCapture={handleFaceCapture}
          onCancel={() => setCurrentStep('intro')}
        />
      );
    case 'id':
      return (
        <IDCapture
          onIDCapture={handleIDCapture}
          onCancel={() => setCurrentStep('face')}
        />
      );
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
  // Intro Screen Styles
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
  privacyFeatures: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  verificationLevel: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  levelDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
  },
  stepsContainer: {
    marginBottom: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  stepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    lineHeight: 16,
    color: '#333333',
    opacity: 1,
  },
  // Processing Screen Styles
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingIcon: {
    marginBottom: 30,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  processingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
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
  // Result Screen Styles
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
  },
  resultScore: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 5,
  },
  resultDetails: {
    marginBottom: 30,
  },
  resultSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  zkProofInfo: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  verificationInfo: {
    backgroundColor: '#F0FFF4',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    opacity: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    opacity: 1,
    flex: 1,
    textAlign: 'right',
  },
  // Button Styles
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
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
