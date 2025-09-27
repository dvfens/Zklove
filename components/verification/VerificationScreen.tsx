import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ExternalInferenceOptions } from '@/services/MoproZKService';
import VerificationService, {
  VerificationSession,
} from '@/services/VerificationService';
import type {
  FaceDetectionResult,
  IDVerificationResult,
} from '@/types/verification';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AadhaarVerification from './AadhaarVerification';
import ETHGlobalNFCScanner from './ETHGlobalNFCScanner';
import FaceCapture from './FaceCapture';
import IDCapture from './IDCapture';
import SelfProtocolVerification from './SelfProtocolVerificationNew';

// const { width } = Dimensions.get('window');

type VerificationStep = 'intro' | 'face' | 'id' | 'processing' | 'result' | 'self-protocol' | 'aadhaar' | 'nfc';

interface VerificationScreenProps {
  onComplete: (session: VerificationSession) => void;
  onCancel: () => void;
}

export default function VerificationScreen({ onComplete, onCancel }: VerificationScreenProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('intro');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [faceResult, setFaceResult] = useState<FaceDetectionResult | null>(null);
  const [idResult, setIdResult] = useState<IDVerificationResult | null>(null);
  const [finalResult, setFinalResult] = useState<VerificationSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const verificationService = VerificationService.getInstance();

  const initializeSession = useCallback(async () => {
    try {
      const id = await verificationService.startVerificationSession();
      setSessionId(id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      Alert.alert('Error', 'Failed to initialize verification session.');
    }
  }, [verificationService]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

const inferenceOptions: ExternalInferenceOptions = {
  minConfidence: 0.85,
  requireLiveness: true,
  compareWithDocument: true,
};

const handleFaceCapture = async (imageUri: string) => {
    try {
      setCurrentStep('processing');
      const inference = await verificationService.detectFaces(
        imageUri,
        inferenceOptions
      );
      setFaceResult(inference);
      setCurrentStep('id');
    } catch (error) {
      console.error('Face inference failed:', error);
      Alert.alert('Face Analysis Failed', String(error));
      setCurrentStep('face');
    }
  };

const handleIDCapture = async (imageUri: string) => {
    try {
      setCurrentStep('processing');
      const inference = await verificationService.verifyIDDocument(
        imageUri,
        inferenceOptions
      );
      setIdResult(inference);
      processVerification();
    } catch (error) {
      console.error('Document inference failed:', error);
      Alert.alert('Document Analysis Failed', String(error));
      setCurrentStep('id');
    }
  };

  const processVerification = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await verificationService.completeVerification();
      setFinalResult(result);
      setCurrentStep('result');
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert(
        'Verification Failed',
        'An error occurred during verification. Please try again.',
        [{ text: 'OK', onPress: () => setCurrentStep('intro') }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIntroScreen = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introHeader}>
          <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
          <ThemedText style={styles.introTitle}>Identity Verification</ThemedText>
          <ThemedText style={styles.introSubtitle}>
            Secure and fast identity verification using advanced face recognition
          </ThemedText>
        </View>

        <View style={styles.verificationOptions}>
          <ThemedText style={styles.sectionTitle}>Choose Verification Method</ThemedText>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setCurrentStep('face')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionTitle}>Standard Verification</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Traditional verification with blockchain integration
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setCurrentStep('self-protocol')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="key" size={24} color="#34C759" />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionTitle}>Self Protocol</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Privacy-first verification with zero-knowledge proofs
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setCurrentStep('aadhaar')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="card" size={24} color="#FF6B35" />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionTitle}>Aadhaar Verification</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Real Aadhaar authentication through Self Protocol
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setCurrentStep('nfc')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="radio" size={24} color="#34C759" />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionTitle}>ETHGlobal Badge</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  NFC verification using ETHGlobal hackathon wristband
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.stepsContainer}>
          <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
          
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
                Capture or upload your government-issued ID document
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Verification Complete</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Get instant results with detailed verification score
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={20} color="#666" />
          <Text style={styles.securityText}>
            Your data is encrypted and processed securely. We never store your biometric data.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setCurrentStep('face')}
        >
          <Text style={styles.startButtonText}>Start Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderProcessingScreen = () => {
    const session = verificationService.getCurrentSession();
    const status = session?.status || 'processing';
    
    return (
      <ThemedView style={styles.container}>
        <View style={styles.processingContainer}>
          <View style={styles.processingIcon}>
            <Ionicons name="sync" size={60} color="#007AFF" />
          </View>
          <ThemedText style={styles.processingTitle}>
            {status === 'generating_proof' ? 'Generating ZK Proof' : 
             status === 'proof_generated' ? 'Proof Generated' :
             status === 'blockchain_submitted' ? 'Submitting to Blockchain' :
             'Verifying Identity'}
          </ThemedText>
          <ThemedText style={styles.processingSubtitle}>
            {status === 'generating_proof' ? 'Creating zero-knowledge proof for privacy-preserving verification...' :
             status === 'proof_generated' ? 'Zero-knowledge proof generated successfully!' :
             status === 'blockchain_submitted' ? 'Submitting verification to decentralized network...' :
             'Please wait while we process your verification...'}
          </ThemedText>

          <View style={styles.processingSteps}>
            <View style={styles.processingStep}>
              <Ionicons 
                name={faceResult ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={faceResult ? "#34C759" : "#666"} 
              />
              <ThemedText style={styles.processingStepText}>Face verification complete</ThemedText>
            </View>
            
            <View style={styles.processingStep}>
              <Ionicons 
                name={idResult ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={idResult ? "#34C759" : "#666"} 
              />
              <ThemedText style={styles.processingStepText}>ID document processed</ThemedText>
            </View>
            
            <View style={styles.processingStep}>
              <Ionicons 
                name={status === 'generating_proof' || status === 'proof_generated' || status === 'blockchain_submitted' ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={status === 'generating_proof' || status === 'proof_generated' || status === 'blockchain_submitted' ? "#34C759" : "#666"} 
              />
              <ThemedText style={styles.processingStepText}>Zero-knowledge proof generation</ThemedText>
            </View>

            <View style={styles.processingStep}>
              <Ionicons 
                name={status === 'blockchain_submitted' ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={status === 'blockchain_submitted' ? "#34C759" : "#666"} 
              />
              <ThemedText style={styles.processingStepText}>Blockchain verification</ThemedText>
            </View>
            
            <View style={styles.processingStep}>
              <Ionicons 
                name={finalResult ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={finalResult ? "#34C759" : "#666"} 
              />
              <ThemedText style={styles.processingStepText}>Decentralized identity created</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  const renderResultScreen = () => {
    if (!finalResult) return null;

    const isSuccess = finalResult.status === 'completed';
    const scorePercentage = Math.round(finalResult.overallScore * 100);

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
              {isSuccess ? "Verification Successful" : "Verification Failed"}
            </ThemedText>
            <ThemedText style={styles.resultScore}>
              Confidence Score: {scorePercentage}%
            </ThemedText>
          </View>

          <View style={styles.resultDetails}>
            <ThemedText style={styles.resultSectionTitle}>Verification Details</ThemedText>
            
            <View style={styles.resultItem}>
              <Ionicons 
                name={faceResult?.isLive ? "checkmark" : "close"} 
                size={20} 
                color={faceResult?.isLive ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Liveness Detection: {faceResult?.isLive ? "Passed" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={faceResult && faceResult.confidence > 0.7 ? "checkmark" : "close"} 
                size={20} 
                color={faceResult && faceResult.confidence > 0.7 ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Face Quality: {faceResult ? Math.round(faceResult.confidence * 100) : 0}%
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={idResult?.isValid ? "checkmark" : "close"} 
                size={20} 
                color={idResult?.isValid ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Document Validity: {idResult?.isValid ? "Valid" : "Invalid"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={finalResult.zkProof ? "checkmark" : "close"} 
                size={20} 
                color={finalResult.zkProof ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Zero-Knowledge Proof: {finalResult.zkProof ? "Generated" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={finalResult.blockchainTxHash ? "checkmark" : "close"} 
                size={20} 
                color={finalResult.blockchainTxHash ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Blockchain Verified: {finalResult.blockchainTxHash ? "Yes" : "Local Only"}
              </ThemedText>
            </View>
          </View>

          {/* ZK Proof Information */}
          {finalResult.zkProof && (
            <View style={styles.zkProofInfo}>
              <Text style={styles.resultSectionTitle}>Zero-Knowledge Proof</Text>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Proof Hash:</Text>
                <Text style={styles.dataValue} numberOfLines={1}>
                  {finalResult.zkProof.proofHash.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Commitment:</Text>
                <Text style={styles.dataValue} numberOfLines={1}>
                  {finalResult.zkProof.commitmentHash.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Privacy:</Text>
                <Text style={styles.dataValue}>
                  Zero-knowledge (no personal data revealed)
                </Text>
              </View>
            </View>
          )}

          {/* Decentralized Identity */}
          {finalResult.decentralizedIdentity && (
            <View style={styles.didInfo}>
              <Text style={styles.resultSectionTitle}>Decentralized Identity</Text>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>DID:</Text>
                <Text style={styles.dataValue} numberOfLines={1}>
                  {finalResult.decentralizedIdentity.did}
                </Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Created:</Text>
                <Text style={styles.dataValue}>
                  {new Date(finalResult.decentralizedIdentity.metadata.created).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Status:</Text>
                <Text style={styles.dataValue}>Active & Verified</Text>
              </View>
            </View>
          )}

          {/* Blockchain Transaction */}
          {finalResult.blockchainTxHash && (
            <View style={styles.blockchainInfo}>
              <Text style={styles.resultSectionTitle}>Blockchain Record</Text>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Transaction:</Text>
                <Text style={styles.dataValue} numberOfLines={1}>
                  {finalResult.blockchainTxHash.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Network:</Text>
                <Text style={styles.dataValue}>Polygon Mainnet</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Immutable:</Text>
                <Text style={styles.dataValue}>Permanently recorded</Text>
              </View>
            </View>
          )}

          {idResult?.extractedData && (
            <View style={styles.extractedData}>
              <Text style={styles.resultSectionTitle}>Extracted Information</Text>
              {idResult.extractedData.name && (
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Name:</Text>
                  <Text style={styles.dataValue}>{idResult.extractedData.name}</Text>
                </View>
              )}
              {idResult.extractedData.documentNumber && (
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Document #:</Text>
                  <Text style={styles.dataValue}>{idResult.extractedData.documentNumber}</Text>
                </View>
              )}
              {idResult.extractedData.expiryDate && (
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Expires:</Text>
                  <Text style={styles.dataValue}>{idResult.extractedData.expiryDate}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(finalResult)}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setCurrentStep('intro');
              setFaceResult(null);
              setIdResult(null);
              setFinalResult(null);
              initializeSession();
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
    case 'self-protocol':
      return (
        <SelfProtocolVerification
          onComplete={(result) => {
            // Convert Self Protocol result to standard verification session
            const session: VerificationSession = {
              id: result.verificationId,
              timestamp: result.timestamp,
              faceData: null, // Self Protocol doesn't expose raw data
              idData: null, // Self Protocol doesn't expose raw data
              status: result.confidenceScore > 0.8 ? 'completed' : 'failed',
              overallScore: result.confidenceScore,
              zkProof: {
                proof: result.zkProof.proof,
                publicSignals: result.zkProof.publicSignals,
                proofHash: result.zkProof.proofHash,
                commitmentHash: result.zkProof.identityCommitment,
                nullifierHash: result.zkProof.nullifierHash
              }
            };
            onComplete(session);
          }}
          onCancel={() => setCurrentStep('intro')}
          verificationLevel="enhanced"
          requiredAge={18}
          allowedCountries={['USA', 'CAN', 'GBR']}
          requireSanctionsCheck={true}
        />
      );
    case 'aadhaar':
      return (
        <AadhaarVerification
          onComplete={(result) => {
            // Convert Aadhaar verification result to standard verification session
            const session: VerificationSession = {
              id: result.verificationId || `aadhaar_${Date.now()}`,
              timestamp: result.timestamp || Date.now(),
              faceData: null, // Aadhaar doesn't expose raw biometric data
              idData: null, // Aadhaar doesn't expose raw personal data
              status: result.success ? 'completed' : 'failed',
              overallScore: result.confidenceScore || 0,
              zkProof: result.zkProof ? {
                proof: result.zkProof.proof,
                publicSignals: result.zkProof.publicSignals,
                proofHash: result.zkProof.proofHash,
                commitmentHash: result.zkProof.identityCommitment,
                nullifierHash: result.zkProof.nullifierHash
              } : undefined
            };
            onComplete(session);
          }}
          onCancel={() => setCurrentStep('intro')}
        />
      );
    case 'nfc':
      return (
        <ETHGlobalNFCScanner
          onBadgeVerified={(badgeData) => {
            // Convert NFC badge verification to standard verification session
            const session: VerificationSession = {
              id: badgeData.badgeId,
              timestamp: Date.now(),
              faceData: null, // NFC doesn't capture face data
              idData: {
                documentType: 'ethglobal_badge',
                extractedData: {
                  name: badgeData.participantName,
                  email: badgeData.email,
                  githubUsername: badgeData.githubUsername,
                  twitterHandle: badgeData.twitterHandle,
                },
                confidence: 1.0, // NFC verification is considered 100% confident
                isValid: true, // NFC verification is considered valid
                verificationMethod: 'nfc'
              },
              status: 'completed',
              overallScore: 1.0,
              zkProof: undefined // Will be generated by the NFC service
            };
            onComplete(session);
          }}
          onCancel={() => setCurrentStep('intro')}
        />
      );
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
  verificationOptions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  option: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
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
  extractedData: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  zkProofInfo: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  didInfo: {
    backgroundColor: '#F0FFF4',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  blockchainInfo: {
    backgroundColor: '#FFF8F0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
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
